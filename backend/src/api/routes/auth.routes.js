const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../../middleware/auth.middleware');
const { loginLimiter } = require('../../middleware/rateLimit.middleware');

const router = express.Router();

// Public route with brute-force protection
router.post('/login', loginLimiter, authController.login);

// Protected routes (Admin only)
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
