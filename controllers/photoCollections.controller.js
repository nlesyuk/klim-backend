const fs = require('fs');
const db = require('../db/')
const {
  removeDomainFromImagePath,
  prepareImagePathForDB,
  getRightPathForImage,
  removeUploadedFiles,
  getCurrentDateTime,
} = require('../global/helper')

const mock = [
  {
    "id": 1,
    "title": "title",
    "credits": "credits",
    "category": ["commerce"],
    "photos": [
      {
        "id": 470,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577399_s_2021112213.10.17.jpg",
        "isPreview": false,
        "order": 0,
        "format": "horizontal"
      },
      {
        "id": 472,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577404_s_2021112213.07.22.jpg",
        "isPreview": false,
        "order": 4,
        "format": "horizontal"
      },
      {
        "id": 473,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577407_s_2021112213.09.00.jpg",
        "isPreview": false,
        "order": 2,
        "format": "horizontal"
      },
      {
        "id": 476,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577416_s_2021112213.05.36.jpg",
        "isPreview": false,
        "order": 6,
        "format": "horizontal"
      },
      {
        "id": 477,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577419_s_2021112212.50.08.jpg",
        "isPreview": false,
        "order": 7,
        "format": "horizontal"
      },
      {
        "id": 471,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577402_s_2021112213.09.18.jpg",
        "isPreview": true,
        "order": 4,
        "format": "horizontal"
      },
      {
        "id": 475,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577412_s_2021112213.06.27.jpg",
        "isPreview": true,
        "order": 0,
        "format": "horizontal"
      },
      {
        "id": 474,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577410_s_2021112213.07.44.jpg",
        "isPreview": true,
        "order": 1,
        "format": "horizontal"
      }
    ]
  },
  {
    "id": 2,
    "title": "title2",
    "credits": "credits2",
    "category": ["commerce"],
    "photos": [
      {
        "id": 470,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577399_s_2021112213.10.17.jpg",
        "isPreview": false,
        "order": 0,
        "format": "horizontal"
      },
      {
        "id": 472,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577404_s_2021112213.07.22.jpg",
        "isPreview": false,
        "order": 4,
        "format": "horizontal"
      },
      {
        "id": 473,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577407_s_2021112213.09.00.jpg",
        "isPreview": false,
        "order": 2,
        "format": "horizontal"
      },
      {
        "id": 476,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577416_s_2021112213.05.36.jpg",
        "isPreview": false,
        "order": 6,
        "format": "horizontal"
      },
      {
        "id": 477,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577419_s_2021112212.50.08.jpg",
        "isPreview": false,
        "order": 7,
        "format": "horizontal"
      },
      {
        "id": 471,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577402_s_2021112213.09.18.jpg",
        "isPreview": true,
        "order": 4,
        "format": "horizontal"
      },
      {
        "id": 475,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577412_s_2021112213.06.27.jpg",
        "isPreview": true,
        "order": 0,
        "format": "horizontal"
      },
      {
        "id": 474,
        "src": "//3.126.125.66/public/uploads/s/work/1637579577410_s_2021112213.07.44.jpg",
        "isPreview": true,
        "order": 1,
        "format": "horizontal"
      }
    ]
  },
]
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
      //3.126.125.66/public/uploads/s/work/1637577029639_s_811.jpeg
      res.json(mock)
    } catch (error) {

    }
    console.log('------------------------------------getPhotoCollection-END', d)
  }
  async getById(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getByIDPhotoCollection-START', d)
    try {
      const { id } = req.params
      res.json(mock.filter(v => v.id == id))
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
      const { id } = req.params
    } catch (error) {

    }
    console.log('------------------------------------deletePhotoCollection-END', d)
  }
}

module.exports = new PhotoCollectionsController()