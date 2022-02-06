const Express = require('express')
const router = new Express()
const AuthController = require('../controllers/auth.controller')
const key = 'auth';

router.post(`/${key}/login`, AuthController.login)
router.post(`/${key}/register`, AuthController.register)

module.exports = router
