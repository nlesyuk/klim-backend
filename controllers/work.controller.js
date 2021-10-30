const fs = require('fs');
const db = require('../db/')
const { getRightPathForImage, prepareImagePathForDB, removeDomainFromImagePath, removeUploadedFiles } = require('../global/helper')

class WorkController {
  // CRUD
  async createWork(req, res) {
    const d = Date.now()
    console.log('------------------------------------createWork-START', d)
    const storage = {}
    try {
      const { title, description, credits, videos, photosInfo, workOrder, category } = req.body
      const filesInfo = JSON.parse(photosInfo)
      const files = req.files
      let workCategory = category ? category : null

      console.log('TEXT', title, description, credits, filesInfo)
      console.log('FILES', files)

      // 0 check
      if (!files?.length) {
        throw new Error('No files')
      }

      // prepare photos to db
      const mappedFiles = Array.from(files).map(file => {
        return {
          path: prepareImagePathForDB(file),
          filename: file.filename
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
      console.log('photoIds', photoIds)

      // 3 - set photos id in work record
      const updatedWork = await db.query(`UPDATE work SET photos = $1 WHERE  id = $2 RETURNING *`, [photoIds, workId])
      console.log('updatedWork', updatedWork.rows)
      res.json(updatedWork.rows?.[0])

    } catch (e) {
      if (e.message === 'No files') {
        res.status(400)
        res.send({ message: 'No files' })
      } else {
        console.error('createWork Error', e)
        // remove uploaded files
        const files = req.files
        removeUploadedFiles(files)

        // remove record from db
        const resq = await db.query(`DELETE FROM work WHERE id=$1`, [storage.workId])
        console.log('storage', storage, resq.rows)

        res.status(500)
        res.send({ message: 'Server error' })
      }
    }
    console.log('------------------------------------createWork-END', d)
  }

  async getWork(req, res) {
    const d = Date.now()
    console.log('------------------------------------getWork-START', d)
    try {
      const { id } = req.params

      const workDirty = await db.query(`SELECT * FROM work WHERE id = $1`, [id])
      if (workDirty.rows.length === 0) {
        res.status(404);
        res.send({ message: 'Work do not exist' });
      }

      const work = workDirty.rows[0]
      work.workOrder = work?.work_order ?? 0
      delete work.work_order

      const photosDirty = await db.query(`SELECT * FROM photos WHERE work_id = $1`, [id])

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
      console.error('getWork Error', error)
      res.status(500)
    }
    console.log('------------------------------------getWork-END', d)
  }

  async getWorks(req, res) {
    const d = Date.now()
    console.log('------------------------------------getWorks-START', d)
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
        work.workOrder = work?.work_order ?? 0
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

      const d = Date.now()
      console.log('------------------------------------getWorks-START', d)
      console.log(works)
      console.log('------------------------------------getWorks-END', d)

      res.json(works)
    } catch (error) {
      console.error('getWorks Error', error)
    }
    console.log('------------------------------------getWorks-END', d)
  }

  async updateWork(req, res) {
    const d = Date.now()
    console.log('------------------------------------updateWork-START', d)
    try {
      const { id, title, credits, description, videos, photosInfo, workOrder, removedPhotos } = req.body
      const RESPONSE = {
        photos: []
      }

      const d = Date.now()
      console.log('------------------------------------updateWork-START', d)
      console.log(id)

      // prepare PHOTOS
      const parsedPhotosInfo = JSON.parse(photosInfo)
      const existingPhotos = parsedPhotosInfo.existing
      const newPhotos = parsedPhotosInfo.new
      const parsedRemovedPhotos = JSON.parse(removedPhotos)
      const workId = id
      // console.log('parsedPhotos', parsedPhotosInfo)


      // CREATE NEW PHOTOS
      /*{
        fileName: '168.jpg',
        isPreview: false,
        order: 0
        format: 'vertical',
      }*/
      if (newPhotos?.length) {
        // console.log('NEW:')
        const queryArr = []
        const files = req.files

        // prepare photos to db
        const mappedFiles = Array.from(files).map(v => {
          // v.destination './public/uploads/s/work/1630852886366_s_168.jpg'
          let destination = `${v.destination}`.slice(2)
          return {
            path: `${destination}/${v.filename}`, // 'public/uploads/s/work/1630852886366_s_168.jpg'
            filename: v.filename // '1630852886366_s_168.jpg'
          }
        })
        // prepare data
        Array.from(newPhotos).forEach((photo, i) => {
          const isWorkPreview = photo.isPreview ?? false
          const workOrder = photo.order ?? null
          const format = photo.format ?? null
          const image = mappedFiles[i].path ?? null
          queryArr.push(`(${workId}, ${isWorkPreview}, ${workOrder}, '${format}', '${image}')`)
        });

        // console.log("NEW-RES-q", queryArr)
        const photosDirty = await db.query(`
          INSERT INTO photos(work_id, is_work_preview, work_order, format, image)
          VALUES ${queryArr.join(',')}
          RETURNING *;
        `)


        // console.log("NEW-RES", photosDirty.rows)
        const arrNewPhotos = Array.from(photosDirty.rows).map(v => ({
          id: v.id,
          src: getRightPathForImage(v.image),
          isPreview: v.is_work_preview,
          order: v.work_order,
          format: v.format
        }))

        RESPONSE.photos = RESPONSE.photos.concat(arrNewPhotos)
      }

      // UPDATE PHOTOS INFO
      /*{
        id: 15,
        src: '//localhost:8090/public/uploads/s/work/1630249866918_s_7R-8R-Night.jpg',
        isPreview: false,
        order: 0
        format: 'str'
      }*/
      if (existingPhotos?.length) {
        console.log('EXISTING:')
        const queryArr = []

        // prepare data
        Array.from(existingPhotos).forEach(photo => {
          let image = removeDomainFromImagePath(photo.src) ?? null
          const id = photo.id ?? null
          const format = photo?.format ?? null
          const work_order = photo.order ?? null
          const isWorkPreview = photo.isPreview ?? false
          queryArr.push(`(${id}, ${workId}, ${isWorkPreview}, ${work_order}, '${format}', '${image}')`)
        });

        // console.log("EXISTING-RES-q", queryArr)
        // req to db - https://stackoverflow.com/questions/18797608/update-multiple-rows-in-same-query-using-postgresql
        const photos = await db.query(`
          UPDATE photos AS p
          SET
            image = row.image,
            format = row.format,
            work_id = row.work_id,
            work_order = row.work_order,
            is_work_preview = row.is_work_preview
          FROM (VALUES ${queryArr.join(',')})
            AS row(id, work_id, is_work_preview, work_order, format, image)
          WHERE row.id = p.id
          RETURNING *;
        `)


        // console.log("EXISTING-RES", photos.rows)

        const arrExistingPhotos = Array.from(photos.rows).map(v => ({
          id: v.id,
          src: getRightPathForImage(v.image),
          isPreview: v.is_work_preview,
          order: v.work_order,
          format: v.format
        }))

        RESPONSE.photos = RESPONSE.photos.concat(arrExistingPhotos)
      }

      // DELETE PHOTOS
      if (parsedRemovedPhotos.length) {
        const deletedPhotos = await db.query(`DELETE FROM photos WHERE id IN (${parsedRemovedPhotos.join(',')}) RETURNING *`)
        console.log('deletedPhotos', deletedPhotos.rows)
      }

      // UPDATE WORK INFO
      const photos = Array.from(RESPONSE.photos).map(v => v.id)
      const updateWorkDraft = await db.query(`UPDATE work SET title = $1, credits = $2, description = $3, videos = $4, photos = $5, work_order = $6 WHERE id = $7 RETURNING *`, [title, credits, description, videos, photos, workOrder, id])

      // console.log('update work', updateWorkDraft.rows)
      const updateWork = updateWorkDraft.rows[0]
      for (let key in updateWork) {
        if (key === 'photos') {
          RESPONSE.photos = [...RESPONSE.photos]
          continue
        }
        if (key === 'work_order') {
          RESPONSE['workOrder'] = updateWork[key]
          continue
        }
        RESPONSE[key] = updateWork[key]
      }

      console.log('RESPONSE:', RESPONSE)
      console.log('------------------------------------updateWork-END', d)
      res.json(RESPONSE)
    } catch (error) {
      console.error('updateWork ERROR:', error)
      res.status(500)
      res.json('error')
    }
    console.log('------------------------------------updateWork-END', d)
  }

  async deleteWork(req, res) {
    const d = Date.now()
    console.log('------------------------------------deleteWork-START', d)
    try {
      const { id } = req.params
      const status = { id, }

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
        })
        status.message = `Removed ${count} photos`
      } else {
        await db.query(`UPDATE photos SET work_id = null WHERE work_id = $1`, [id])
        status.message = "Photos was not removed - saved for other categories or dosn't exist"
      }
      status.status = 'success'

      res.json(status)
    } catch (error) {
      console.error('deleteWork Error', error)
      res.status(500)
    }
    console.log('------------------------------------deleteWork-END', d)
  }
}

module.exports = new WorkController()