const Router = require('express')
const router = new Router()
const workController = require('../controllers/work.controller')
const { checkJWTAuth } = require('../auth/index')
const routeKey = `work`;

router.post(`/${routeKey}`, checkJWTAuth(), workController.create)
router.get(`/${routeKey}`, checkJWTAuth(), workController.getWorks)
router.get(`/${routeKey}/:id`, workController.getWork)
router.put(`/${routeKey}`, checkJWTAuth(), workController.update)
router.delete(`/${routeKey}/:id`, checkJWTAuth(), workController.delete)

module.exports = router