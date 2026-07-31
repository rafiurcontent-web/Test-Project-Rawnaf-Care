# Backend Build Prompts — Rawnaf Care MVP

> **Purpose:** This file contains step-by-step prompts to build the **complete Express.js backend** for Rawnaf Care MVP. Each prompt is self-contained and should be executed sequentially. The project follows a **Backend-First** approach.

> **Tech Stack:** Node.js + Express.js | MongoDB Atlas (Mongoose) | JWT (HttpOnly Cookie) | Cloudinary | Winston Logger

> **Architecture:** Layered Monolith — Route → Middleware → Controller → Service → Repository → Model

---

## Phase 1: Project Initialization & Configuration

### Prompt 1.1 — Initialize Node.js Project & Install Dependencies

```
Initialize a new Node.js backend project inside a `backend/` directory.

1. Run `npm init -y` to create `package.json`.
2. Install these production dependencies:
   - express, mongoose, bcryptjs, jsonwebtoken, cookie-parser, cors, dotenv, multer, cloudinary, express-rate-limit, helmet, winston, slugify
3. Install these dev dependencies:
   - nodemon
4. In `package.json`, add these scripts:
   - "start": "node src/app.js"
   - "dev": "nodemon src/app.js"
   - "seed:admin": "node src/scripts/seedAdmin.js"
5. Create the complete folder structure exactly as follows:

backend/
├── src/
│   ├── api/
│   │   ├── routes/           # auth.routes.js, blog.routes.js, video.routes.js, upload.routes.js, admin.routes.js
│   │   ├── controllers/      # auth.controller.js, blog.controller.js, video.controller.js, upload.controller.js, admin.controller.js
│   │   ├── services/         # auth.service.js, blog.service.js, video.service.js, admin.service.js
│   │   └── repositories/     # admin.repository.js, blog.repository.js, video.repository.js
│   ├── models/               # Admin.js, Blog.js, Video.js
│   ├── middleware/           # auth.middleware.js, upload.middleware.js, error.middleware.js, rateLimit.middleware.js
│   ├── scripts/              # seedAdmin.js
│   ├── utils/                # slugify.js, youtubeParser.js, logger.js
│   ├── config/               # db.js, env.js, cloudinary.js
│   └── app.js                # Express app entry point
├── .env.example
├── .gitignore
└── package.json

6. Create `.env.example` with all required environment variables:
   - PORT=5000
   - NODE_ENV=development
   - MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rawnafcare
   - JWT_SECRET=your_jwt_secret_key_here
   - JWT_EXPIRES_IN=24h
   - FRONTEND_URL=http://localhost:3000
   - CLOUDINARY_CLOUD_NAME=your_cloud_name
   - CLOUDINARY_API_KEY=your_api_key
   - CLOUDINARY_API_SECRET=your_api_secret
   - ADMIN_USERNAME=admin_rawnaf
   - ADMIN_PASSWORD=securepassword123
   - WHATSAPP_PHONE=8801XXXXXXXXX
   - WHATSAPP_MESSAGE=Hello Dr. Nafia, I would like to book an appointment.

7. Create `.gitignore` with: node_modules, .env, logs/

Only create the folder structure and empty placeholder files. Do NOT write any code inside the files yet.
```

---

### Prompt 1.2 — Configuration Files (env.js, db.js, cloudinary.js)

```
Now write the configuration files for the backend.

**File: src/config/env.js**
- Load dotenv at the very top.
- Export an object with all environment variable values: PORT (default 5000), NODE_ENV, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN (default '24h'), FRONTEND_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, WHATSAPP_PHONE, WHATSAPP_MESSAGE.
- Validate that critical variables (MONGODB_URI, JWT_SECRET) exist; throw an Error on startup if missing.

**File: src/config/db.js**
- Import mongoose and the env config.
- Export an async `connectDB()` function.
- Connect to MongoDB using mongoose.connect(MONGODB_URI).
- Use Mongoose connection pooling (default is fine for M0).
- On success, log "MongoDB Atlas connected successfully" using the logger.
- On failure, log the error and call process.exit(1).

**File: src/config/cloudinary.js**
- Import and configure cloudinary v2 with CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET from env.js.
- Export the configured cloudinary instance.
```

