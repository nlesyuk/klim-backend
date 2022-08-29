const Express = require('express')
const router = new Express()
const { visitorCheck, adminCheck } = require('../middleware')
const SliderController = require('../controllers/slider.controller')

const routeKey = `slider`;

router.get(`/${routeKey}`, visitorCheck, SliderController.get)
router.get(`/${routeKey}/:id`, visitorCheck, SliderController.getById)
router.put(`/${routeKey}`, adminCheck, SliderController.update)
router.post(`/${routeKey}`, adminCheck, SliderController.create)
router.delete(`/${routeKey}/:id`, adminCheck, SliderController.delete)

module.exports = router