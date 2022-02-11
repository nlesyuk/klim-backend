const Express = require('express')
const router = new Express()
const ContactController = require('../controllers/contact.controller')
const { checkJWTAuth } = require('../auth/index')
const key = 'contact';

router.post(`/${key}`, checkJWTAuth(), ContactController.createContact)
router.get(`/${key}`, ContactController.getContact)
router.put(`/${key}`, checkJWTAuth(), ContactController.updateContact)

module.exports = router
