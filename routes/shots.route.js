const Express = require('express')
const router = new Express()
const controller = require('../controllers/shots.controller')

const routeKey = `shot`;

router.post(`/${routeKey}`, controller.create)
router.get(`/${routeKey}`, controller.get)
router.put(`/${routeKey}`, controller.update)
router.delete(`/${routeKey}/:id`, controller.delete)

module.exports = router