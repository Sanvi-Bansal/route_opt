const express = require('express');
const { protect } = require('../middleware/auth');
const stopsController = require('../controllers/stopsController');

const router = express.Router();
router.use(protect);

// Keep specific /sets routes before /:id routes, as in the original router.
router.get('/', stopsController.getStops);
router.get('/sets/list', stopsController.listStopSets);
router.post('/sets', stopsController.saveStopSet);
router.delete('/sets/:name', stopsController.deleteStopSet);
router.post('/', stopsController.createStop);
router.put('/:id', stopsController.updateStop);
router.delete('/:id', stopsController.deleteStop);
router.delete('/', stopsController.clearStops);

module.exports = router;
