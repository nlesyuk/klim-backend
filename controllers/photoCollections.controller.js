const fs = require('fs');
const db = require('../db/')
const {
  removeDomainFromImagePath,
  prepareImagePathForDB,
  getRightPathForImage,
  removeUploadedFiles,
  getCurrentDateTime,
  getUserIdByDomain
} = require('../global/helper')


class PhotoCollectionsController {
  /**
    {
      order: Number
      title: String,
      credits: String,
      photosInfo: String,
      description: String,
      photos: binary[]
    }
  */
  async create(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createPhotoCollection-START', d)
    const storage = {}
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { title, description, credits, photosInfo, order, categories } = req.body
      const filesInfo = JSON.parse(photosInfo)
      const files = req.files

      console.log('FIELDS', title, description, credits, filesInfo, categories, order)
      // console.log('FILES', files)

      // 0 - check
      if (!files?.length) {
        throw new Error('No files')
      }

      // 1 - create record
      // prepare photos to db
      const mappedFiles = Array.from(files).map(file => {
        return {
          path: prepareImagePathForDB(file),
          filename: file.filename
        }
      }) // get path of photo in current project backend/public/uploads/s/category
      // console.log('FILES-INFO', mappedFiles)

      const record = await db.query(`
        INSERT INTO photo
          (title, description, credits, categories, photo_order, user_id)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [title, description, credits, JSON.parse(categories), order, userId]
      )
      console.log('DB RECORD', record.rows)
      if (record.rows?.[0]?.id) {
        storage.id = record.rows[0].id
      } else {
        throw new Error('record id is not setted')
      }

      // 2 - create photos record
      const queryArr = []

      Array.from(filesInfo).forEach((photo, i) => {
        const isWorkPreview = photo.isPreview ?? false
        const photoOrder = photo.order ?? null
        const format = photo.format ?? null
        const image = mappedFiles[i].path ?? null
        queryArr.push(`(${storage.id}, ${isWorkPreview}, ${photoOrder}, '${format}', '${image}', '${userId}')`)
      });
      const queryStr = queryArr.join(',')
      console.log('QueryArr', queryStr, queryArr)

      // 1 - set photos in table
      const photos = await db.query(`
        INSERT INTO photos
          (photo_id, is_photo_preview, photo_order, format, image, user_id)
        VALUES
          ${queryStr}
        RETURNING *;`
      )
      console.log('DB PHOTOS', photos.rows)


      const mappedDataForFrontend = {
        title: record.rows[0].title,
        order: record.rows[0].photo_order,
        credits: record.rows[0].credits,
        description: record.rows[0].description,
        photos: photos.rows.map(v => {
          return {
            id: v.id,
            order: v.photo_order,
            format: v.format,
            isPreview: v.is_photo_preview,
            src: getRightPathForImage(v.image, userId)
          }
        })
      }

      res.status(200)
      res.json(mappedDataForFrontend)

    } catch (e) {
      if (e.message === 'No files') {
        console.error('createPhotoCollection Error', e.message)
        res.status(400)
        res.send({ message: 'No files' })
      }

      // remove uploaded files
      const files = req.files
      removeUploadedFiles(files)

      // remove record from db
      const resq = await db.query(`DELETE FROM photo WHERE id = $1`, [storage.recordId])
      console.log('storage', storage, resq.rows)

      // response
      const anotherMessage = e?.message ? e.message : 'Unknow server error at createWork controller'
      res.status(500)
      res.send({ message: anotherMessage })
      console.error('createPhotoCollection Error', anotherMessage)
    }
    console.log('------------------------------------createPhotoCollection-END', d)
  }

  async get(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getPhotoCollection-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const photoRecords = await db.query(`SELECT * FROM photo WHERE user_id = $1`, [userId])
      const dirtyPhotos = await db.query(`SELECT * FROM photos WHERE photo_id IS NOT NULL AND user_id = $1`, [userId])

      // prepare photos for front-end
      const photos = dirtyPhotos.rows.map(photo => ({
        id: photo.id,
        photo_id: photo.photo_id,
        src: getRightPathForImage(photo.image, userId),
        isPreview: photo.is_photo_preview,
        order: photo.photo_order,
        format: photo.format ?? null,
      }))

      console.log('photoRecords', photoRecords.rows)
      const works = photoRecords.rows.map((item) => {
        const order = item.photo_order ?? 0
        const description = item.description ?? ''
        delete item.photo_order
        delete item.description
        return {
          ...item,
          order,
          lol: 123,
          description,
          photos: photos.filter(photo => {
            if (photo?.photo_id === item.id) {
              delete photo.photo_id
              return true
            }
            return false
          })
        }
      })
      // console.log('works', works)

      res.json(works)
    } catch (error) {
      console.error('Error', error)
    }
    console.log('------------------------------------getPhotoCollection-END', d)
  }

  async getById(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getByIDPhotoCollection-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { id } = req.params
      const record = await db.query(`SELECT * FROM photo WHERE id = $1 AND user_id = $2`, [id, userId])
      if (record.rows.length === 0) {
        res.status(404);
        res.send({ message: "Photo collection doesn't exist" });
      }

      const photo = record.rows[0]
      photo.order = photo?.photo_order ?? 0
      delete photo.photo_order

      const photosDirty = await db.query(`SELECT * FROM photos WHERE photo_id = $1 AND user_id = $2`, [id, userId])

      // prepare photos for front-end
      if (photosDirty?.rows?.length) {
        photo.photos = photosDirty.rows.map(photo => ({
          id: photo.id,
          // photo_id: photo.photo_id,
          src: getRightPathForImage(photo.image, userId),
          isPreview: photo.is_photo_preview,
          order: photo.photo_order,
          format: photo.format ?? null,
        }))
      }

      res.json(photo)
    } catch (error) {
      console.error('Error', error)
      res.status(500)
    }
    console.log('------------------------------------getByIDPhotoCollection-END', d)
  }

  async update(req, res) {
    // TODO: need handle update "categories" field from FE (see in create method)
    const d = getCurrentDateTime()
    console.log('------------------------------------updatePhotoCollection-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { id, title, credits, description, photosInfo, order } = req.body
      let updatedPhotoStore = []

      console.log('UPDATE data', id, title, credits, description, JSON.parse(photosInfo), order)

      // check
      if (!id) {
        throw new Error('id is required')
      }
      if (!title) {
        throw new Error('title is required')
      }
      // if (!credits) {
      //   throw new Error('credits are required')
      // }
      // if (!description) {
      //   throw new Error('description is required')
      // }
      if (!photosInfo) {
        throw new Error('photosInfo is required')
      }
      if (!order) {
        throw new Error('order is required')
      }


      // prepare PHOTOS
      const parsedPhotosInfo = JSON.parse(photosInfo)
      const existingPhotos = parsedPhotosInfo.existing
      const deletedPhotos = parsedPhotosInfo.deleted
      const updatedPhotos = parsedPhotosInfo.updated
      const newPhotos = parsedPhotosInfo.new
      const recordId = id
      console.log('parsedPhotos', parsedPhotosInfo)


      // ===CREATE NEW PHOTOS
      if (newPhotos?.length) {
        const queryArr = []
        const files = req.files

        // prepare photos to db
        const mappedFiles = Array.from(files).map(file => {
          return {
            path: prepareImagePathForDB(file),
            filename: file.filename
          }
        }) // get path of photo in current project backend/public/uploads/s/category


        // prepare data
        Array.from(newPhotos).forEach((photo, i) => {
          const isPreview = photo.isPreview ?? false
          const order = photo.order ?? null
          const format = photo.format ?? null
          const image = mappedFiles[i].path ?? null
          const str = `(${recordId}, ${isPreview}, ${order}, '${format}', '${image}', '${userId}')`
          queryArr.push(str)
        });

        console.log("NEW-P mappedFiles", mappedFiles)
        console.log("NEW-P newPhotos", newPhotos)
        console.log("NEW-P queryStr", queryArr.join(','))
        const photosFromDB = await db.query(`
          INSERT INTO
            photos
            (photo_id, is_photo_preview, photo_order, format, image, user_id)
          VALUES
            ${queryArr.join(',')}
          RETURNING *;
        `)

        console.log("NEW-P photosFromDB", photosFromDB.rows)
        // interface IPhoto
        const mappedNewPhotosFromDB = Array.from(photosFromDB.rows).map(v => ({
          id: v.id,
          src: getRightPathForImage(v.image, userId),
          isPreview: v.is_photo_preview,
          order: v.photo_order,
          format: v.format
        }))

        console.log("NEW-P mappedNewPhotosFromDB", mappedNewPhotosFromDB)
        updatedPhotoStore = updatedPhotoStore.concat(mappedNewPhotosFromDB)
      }

      // ===UPDATE PHOTOS
      if (updatedPhotos?.length) {
        const queryArr = []

        // prepare data
        Array.from(updatedPhotos).forEach(photo => {
          let image = removeDomainFromImagePath(photo.src) ?? null
          const id = photo.id ?? null
          const format = photo?.format ?? null
          const order = photo.order ?? null
          const isPreview = photo.isPreview ?? false
          queryArr.push(`(${id}, ${recordId}, ${isPreview}, ${order}, '${format}', '${image}', ${userId})`)
        });

        console.log("UP-P queryStr", queryArr, queryArr.join(',')) // ERROR
        // req to db - https://stackoverflow.com/questions/18797608/update-multiple-rows-in-same-query-using-postgresql
        const updatedPhotosFromDB = await db.query(`
          UPDATE photos AS p
          SET
            image = row.image,
            format = row.format,
            photo_id = row.photo_id,
            photo_order = row.photo_order,
            is_photo_preview = row.is_photo_preview
          FROM
            (VALUES ${queryArr.join(',')})
            AS row(id, photo_id, is_photo_preview, photo_order, format, image, user_id)
          WHERE
            row.id = p.id AND row.user_id = p.user_id
          RETURNING *;
        `) // 🔴

        console.log("UP-P updatedPhotosFromDB", updatedPhotosFromDB.rows)
        // interface IPhoto
        const arrUpdatedPhotosFromDB = Array.from(updatedPhotosFromDB.rows).map(v => ({
          id: v.id,
          src: getRightPathForImage(v.image, userId),
          isPreview: v.is_work_preview,
          order: v.work_order,
          format: v.format
        }))

        console.log("UP-P arrUpdatedPhotosFromDB", arrUpdatedPhotosFromDB)
        updatedPhotoStore = updatedPhotoStore.concat(arrUpdatedPhotosFromDB)
      }

      // ===DELETE PHOTOS
      if (deletedPhotos?.length) {
        const deletedPhotosRaw = await db.query(`
          DELETE FROM
            photos
          WHERE
            id
          IN
            (${deletedPhotos.join(',')})
          RETURNING *`
        )
        console.log('DEL-P deletedPhotos', deletedPhotosRaw.rows)
      }

      // ===UPDATE WORK INFO
      const updatedWorkFromDB = await db.query(`
        UPDATE
          photo
        SET
          title = $1,
          credits = $2,
          description = $3,
          photo_order = $4
        WHERE
          id = $5 AND user_id = $6
        RETURNING *`,
        [title, credits, description, order, id, userId]
      )
      console.log('UP-WORK updatedWorkFromDB', updatedWorkFromDB.rows)

      res.status(200).json({ message: 'Photo record is updated' })
      return;
    } catch (error) {
      // remove uploaded files
      removeUploadedFiles(req.files)

      res.status(500).json({ message: error.message })
      console.error('updatePhotoCollection ERROR:', error)
    }
    console.log('------------------------------------updatePhotoCollection-END', d)
  }

  async delete(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------deletePhotoCollection-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { id } = req.params
      const status = { id, }

      const removedPhotoRecord = await db.query(`
        DELETE FROM
          photo
        WHERE
          id = $1 AND user_id = $2
        RETURNING *`,
        [id, userId]
      )
      const removedPhotos = await db.query(`
        DELETE FROM
          photos
        WHERE
          photo_id = $1
        AND
          work_id IS NULL
        AND
          shot_id IS NULL
        RETURNING *`
        , [id]
      )

      // remove uploaded files
      if (removedPhotos?.rows?.length) {
        let count = 0
        Array.from(removedPhotos.rows).forEach(file => {
          try {
            fs.unlink(file.image, (err) => { // remove file
              if (err) {
                console.error("unlink can't delete file - ", file.image)
                throw err;
              }
              console.log('File deleted! - ', file.image);
            });
            count++
          } catch (e) {
            console.error('deleteWork Error at fs.unlink', e)
          }
        })
        status.message = `Removed ${count} photos`
      } else {
        await db.query(`UPDATE photos SET photo_id = null WHERE photo_id = $1`, [id])
        status.message = "Photos was not removed - saved for other categories or dosn't exist"
      }
      status.status = 'success'

      res.json(status)
    } catch (error) {
      console.error('deleteWork Error', error)
      res.status(500)
    }
    console.log('------------------------------------deletePhotoCollection-END', d)
  }
}

module.exports = new PhotoCollectionsController()