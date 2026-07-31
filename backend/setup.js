const fs = require('fs');
const path = require('path');

const dirs = [
  'src/api/routes',
  'src/api/controllers',
  'src/api/services',
  'src/api/repositories',
  'src/models',
  'src/middleware',
  'src/scripts',
  'src/utils',
  'src/config'
];

const files = [
  'src/api/routes/auth.routes.js',
  'src/api/routes/blog.routes.js',
  'src/api/routes/video.routes.js',
  'src/api/routes/upload.routes.js',
  'src/api/routes/admin.routes.js',
  'src/api/controllers/auth.controller.js',
  'src/api/controllers/blog.controller.js',
  'src/api/controllers/video.controller.js',
  'src/api/controllers/upload.controller.js',
  'src/api/controllers/admin.controller.js',
  'src/api/services/auth.service.js',
  'src/api/services/blog.service.js',
  'src/api/services/video.service.js',
  'src/api/services/admin.service.js',
  'src/api/repositories/admin.repository.js',
  'src/api/repositories/blog.repository.js',
  'src/api/repositories/video.repository.js',
  'src/models/Admin.js',
  'src/models/Blog.js',
  'src/models/Video.js',
  'src/middleware/auth.middleware.js',
  'src/middleware/upload.middleware.js',
  'src/middleware/error.middleware.js',
  'src/middleware/rateLimit.middleware.js',
  'src/scripts/seedAdmin.js',
  'src/utils/slugify.js',
  'src/utils/youtubeParser.js',
  'src/utils/logger.js',
  'src/config/db.js',
  'src/config/env.js',
  'src/config/cloudinary.js',
  'src/app.js'
];

dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));
files.forEach(f => fs.writeFileSync(f, ''));
console.log('Structure created');
