const Express = require('express')
const router = new Express()
const SliderController = require('../controllers/slider.controller')

const routeKey = '/slider';

router.post(`${routeKey}`, SliderController.create)
router.get(`${routeKey}`, SliderController.get)
router.get(`${routeKey}/:id`, SliderController.getById)
router.put(`${routeKey}`, SliderController.update)
router.delete(`${routeKey}/:id`, SliderController.delete)

module.exports = router