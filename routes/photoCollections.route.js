const Express = require('express')
const router = new Express()
const controller = require('../controllers/photoCollections.controller')

const routeKey = `photo-collections`;

router.post(`/${routeKey}`, controller.create)
router.get(`/${routeKey}`, controller.get)
router.get(`/${routeKey}/:id`, controller.getById)
router.put(`/${routeKey}`, controller.update)
router.delete(`/${routeKey}/:id`, controller.delete)

module.exports = router