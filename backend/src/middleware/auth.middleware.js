const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Middleware to protect admin routes.
 * Checks for a valid JWT in the HttpOnly 'token' cookie.
 */
const protect = (req, res, next) => {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    const error = new Error('Please log in to continue.');
    error.statusCode = 401;
    error.name = 'UnauthorizedError';
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

module.exports = { protect };
