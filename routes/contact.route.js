const Express = require('express')
const router = new Express()
const { visitorCheck, adminCheck } = require('../middleware')
const ContactController = require('../controllers/contact.controller')

const key = 'contact';

router.get(`/${key}`, visitorCheck, ContactController.getContact)
router.put(`/${key}`, adminCheck, ContactController.updateContact)
router.post(`/${key}`, adminCheck, ContactController.createContact)

module.exports = router
