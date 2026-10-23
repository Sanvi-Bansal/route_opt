const express = require('express');
const { protect } = require('../middleware/auth');
const routesController = require('../controllers/routesController');

const router = express.Router();
router.use(protect);

// Routes only map URLs to controller actions; request handling lives in controllers.
router.post('/optimize', routesController.optimizeRoute);
router.get('/', routesController.getRoutePlans);
router.get('/stats/summary', routesController.getRouteStatsSummary);
router.put('/:id', routesController.updateRoutePlan);
router.get('/:id', routesController.getRoutePlan);
router.delete('/:id', routesController.deleteRoutePlan);
router.delete('/', routesController.clearRouteHistory);

module.exports = router;
