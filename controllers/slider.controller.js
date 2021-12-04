const db = require('../db/index')
const {
  getCurrentDateTime
} = require('../global/helper')
const dbKey = 'slider';

class SliderController {
  async create(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createSlider-START', d)
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