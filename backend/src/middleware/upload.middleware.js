const multer = require('multer');

// Configure memory storage to store files as buffers (for Cloudinary upload)
const storage = multer.memoryStorage();

// Restrict file uploads to specific image MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Only JPEG, PNG, and WebP images are allowed');
    error.statusCode = 400;
    error.name = 'MulterError';
    cb(error, false);
  }
};

// Set maximum file size limit
const limits = {
  fileSize: 2 * 1024 * 1024, // 2MB max
};

// Initialize multer instance
const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;
