const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();

// Protected Image Upload Route
// Applies Auth protection -> Multer Memory Storage -> Cloudinary Upload
router.post('/image', protect, upload.single('image'), uploadController.uploadImage);

module.exports = router;
