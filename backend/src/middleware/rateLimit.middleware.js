const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware for brute-force protection on the login route.
 * Limits each IP to 5 requests per 15-minute window.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 attempts per windowMs
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many failed login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { loginLimiter };
