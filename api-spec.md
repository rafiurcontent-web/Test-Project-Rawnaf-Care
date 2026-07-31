# API Specification - Rawnaf Care MVP

This document outlines the API endpoints, methods, request bodies, and expected responses for the Rawnaf Care MVP, based on the PRD, Database Schema, and Architecture.

---

## Version Control Strategy
For this MVP phase, the API follows an **implicit versioning strategy**. All endpoints are grouped under the `/api/` prefix, acting as `v1`. 
When breaking changes are introduced in the future, a **URI versioning strategy** (e.g., `/api/v1/...`, `/api/v2/...`) will be implemented to ensure backward compatibility without disrupting existing frontend clients.

---

## 1. Authentication Endpoints

### 1.1 Admin Login
- **Path:** `/api/auth/login`
- **Method:** `POST`
- **Auth Required:** No (Public)
- **Description:** Validates admin credentials and sets an HttpOnly JWT cookie.
- **Request Body:**
  ```json
  {
    "username": "admin_rawnaf",
    "password": "securepassword123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "admin": {
      "id": "66a93b1f2e4a8c1234567890",
      "username": "admin_rawnaf"
    }
  }
  ```
  *(Sets HttpOnly cookie: `token=eyJhbGci...; Path=/; HttpOnly; Secure; SameSite=None`)*

### 1.2 Admin Logout
- **Path:** `/api/auth/logout`
- **Method:** `POST`
- **Auth Required:** Yes (Admin)
- **Description:** Clears the authentication cookie.
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
  *(Clears `token` cookie)*

### 1.3 Check Auth Status
- **Path:** `/api/auth/me`
- **Method:** `GET`
- **Auth Required:** Yes (Admin)
- **Description:** Returns the current admin session status based on the JWT cookie.
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "admin": {
      "id": "66a93b1f2e4a8c1234567890",
      "username": "admin_rawnaf"
    }
  }
  ```

---

## 2. Blog Endpoints

### 2.1 Get Public Blogs (Paginated & Search)
- **Path:** `/api/blogs`
- **Method:** `GET`
- **Auth Required:** No (Public)
- **Description:** Returns a paginated list of published blog posts. Supports text search.
- **Query Parameters:** `?page=1&limit=10&search=nutrition`
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "66a93b5f...",
        "title": "গর্ভাবস্থায় সঠিক পুষ্টি",
        "slug": "gorbhabosthay-sothik-pusti",
        "excerpt": "...",
        "featuredImage": { "url": "...", "public_id": "..." },
        "createdAt": "2026-07-30T11:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
  ```

### 2.2 Get Single Public Blog by Slug
- **Path:** `/api/blogs/:slug`
- **Method:** `GET`
- **Auth Required:** No (Public)
- **Description:** Retrieves full details of a single published blog post by its SEO slug.
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "66a93b5f...",
      "title": "গর্ভাবস্থায় সঠিক পুষ্টি",
      "slug": "gorbhabosthay-sothik-pusti",
      "content": "<p>...</p>",
      "excerpt": "...",
      "featuredImage": { "url": "...", "public_id": "..." },
      "metaTitle": "...",
      "metaDescription": "...",
      "createdAt": "2026-07-30T11:00:00.000Z",
      "updatedAt": "2026-07-30T11:00:00.000Z"
    }
  }
  ```

### 2.3 Get All Blog Slugs (For Sitemap)
- **Path:** `/api/blogs/slugs`
- **Method:** `GET`
- **Auth Required:** No (Public)
- **Description:** Returns a list of all published slugs for Next.js dynamic routing and sitemap generation.
  > **Note (Route Priority):** Ensure this route is defined *before* `/api/blogs/:slug` in the Express router to prevent `"slugs"` from being misinterpreted as a dynamic slug parameter.
- **Query Parameters:** `?page=1&limit=50`
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      { "slug": "gorbhabosthay-sothik-pusti", "updatedAt": "2026-07-30..." }
    ]
  }
  ```