---

### Prompt 1.3 — Logger Utility (Winston)

```
Write the Winston logger utility.

**File: src/utils/logger.js**
- Import winston.
- Create a logger with two transports:
  1. Console transport (always active) — format: combine(colorize, timestamp, printf with "[timestamp] level: message").
  2. In production (NODE_ENV === 'production'), logs output to stdout/stderr only (no file transport needed since Render/Railway captures stdout).
- Log levels: info, warn, error.
- Export the logger instance.
```

---

## Phase 2: Mongoose Models

### Prompt 2.1 — Admin Model

```
Write the Mongoose schema for the Admin model.

**File: src/models/Admin.js**

Fields:
- username: String, required (with message "Username is required"), unique, trimmed, minlength 3 (with message), maxlength 50 (with message).
- password: String, required (with message "Password is required").
- Timestamps: true (auto createdAt, updatedAt).

Export as mongoose.model('Admin', adminSchema).

Do NOT add password hashing hooks here — that will be handled in the seed script and auth service.
```

---

### Prompt 2.2 — Blog Model

```
Write the Mongoose schema for the Blog model.

**File: src/models/Blog.js**

Fields:
- title: String, required (message: "Blog title is required"), trim, maxlength 150 (with message).
- slug: String, required, unique, lowercase, trim. Do NOT add `index: true` because `unique: true` already creates an index automatically.
- content: String, required (message: "Content is required").
- excerpt: String, trim, maxlength 300 (with message), default ''.
- featuredImage: Nested object with:
  - url: String, default ''
  - public_id: String, default ''
- isPublished: Boolean, default false, index true.
- metaTitle: String, maxlength 160 (with message), default ''.
- metaDescription: String, maxlength 160 (with message), default ''.
- createdBy: ObjectId, ref 'Admin'.
- Timestamps: true.

Pre-save hook:
- If metaTitle is empty and title exists → set metaTitle = title.slice(0, 160).
- If metaDescription is empty and excerpt exists → set metaDescription = excerpt.slice(0, 160).

Indexes (after schema definition):
- blogSchema.index({ isPublished: 1, createdAt: -1 }) — compound index for paginated public feeds.
- blogSchema.index({ title: 'text', excerpt: 'text' }) — text index for public search.

Export as mongoose.model('Blog', blogSchema).
```

---

### Prompt 2.3 — Video Model

```
Write the Mongoose schema for the Video model.

**File: src/models/Video.js**

Fields:
- title: String, required (message: "Video title is required"), trim, maxlength 150 (with message).
- youtubeUrl: String, required (message: "YouTube URL is required"), with match regex validation:
  Regex: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  Message: "Please enter a valid YouTube URL"
- videoId: String, required, unique.
- thumbnailUrl: String, required.
- isPublished: Boolean, default false, index true.
- createdBy: ObjectId, ref 'Admin'.
- Timestamps: true.

Indexes (after schema definition):
- videoSchema.index({ isPublished: 1, createdAt: -1 }) — compound index for paginated public video gallery.

Export as mongoose.model('Video', videoSchema).
```

---

## Phase 3: Utility Functions

### Prompt 3.1 — Slug Generator Utility

```
Write the slug generator utility.

**File: src/utils/slugify.js**

Export an async function `generateUniqueSlug(title, BlogModel)` that:
1. Takes the blog title string and the Blog Mongoose model as arguments.
2. Uses the `slugify` npm package to convert the title to a lowercase ASCII slug (strict mode, replacing spaces with dashes).
3. If the title is Bengali/Unicode and slugify returns an empty string, generate a fallback slug using Date.now() (e.g., "post-1722345678901").
4. Check the database for existing slugs that match the base slug.
5. If a collision exists, append `-1`, `-2`, `-3`, etc. to make it unique (e.g., "my-title-1", "my-title-2").
6. Return the guaranteed unique slug string.
```

