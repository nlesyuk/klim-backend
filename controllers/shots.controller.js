const fs = require('fs');
const db = require('../db/index');
const { getRightPathForImage, removeUploadedFiles } = require('../global/helper')

const dbKey = 'shots';

class ShotsController {
  async createShot(req, res) {
    try {
      const d = Date.now()
      console.log('------------------------------------createShot-START', d)
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
      const shotsCreated = await db.query(`INSERT INTO shot(categories, work_id) VALUES ($1, $2) RETURNING *`, [shortsData[0].categories, shortsData[0].workId])
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
        const image = file.path
        const shot_id = RESPONSE[i].id
        const format = RESPONSE[i].format
        RESPONSE[i].path = file.path
        return { shot_id, image, format }
      });
      const photoCreated = await db.query(`INSERT INTO photos(shot_id, image, format) values ($1, $2, $3) RETURNING *`, [photosData[0].shot_id, photosData[0].image, photosData[0].format])

      // 3 prepare for frontEnd
      RESPONSE = Array.from(RESPONSE).map(v => ({
        id: v.id,
        format: v.format,
        workId: v.work_id,
        categories: v.categories,
        src: getRightPathForImage(v.path),
      }))

      console.log("RESPONSE", RESPONSE)
      res.json(RESPONSE)
      console.log('------------------------------------createShot-END', d)
    } catch (error) {
      // remove uploaded files
      const files = req.files
      removeUploadedFiles(files)

      // remove record from db
      const resq = await db.query(`DELETE FROM shot WHERE id=$1`, [RESPONSE[0].id])

      console.error('ERROR', error, resq.rows)
      res.status(500)
      res.json({ error: 'error' })
    }
  }

  async getShots(req, res) {
    try {
      const d = Date.now()
      console.log('------------------------------------createShot-START', d)

      const dirtyShots = await db.query(`SELECT * FROM shot `);
      if (!dirtyShots.rows) {
        throw 'query to db is error'
      }
      const dirtyShotsPhotos = await db.query(`SELECT * FROM photos WHERE shot_id IS NOT NULL`);
      if (!dirtyShotsPhotos.rows) {
        throw 'query to db is error'
      }

      // prepare photos for front-end
      const photos = dirtyShotsPhotos.rows.map(photo => ({
        id: photo.shot_id,
        format: photo.format,
        src: getRightPathForImage(photo.image),
        workId: dirtyShots.rows.filter(v => v.id === photo.shot_id)?.[0]?.work_id,
        categories: dirtyShots.rows.filter(v => v.id === photo.shot_id)?.[0]?.categories,
      }))

      console.log(photos)
      res.json(photos)
      console.log('------------------------------------createShot-END', d)
    } catch (error) {
      console.error(error)
      res.status(500)
    }

  }

  async updateShot(req, res) {
    try {
      const d = Date.now()
      console.log('------------------------------------createShot-START', d)
      /*[{
        id: Number
        src: String
        workId: Number
        categories: Array
        format: String | null
      }]*/
      const { id, src, workId, categories, format } = req.body

      console.log('DATA', { id, src, workId, categories, format })

      res.json({ ok: 1 })
      console.log('------------------------------------createShot-END', d)
    } catch (error) {
      console.error(error)
      res.status(500)
    }
  }

  async deleteShot(req, res) {
    try {
      const d = Date.now()
      console.log('------------------------------------deleteShot-START', d)
      /*
        id: Number
      */
      const { id } = req.params
      const status = { id: +id, }

      const deletedShot = await db.query(`DELETE FROM shot WHERE id = $1`, [id])
      if (!deletedShot) {
        throw 'query to db is error'
      }
      const deletedShotPhoto = await db.query(`DELETE FROM photos WHERE shot_id = $1 RETURNING *`, [id])
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
        await db.query(`UPDATE photos SET shot_id = null WHERE shot_id = $1`, [id])
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
      console.log('------------------------------------deleteShot-END', d)
    } catch (error) {
      console.error(error)
      res.status(500)
      res.json({ status: 'failed' })
    }
  }
}

module.exports = new ShotsController()