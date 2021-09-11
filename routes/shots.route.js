const Express = require('express')
const router = new Express()
const ShotsController = require('../controllers/shots.controller')

const routeKey = `shot`;

router.post(`/${routeKey}`, ShotsController.createShot)
router.get(`/${routeKey}`, ShotsController.getShots)
router.put(`/${routeKey}`, ShotsController.updateShot)
router.delete(`/${routeKey}/:id`, ShotsController.deleteShot)

module.exports = router