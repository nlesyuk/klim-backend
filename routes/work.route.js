const Router = require('express')
const router = new Router()
const workController = require('../controllers/work.controller')

const routeKey = `work`;

router.post(`/${routeKey}`, workController.createWork)
router.get(`/${routeKey}`, workController.getWorks)
router.get(`/${routeKey}/:id`, workController.getWork)
router.put(`/${routeKey}`, workController.updateWork)
router.delete(`/${routeKey}/:id`, workController.deleteWork)

module.exports = router