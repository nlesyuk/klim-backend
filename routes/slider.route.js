const Express = require('express')
const router = new Express()
const { authJwt } = require('../middleware')
const SliderController = require('../controllers/slider.controller')

const routeKey = '/slider';

router.post(`${routeKey}`, [authJwt.verifyToken], SliderController.create)
router.get(`${routeKey}`, SliderController.get)
router.get(`${routeKey}/:id`, SliderController.getById)
router.put(`${routeKey}`, [authJwt.verifyToken], SliderController.update)
router.delete(`${routeKey}/:id`, [authJwt.verifyToken], SliderController.delete)

module.exports = router