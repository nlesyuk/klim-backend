const Express = require('express');

const router = new Express();
const { visitorCheck, adminCheck } = require('../middleware');
const controller = require('../controllers/photoCollections.controller');

const routeKey = 'photos';

router.get(`/${routeKey}`, visitorCheck, controller.get);
router.get(`/${routeKey}/:id`, visitorCheck, controller.getById);
router.put(`/${routeKey}`, adminCheck, controller.update);
router.post(`/${routeKey}`, adminCheck, controller.create);
router.delete(`/${routeKey}/:id`, adminCheck, controller.delete);

module.exports = router;
