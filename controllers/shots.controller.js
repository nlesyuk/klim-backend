const fs = require('fs');
const db = require('../db/index');
const {
  getRightPathForImage,
  prepareImagePathForDB,
  removeUploadedFiles,
  getCurrentDateTime,
  getUserIdByDomain
} = require('../global/helper')

const dbKey = 'shots';

class ShotsController {
  async create(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createShot-START', d)
    let RESPONSE
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { shots } = req.body
      const shotsDirty = JSON.parse(shots)
      /*
        [{
          workId: Number,
          format: String,
          categories: Array,
          photoOriginalName: String,
        }]
      */
      const files = req.files
      /*
        [{
          fieldname: 'photos[]',
          originalname: '009.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: './public/uploads/s/shot',
          filename: '1631285501490_s_009.jpg',
          path: 'public/uploads/s/shot/1631285501490_s_009.jpg',
          size: 51293
        }]
      */
      console.log('1createShot', files, shotsDirty)

      // 1 create shot
      // 10 - for multiply files
      /*
      const shortsQueryData = Array.from(shotsDirty).map(shot => {
        const workId = shot.workId
        const categories = shot.categories ?? ['all']
        // const c = categories.join(',')
        return `('${JSON.stringify(categories)}', ${workId})`
        // return `(${c}, ${workId})`
      }).join(',');
      const q = `INSERT INTO shot(categories, work_id) VALUES ${shortsQueryData} RETURNING *`;
      console.log('TEST1', shortsQueryData, q)
      const shotsCreated = await db.query(q)
      console.log('2shotsCreated', shotsCreated)
      const RESPONSE = shotsCreated?.rows
      */
      // 11 - for single file
      const shortsData = Array.from(shotsDirty).map(shot => {
        const workId = shot.workId
        const format = shot.format
        const categories = shot.categories ?? ['all']
        return { categories, workId, format }
      });
      const shotsCreated = await db.query(`
        INSERT INTO
          shot(categories, work_id, user_id)
        VALUES
          ($1, $2, $3)
        RETURNING *`,
        [shortsData[0].categories, shortsData[0].workId, userId]
      )
      let RESPONSE = Array.from(shotsCreated?.rows).map((v, i) => ({
        format: shortsData[i].format,
        ...v
      }))

      // 2 create photos
      /*
      // 21 - multiply photo for shot
      const photosQueryData = Array.from(files).map((file, i) => {
        const shot_id = RESPONSE[i].id
        const image = file.path
        RESPONSE[i].path = file.path
        return `(${shot_id}, '${image}')` // for multiply photos for shot
      }).join(',');
      console.log('TEST2', photosQueryData)
      await db.query(`INSERT INTO photos(shot_id, image) values ${photosQueryData} RETURNING *`) // for multiply photos for shot
      */

      // 22 - single photo for shot
      if (!files) {
        throw "files don't exist"
      }
      const photosData = Array.from(files).map((file, i) => {
        const image = prepareImagePathForDB(file)
        const shot_id = RESPONSE[i].id
        const format = RESPONSE[i].format
        RESPONSE[i].path = image
        return { shot_id, image, format }
      });
      const photoCreated = await db.query(`
        INSERT INTO
          photos(shot_id, image, format, user_id)
        VALUES
          ($1, $2, $3, $4)
        RETURNING *`,
        [photosData[0].shot_id, photosData[0].image, photosData[0].format, userId]
      )

      // 3 prepare for frontEnd
      RESPONSE = Array.from(RESPONSE).map(v => ({
        id: v.id,
        format: v.format,
        workId: v.work_id,
        categories: v.categories,
        src: getRightPathForImage(v.path, userId),
      }))

      console.log("RESPONSE", RESPONSE)
      res.json(RESPONSE)
    } catch (error) {
      // remove uploaded files
      const files = req.files
      removeUploadedFiles(files)

      // remove record from db
      const shotId = RESPONSE?.[0]?.id
      console.log('---', shotId)
      if (shotId) {
        const resq = await db.query(`DELETE FROM shot WHERE id=$1`, [shotId])
      }

      const anotherMessage = error?.message ?? 'Unknow server error at ' + ShotsController.name
      res.status(500).send({ message: anotherMessage })
      console.log(error)
    }
    console.log('------------------------------------createShot-END', d)
  }

  async get(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createShot-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const dirtyShots = await db.query(`SELECT * FROM shot `);
      if (!dirtyShots.rows) {
        throw 'query to db is error'
      }
      const dirtyShotsPhotos = await db.query(`SELECT * FROM photos WHERE shot_id IS NOT NULL AND user_id = $1`, [userId]);
      if (!dirtyShotsPhotos.rows) {
        throw 'query to db is error'
      }

      // prepare photos for front-end
      const photos = dirtyShotsPhotos.rows.map(photo => ({
        id: photo.shot_id,
        format: photo.format,
        src: getRightPathForImage(photo.image, userId),
        workId: dirtyShots.rows.filter(v => v.id === photo.shot_id)?.[0]?.work_id,
        categories: dirtyShots.rows.filter(v => v.id === photo.shot_id)?.[0]?.categories,
      }))

      console.log(photos)
      res.json(photos)
    } catch (error) {
      console.error(error)
      res.status(500)
    }
    console.log('------------------------------------createShot-END', d)

  }

  async update(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createShot-START', d)
    /*[{
      id: Number
      src: String
      workId: Number
      categories: Array
      format: String | null
    }]*/
    const userId = getUserIdByDomain(req.headers?.domain)
    if (isNaN(userId)) {
      throw new Error(`userId should be a number got ${userId}`)
    }
    const files = req.files
    const newImagePath = files?.[0]?.path
    const { id, src, workId, categories, format } = req.body
    const shotId = +id
    const shotWorkId = +workId
    const shotCategories = JSON.parse(categories)

    console.log('DATA', { id, src, workId, categories, format }, files)
    const RESPONSE = {
      id,
      src,
      workId: "",
      categories: "",
      format: "",
    }
    const TEMP = {}

    // update categories, workid
    try {
      const updatedDataRaw = await db.query(`UPDATE shot SET categories = $1, work_id = $2 WHERE id = $3 AND user_id = $4 RETURNING *`, [shotCategories, shotWorkId, shotId, userId]);
      console.log('>>', updatedDataRaw.rows)
      const updatedData = updatedDataRaw?.rows[0]
      if (updatedData) {
        const { categories, work_id, id } = updatedData
        RESPONSE.id = id
        RESPONSE.workId = work_id
        RESPONSE.categories = categories
      }
    } catch (error) {
      catchError(error, req, res)
    }

    // get path of existing img from server
    try {
      if (!src && newImagePath) {
        const existingImg = await db.query(`SELECT * FROM photos WHERE shot_id = $1 AND user_id = $2`, [shotId, userId])
        const targetImagePath = existingImg?.rows[0]?.image
        console.log('targetImagePath', targetImagePath)

        if (targetImagePath) {
          TEMP.imagePath = targetImagePath
        } else {
          throw new Error("DB: Can't get image path")
        }
      }
    } catch (error) {
      catchError(error, req, res)
    }

    // upload new img on a server
    // update path of image in record
    // delete prev existing image
    try {
      if (newImagePath) {
        // update path of image in record
        const updatedImageRaw = await db.query(`UPDATE photos SET image = $1, format = $2 WHERE shot_id = $3 AND user_id = $4 RETURNING *`, [newImagePath, format, shotId, userId]);
        const updatedImage = updatedImageRaw?.rows[0]
        if (updatedImage) {
          console.log('updatedImage', updatedImage.image)
          const { image, format } = updatedImage
          RESPONSE.src = image
          RESPONSE.format = format

          // delete prev existing image
          if (TEMP.imagePath) {
            console.log('delete prev existing image:', TEMP.imagePath)
            removeUploadedFiles([{ path: TEMP.imagePath }])
          }
        }
      } else if (format) {
        const updatedImageRaw = await db.query(`UPDATE photos SET format = $1 WHERE shot_id = $2 AND user_id = $3 RETURNING *`, [format, shotId, userId]);
        const updatedImage = updatedImageRaw?.rows[0]
        if (updatedImage) {
          RESPONSE.format = updatedImage.format
        }
      } else {
        console.log("Don't need uploading image")
      }
    } catch (error) {
      catchError(error, req, res, false)
    }

    console.log('RESPONSE', RESPONSE)
    res.json(RESPONSE)
    console.log('------------------------------------createShot-END', d)

    function catchError(error, req, res, isRemoveUploadedFileFromServer = true) {
      const files = req.files
      if (files && isRemoveUploadedFileFromServer) {
        removeUploadedFiles(files)
      }
      console.error(error)
      res.status(500)
      res.json('catchError fn:', error)
    }
  }

  async delete(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------deleteShot-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      /*
        id: Number
      */
      const { id } = req.params
      const status = { id: +id, }

      const deletedShot = await db.query(`DELETE FROM shot WHERE id = $1 AND user_id = $2`, [id, userId])
      if (!deletedShot) {
        throw 'query to db is error'
      }
      const deletedShotPhoto = await db.query(`DELETE FROM photos WHERE shot_id = $1 AND user_id = $2 RETURNING *`, [id, userId])
      if (!deletedShotPhoto) {
        throw 'query to db is error'
      }

      // remove uploaded files
      if (deletedShotPhoto?.rows?.length) {
        let count = 0
        Array.from(deletedShotPhoto.rows).forEach(file => {
          fs.unlink(file.image, function (err) { // remove file
            if (err) {
              console.error("unlink can't delete file - ", file.image)
              throw err;
            }
            console.log('File deleted!');
            ++count
          });
        })
        status.message = `Removed ${count} photos`
      } else {
        await db.query(`UPDATE photos SET shot_id = null WHERE shot_id = $1 AND user_id = $2`, [id, userId])
        status.message = "Photos was not removed"
      }
      status.status = 'success'

      console.log(status)
      res.json(status)
      /*[{
        id: Number
        workId: Number
        categories: Array
        format: String | null
        src: String "//localhost:8090/public/uploads/s/shot/1631380679046_s_0813.jpg"
      }]*/
    } catch (error) {
      console.error(error)
      res.status(500)
      res.json({ status: 'failed' })
    }
    console.log('------------------------------------deleteShot-END', d)
  }
}

module.exports = new ShotsController()