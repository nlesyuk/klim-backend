const fs = require('fs');
const db = require('../db/')
const {
  removeDomainFromImagePath,
  prepareImagePathForDB,
  getRightPathForImage,
  removeUploadedFiles,
  getCurrentDateTime,
  getUserIdByDomain,
} = require('../global/helper')

class WorkController {
  /**
    {
      title: String,
      description: String,
      credits: String,
      videos: String of JSON,
      photosInfo: String,
      order: Number,
      photos: binary[]
    }
  */
  async create(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createWork-START', d)
    const storage = {}
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { title, description, credits, videos, photosInfo, order } = req.body

      if (!title && !description && !credits && !videos && !photosInfo && !order) {
        throw new Error('Required fields: title, description, credits, videos, photosInfo, order')
      }
      const filesInfo = JSON.parse(photosInfo)
      const files = req.files

      console.log('FIELDS', title, description, credits, filesInfo)
      console.log('FILES', files)

      // 0 - check
      if (!files?.length) {
        throw new Error('No file(s)')
      }

      // 1 - create work record
      // prepare photos to db
      const mappedFiles = Array.from(files).map(file => {
        return {
          path: prepareImagePathForDB(file),
          filename: file.filename
        }
      }) // get path of photo in current project backend/public/uploads/s/category
      console.log('FILES-INFO', mappedFiles)

      const work = await db.query(`
        INSERT INTO
          work
          (title, videos, description, credits, work_order, user_id)
          values
          ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [title, videos, description, credits, order, userId]
      )

      console.log('DB WORK', work.rows)
      let workId = ''
      if (work.rows?.[0]?.id) {
        workId = work.rows[0].id
        storage.workId = work.rows[0].id
      } else {
        throw new Error('work id is not setted')
      }

      // 2 - create photos record
      const queryArr = []

      Array.from(filesInfo).forEach((photo, i) => {
        const isWorkPreview = photo.isPreview ?? false
        const work_order = photo.order ?? null
        const format = photo.format ?? null
        const image = mappedFiles[i].path ?? null
        queryArr.push(`(${workId}, ${isWorkPreview}, ${work_order}, '${format}', '${image}', '${userId}')`)
      });
      const queryStr = queryArr.join(',')
      console.log('QueryArr', queryStr, queryArr)

      // 1 - set photos in table
      const photos = await db.query(`
        INSERT INTO
          photos
          (work_id, is_work_preview, work_order, format, image, user_id)
          values
          ${queryStr}
        RETURNING *;`
      )
      console.log('DB PHOTOS', photos.rows)

      let photoIds = ''
      if (photos?.rows?.length) {
        photoIds = Array.from(photos.rows).map(v => v.id)
      } else {
        throw new Error('photos are not setted')
      }
      console.log('photoIds', photoIds)

      // 3 - set photos id in work record
      const updatedWork = await db.query(`
        UPDATE
          work
        SET
          photos = $1
        WHERE
          id = $2
        RETURNING *`,
        [photoIds, workId]
      )
      console.log('updatedWork', updatedWork.rows)
      const workPraperedForFrontEnd = updatedWork.rows?.map(v => {
        v.order = v.work_order ?? 0;
        delete v.work_order
        return {
          ...v
        }
      })
      res.json(workPraperedForFrontEnd[0])

    } catch (e) {
      if (e.message === 'No files') {
        console.error('createWork Error', e.message)
        res.status(400).send({ message: 'No files' })
      }

      // remove uploaded files
      const files = req.files
      removeUploadedFiles(files)

      // remove record from db
      const resq = await db.query(`DELETE FROM work WHERE id = $1`, [storage.workId])
      console.log('storage', storage, resq.rows)

      // response
      console.log(e)
      const anotherMessage = e?.message ?? 'Unknow server error at ' + WorkController.name
      res.status(500).send({ message: anotherMessage })
      console.error('createWork Error', anotherMessage)
    }
    console.log('------------------------------------createWork-END', d)
  }

  /*
    id: Number
  */
  async getWork(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getWork-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { id } = req.params

      const workDirty = await db.query(`SELECT * FROM work WHERE id = $1 AND user_id = $2`, [id, userId])
      if (workDirty.rows.length === 0) {
        res.status(404);
        res.send({ message: 'Work is not exist ' });
        return
      }

      const work = workDirty.rows[0]
      work.order = work?.work_order ?? 0
      delete work.work_order

      const photosDirty = await db.query(`SELECT * FROM photos WHERE work_id = $1 AND user_id = $2`, [id, userId])

      // prepare photos for front-end
      if (photosDirty?.rows?.length) {
        work.photos = photosDirty.rows.map(item => ({
          id: item.id,
          work_id: item.work_id,
          src: getRightPathForImage(item.image),
          isPreview: item.is_work_preview,
          order: item.work_order,
          format: item.format ?? null,
        }))
      }

      res.json(work)
    } catch (error) {
      const anotherMessage = error?.message ?? 'Unknow server error at ' + WorkController.name
      res.status(500).send({ message: anotherMessage })
    }
    console.log('------------------------------------getWork-END', d)
  }

  /**
    {
      title: String,
      description: String,
      credits: String,
      videos: String of JSON,
      photosInfo: String,
      order: Number,
    }
  */
  async getWorks(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getWorks-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }

      const dirtyWorks = await db.query(`SELECT * FROM work WHERE user_id = $1`, [userId])
      const dirtyWorkPhotos = await db.query(`SELECT * FROM photos WHERE work_id IS NOT NULL AND user_id = $1`, [userId])

      // prepare photos for front-end
      const photos = dirtyWorkPhotos.rows.map(photo => ({
        id: photo.id,
        work_id: photo.work_id,
        src: getRightPathForImage(photo.image),
        isPreview: photo.is_work_preview,
        order: photo.work_order,
        format: photo.format ?? null,
      }))

      const works = dirtyWorks.rows.map((work) => {
        work.order = work?.work_order ?? 0
        delete work.work_order
        work.photos = photos.filter(photo => {
          if (photo.work_id && photo.work_id === work.id) {
            delete photo.work_id
            return true
          }
          return false
        })
        return work
      })

      console.log(works)
      res.json(works)
    } catch (error) {
      const anotherMessage = error?.message ?? 'Unknow server error at ' + WorkController.name
      res.status(500).send({ message: anotherMessage })
    }
    console.log('------------------------------------getWorks-END', d)
  }

  /**
    {
      id: Number,
      title: String,
      videos: String of JSON,
      credits: String,
      order: Number,
      description: String,
      photosInfo: String of JSON {
        new: [{
          isPreview: false
          fileName: "13.jpg"
          format: "vertical"
          order: 0
        }],
        existing: [{}],
        deleted: [id],
        updated: [{
          id: 15,
          src: '//localhost:8090/public/uploads/s/work/1630249866918_s_7R-8R-Night.jpg',
          isPreview: false,
          order: 0
          format: 'vertical'
        }]
      },
      photos[]: Binary
    }
  */
  async update(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------updateWork-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { id, title, credits, description, videos, photosInfo, order } = req.body
      let updatedPhotoStore = []
      // check
      if (!id) {
        throw new Error('id is required')
      }
      if (!title) {
        throw new Error('title is required')
      }
      if (!videos) {
        throw new Error('videos are required')
      }
      if (!photosInfo) {
        throw new Error('photosInfo is required')
      }
      if (!order) {
        throw new Error('order is required')
      }
      // if (!credits) {
      //   throw new Error('credits are required')
      // }
      // if (!description) {
      //   throw new Error('description is required')
      // }
      console.log(id)

      // prepare PHOTOS
      const parsedPhotosInfo = JSON.parse(photosInfo)
      // const existingPhotos = parsedPhotosInfo.existing
      const deletedPhotos = parsedPhotosInfo.deleted
      const updatedPhotos = parsedPhotosInfo.updated
      const newPhotos = parsedPhotosInfo.new
      const workId = id
      // console.log('parsedPhotos', parsedPhotosInfo)


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
          const isWorkPreview = photo.isPreview ?? false
          const order = photo.order ?? null
          const format = photo.format ?? null
          const image = mappedFiles[i].path ?? null
          const str = `(${workId}, ${isWorkPreview}, ${order}, '${format}', '${image}', '${userId}')`
          queryArr.push(str)
        });

        console.log("NEW-P mappedFiles", mappedFiles)
        console.log("NEW-P newPhotos", newPhotos)
        console.log("NEW-P queryStr", queryArr.join(','))
        const photosFromDB = await db.query(`
          INSERT INTO photos(work_id, is_work_preview, work_order, format, image, user_id)
          VALUES ${queryArr.join(',')}
          RETURNING *;
      `)

        console.log("NEW-P photosFromDB", photosFromDB.rows)
        // interface IPhoto
        const mappedNewPhotosFromDB = Array.from(photosFromDB.rows).map(v => ({
          id: v.id,
          src: getRightPathForImage(v.image),
          isPreview: v.is_work_preview,
          order: v.work_order,
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
          const work_order = photo.order ?? null
          const isWorkPreview = photo.isPreview ?? false
          queryArr.push(`(${id}, ${workId}, ${isWorkPreview}, ${work_order}, '${format}', '${image}', '${userId}')`)
        });

        console.log("UP-P queryStr", queryArr.join(','))
        // req to db - https://stackoverflow.com/questions/18797608/update-multiple-rows-in-same-query-using-postgresql
        const updatedPhotosFromDB = await db.query(`
          UPDATE photos AS p
          SET
          image = row.image,
            format = row.format,
            work_id = row.work_id,
            work_order = row.work_order,
            is_work_preview = row.is_work_preview
            user_id = row.user_id
          FROM(VALUES ${queryArr.join(',')})
                AS row(id, work_id, is_work_preview, work_order, format, image, user_id)
              WHERE row.id = p.id
          RETURNING *;
      `)

        console.log("UP-P updatedPhotosFromDB", updatedPhotosFromDB.rows)
        // interface IPhoto
        const arrUpdatedPhotosFromDB = Array.from(updatedPhotosFromDB.rows).map(v => ({
          id: v.id,
          src: getRightPathForImage(v.image),
          isPreview: v.is_work_preview,
          order: v.work_order,
          format: v.format
        }))

        console.log("UP-P arrUpdatedPhotosFromDB", arrUpdatedPhotosFromDB)
        updatedPhotoStore = updatedPhotoStore.concat(arrUpdatedPhotosFromDB)
      }

      // ===DELETE PHOTOS
      if (deletedPhotos?.length) {
        const values = deletedPhotos.join(',')
        const deletedPhotosRaw = await db.query(`DELETE FROM photos WHERE id IN(${values}) RETURNING * `)
        console.log('DEL-P deletedPhotos', deletedPhotosRaw.rows)
      }

      // ===UPDATE WORK INFO
      const photos = Array.from(updatedPhotoStore).map(v => v.id)
      const updatedWorkFromDB = await db.query(`
        UPDATE work
        SET
          title = $1,
          credits = $2,
          description = $3,
          videos = $4,
          photos = $5,
          work_order = $6
        WHERE
          id = $7 AND
          user_id = $8
        RETURNING * `,
        [title, credits, description, videos, photos, order, id, userId]
      )
      console.log('UP-WORK updatedWorkFromDB', updatedWorkFromDB.rows)

      res.status(200).json({ message: 'Work is updated' })
      return;
    } catch (error) {
      // remove uploaded files
      removeUploadedFiles(req.files)

      const anotherMessage = error?.message ?? 'Unknow server error at ' + WorkController.name
      res.status(500).send({ message: anotherMessage })
    }
    console.log('------------------------------------updateWork-END', d)
  }

  /*
    id: Number
  */
  async delete(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------deleteWork-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { id } = req.params
      const status = { id, }

      const removedWork = await db.query(`
      DELETE FROM
        work
      WHERE
        id = $1 AND
        user_id = $2
      RETURNING * `,
        [id, userId]
      )
      const removedPhotos = await db.query(`
      DELETE FROM
        photos
      WHERE
        work_id = $1 AND
        photo_id IS NULL AND
        shot_id IS NULL AND
        user_id = $2
      RETURNING * `,
        [id, userId]
      )

      // remove uploaded files
      if (removedPhotos?.rows?.length) {
        let count = 0
        Array.from(removedPhotos.rows).forEach(file => {
          fs.unlink(file.image, function (err) { // remove file
            if (err) {
              console.error("unlink can't delete file - ", file.image)
              throw err;
            }
            console.log('File deleted!');
            count++
          });
        })
        status.message = `Removed ${count} photos`
      } else {
        await db.query(`
        UPDATE
          photos
        SET
          work_id = null
        WHERE
          work_id = $1 AND
          user_id = $2`,
          [id, userId]
        )
        status.message = "Photos was not removed - saved for other categories or dosn't exist"
      }
      status.status = 'success'

      res.json(status)
    } catch (error) {
      console.error('deleteWork Error', error)
      const anotherMessage = error?.message ?? 'Unknow server error at ' + WorkController.name
      res.status(500).send({ message: anotherMessage })
    }
    console.log('------------------------------------deleteWork-END', d)
    return;
  }
}

module.exports = new WorkController()