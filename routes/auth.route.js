const Express = require('express')
const router = new Express()
const AuthController = require('../controllers/auth.controller')

const key = 'auth';

router.post(`/${key}/signup`, AuthController.signup)
router.post(`/${key}/signin`, AuthController.signin)
router.post(`/${key}/refreshtoken`, AuthController.refreshToken)

module.exports = router
