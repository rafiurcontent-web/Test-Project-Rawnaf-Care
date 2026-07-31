const cloudinary = require('../../config/cloudinary');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'No image file provided.',
      });
    }

    // Initialize Cloudinary upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'rawnafcare',
        resource_type: 'image',
        transformation: [{ quality: 'auto', format: 'webp' }],
      },
      (error, result) => {
        if (error) {
          return next(error);
        }

        return res.status(201).json({
          success: true,
          message: 'Image uploaded successfully',
          data: {
            url: result.secure_url,
            public_id: result.public_id,
          },
        });
      }
    );

    // Pipe the multer memory buffer into the Cloudinary stream
    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
};
