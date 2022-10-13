const Router = require('express');

const router = new Router();
const { visitorCheck, adminCheck } = require('../middleware');
const workController = require('../controllers/work.controller');

const routeKey = 'work';

router.get(`/${routeKey}`, visitorCheck, workController.getWorks);
router.get(`/${routeKey}/:id`, visitorCheck, workController.getWork);
router.put(`/${routeKey}`, adminCheck, workController.update);
router.post(`/${routeKey}`, adminCheck, workController.create);
router.delete(`/${routeKey}/:id`, adminCheck, workController.delete);

module.exports = router;
