const Express = require('express')
const router = new Express()
const SliderController = require('../controllers/slider.controller')
const { checkJWTAuth } = require('../auth/index')
const routeKey = `slider`;

router.post(`/${routeKey}`, checkJWTAuth(), SliderController.create)
router.get(`/${routeKey}`, SliderController.get)
router.get(`/${routeKey}/:id`, SliderController.getById)
router.put(`/${routeKey}`, checkJWTAuth(), SliderController.update)
router.delete(`/${routeKey}/:id`, checkJWTAuth(), SliderController.delete)

module.exports = router