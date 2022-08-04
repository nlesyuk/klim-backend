const Express = require('express')
const router = new Express()
const { authJwt } = require('../middleware')
const ContactController = require('../controllers/contact.controller')

const key = 'contact';

router.post(`/${key}`, [authJwt.verifyToken], ContactController.createContact)
router.get(`/${key}`, ContactController.getContact)
router.put(`/${key}`, [authJwt.verifyToken], ContactController.updateContact)

module.exports = router
