const Express = require('express')
const router = new Express()
const { authJwt } = require('../middleware')
const controller = require('../controllers/shots.controller')

const routeKey = `shot`;

router.post(`/${routeKey}`, [authJwt.verifyToken], controller.create)
router.get(`/${routeKey}`, controller.get)
router.put(`/${routeKey}`, [authJwt.verifyToken], controller.update)
router.delete(`/${routeKey}/:id`, [authJwt.verifyToken], controller.delete)

module.exports = router