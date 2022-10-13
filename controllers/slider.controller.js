const fs = require('fs');
const db = require('../db/index')
const {
  getCurrentDateTime,
  removeUploadedFiles,
  prepareImagePathForDB,
  getRightPathForImage,
  prepareSlideDataForClient,
  removeFileByPath,
  getUserIdByDomain,
} = require('../global/helper')
const dbKey = 'slides';

class SliderController {
  /*
    type: String
    title: String
    order: Number
    video: String
    workId: Number
    photoId: Number
    photos[]: (binary)
  */
  async create(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createSlider-START', d)
    const temp = {}
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { title, type, order, videos, workId, photoId, photosInfo } = req.body
      console.log('START', title, type, order, videos, workId, photoId, photosInfo)

      // check
      if (!title) {
        throw new Error('title is required')
      }
      if (!['video', 'image'].includes(type)) {
        throw new Error('type is required')
      }
      if (type === 'video' && !videos) {
        throw new Error('video is required')
      }
      if (!Number.isInteger(+order)) {
        throw new Error('order is required')
      }
      if (workId && !Number.isInteger(+workId)) {
        throw new Error('workId is required')
      }
      if (photoId && !Number.isInteger(+photoId)) {
        throw new Error('photoId is required')
      }

      // photo
      const files = req.files
      // prepare photos to db
      const mappedFiles = Array.from(files).map(file => {
        return {
          path: prepareImagePathForDB(file),
          filename: file.filename,
        }
      })

      // data
      const slide = {
        type,
        title,
        slide_order: order ? +order : null,
        workId: workId ? +workId : null,
        photoId: photoId ? +photoId : null,
        image: mappedFiles?.[0]?.path ?? null,
        videos: videos ? videos : null,
      }

      console.log('slide', slide, mappedFiles)
      // db
      const createdSlideRaw = await db.query(`
        INSERT INTO
          slides(title, slide_order, work_id, photo_id, image, type, videos, user_id)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;`,
        [slide.title, slide.slide_order, slide.workId,
        slide.photoId, slide.image, slide.type, slide.videos, userId]
      )

      temp.createdId = createdSlideRaw?.rows?.[0]?.id

      if (createdSlideRaw?.rows?.[0]) {
        const { id, type, title, image, slide_order, videos, work_id, photo_id } = createdSlideRaw.rows[0]
        const createdSlide = {
          id,
          type,
          title,
          image: image ? getRightPathForImage(image, userId) : null,
          order: slide_order,
          videos: videos ? videos : null,
          workId: work_id,
          photoId: photo_id,
        }
        res.status(200)
        res.json(createdSlide)
      } else {
        res.status(500)
        res.send({ message: 'record does"t created in DB' })
      }

    } catch (error) {
      // remove uploaded files
      const files = req.files
      removeUploadedFiles(files)

      // remove record from db
      if (temp.createdId) {
        const resq = await db.query(`DELETE FROM slides WHERE id = $1 AND user_id = $2`, [temp.createdId, userId])
        console.log('createSlider deleted record', resq.rows)
      }

      // response
      const anotherMessage = error?.message
        ? error.message
        : 'Unknow server error at createSlider controller'
      res.status(500)
      res.send({ message: anotherMessage })
      console.error('createSlider Error', anotherMessage)
    }
    console.log('------------------------------------createSlider-END', d)
  }

  async get(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getSlider-START', d)

    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const slides = await db.query(`SELECT * FROM slides WHERE user_id = $1`, [userId])
      const slidesRaw = slides?.rows
      if (slidesRaw?.length) {
        const slides = Array.from(slidesRaw).map(slide => {
          const { id, type, title, image, slide_order, videos, work_id, photo_id } = slide
          console.log('GET_SLIDE', { id, type, title, image, slide_order, videos, work_id, photo_id })
          return {
            id,
            type,
            title,
            image: getRightPathForImage(image, userId) || null,
            order: slide_order,
            videos: videos ? JSON.parse(videos) : null,
            workId: work_id,
            photoId: photo_id,
          }
        })

        res.status(200).json(slides)
      } else {
        res.status(200).send([])
      }

    } catch (error) {
      // response
      const anotherMessage = error?.message
        ? error.message
        : 'Unknow server error at getSlider controller';
      console.error('getSlider Error', anotherMessage)
      res.status(500).send({ message: anotherMessage })
    }
    console.log('------------------------------------getSlider-END', d)
  }

  async getById(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getSliderById-START', d)

    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const id = req.params?.id ? +req.params?.id : null
      if (!id || !Number.isInteger(id)) {
        throw new Error('id is required or id is incorrect')
      }

      const slides = await db.query(`SELECT * FROM slides WHERE id = $1 AND user_id = $2`, [id, userId])

      const slideRaw = slides?.rows?.[0]
      if (slideRaw) {
        const { id, type, title, image, slide_order, videos, work_id, photo_id } = slideRaw
        const slideClear = {
          id,
          type,
          title,
          image: image ? getRightPathForImage(image, userId) : null,
          order: slide_order,
          videos: videos ? JSON.parse(videos) : null,
          workId: work_id,
          photoId: photo_id,
        }

        res.status(200).json(slideClear)
      } else {
        res.status(200).send({ message: 'Do not find slide' })
      }

    } catch (error) {
      // response
      const anotherMessage = error?.message
        ? error.message
        : 'Unknow server error at getSliderById controller'
      res.status(500).send({ message: anotherMessage })
      console.error('getSliderById Error', anotherMessage)
    }

    res.status(200).json({ message: 'get' })
    console.log('------------------------------------getSliderById-END', d)
  }

  async update(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------updateSlider-START', d)
    /*
      type: String
      title: String
      order: Number
        video: String
        workId: Number
        photoId: Number
        photos[]: (binary)
    */
    const temp = {}
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const { id, title, type, order, videos, workId, photoId } = req.body
      console.log('START', id, title, type, order, videos, workId, photoId)

      // check
      if (!id) {
        throw new Error('id is required')
      }
      if (!title) {
        throw new Error('title is required')
      }
      if (!['video', 'image'].includes(type)) {
        throw new Error('type is required')
      }
      if (type === 'video' && !videos) {
        throw new Error('video is required')
      }
      if (!Number.isInteger(+order)) {
        throw new Error('order is required')
      }
      if (photoId && !Number.isInteger(+photoId) || workId && !Number.isInteger(+workId)) {
        throw new Error('photoId or workId is required')
      }

      // base data
      const slide = {
        id,
        type,
        title,
        slide_order: order ? +order : null,
        workId: workId ? +workId : null,
        photoId: photoId ? +photoId : null,
        image: null,
        videos: videos ? videos : null,
      }

      if (type === 'image') {
        const files = req.files
        let slideClear

        // 1 upload new image
        if (files?.length) {
          // prepare photos to db
          const mappedFiles = Array.from(files).map(file => {
            return {
              path: prepareImagePathForDB(file),
            }
          })

          // get old image path
          const oldImage = await db.query(`SELECT * FROM slides WHERE id = $1 AND user_id = $2`, [id, userId])
          const oldImagePath = oldImage?.rows?.[0]?.image ?? null
          // remove old image
          const isRemoved = removeFileByPath(oldImagePath)
          // set new image path to db
          if (isRemoved) {
            slide.image = mappedFiles?.[0]?.path ?? null
            const slideRaw = await db.query(`
              UPDATE slides
              SET
                type = $2,
                title = $3,
                slide_order = $4,
                work_id = $5,
                photo_id = $6,
                image = $7
              WHERE
                id = $1 AND
                user_id = $8
              RETURNING *`,
              [
                slide.id,
                slide.type,
                slide.title,
                slide.slide_order,
                slide.workId,
                slide.photoId,
                slide.image,
                userId,
              ]
            );
            // result
            slideClear = prepareSlideDataForClient(slideRaw)
          } else {
            res.status(500)
            res.send({ message: 'Can not remove old image' })
          }
        } else {
          // 2 update data without image
          const slideRaw = await db.query(`
            UPDATE slides
            SET
              type = $2,
              title = $3,
              slide_order = $4,
              work_id = $5,
              photo_id = $6
            WHERE id = $1 AND user_id = $7
            RETURNING *`,
            [
              slide.id,
              slide.type,
              slide.title,
              slide.slide_order,
              slide.workId,
              slide.photoId,
              userId
            ]
          );
          // result
          slideClear = prepareSlideDataForClient(slideRaw)
        }

        // response
        if (slideClear) {
          console.log('IMG+ response', slideClear)
          res.status(200)
          res.json(slideClear)
        } else {
          throw new Error('slide mapped is incorrect while update image')
        }
      } else if (type === 'video') {
        // 1 update video
        const slideRaw = await db.query(`
          UPDATE slides
          SET
            type = $2,
            title = $3,
            slide_order = $4,
            work_id = $5,
            photo_id = $6,
            videos = $7
          WHERE id = $1 AND user_id = $8
          RETURNING *`,
          [
            slide.id,
            slide.type,
            slide.title,
            slide.slide_order,
            slide.workId,
            slide.photoId,
            slide.videos,
            userId,
          ]
        );
        // result
        const slideClear = prepareSlideDataForClient(slideRaw)

        // response
        if (slideClear) {
          console.log('VIDEO+ response', slideClear)
          res.status(200)
          res.json(slideClear)
        } else {
          throw new Error('slide mapped is incorrect while update video')
        }
      } else {
        throw new Error('type is incorrect')
      }

    } catch (error) {
      // remove uploaded files
      removeUploadedFiles(req.files)

      // response
      const anotherMessage = error?.message
        ? error.message
        : 'Unknow server error at updateSlider controller'
      res.status(500)
      res.send({ message: anotherMessage })
      console.error('updateSlider Error', anotherMessage)
    }
    console.log('------------------------------------updateSlider-END', d)
  }

  async delete(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------deleteSlider-START', d)
    try {
      const userId = getUserIdByDomain(req.headers?.domain)
      if (isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`)
      }
      const id = req.params?.id ? +req.params?.id : null
      if (!id || !Number.isInteger(id)) {
        throw new Error('id is required or id is incorrect')
      }

      const slideDeletedRaw = await db.query(`DELETE FROM slides WHERE id = $1 AND user_id = $2 RETURNING *`, [id, userId])
      const slideDeleted = slideDeletedRaw?.rows?.[0]
      console.log('slideDeleted', slideDeleted)
      if (slideDeleted?.type === 'image') {
        fs.unlink(slideDeleted.image, (err) => {
          if (err) {
            console.error("unlink can't delete file - ", slideDeleted.image)
            throw err;
          }
          console.log('File deleted!');
        });
      }

      res.status(200).json({ message: 'slide deleted', id: slideDeleted.id })
    } catch (error) {
      // response
      const anotherMessage = error?.message
        ? error.message
        : 'Unknow server error at deleteSlider controller'
      res.status(500).send({ message: anotherMessage })
      console.error('deleteSlider Error', anotherMessage)
    }
    console.log('------------------------------------deleteSlider-END', d)
  }
}

module.exports = new SliderController()