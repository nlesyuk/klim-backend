const fs = require('fs');
const db = require('../db/')
const {
  removeDomainFromImagePath,
  prepareImagePathForDB,
  getRightPathForImage,
  removeUploadedFiles,
  getCurrentDateTime,
} = require('../global/helper')

const mock = [
  {
    "id": 1,
    "title": "title",
    "credits": "credits",
    "category": ["commerce"],
    "photos": [
      {
        "id": 470,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577399_s_2021112213.10.17.jpg",
        "isPreview": false,
        "order": 0,
        "format": "horizontal"
      },
      {
        "id": 472,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577404_s_2021112213.07.22.jpg",
        "isPreview": false,
        "order": 4,
        "format": "horizontal"
      },
      {
        "id": 473,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577407_s_2021112213.09.00.jpg",
        "isPreview": false,
        "order": 2,
        "format": "horizontal"
      },
      {
        "id": 476,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577416_s_2021112213.05.36.jpg",
        "isPreview": false,
        "order": 6,
        "format": "horizontal"
      },
      {
        "id": 477,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577419_s_2021112212.50.08.jpg",
        "isPreview": false,
        "order": 7,
        "format": "horizontal"
      },
      {
        "id": 471,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577402_s_2021112213.09.18.jpg",
        "isPreview": true,
        "order": 4,
        "format": "horizontal"
      },
      {
        "id": 475,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577412_s_2021112213.06.27.jpg",
        "isPreview": true,
        "order": 0,
        "format": "horizontal"
      },
      {
        "id": 474,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577410_s_2021112213.07.44.jpg",
        "isPreview": true,
        "order": 1,
        "format": "horizontal"
      }
    ]
  },
  {
    "id": 2,
    "title": "title2",
    "credits": "credits2",
    "category": ["commerce"],
    "photos": [
      {
        "id": 470,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577399_s_2021112213.10.17.jpg",
        "isPreview": false,
        "order": 0,
        "format": "horizontal"
      },
      {
        "id": 472,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577404_s_2021112213.07.22.jpg",
        "isPreview": false,
        "order": 4,
        "format": "horizontal"
      },
      {
        "id": 473,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577407_s_2021112213.09.00.jpg",
        "isPreview": false,
        "order": 2,
        "format": "horizontal"
      },
      {
        "id": 476,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577416_s_2021112213.05.36.jpg",
        "isPreview": false,
        "order": 6,
        "format": "horizontal"
      },
      {
        "id": 477,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577419_s_2021112212.50.08.jpg",
        "isPreview": false,
        "order": 7,
        "format": "horizontal"
      },
      {
        "id": 471,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577402_s_2021112213.09.18.jpg",
        "isPreview": true,
        "order": 4,
        "format": "horizontal"
      },
      {
        "id": 475,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577412_s_2021112213.06.27.jpg",
        "isPreview": true,
        "order": 0,
        "format": "horizontal"
      },
      {
        "id": 474,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577410_s_2021112213.07.44.jpg",
        "isPreview": true,
        "order": 1,
        "format": "horizontal"
      }
    ]
  },
]

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
      // res.json({ message: 'ok' })
      const { title, description, credits, photosInfo, order } = req.body
      const filesInfo = JSON.parse(photosInfo)
      const files = req.files

      console.log('FIELDS', title, description, credits, filesInfo, order)
      console.log('FILES', files)

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
      console.log('FILES-INFO', mappedFiles)

      const record = await db.query(`
        INSERT INTO photo
          (title, descriptions, credits, photo_order)
        VALUES
          ($1, $2, $3, $4)
        RETURNING *`,
        [title, description, credits, order]
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
        queryArr.push(`(${storage.id}, ${isWorkPreview}, ${photoOrder}, '${format}', '${image}')`)
      });
      const queryStr = queryArr.join(',')
      console.log('QueryArr', queryStr, queryArr)

      // 1 - set photos in table
      const photos = await db.query(`
        INSERT INTO photos
          (photo_id, is_photo_preview, photo_order, format, image)
        VALUES
          ${queryStr}
        RETURNING *;`
      )
      console.log('DB PHOTOS', photos.rows)


      const mappedDataForFrontend = {
        title: record.rows[0].title,
        order: record.rows[0].photo_order,
        credits: record.rows[0].credits,
        description: record.rows[0].descriptions,
        photos: photos.rows.map(v => {
          return {
            id: v.id,
            order: v.photo_order,
            format: v.format,
            isPreview: v.is_photo_preview,
            src: getRightPathForImage(v.image)
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
      const photoRecords = await db.query(`SELECT * FROM photo`)
      const dirtyPhotos = await db.query(`SELECT * FROM photos WHERE photo_id IS NOT NULL`)

      // prepare photos for front-end
      const photos = dirtyPhotos.rows.map(photo => ({
        id: photo.id,
        photo_id: photo.photo_id,
        src: getRightPathForImage(photo.image),
        isPreview: photo.is_photo_preview,
        order: photo.photo_order,
        format: photo.format ?? null,
      }))

      const works = photoRecords.rows.map((item) => {
        const order = item.photo_order ?? 0
        const description = item.descriptions ?? ''
        delete item.photo_order
        delete item.descriptions
        return {
          ...item,
          order,
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
      const { id } = req.params

      const record = await db.query(`SELECT * FROM photo WHERE id = $1`, [id])
      if (record.rows.length === 0) {
        res.status(404);
        res.send({ message: "Photo collection doesn't exist" });
      }

      const photo = record.rows[0]
      photo.order = photo?.photo_order ?? 0
      delete photo.photo_order

      const photosDirty = await db.query(`SELECT * FROM photos WHERE photo_id = $1`, [id])

      // prepare photos for front-end
      if (photosDirty?.rows?.length) {
        photo.photos = photosDirty.rows.map(photo => ({
          id: photo.id,
          // photo_id: photo.photo_id,
          src: getRightPathForImage(photo.image),
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
    const d = getCurrentDateTime()
    console.log('------------------------------------updatePhotoCollection-START', d)
    try {

    } catch (error) {

    }
    console.log('------------------------------------updatePhotoCollection-END', d)
  }
  async delete(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------deletePhotoCollection-START', d)
    try {
      const { id } = req.params
      const status = { id, }

      const removedPhotoRecord = await db.query(`
        DELETE FROM
          photo
        WHERE
          id = $1
        RETURNING *`,
        [id]
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