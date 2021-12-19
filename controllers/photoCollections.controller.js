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
    console.log('------------------------------------createWork-START', d)
    try {

    } catch (error) {

    }
    console.log('------------------------------------createWork-END', d)
  }
  async get(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createWork-START', d)
    try {

    } catch (error) {

    }
    console.log('------------------------------------createWork-END', d)
  }
  async getById(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createWork-START', d)
    try {

    } catch (error) {

    }
    console.log('------------------------------------createWork-END', d)
  }
  async update(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createWork-START', d)
    try {

    } catch (error) {

    }
    console.log('------------------------------------createWork-END', d)
  }
  async delete(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createWork-START', d)
    try {

    } catch (error) {

    }
    console.log('------------------------------------createWork-END', d)
  }
}

module.exports = new PhotoCollectionsController()