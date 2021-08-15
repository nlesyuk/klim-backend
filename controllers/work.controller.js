const db = require('../db/')
const { Inserts } = require('../global/helper');

class WorkController {
  // CRUD
  async createWork(req, res) {
    try {
      const { title, description, credits, photosInfo } = req.body
      const filesInfo = JSON.parse(photosInfo)
      const files = req.files

      console.log('TEXT', title, description, credits, filesInfo)
      console.log('FILES', files)

      // prepare photos to db
      const mappedFiles = Array.from(files).map(v => ({ path: v.path, originalname: v.originalname })) // get path of photo in current project backedn/public/uploads/s/category
      console.log('FILES-INFO', mappedFiles)

      const queryArr = []
      Array.from(filesInfo).forEach((photo, i) => {
        const matchFileWithPhotoInfo = mappedFiles.find(file => file.originalname === photo.fileName)

        if (matchFileWithPhotoInfo) {
          const is_preview = photo.isPreview ?? false
          const work_order = photo.order ?? null
          const format = photo.format ?? null
          const image = matchFileWithPhotoInfo.path ?? null
          queryArr.push(`(${is_preview}, ${work_order}, ${format}, '${image}')`)
        }
      });
      const queryStr = queryArr.join(',')

      console.log('str', queryStr, queryArr)
      // 1 - set photos in table
      const photos = await db.query(`INSERT INTO photos(is_preview, work_order, format, image) values ${queryStr} RETURNING *;`)
      // const photos = await db.none(`INSERT INTO photos (work_id, shot_id, photo_id, is_preview, format, categories, image) values ($1) RETURNING *`, Inserts('1, $2, $3, $4, $5, $6', rrr))
      console.log('DB PHGOTOS', photos)
      // 2 -

      // const work = await db.query(`INSERT INTO work (title, videos, description, credits, category, photos) values ($1, $2, $3, $4, $5, $6) RETURNING *`, [title, videos, description, credits, category, photos])

    } catch (e) {
      console.error('ERROR', e)
      // remove uploaded files
    }
  }

  async getWork(req, res) { }

  async getWorks(req, res) { }

  async updateWork(req, res) { }

  async deleteWork(req, res) { }
}

module.exports = new WorkController()