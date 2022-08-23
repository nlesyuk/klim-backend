const Router = require('express')
const router = new Router()
const { authJwt, general } = require('../middleware')
const workController = require('../controllers/work.controller')

const routeKey = `work`;

const adminCheck = [general.checkUserExisting, authJwt.verifyToken]
const visitorCheck = [general.checkUserExisting]

router.get(`/${routeKey}`, visitorCheck, workController.getWorks)
router.get(`/${routeKey}/:id`, visitorCheck, workController.getWork)
router.put(`/${routeKey}`, adminCheck, workController.update)
router.post(`/${routeKey}`, adminCheck, workController.create)
router.delete(`/${routeKey}/:id`, adminCheck, workController.delete)

module.exports = router