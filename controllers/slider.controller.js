const db = require('../db/index')
const {
  getCurrentDateTime
} = require('../global/helper')
const dbKey = 'slider';

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
    const { title, type, order, videos, workId, photoId, photosInfo } = req.body

    try {
      if (!title) {
        throw new Error('title is required')
      }
      if (!type) {
        throw new Error('type is required')
      }
      if (type === 'video' && !videos) {
        throw new Error('video is required')
      }
      if (type === 'image' && !Number.isInteger(photoId)) {
        throw new Error('photoId is required')
      }
      if (type === 'image' && !photosInfo) {
        throw new Error('photosInfo is required')
      }
      if (!Number.isInteger(order)) {
        throw new Error('order is required')
      }
      if (!Number.isInteger(workId)) {
        throw new Error('workId is required')
      }



    } catch (error) {
      // remove uploaded files
      const files = req.files
      removeUploadedFiles(files)

      // remove record from db
      // const resq = await db.query(`DELETE FROM work WHERE id=$1`, [storage.workId])
      // console.log('storage', storage, resq.rows)

      // response
      const anotherMessage = error?.message
        ? error.message
        : 'Unknow server error at createSlider controller'
      res.status(500).send({ message: anotherMessage })
      console.error('createSlider Error', anotherMessage)
    }





    res.status(200).json({ message: 'create' })
    console.log('------------------------------------createSlider-END', d)
  }

  async get(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getSlider-START', d)
    const slides = [
      {
        type: "video",
        workId: "7",
        video: {
          vimeoId: 561200941
        }
      },
      {
        type: "image",
        image: "https://nrdevux.com/klim/slides/2.jpg",
        workId: "4"
      },
      {
        type: "image",
        image: "https://nrdevux.com/klim/slides/11.jpg",
        workId: "4"
      },
      {
        type: "image",
        image: "https://nrdevux.com/klim/slides/1.jpg",
        photoId: "4"
      },
      {
        type: "image",
        image: "https://nrdevux.com/klim/slides/12.jpg",
        workId: "4"
      },
      {
        type: "image",
        image: "https://nrdevux.com/klim/slides/3.jpg",
        workId: "1"
      },
      {
        type: "image",
        image: "https://nrdevux.com/klim/slides/14.jpg",
        workId: "4"
      },
      {
        type: "image",
        image: "https://nrdevux.com/klim/slides/15.jpg",
        workId: "4"
      },
      {
        type: "image",
        image: "https://nrdevux.com/klim/slides/16.jpg",
        workId: "4"
      },
      {
        type: "video",
        workId: "9",
        video: {
          vimeoId: 561200941
        }
      }
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