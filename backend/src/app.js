const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Configs and Utilities
const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/error.middleware');

// Route Imports
const authRoutes = require('./api/routes/auth.routes');
const blogRoutes = require('./api/routes/blog.routes');
const videoRoutes = require('./api/routes/video.routes');
const uploadRoutes = require('./api/routes/upload.routes');
const adminRoutes = require('./api/routes/admin.routes');

const app = express();

// Global Middleware Setup
app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler - MUST be the last middleware
app.use(errorHandler);

// Connect to Database and Start Server
connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  })
  .catch((error) => {
    logger.error('Failed to connect to the database. Application shutting down.', error);
    process.exit(1);
  });

module.exports = app;
