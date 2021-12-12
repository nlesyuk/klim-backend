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
      type: image
      title: test
      order: 0
      video: {"vimeoId": 561200941}
      workId: 84
      photoId: null
      photos[]: (binary)
      photosInfo: [{"fileName":"8.jpg","format":"horizontal"}]
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
          image: getRightPathForImage(image),
          order: slide_order,
          videos,
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
    const slides = [
      {
        id: 1,
        title: 'test1',
        type: "video",
        order: 0,
        workId: 7,
        video: {
          vimeoId: 561200941
        }
      },
      {
        id: 2,
        title: 'test2',
        type: "image",
        order: 0,
        image: "https://nrdevux.com/klim/slides/2.jpg",
        workId: 4
      },
    ]

    res.status(200).json(slides)
    console.log('------------------------------------getSlider-END', d)
  }

  async getById(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getSliderById-START', d)


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
    console.log('------------------------------------updateSlider-START', d)
    res.status(200).json({ message: 'delete' })
    console.log('------------------------------------updateSlider-END', d)
  }
}

module.exports = new SliderController()