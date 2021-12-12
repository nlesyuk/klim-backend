const db = require('../db/index')
const {
  getCurrentDateTime,
  removeUploadedFiles,
  prepareImagePathForDB,
  getRightPathForImage,
} = require('../global/helper')
const dbKey = 'slides';

class SliderController {
  async create(req, res) {
    /*
      type: String
      title: String
      order: Number
      video: String
      workId: Number
      photoId: Number
      photos[]: (binary)
      photosInfo: String
    */
    const d = getCurrentDateTime()
    console.log('------------------------------------createSlider-START', d)
    const temp = {}
    try {
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
      if (type === 'image' && !photosInfo) {
        throw new Error('photosInfo is required')
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
          slides(title, slide_order, work_id, photo_id, image, type, videos)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;`,
        [slide.title, slide.slide_order, slide.workId,
        slide.photoId, slide.image, slide.type, slide.videos]
      )

      temp.createdId = createdSlideRaw?.rows?.[0]?.id

      if (createdSlideRaw?.rows?.[0]) {
        const { id, type, title, image, slide_order, videos, work_id, photo_id } = createdSlideRaw.rows[0]
        const createdSlide = {
          id,
          type,
          title,
          image: image ? getRightPathForImage(image) : null,
          order: slide_order,
          videos: videos ? videos : null,
          workId: work_id,
          photoId: photo_id,
        }
        res.status(200).json(createdSlide)
      } else {
        res.status(500).send({ message: 'record does"t created in DB' })
      }

    } catch (error) {
      // remove uploaded files
      const files = req.files
      removeUploadedFiles(files)

      // remove record from db
      if (temp.createdId) {
        const resq = await db.query(`DELETE FROM slides WHERE id = $1`, [temp.createdId])
        console.log('createSlider deleted record', resq.rows)
      }

      // response
      const anotherMessage = error?.message
        ? error.message
        : 'Unknow server error at createSlider controller'
      res.status(500).send({ message: anotherMessage })
      console.error('createSlider Error', anotherMessage)
    }
    console.log('------------------------------------createSlider-END', d)
  }

  async get(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getSlider-START', d)

    try {
      const slides = await db.query(`SELECT * FROM slides`)

      const slidesRaw = slides?.rows
      if (slidesRaw?.length) {
        const slides = Array.from(slidesRaw).map(slide => {
          const { id, type, title, image, slide_order, videos, work_id, photo_id } = slide
          return {
            id,
            type,
            title,
            image: image ? getRightPathForImage(image) : null,
            order: slide_order,
            videos: videos ? videos : null,
            workId: work_id,
            photoId: photo_id,
          }
        })

        res.status(200).json(slides)
      } else {
        res.status(200).send({ message: 'Do not have any slides' })
      }

    } catch (error) {
      // response
      const anotherMessage = error?.message
        ? error.message
        : 'Unknow server error at getSlider controller'
      res.status(500).send({ message: anotherMessage })
      console.error('getSlider Error', anotherMessage)
    }

    res.status(200).json(slides)
    console.log('------------------------------------getSlider-END', d)
  }

  async getById(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getSliderById-START', d)

    try {
      const id = req.params?.id ? +req.params?.id : null
      if (!id || !Number.isInteger(id)) {
        throw new Error('id is required or id is incorrect')
      }

      const slides = await db.query(`SELECT * FROM slides WHERE id = $1`, [id])

      const slideRaw = slides?.rows?.[0]
      if (slideRaw) {
        const { id, type, title, image, slide_order, videos, work_id, photo_id } = slideRaw
        const slideClear = {
          id,
          type,
          title,
          image: image ? getRightPathForImage(image) : null,
          order: slide_order,
          videos: videos ? videos : null,
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
    res.status(200).json({ message: 'update' })
    console.log('------------------------------------updateSlider-END', d)
  }

  async delete(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------deleteSlider-START', d)
    try {
      const id = req.params?.id ? +req.params?.id : null
      if (!id || !Number.isInteger(id)) {
        throw new Error('id is required or id is incorrect')
      }

      const slideDeletedRaw = await db.query(`DELETE FROM slides WHERE id = $1 RETURNING *`, [id])
      const slideDeleted = slideDeletedRaw?.rows?.[0]
      console.log('slideDeleted', slideDeleted)
      if (slideDeleted) {
        res.status(200).json({ message: 'slide deleted', id: slideDeleted.id })
      } else {
        throw new Error('Something wrong with delete slide')
      }
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