---

### Prompt 3.2 — YouTube URL Parser Utility

```
Write the YouTube URL parser utility.

**File: src/utils/youtubeParser.js**

Export a function `parseYouTubeUrl(url)` that:
1. Takes a YouTube URL string (supports both youtube.com/watch?v= and youtu.be/ formats).
2. Extracts the 11-character Video ID using regex.
3. Derives the thumbnail URL using the pattern: `https://img.youtube.com/vi/<videoId>/hqdefault.jpg`
4. Returns an object: { videoId, thumbnailUrl }.
5. If the URL is invalid or videoId cannot be extracted, throw an Error with message "Invalid YouTube URL format".
```

---

## Phase 4: Middleware

### Prompt 4.1 — Auth Middleware (JWT Cookie Verification)

```
Write the authentication middleware.

**File: src/middleware/auth.middleware.js**

Export a function `protect` (Express middleware) that:
1. Reads the JWT token from `req.cookies.token`.
2. If no token exists, return 401 with: { success: false, error: "Unauthorized access", message: "Please log in to continue." }
3. Verify the token using jwt.verify() with JWT_SECRET from env config.
4. If verification fails (expired or invalid), return 401 with the same error format.
5. On success, attach the decoded payload (admin id) to `req.admin` and call next().
```

---

### Prompt 4.2 — Rate Limiter Middleware

```
Write the rate limiter middleware for brute-force protection.

**File: src/middleware/rateLimit.middleware.js**

Using express-rate-limit, export a `loginLimiter` configured with:
- windowMs: 15 * 60 * 1000 (15 minutes)
- max: 5 attempts per window per IP
- message: { success: false, error: "Too Many Requests", message: "Too many failed login attempts. Please try again after 15 minutes." }
- standardHeaders: true (Return rate limit info in RateLimit-* headers)
- legacyHeaders: false
```

---

### Prompt 4.3 — File Upload Middleware (Multer)

```
Write the Multer file upload middleware.

**File: src/middleware/upload.middleware.js**

Configure Multer with:
1. Storage: memoryStorage() (file stored in buffer for Cloudinary upload).
2. File filter: Only allow MIME types 'image/jpeg', 'image/png', 'image/webp'. Reject others with an Error: "Only JPEG, PNG, and WebP images are allowed".
3. Limits: fileSize max 2 * 1024 * 1024 (2MB).

Export the configured multer instance as `upload` with single file field name 'image'.
```

---

### Prompt 4.4 — Global Error Handler Middleware

```
Write the centralized error handling middleware.

**File: src/middleware/error.middleware.js**

Export a function `errorHandler(err, req, res, next)` that:
1. Log the error using the winston logger (logger.error).
2. Handle specific error types:
   - Mongoose ValidationError → status 400, extract first validation message.
   - Mongoose CastError (invalid ObjectId) → status 400, message: "Invalid resource ID format".
   - MongoDB duplicate key error (code 11000) → status 409, extract the duplicate field name and return message: "A record with this <field> already exists."
   - Multer file size error (LIMIT_FILE_SIZE) → status 413, message: "Image exceeds the maximum allowed size of 2MB."
   - JWT errors (JsonWebTokenError, TokenExpiredError) → status 401.
3. For all other unhandled errors → status 500.
4. Response format always: { success: false, error: "<short type>", message: "<human-readable message>" }
5. Include `stack` property ONLY when NODE_ENV === 'development'.
```

---

## Phase 5: Repository Layer

### Prompt 5.1 — Admin Repository

```
Write the Admin repository layer.

**File: src/api/repositories/admin.repository.js**

Export an object with these methods:
- findByUsername(username): Find and return a single admin by username.
- createAdmin(data): Create and return a new admin document.
```

---

### Prompt 5.2 — Blog Repository

```
Write the Blog repository layer.

