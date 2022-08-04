const Router = require('express')
const router = new Router()
const { authJwt } = require('../middleware')
const workController = require('../controllers/work.controller')

const routeKey = `work`;

router.post(`/${routeKey}`, [authJwt.verifyToken], workController.create)
router.get(`/${routeKey}`, workController.getWorks)
router.get(`/${routeKey}/:id`, workController.getWork)
router.put(`/${routeKey}`, [authJwt.verifyToken], workController.update)
router.delete(`/${routeKey}/:id`, [authJwt.verifyToken], workController.delete)

module.exports = router