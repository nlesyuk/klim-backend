const fs = require('fs');
const db = require('../db/')
const {
  removeDomainFromImagePath,
  prepareImagePathForDB,
  getRightPathForImage,
  removeUploadedFiles,
  getCurrentDateTime,
} = require('../global/helper')


class PhotoCollectionsController {
  async create(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createPhotoCollection-START', d)
    try {
      res.json({ message: 'ok' })
    } catch (error) {

    }
    console.log('------------------------------------createPhotoCollection-END', d)
  }
  async get(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getPhotoCollection-START', d)
    try {
      res.json([])
    } catch (error) {

    }
    console.log('------------------------------------getPhotoCollection-END', d)
  }
  async getById(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getByIDPhotoCollection-START', d)
    try {

    } catch (error) {

    }
    console.log('------------------------------------getByIDPhotoCollection-END', d)
  }
  async update(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------updatePhotoCollection-START', d)
    try {

    } catch (error) {

    }
    console.log('------------------------------------updatePhotoCollection-END', d)
  }
  async delete(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------deletePhotoCollection-START', d)
    try {

    } catch (error) {

    }
    console.log('------------------------------------deletePhotoCollection-END', d)
  }
}

module.exports = new PhotoCollectionsController()