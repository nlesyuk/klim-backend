const Express = require('express')
const router = new Express()
const controller = require('../controllers/photos.controller')

const routeKey = `photos`;

router.post(`/${routeKey}`, controller.create)
router.get(`/${routeKey}`, controller.getAll)
router.get(`/${routeKey}/:id`, controller.get)
router.put(`/${routeKey}`, controller.update)
router.delete(`/${routeKey}/:id`, controller.delete)

module.exports = router