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
    res.status(200).json({ message: 'get' })
    console.log('------------------------------------getSlider-END', d)
  }

  async getById(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getSliderById-START', d)
    res.status(200).json({ message: 'getById' })
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