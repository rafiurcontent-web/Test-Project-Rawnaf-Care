const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Centralized global error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  // 1. Log the error for internal tracking
  logger.error(err.stack || err.message);

  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let errorType = err.name || 'ServerError';
  let message = err.message || 'An unexpected error occurred';

  // 2. Handle specific error types

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'ValidationError';
    // Extract the first validation error message
    const firstField = Object.keys(err.errors)[0];
    message = err.errors[firstField].message;
  }

  // Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorType = 'CastError';
    message = 'Invalid resource ID format';
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    errorType = 'DuplicateKeyError';
    const duplicateField = Object.keys(err.keyValue)[0];
    message = `A record with this ${duplicateField} already exists.`;
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    errorType = 'FileSizeLimitError';
    message = 'Image exceeds the maximum allowed size of 2MB.';
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = err.name;
    message = 'Unauthorized access. Please log in again.';
  }

  // For unhandled 500 errors, obfuscate the message in production to prevent leaking internals
  if (statusCode === 500 && env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
  }

  // 4. Standardized response format
  const responsePayload = {
    success: false,
    error: errorType,
    message: message,
  };

  // 5. Include stack trace ONLY in development
  if (env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = { errorHandler };
