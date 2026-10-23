const express = require('express');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes only map URLs to controller actions; request handling lives in controllers.
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateMe);
router.delete('/me', protect, authController.deleteMe);

module.exports = router;