### 2.4 Get All Blogs (Admin Dashboard)
- **Path:** `/api/admin/blogs`
- **Method:** `GET`
- **Auth Required:** Yes (Admin)
- **Description:** Returns all blogs (both published and drafts) for the admin table view.
- **Query Parameters:** `?page=1&limit=20`
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "66a93b5f...",
        "title": "গর্ভাবস্থায় সঠিক পুষ্টি",
        "isPublished": true,
        "createdAt": "..."
      }
    ],
    "pagination": { "total": 50, "page": 1, "limit": 20 }
  }
  ```

### 2.5 Create Blog Post
- **Path:** `/api/blogs`
- **Method:** `POST`
- **Auth Required:** Yes (Admin)
- **Description:** Creates a new blog post. Auto-generates SEO meta if empty.
  > **Note (Slug Generation):** The backend will automatically generate the `slug` from the `title` (using Bengali transliteration and handling collisions by appending `-1`, `-2`). It should not be sent by the client.
- **Request Body:**
  ```json
  {
    "title": "নতুন পোস্টের শিরোনাম",
    "content": "<p>কন্টেন্ট এখানে...</p>",
    "excerpt": "ছোট বিবরণ",
    "featuredImage": {
      "url": "https://res.cloudinary.com/...",
      "public_id": "folder/image123"
    },
    "isPublished": true,
    "metaTitle": "",
    "metaDescription": ""
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Blog created successfully",
    "data": { "_id": "...", "slug": "notun-poster-shironam", ... }
  }
  ```

### 2.6 Update Blog Post
- **Path:** `/api/blogs/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (Admin)
- **Description:** Updates an existing blog post.
- **Request Body:** Same as `POST /api/blogs` (title, content, excerpt, featuredImage, isPublished, metaTitle, metaDescription)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Blog updated successfully",
    "data": {
      "_id": "66a93b5f...",
      "title": "আপডেট করা শিরোনাম",
      "slug": "update-kora-shironam",
      "isPublished": true,
      "updatedAt": "2026-07-30T14:00:00.000Z"
    }
  }
  ```

### 2.7 Toggle Blog Publish Status
- **Path:** `/api/blogs/:id/toggle-publish`
- **Method:** `PATCH`
- **Auth Required:** Yes (Admin)
- **Description:** Quickly toggles the `isPublished` boolean without updating the full document. The backend inverses the current value automatically.
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Publish status updated",
    "isPublished": true
  }
  ```
  *(The `isPublished` value in the response reflects the **new** toggled state — it will be `true` or `false` depending on the previous value.)*

### 2.8 Delete Blog Post
- **Path:** `/api/blogs/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Admin)
- **Description:** Deletes a blog post and triggers async Cloudinary image cleanup.
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Blog deleted successfully"
  }
  ```

---

## 3. Video Endpoints

### 3.1 Get Public Videos (Paginated)
- **Path:** `/api/videos`
- **Method:** `GET`
- **Auth Required:** No (Public)
- **Description:** Returns a paginated list of published YouTube videos.
- **Query Parameters:** `?page=1&limit=10`
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "66a93b8f...",
        "title": "নবজাতকের যত্ন",
        "youtubeUrl": "...",
        "videoId": "dQw4w9WgXcQ",
        "thumbnailUrl": "...",
        "createdAt": "..."
      }
    ],
    "pagination": { "total": 15, "page": 1, "limit": 10 }
  }
  ```

### 3.2 Get Single Public Video by ID
- **Path:** `/api/videos/:id`
- **Method:** `GET`
- **Auth Required:** No (Public)
- **Description:** Retrieves details for a specific published video.
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "66a93b8f...",
      "title": "নবজাতকের প্রথম ৩ মাসের ত্বকের যত্ন",
      "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "videoId": "dQw4w9WgXcQ",
      "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "isPublished": true,
      "createdAt": "2026-07-30T12:00:00.000Z",
      "updatedAt": "2026-07-30T12:00:00.000Z"
    }
  }
  ```

### 3.3 Get All Videos (Admin Dashboard)
- **Path:** `/api/admin/videos`
- **Method:** `GET`
- **Auth Required:** Yes (Admin)
- **Description:** Returns all videos (published and drafts) for the admin table.
- **Query Parameters:** `?page=1&limit=20`
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "66a93b8f...",
        "title": "নবজাতকের প্রথম ৩ মাসের ত্বকের যত্ন",
        "videoId": "dQw4w9WgXcQ",
        "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        "isPublished": true,
        "createdAt": "2026-07-30T12:00:00.000Z"
      }
    ],
    "pagination": { "total": 15, "page": 1, "limit": 20 }
  }
  ```

### 3.4 Create Video Entry
- **Path:** `/api/videos`
- **Method:** `POST`
- **Auth Required:** Yes (Admin)
- **Description:** Adds a new YouTube video entry. The backend will automatically extract `videoId` and derive `thumbnailUrl` from the provided `youtubeUrl`.
- **Request Body:**
  ```json
  {
    "title": "নবজাতকের যত্ন",
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "isPublished": true
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Video added successfully",
    "data": { ... }
  }
  ```

### 3.5 Update Video Entry
- **Path:** `/api/videos/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (Admin)
- **Description:** Updates an existing video entry.
- **Request Body:** Same as `POST /api/videos` (title, youtubeUrl, isPublished)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Video updated successfully",
    "data": {
      "_id": "66a93b8f...",
      "title": "আপডেট করা ভিডিও শিরোনাম",
      "videoId": "dQw4w9WgXcQ",
      "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "isPublished": true,
      "updatedAt": "2026-07-30T14:00:00.000Z"
    }
  }
  ```

### 3.6 Toggle Video Publish Status
- **Path:** `/api/videos/:id/toggle-publish`
- **Method:** `PATCH`
- **Auth Required:** Yes (Admin)
- **Description:** Quickly toggles the `isPublished` boolean for a video. The backend inverses the current value automatically.
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Video publish status updated",
    "isPublished": true
  }
  ```
  *(The `isPublished` value in the response reflects the **new** toggled state — it will be `true` or `false` depending on the previous value.)*

