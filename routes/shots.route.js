const Express = require('express')
const router = new Express()
const { visitorCheck, adminCheck } = require('../middleware')
const controller = require('../controllers/shots.controller')

const routeKey = `shot`;

router.get(`/${routeKey}`, visitorCheck, controller.get)
router.post(`/${routeKey}`, adminCheck, controller.create)
router.put(`/${routeKey}`, adminCheck, controller.update)
router.delete(`/${routeKey}/:id`, adminCheck, controller.delete)

module.exports = router