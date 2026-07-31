const express = require('express');
const adminController = require('../controllers/admin.controller');
const blogController = require('../controllers/blog.controller');
const videoController = require('../controllers/video.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

// Apply auth protection to all routes in this router
router.use(protect);

// Admin-specific aggregate feeds (includes both drafts and published items)
router.get('/blogs', blogController.getAdminBlogs);
router.get('/videos', videoController.getAdminVideos);

// Admin dashboard statistics
router.get('/stats', adminController.getDashboardStats);

module.exports = router;
