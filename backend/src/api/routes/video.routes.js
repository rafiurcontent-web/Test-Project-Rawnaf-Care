const express = require('express');
const videoController = require('../controllers/video.controller');
const { protect } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public Routes (No Auth required)
router.get('/', videoController.getPublicVideos);
router.get('/:id', videoController.getVideoById);

// Protected Admin Routes
router.post('/', protect, videoController.createVideo);
router.put('/:id', protect, videoController.updateVideo);
router.patch('/:id/toggle-publish', protect, videoController.togglePublish);
router.delete('/:id', protect, videoController.deleteVideo);

module.exports = router;