**File: src/api/repositories/blog.repository.js**

Export an object with these methods:
- findPublishedBlogs({ page, limit, search }): Query published blogs with optional text search. Use the compound index { isPublished: 1, createdAt: -1 } for sorting. Return { data, total, page, limit, totalPages }.
- findBySlug(slug): Find a single published blog by slug.
- findAllSlugs({ page, limit }): Return only { slug, updatedAt } fields for all published blogs (for sitemap generation).
- findAllBlogs({ page, limit }): Return ALL blogs (published + draft) for admin dashboard, sorted by createdAt descending.
- findById(id): Find a blog by MongoDB _id.
- create(data): Create and return a new blog document.
- updateById(id, data): Find by id and update, return the updated document (new: true).
- deleteById(id): Delete a blog by id, return the deleted document.
- countBySlugPattern(slugPattern): Count documents matching a slug regex (for collision detection).
```

---

### Prompt 5.3 — Video Repository

```
Write the Video repository layer.

**File: src/api/repositories/video.repository.js**

Export an object with these methods:
- findPublishedVideos({ page, limit }): Query published videos only, sorted by createdAt descending. Return { data, total, page, limit, totalPages }.
- findById(id): Find a single video by MongoDB _id.
- findAllVideos({ page, limit }): Return ALL videos (published + draft) for admin dashboard, sorted by createdAt descending.
- create(data): Create and return a new video document.
- updateById(id, data): Find by id and update, return the updated document (new: true).
- deleteById(id): Delete a video by id, return the deleted document.
```

---

## Phase 6: Service Layer (Business Logic)

### Prompt 6.1 — Auth Service

```
Write the Auth service layer.

**File: src/api/services/auth.service.js**

Export an object with these methods:

1. login(username, password):
   - Find admin by username using adminRepository.
   - If not found, throw Error "Invalid username or password" (status 401).
   - Compare password using bcryptjs.compare().
   - If mismatch, throw Error "Invalid username or password" (status 401).
   - Sign JWT with payload { id: admin._id } and JWT_SECRET, expiresIn from env config.
   - Return { token, admin: { id: admin._id, username: admin.username } }.

2. getMe(adminId):
   - Find admin by ID using adminRepository.
   - If not found, throw Error "Admin not found" (status 404).
   - Return { id: admin._id, username: admin.username } (never return password).
```

---

### Prompt 6.2 — Blog Service

```
Write the Blog service layer.

**File: src/api/services/blog.service.js**

Export an object with these methods:

1. getPublicBlogs({ page, limit, search }):
   - Delegate to blogRepository.findPublishedBlogs().
   - Return the paginated result.

2. getBlogBySlug(slug):
   - Find by slug using blogRepository.
   - If not found, throw Error "Blog post not found" (status 404).
   - Return the blog document.

3. getAllSlugs({ page, limit }):
   - Delegate to blogRepository.findAllSlugs().

4. getAdminBlogs({ page, limit }):
   - Delegate to blogRepository.findAllBlogs().

5. createBlog(data, adminId):
   - Generate unique slug from data.title using the generateUniqueSlug utility.
   - Attach slug and createdBy: adminId to data.
   - Create blog using blogRepository.create().
   - Return the created blog.

6. updateBlog(id, data):
   - If data.title has changed, regenerate slug using generateUniqueSlug.
   - Update using blogRepository.updateById().
   - If not found, throw Error "Blog post not found" (status 404).
   - Return the updated blog.

7. togglePublish(id):
   - Find blog by id using blogRepository.findById().
   - If not found, throw Error "Blog post not found" (status 404).
   - Toggle: blog.isPublished = !blog.isPublished.
   - Save and return { isPublished: blog.isPublished }.

