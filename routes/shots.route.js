const Express = require('express')
const router = new Express()
const controller = require('../controllers/shots.controller')
const { checkJWTAuth } = require('../auth/index')
const routeKey = `shot`;

router.post(`/${routeKey}`, checkJWTAuth(), controller.create)
router.get(`/${routeKey}`, controller.get)
router.put(`/${routeKey}`, checkJWTAuth(), controller.update)
router.delete(`/${routeKey}/:id`, checkJWTAuth(), controller.delete)

module.exports = router