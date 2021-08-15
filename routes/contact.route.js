const Express = require('express')
const router = new Express()
const ContactController = require('../controllers/contact.controller')

router.post('/contact', ContactController.createContact)
router.get('/contact', ContactController.getContact)
router.put('/contact', ContactController.updateContact)

module.exports = router