8. deleteBlog(id):
   - Find blog by id using blogRepository.findById().
   - If not found, throw Error "Blog post not found" (status 404).
   - Delete using blogRepository.deleteById().
   - If blog.featuredImage.public_id exists, trigger async Cloudinary cleanup:
     cloudinary.uploader.destroy(public_id).catch(err => logger.error('Cloudinary cleanup failed:', err))
   - This is best-effort: do NOT throw or rollback if Cloudinary fails.
   - Return success.
```

---

### Prompt 6.3 — Video Service

```
Write the Video service layer.

**File: src/api/services/video.service.js**

Export an object with these methods:

1. getPublicVideos({ page, limit }):
   - Delegate to videoRepository.findPublishedVideos().

2. getVideoById(id):
   - Find by id using videoRepository.findById().
   - If not found, throw Error "Video not found" (status 404).
   - Return the video.

3. getAdminVideos({ page, limit }):
   - Delegate to videoRepository.findAllVideos().

4. createVideo(data, adminId):
   - Parse youtubeUrl using parseYouTubeUrl() utility to extract videoId and thumbnailUrl.
   - Attach videoId, thumbnailUrl, and createdBy: adminId to data.
   - Create video using videoRepository.create().
   - Return the created video.

5. updateVideo(id, data):
   - If data.youtubeUrl is provided, re-parse to extract new videoId and thumbnailUrl.
   - Update using videoRepository.updateById().
   - If not found, throw Error "Video not found" (status 404).
   - Return the updated video.

6. togglePublish(id):
   - Find video by id.
   - If not found, throw Error "Video not found" (status 404).
   - Toggle: video.isPublished = !video.isPublished.
   - Save and return { isPublished: video.isPublished }.

7. deleteVideo(id):
   - Delete using videoRepository.deleteById().
   - If not found, throw Error "Video not found" (status 404).
   - Return success.
```

---

### Prompt 6.4 — Admin Stats Service

```
Write the Admin stats service.

**File: src/api/services/admin.service.js**

Export an object with this method:

1. getDashboardStats():
   - Run Blog.aggregate() to get: totalBlogs, publishedBlogs, draftBlogs (using $group and $cond).
   - Run Video.aggregate() to get: totalVideos, publishedVideos, draftVideos (using $group and $cond).
   - Run both aggregations in parallel using Promise.all().
   - If either aggregation returns empty, default to 0 values.
   - Return the combined stats object: { blogs: {...}, videos: {...} }.

Reference the exact aggregation pipeline from database.md Section 6.2.
```

---

## Phase 7: Controller Layer

### Prompt 7.1 — Auth Controller

```
Write the Auth controller.

**File: src/api/controllers/auth.controller.js**

Export these controller functions (each wrapped in try-catch, sending errors to next()):

