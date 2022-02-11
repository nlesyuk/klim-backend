const Express = require('express')
const router = new Express()
const controller = require('../controllers/photoCollections.controller')
const { checkJWTAuth } = require('../auth/index')
const routeKey = `photo-collections`;

router.post(`/${routeKey}`, checkJWTAuth(), controller.create)
router.get(`/${routeKey}`, controller.get)
router.get(`/${routeKey}/:id`, controller.getById)
router.put(`/${routeKey}`, checkJWTAuth(), controller.update)
router.delete(`/${routeKey}/:id`, checkJWTAuth(), controller.delete)

module.exports = router