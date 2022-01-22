const Express = require('express')
const router = new Express()
const ContactController = require('../controllers/contact.controller')
const key = 'contact';

router.post(`/${key}`, ContactController.createContact)
router.get(`/${key}`, ContactController.getContact)
router.put(`/${key}`, ContactController.updateContact)

module.exports = router
