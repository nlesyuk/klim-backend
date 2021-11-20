const Router = require('express')
const router = new Router()
const workController = require('../controllers/work.controller')

const routeKey = `work`;

router.post(`/${routeKey}`, workController.create)
router.get(`/${routeKey}`, workController.getWorks)
router.get(`/${routeKey}/:id`, workController.getWork)
router.put(`/${routeKey}`, workController.update)
router.delete(`/${routeKey}/:id`, workController.delete)

module.exports = router