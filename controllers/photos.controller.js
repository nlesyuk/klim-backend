const fs = require('fs');
const db = require('../db/index');
const {
  getRightPathForImage,
  removeUploadedFiles,
  getCurrentDateTime
} = require('../global/helper');

const dbKey = 'photos';

class PhotosController {
  async create(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createPhotos-START', d)
    console.log('------------------------------------createPhotos-END', d)
  }

  async getAll(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getAllPhotos-START', d)
    console.log('------------------------------------getAllPhotos-END', d)
  }

  async get(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getPhotos-START', d)
    console.log('------------------------------------getPhotos-END', d)
  }

  async update(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------updatePhotos-START', d)
    console.log('------------------------------------updatePhotos-END', d)
  }

  async delete(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------deletePhotos-START', d)
    console.log('------------------------------------deletePhotos-END', d)
  }
}

module.exports = new PhotosController()