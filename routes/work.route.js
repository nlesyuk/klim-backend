const Router = require('express')
const router = new Router()
const workController = require('../controllers/work.controller')

router.post('/work', workController.createWork)
router.get('/work', workController.getWorks)
router.get('/work/:id', workController.getWork)
router.put('/work/', workController.updateWork)
router.delete('/work/:id', workController.deleteWork)

module.exports = router