1. login(req, res, next):
   - Extract username, password from req.body.
   - Validate: if either is missing, return 400: "Username and password are required."
   - Call authService.login().
   - Set cookie: res.cookie('token', token, { httpOnly: true, secure: NODE_ENV === 'production', sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', maxAge: 24*60*60*1000, path: '/' }).
   - Return 200: { success: true, message: "Logged in successfully", admin }.

2. logout(req, res, next):
   - Clear cookie: res.cookie('token', '', { httpOnly: true, secure: NODE_ENV === 'production', sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', expires: new Date(0), path: '/' }).
   - Return 200: { success: true, message: "Logged out successfully" }.

3. getMe(req, res, next):
   - Call authService.getMe(req.admin.id).
   - Return 200: { success: true, admin }.
```

---

### Prompt 7.2 — Blog Controller

```
Write the Blog controller.

**File: src/api/controllers/blog.controller.js**

Export these controller functions (all wrapped in try-catch with next(error)):

1. getPublicBlogs(req, res, next):
   - Extract page (default 1), limit (default 10), search from req.query.
   - Parse page and limit to integers.
   - Call blogService.getPublicBlogs({ page, limit, search }).
   - Return 200: { success: true, data, pagination }.

2. getBlogBySlug(req, res, next):
   - Extract slug from req.params.
   - Call blogService.getBlogBySlug(slug).
   - Return 200: { success: true, data: blog }.

3. getAllSlugs(req, res, next):
   - Extract page (default 1), limit (default 50) from req.query.
   - Call blogService.getAllSlugs({ page, limit }).
   - Return 200: { success: true, data }.

4. getAdminBlogs(req, res, next):
   - Extract page (default 1), limit (default 20) from req.query.
   - Call blogService.getAdminBlogs({ page, limit }).
   - Return 200: { success: true, data, pagination }.

5. createBlog(req, res, next):
   - Extract title, content, excerpt, featuredImage, isPublished, metaTitle, metaDescription from req.body.
   - Call blogService.createBlog(data, req.admin.id).
   - Return 201: { success: true, message: "Blog created successfully", data: blog }.

6. updateBlog(req, res, next):
   - Extract id from req.params.
   - Call blogService.updateBlog(id, req.body).
   - Return 200: { success: true, message: "Blog updated successfully", data: blog }.

7. togglePublish(req, res, next):
   - Extract id from req.params.
   - Call blogService.togglePublish(id).
   - Return 200: { success: true, message: "Publish status updated", isPublished }.

8. deleteBlog(req, res, next):
   - Extract id from req.params.
   - Call blogService.deleteBlog(id).
   - Return 200: { success: true, message: "Blog deleted successfully" }.
```

---

### Prompt 7.3 — Video Controller

```
Write the Video controller.

**File: src/api/controllers/video.controller.js**

Export these controller functions (all wrapped in try-catch with next(error)):

1. getPublicVideos(req, res, next):
   - Extract page (default 1), limit (default 10) from req.query.
   - Call videoService.getPublicVideos({ page, limit }).
   - Return 200: { success: true, data, pagination }.

2. getVideoById(req, res, next):
   - Extract id from req.params.
   - Call videoService.getVideoById(id).
   - Return 200: { success: true, data: video }.

3. getAdminVideos(req, res, next):
   - Extract page (default 1), limit (default 20) from req.query.
   - Call videoService.getAdminVideos({ page, limit }).
   - Return 200: { success: true, data, pagination }.

4. createVideo(req, res, next):
   - Extract title, youtubeUrl, isPublished from req.body.
   - Call videoService.createVideo(data, req.admin.id).
   - Return 201: { success: true, message: "Video added successfully", data: video }.

5. updateVideo(req, res, next):
   - Extract id from req.params.
   - Call videoService.updateVideo(id, req.body).
   - Return 200: { success: true, message: "Video updated successfully", data: video }.

6. togglePublish(req, res, next):
   - Extract id from req.params.
   - Call videoService.togglePublish(id).
   - Return 200: { success: true, message: "Video publish status updated", isPublished }.

7. deleteVideo(req, res, next):
   - Extract id from req.params.
   - Call videoService.deleteVideo(id).
   - Return 200: { success: true, message: "Video deleted successfully" }.
```

---

### Prompt 7.4 — Upload Controller

```
Write the Image upload controller.

**File: src/api/controllers/upload.controller.js**

Export this controller function:

1. uploadImage(req, res, next):
   - Wrapped in try-catch.
   - If no req.file, return 400: "No image file provided."
   - Upload the buffer to Cloudinary using cloudinary.uploader.upload_stream() with:
     - folder: 'rawnafcare'
     - resource_type: 'image'
     - transformation: [{ quality: 'auto', format: 'webp' }]
   - On Cloudinary success, return 201: { success: true, message: "Image uploaded successfully", data: { url: result.secure_url, public_id: result.public_id } }.
   - On Cloudinary failure, pass error to next().
```

---

### Prompt 7.5 — Admin Stats Controller

```
Write the Admin stats controller.

**File: src/api/controllers/admin.controller.js**

Export this controller function:

1. getDashboardStats(req, res, next):
   - Wrapped in try-catch.
   - Call adminService.getDashboardStats().
   - Return 200: { success: true, data: stats }.
```

---

## Phase 8: Routes

### Prompt 8.1 — Auth Routes

```
Write the Auth routes.

**File: src/api/routes/auth.routes.js**

- POST /login → Apply loginLimiter middleware → authController.login
- POST /logout → Apply protect middleware → authController.logout
- GET /me → Apply protect middleware → authController.getMe

Export the router.
```

---

### Prompt 8.2 — Blog Routes

```
Write the Blog routes.

**File: src/api/routes/blog.routes.js**

**CRITICAL Route Ordering:** Define `/slugs` BEFORE `/:slug` to prevent Express from matching "slugs" as a dynamic :slug parameter.

Public routes (no auth):
- GET / → blogController.getPublicBlogs
- GET /slugs → blogController.getAllSlugs (MUST be defined before /:slug)
- GET /:slug → blogController.getBlogBySlug

Protected routes (apply protect middleware):
- POST / → blogController.createBlog
- PUT /:id → blogController.updateBlog
- PATCH /:id/toggle-publish → blogController.togglePublish
- DELETE /:id → blogController.deleteBlog

Export the router.
```

---

### Prompt 8.3 — Video Routes

```
Write the Video routes.

**File: src/api/routes/video.routes.js**

Public routes (no auth):
- GET / → videoController.getPublicVideos
- GET /:id → videoController.getVideoById

Protected routes (apply protect middleware):
- POST / → videoController.createVideo
- PUT /:id → videoController.updateVideo
- PATCH /:id/toggle-publish → videoController.togglePublish
- DELETE /:id → videoController.deleteVideo

Export the router.
```

---

### Prompt 8.4 — Upload Routes

```
Write the Upload routes.

**File: src/api/routes/upload.routes.js**

Protected route (apply protect + upload middleware):
- POST /image → protect → upload.single('image') → uploadController.uploadImage

Export the router.
```

---

### Prompt 8.5 — Admin Routes

```
Write the Admin routes.

**File: src/api/routes/admin.routes.js**

Protected routes (apply protect middleware):
- GET /blogs → blogController.getAdminBlogs
- GET /videos → videoController.getAdminVideos
- GET /stats → adminController.getDashboardStats

Export the router.
```

---

## Phase 9: App Entry Point

### Prompt 9.1 — Express App Configuration (app.js)

```
Write the main Express app entry point.

**File: src/app.js**

1. Import all configs (env, db, logger).
2. Create Express app.
3. Apply global middleware in this order:
   a. helmet() for security headers.
   b. cors({ origin: [FRONTEND_URL, 'http://localhost:3000'], credentials: true }).
   c. express.json({ limit: '10mb' }).
   d. express.urlencoded({ extended: true }).
   e. cookieParser().

4. Mount routes:
   - /api/auth → authRoutes
   - /api/blogs → blogRoutes
   - /api/videos → videoRoutes
   - /api/upload → uploadRoutes
   - /api/admin → adminRoutes

5. Health check route: GET /api/health → return { status: "ok", timestamp }.

6. Apply global error handler middleware as the LAST middleware.

7. Connect to DB, then start server:
   connectDB().then(() => {
     app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
   });
```

---

## Phase 10: Admin Seed Script

### Prompt 10.1 — Seed Admin Script

```
Write the admin account seed script.

**File: src/scripts/seedAdmin.js**

1. Import mongoose, bcryptjs, Admin model, env config, and logger.
2. Connect to MongoDB.
3. Check if admin already exists by ADMIN_USERNAME.
4. If exists, log "Admin already exists" and exit.
5. If not, hash ADMIN_PASSWORD using bcrypt with 12 salt rounds.
6. Create new Admin document with username and hashed password.
7. Log "Admin account created successfully" and exit with process.exit(0).
8. On error, log the error and exit with process.exit(1).
9. Ensure mongoose.connection.close() is called in a finally block.

This script runs via: npm run seed:admin
```

---

## Phase 11: Testing & Verification

### Prompt 11.1 — Verify Server Starts

```
Verify the backend starts correctly.

1. Create a .env file from .env.example with your actual MongoDB Atlas connection string and other values.
2. Run `npm run dev` and confirm:
   - Server starts on PORT 5000.
   - MongoDB Atlas connection is successful.
   - No errors in console.
3. Test the health check: GET http://localhost:5000/api/health should return { status: "ok" }.
```

---

### Prompt 11.2 — Seed Admin & Test Auth Flow

```
Test the complete authentication flow.

1. Run `npm run seed:admin` — verify admin account is created in MongoDB Atlas.
2. Test POST /api/auth/login with correct credentials — verify 200 response and cookie is set.
3. Test GET /api/auth/me with the cookie — verify admin data is returned.
4. Test POST /api/auth/logout — verify cookie is cleared.
5. Test GET /api/auth/me without cookie — verify 401 is returned.
6. Test login with wrong password 6 times — verify rate limiter kicks in with 429 response.
```

---

### Prompt 11.3 — Test Blog CRUD Flow

```
Test the complete Blog CRUD flow.

1. Login as admin first.
2. Test POST /api/blogs — create a blog with Bengali title, verify slug is auto-generated.
3. Test POST /api/blogs with same title — verify slug collision resolution (-1 appended).
4. Test GET /api/blogs — verify only published blogs appear.
5. Test GET /api/blogs/:slug — verify single blog retrieval.
6. Test GET /api/blogs/slugs — verify slugs list for sitemap.
7. Test GET /api/admin/blogs — verify all blogs (including drafts) appear.
8. Test PUT /api/blogs/:id — update the blog title and content.
9. Test PATCH /api/blogs/:id/toggle-publish — toggle publish status.
10. Test DELETE /api/blogs/:id — verify deletion and Cloudinary cleanup log.
```

---

### Prompt 11.4 — Test Video CRUD Flow

```
Test the complete Video CRUD flow.

1. Login as admin first.
2. Test POST /api/videos with a YouTube URL — verify videoId and thumbnailUrl are auto-extracted.
3. Test POST /api/videos with the same YouTube URL — verify 409 Conflict (duplicate videoId).
4. Test GET /api/videos — verify only published videos appear.
5. Test GET /api/videos/:id — verify single video retrieval with all fields.
6. Test GET /api/admin/videos — verify all videos appear.
7. Test PUT /api/videos/:id — update video title.
8. Test PATCH /api/videos/:id/toggle-publish — toggle publish status.
9. Test DELETE /api/videos/:id — verify deletion.
```

---

### Prompt 11.5 — Test Image Upload

```
Test the image upload flow.

1. Login as admin first.
2. Test POST /api/upload/image with a valid JPEG file (under 2MB) — verify Cloudinary URL is returned.
3. Test with a 5MB file — verify 413 Payload Too Large error.
4. Test with a .gif file — verify 400 error (unsupported MIME type).
5. Test without any file — verify 400 error.
```

---

### Prompt 11.6 — Test Admin Dashboard Stats

```
Test the admin dashboard stats endpoint.

1. Login as admin first.
2. Create 3 blogs (2 published, 1 draft) and 2 videos (1 published, 1 draft).
3. Test GET /api/admin/stats — verify correct counts:
   - blogs: { totalBlogs: 3, publishedBlogs: 2, draftBlogs: 1 }
   - videos: { totalVideos: 2, publishedVideos: 1, draftVideos: 1 }
```

---

### Prompt 11.7 — Test Error Handling

```
Test the global error handling middleware.

1. Test GET /api/blogs/invalidslug123 — verify 404 response.
2. Test PUT /api/blogs/invalidObjectId — verify 400 "Invalid resource ID format".
3. Test POST /api/blogs with empty title — verify 400 validation error.
4. Test accessing admin routes without login — verify 401 response.
5. Test POST /api/videos with invalid YouTube URL — verify 400 response.
6. Verify all error responses follow the standardized format: { success: false, error: "...", message: "..." }.
7. In development mode, verify `stack` trace is included in error responses.
```