### 3.7 Delete Video Entry
- **Path:** `/api/videos/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Admin)
- **Description:** Deletes a video entry from the database.
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Video deleted successfully"
  }
  ```

---

## 4. Admin Dashboard Stats

### 4.1 Get Dashboard Statistics
- **Path:** `/api/admin/stats`
- **Method:** `GET`
- **Auth Required:** Yes (Admin)
- **Description:** Returns aggregated counts for blogs and videos for the admin overview dashboard.
- **Request Body:** None
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "blogs": {
        "totalBlogs": 45,
        "publishedBlogs": 40,
        "draftBlogs": 5
      },
      "videos": {
        "totalVideos": 15,
        "publishedVideos": 12,
        "draftVideos": 3
      }
    }
  }
  ```

---

## 5. Media Upload Endpoints

### 5.1 Upload Image
- **Path:** `/api/upload/image`
- **Method:** `POST`
- **Auth Required:** Yes (Admin)
- **Description:** Uploads a featured image to Cloudinary. Max 2MB, formats: jpeg/png/webp.
- **Request Body:** `multipart/form-data`
  - Field name: `image` (File)
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully",
    "data": {
      "url": "https://res.cloudinary.com/.../image.webp",
      "public_id": "rawnafcare/image123"
    }
  }
  ```

---

## 6. Global Error Handling Strategy & Common Responses

### 6.1 Global Error Handling Middleware
To ensure a consistent response structure and prevent application crashes, the backend implements a **Centralized Error Handling Middleware** (`errorHandler.js`).
- **Catch-all:** All unhandled exceptions, mongoose validation failures, and explicitly thrown API errors are caught by this middleware.
- **Environment Awareness:** In `development` mode, the `stack` trace is included in the response. In `production`, the stack trace is entirely stripped to prevent leaking system architecture details.
- **Logging:** 500-level Server Errors are automatically piped to the `winston` logger.

### 6.2 Standardized Error Format
The API follows a strict JSON schema for all error responses:
```json
{
  "success": false,
  "error": "Short Error Type (e.g., 'Validation failed', 'Unauthorized access')",
  "message": "Human-readable message for the frontend toast notification.",
  "stack": "..." // Only present if NODE_ENV === 'development'
}
```

### 6.3 Common HTTP Error Scenarios

#### 400 Bad Request (Validation Error)
Triggered when request payload is invalid (e.g., missing title, invalid YouTube URL).
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Blog title is required and cannot be empty."
}
```

#### 401 Unauthorized
Triggered when accessing protected routes without a valid JWT cookie.
```json
{
  "success": false,
  "error": "Unauthorized access",
  "message": "Please log in to continue."
}
```

#### 404 Not Found
Triggered when a resource (e.g., blog slug, video ID) is not found.
```json
{
  "success": false,
  "error": "Not Found",
  "message": "The requested resource could not be found."
}
```

#### 409 Conflict
Triggered when a unique constraint fails (e.g., duplicate `videoId`). (Slug collision is auto-handled by appending numbers, but if it fails completely).
```json
{
  "success": false,
  "error": "Conflict",
  "message": "A video with this YouTube URL already exists."
}
```

#### 413 Payload Too Large
Triggered during image upload if the file exceeds the 2MB limit.
```json
{
  "success": false,
  "error": "File too large",
  "message": "Image exceeds the maximum allowed size of 2MB."
}
```

#### 429 Too Many Requests
Triggered for rate-limited endpoints (e.g., brute-force protection on `/api/auth/login`).
```json
{
  "success": false,
  "error": "Too Many Requests",
  "message": "Too many failed login attempts. Please try again after 15 minutes."
}
```
