const db = require('../db/')
const { Inserts } = require('../global/helper');
const fs = require('fs');
class WorkController {
  // CRUD
  async createWork(req, res) {
    try {
      const { title, description, credits, videos, photosInfo, work_order, category } = req.body
      const filesInfo = JSON.parse(photosInfo)
      const files = req.files
      let workCategory = category ? category : null

      console.log('TEXT', title, description, credits, filesInfo)
      console.log('FILES', files)

      // prepare photos to db
      const mappedFiles = Array.from(files).map(v => ({ path: v.path, originalname: v.originalname })) // get path of photo in current project backedn/public/uploads/s/category
      console.log('FILES-INFO', mappedFiles)

      // new
      // 1 - create work record
      const work = await db.query(`INSERT INTO work (title, videos, description, credits, work_order, category) values ($1, $2, $3, $4, $5, $6) RETURNING *`, [title, videos, description, credits, work_order, workCategory])
      console.log('DB WORK', work.rows)
      let workId = ''
      if (work.rows?.[0]?.id) {
        workId = work.rows[0].id
      } else {
        throw new Error('work id is not setted')
      }

      // 2 - create photos record
      const queryArr = []
      Array.from(filesInfo).forEach((photo, i) => {
        const matchFileWithPhotoInfo = mappedFiles.find(file => file.originalname === photo.fileName)

        if (matchFileWithPhotoInfo) {
          const isWorkPreview = photo.isPreview ?? false
          const work_order = photo.order ?? null
          const format = photo.format ?? null
          const image = matchFileWithPhotoInfo.path ?? null
          queryArr.push(`(${workId}, ${isWorkPreview}, ${work_order}, ${format}, '${image}')`)
        }
      });
      const queryStr = queryArr.join(',')

      // 1 - set photos in table
      const photos = await db.query(`INSERT INTO photos(work_id, is_work_preview, work_order, format, image) values ${queryStr} RETURNING *;`)
      console.log('DB PHOTOS', photos.rows)
      let photoIds = ''
      if (photos?.rows?.length) {
        photoIds = Array.from(photos.rows).map(v => v.id)
      } else {
        throw new Error('photos are not setted')
      }
      // 3 - set photos id in work record
      const updatedWork = await db.query(`UPDATE work SET photos = $1 WHERE  id = $2 RETURNING *`, [photoIds, workId])
      console.log('updatedWork', updatedWork.rows)
      res.json(updatedWork.rows?.[0])

    } catch (e) {
      console.error('ERROR', e)
      // remove uploaded files
      const files = req.files
      Array.from(files).map(v => ({ path: v.path })).forEach(file => {
        fs.unlink(file.path, function (err) {
          if (err) {
            console.error("unlink can't delete file - ", filePath)
            throw err;
          }
          console.log('File deleted!');
        });
      })
    }
  }

  async getWork(req, res) { }

  async getWorks(req, res) { }

  async updateWork(req, res) { }

  async deleteWork(req, res) { }
}

module.exports = new WorkController()