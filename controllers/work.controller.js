const db = require('../db/')
const fs = require('fs');
const { addAbortSignal } = require('stream');
const { getRightPathForImage } = require('../global/helper')

class WorkController {
  // CRUD
  async createWork(req, res) {
    const storage = {}
    try {
      storage.r = 22
      const { title, description, credits, videos, photosInfo, workOrder, category } = req.body
      const filesInfo = JSON.parse(photosInfo)
      const files = req.files
      let workCategory = category ? category : null

      console.log('TEXT', title, description, credits, filesInfo)
      console.log('FILES', files)

      // prepare photos to db
      const mappedFiles = Array.from(files).map(v => {
        let destination = `${v.destination}`.slice(2)
        return {
          path: `${destination}/${v.filename}`,
          filename: v.filename
        }
      }) // get path of photo in current project backend/public/uploads/s/category
      console.log('FILES-INFO', mappedFiles)

      // new
      // 1 - create work record
      const work = await db.query(`INSERT INTO work (title, videos, description, credits, work_order, category) values ($1, $2, $3, $4, $5, $6) RETURNING *`, [title, videos, description, credits, workOrder, workCategory])
      storage.workId = work.rows[0].id

      console.log('DB WORK', work.rows)
      let workId = ''
      if (work.rows?.[0]?.id) {
        workId = work.rows[0].id
      } else {
        throw new Error('work id is not setted')
      }

      // 2 - create photos record
      const queryArr = []
      console.log('DB WORK-filesInfo', filesInfo)
      console.log('DB WORK-mappedFiles', mappedFiles)

      Array.from(filesInfo).forEach((photo, i) => {
        const isWorkPreview = photo.isPreview ?? false
        const work_order = photo.order ?? null
        const format = photo.format ?? null
        const image = mappedFiles[i].path ?? null
        queryArr.push(`(${workId}, ${isWorkPreview}, ${work_order}, '${format}', '${image}')`)
      });
      const queryStr = queryArr.join(',')
      console.log('QueryArr', queryStr, queryArr)

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
        fs.unlink(file.path, function (err) { // remove file
          if (err) {
            console.error("unlink can't delete file - ", filePath)
            throw err;
          }
          console.log('File deleted!');
        });
      })

      const resq = await db.query(`DELETE FROM work WHERE id=$1`, [storage.workId])
      console.log('storage', storage, resq.rows)
      res.status(500)
    }
  }

  async getWork(req, res) {
    try {
      const { id } = req.params

      const workDirty = await db.query(`SELECT * FROM work WHERE id = $1`, [id])
      if (workDirty.rows.length === 0) {
        res.status(404);
        res.send({ message: 'Work do not exist' });
      }

      const work = workDirty.rows[0]
      const photosDirty = await db.query(`SELECT * FROM photos WHERE work_id = $1`, [id])

      if (photosDirty?.rows?.length) {
        work.photos = photosDirty.rows.map(item => ({
          src: getRightPathForImage(item.image),
          order: item.work_order,
          isPreview: item.is_work_preview,
        }))
      }

      console.log('work', work)
      res.json(work)
    } catch (error) {
      console.error('getWork Error', error)
      res.status(500)
    }
  }

  async getWorks(req, res) {
    try {
      const dirtyWorks = await db.query(`SELECT * FROM work`)
      const dirtyWorkPhotos = await db.query(`SELECT * FROM photos WHERE work_id IS NOT NULL`)

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
        work.photos = photos.filter(photo => {
          if (photo.work_id && photo.work_id === work.id) {
            delete photo.work_id
            return true
          }
          return false
        })
        return work
      })

      const d = Date.now()
      console.log('------------------------------------getWorks-START', d)
      console.log(works)
      console.log('------------------------------------getWorks-END', d)

      res.json(works)
    } catch (error) {
      console.error('getWorks Error', error)
    }
  }

  async updateWork(req, res) {
    try {
      const { id, title, credits, description, videos, photos } = req.body

      const d = Date.now()
      console.log('------------------------------------updateWork-START', d)
      console.log(id, req.body)

      // prepare photos
      const existing = photos.existing
      const newPhotos = photos.new
      const workId = id

      /*
      {
        id: 15,
        src: '//localhost:8090/public/uploads/s/work/1630249866918_s_7R-8R-Night.jpg',
        isPreview: false,
        order: 0
        format: 'str'
      }
      */

      // create new photos
      if (newPhotos?.length) {
        console.log('NEW:')
        const queryArr = []
        Array.from(newPhotos).forEach(v => {
          console.log(v)
        })
        // prepare data
        // Array.from(newPhotos).forEach((photo, i) => {
        //   const isWorkPreview = photo.isPreview ?? false
        //   const work_order = photo.order ?? null
        //   const format = photo.format ?? null
        //   const image = mappedFiles[i].path ?? null
        //   queryArr.push(`(${workId}, ${isWorkPreview}, ${work_order}, '${format}', '${image}')`)
        // });
        // // req to db
        // const photos = await db.query(`INSERT INTO photos(work_id, is_work_preview, work_order, format, image) values ${queryStr} RETURNING *;`)
      }
      // update photo info
      if (existing?.length) {
        console.log('EXISTING:')
        Array.from(existing).forEach(v => {
          console.log(v)
        })

        const queryArr = []
        // prepare data
        Array.from(existing).forEach(photo => {
          const id = photo.id ?? null
          const image = photo.src ?? null
          const format = photo?.format ?? null
          const work_order = photo.order ?? null
          const isWorkPreview = photo.isPreview ?? false
          queryArr.push(`(${id}, ${workId}, ${isWorkPreview}, ${work_order}, '${format}', '${image}')`)
        });
        /*
          update test as t set
          column_a = c.column_a,
            column_c = c.column_c
          from(values
            ('123', 1, '---'),
            ('345', 2, '+++')
          ) as c(column_b, column_a, column_c)
          where c.column_b = t.column_b;

          select * from test;
        */

        console.log("RES-q", queryArr)
        // req to db
        const photos = await db.query(`
          UPDATE photos AS p
          SET
            image = row.image
            format = row.format
            work_id = row.work_id
            work_order = row.work_order
            is_work_preview = row.is_work_preview
          FROM (VALUES ${queryArr.join(',')})
            AS row(id, work_id, is_work_preview, work_order, format, image)
          WHERE row.id = p.id;
        `)


        console.log("RES", photos.rows)
      }

      // update work info
      // const updateWorkDraft = await db.query(`UPDATE work SET title = $1, credits = $2, description = $3, videos = $4, photos = $5 WHERE id = $6 RETURNING *`, [title, credits, description, videos, photos, id])


      console.log('------------------------------------updateWork-END', d)

      res.json('ok')
    } catch (error) {
      console.error('updateWork ERROR:', error)
      res.json('error')
    }
  }

  async deleteWork(req, res) {
    try {
      const { id } = req.params
      const status = {
        id,
      }

      const removedWork = await db.query(`DELETE FROM work WHERE id = $1 RETURNING *`, [id])
      const removedPhotos = await db.query(`DELETE FROM photos WHERE work_id = $1 AND photo_id IS NULL AND shot_id IS NULL RETURNING *`, [id])

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
          status.message = `Removed ${count} photos`
        })
      } else {
        await db.query(`UPDATE photos SET work_id = null WHERE work_id = $1`, [id])
        status.message = "Photos was not removed - saved for other categories or dosn't exist"
      }

      res.json(status)
    } catch (error) {
      console.error('deleteWork Error', error)
      res.status(500)
    }
  }
}

module.exports = new WorkController()