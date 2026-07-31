# Software Architecture Document - Rawnaf Care MVP

This document defines the system architecture, component design, API boundaries, security controls, and deployment strategy for **Rawnaf Care MVP**, built as a **Layered Monolith**.

---

## 1. Tech Stack Summary

- **Frontend:** Next.js (App Router, React) + Tailwind CSS + Lucide Icons
- **Backend:** Node.js + Express.js (Layered Monolith: Controller > Service > Repository)
- **Database:** MongoDB Atlas (M0 Managed Cloud Database via Mongoose ORM)
- **Authentication:** JWT (JSON Web Tokens) persisted in **HttpOnly Cookies**
- **Media Storage:** Cloudinary (Free Tier) or AWS S3 for featured blog images
- **Analytics:** Google Analytics 4 (GA4) for client-side event tracking
- **Deployment:** Vercel (Frontend), Render / Railway (Backend), MongoDB Atlas (Database)

---

## 2. High-Level System Architecture

The frontend and backend are decoupled services communicating via a RESTful HTTP API over TLS. External third-party integrations (YouTube embeds, WhatsApp direct links, GA4 scripts) run exclusively on the client boundary to keep the backend lightweight and stateless.

```mermaid
flowchart TD
    User([General User / Admin])
    
    subgraph Frontend [Next.js App Router Frontend - Vercel]
        UI[UI Components & Layouts]
        CalcEngine[Stateless Health Calculator Engine]
        GA4Script[GA4 Analytics Event Tracker]
        ExtEmbed[YouTube Modal Player]
        WaLink[WhatsApp wa.me Redirect]
    end
    
    subgraph Backend [Express.js Backend API - Render/Railway]
        AuthMW[Auth Middleware (HttpOnly Cookie JWT)]
        Router[Express API Routers]
        Controllers[Controllers (Req/Res Validation)]
        Services[Business Logic Services]
        Repos[Mongoose Repositories]
    end
    
    subgraph Database [Database & Cloud]
        Mongo[(MongoDB Atlas M0)]
        Cloudinary[(Cloudinary Media Storage)]
    end

    User -->|HTTPS| UI
    UI -->|REST API Requests| Router
    Router --> AuthMW
    AuthMW --> Controllers
    Controllers --> Services
    Services --> Repos
    Services -->|Upload Image| Cloudinary
    Repos -->|Mongoose Driver| Mongo
    
    UI -->|Calculates Instantly| CalcEngine
    UI -->|Tracks Clicks| GA4Script
    ExtEmbed -->|Streams Video| YouTube([YouTube Servers])
    WaLink -->|Opens App| WhatsApp([WhatsApp Web/App])
```

---

## 3. Low-Level Backend Architecture (Layered Pattern)

The Express backend strictly enforces separation of concerns through a 4-layer architecture:

```mermaid
flowchart LR
    Client[Next.js Client Request] --> Route[Route Layer]
    Route --> MW[Auth / Validation Middleware]
    MW --> Controller[Controller Layer\n(Input Sanitation & Response)]
    Controller --> Service[Service Layer\n(Business Logic & Rules)]
    Service --> Repo[Repository Layer\n(Database Queries)]
    Repo --> Model[Mongoose Model / Schema]
    Model --> DB[(MongoDB Atlas)]
```

### Layer Responsibilities:
1. **Route & Middleware Layer:** Maps endpoint paths to controllers. Enforces JWT authentication middleware on `POST`, `PUT`, `PATCH`, `DELETE` routes, and sanitizes input payloads.
2. **Controller Layer:** Parses HTTP headers/body, executes schema validation, handles HTTP status codes (200, 201, 400, 401, 404, 500), and triggers toast payload responses.
3. **Service Layer:** Houses domain rules (e.g., auto-slug generation with Bengali transliteration/fallback, password comparison via bcrypt, JWT signing, YouTube ID extraction).
4. **Repository Layer:** Abstracted data layer encapsulating Mongoose methods (`find()`, `findByIdAndUpdate()`, `deleteOne()`).

---

## 4. Module Breakdown

### 4.1. Auth Module (Admin Only)
- **Routes:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Security:** Authenticates admin credentials, signs JWT, sets `HttpOnly`, `Secure`, `SameSite=None` cookie. Protects all administrative routes.

### 4.2. Blog Module
- **Public Routes:** `GET /api/blogs` (Paginated via "Load More", supports `?search=query` filtering published posts only), `GET /api/blogs/:slug`, `GET /api/blogs/slugs` (Paginated/cursor-based for Next.js dynamic `sitemap.ts` generation to prevent memory overload).
- **Protected Admin Routes:** `GET /api/admin/blogs` (returns all published and draft articles for dashboard), `POST /api/blogs`, `PUT /api/blogs/:id`, `DELETE /api/blogs/:id`, `PATCH /api/blogs/:id/toggle-publish`
- **Logic:** Enforces MongoDB `{ slug: 1 }` unique index. Handles title transliteration for clean ASCII slugs, slug collision `-1`, `-2` resolution, image upload (max 2MB, jpeg/png/webp), and optional SEO meta overrides.
- **Cloudinary Cleanup:** Updating or deleting a featured image automatically calls `cloudinary.uploader.destroy(public_id)` to clean up orphan image assets from cloud storage.

### 4.3. Video Module
- **Public Routes:** `GET /api/videos` (Paginated via "Load More", filters to return published videos only)
- **Protected Routes:** `POST /api/videos`, `PUT /api/videos/:id`, `DELETE /api/videos/:id`, `PATCH /api/videos/:id/toggle-publish`
- **Logic:** Regex validation for YouTube URLs (`youtube.com/watch?v=`, `youtu.be/`), auto-deriving thumbnail URLs using YouTube Video ID (`https://img.youtube.com/vi/<id>/hqdefault.jpg`).

### 4.4. Health Tools Module (Stateless / Client-Side)
- **Components:** BMI Calculator, Fertile Window Calculator, Diabetes Risk Calculator, Child Growth Tracker.
- **Architecture:** 100% executed in Next.js browser memory. Zero API requests or database storage, guaranteeing 0ms network latency and strict data privacy compliance.

### 4.5. About & Appointment Module
- **Stateless:** Static component presenting Dr. Nafia's qualifications and credentials. Appointment callout renders a formatted `https://wa.me/<phone>?text=<prefilled_msg>` link.

---

## 5. Folder Structure

```text
rawnaf-care/
├── frontend/                     # Next.js App Router Frontend
│   ├── public/                   # Static images, favicon, robots.txt
│   ├── src/
│   │   ├── app/                  # Pages & Layouts
│   │   │   ├── (public)/         # Public layout routes (Home, Blog, Videos, Tools, About)
│   │   │   ├── admin/            # Protected Admin Dashboard routes (Login, Posts, Videos)
│   │   │   └── api/              # Optional Next.js proxy routes / GA4 helpers
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI primitives (Buttons, Modals, Toasts)
│   │   │   ├── blog/             # Blog Cards, Detail View, Rich Text Renderer
│   │   │   ├── calculators/      # BMI, Fertile Window, Diabetes, Child Growth components
│   │   │   └── admin/            # Post Editor, Video Form, Confirmation Modals
│   │   ├── lib/                  # Calculator math logic, GA4 event helpers, slug utilities
│   │   │   └── data/             # who-percentiles.json (Static WHO dataset for Child Growth Tracker)
│   │   └── hooks/                # Custom React hooks (useAuth, usePagination)
│   ├── package.json
│   └── next.config.js
│
└── backend/                      # Express.js REST API Backend
    ├── src/
    │   ├── api/
    │   │   ├── routes/           # auth.routes.js, blog.routes.js, video.routes.js
    │   │   ├── controllers/      # auth.controller.js, blog.controller.js, video.controller.js
    │   │   ├── services/         # auth.service.js, blog.service.js, video.service.js
    │   │   └── repositories/     # blog.repository.js, video.repository.js, admin.repository.js
    │   ├── models/               # Blog.js, Video.js, Admin.js (Mongoose Schemas)
    │   ├── middleware/           # auth.middleware.js, upload.middleware.js, error.middleware.js, rateLimit.middleware.js
    │   ├── scripts/              # seedAdmin.js (Initial admin account setup script)
    │   ├── utils/                # slugify.js, youtubeParser.js, logger.js
    │   ├── config/               # db.js, env.js, cloudinary.js
    │   └── app.js                # Express app configuration & server entry
    ├── .env
    └── package.json
```

---

## 6. Security & Authentication Architecture

1. **Cross-Domain HttpOnly Cookie Token Storage:** JWT is issued on successful `/api/auth/login` and sent via `Set-Cookie: token=...; HttpOnly; Secure; SameSite=None`. Frontend API requests (Axios/fetch) must set `credentials: 'include'` to safely pass cookies cross-domain (Vercel to Render/Railway).
2. **Route Authorization Guard:** An `authMiddleware` intercepts incoming requests for all mutating endpoints (`POST`, `PUT`, `PATCH`, `DELETE`). If the cookie token is missing or invalid, it immediately halts execution and returns a `401 Unauthorized` status.
3. **File Upload Security:** Multer middleware validates incoming featured image files before disk/cloud buffer:
   - **Max File Size:** 2MB hard cap.
   - **MIME Type Whitelist:** `image/jpeg`, `image/png`, `image/webp` only.
4. **CORS & Next.js Remote Patterns:** 
   - Express `cors` middleware restricts origin access to the frontend domains (`origin: [process.env.FRONTEND_URL, 'http://localhost:3000'], credentials: true`) to support both production and local development.
   - `next.config.js` configures `images.remotePatterns` for `res.cloudinary.com` and `img.youtube.com` to enable optimized Next.js `<Image />` rendering.

---

## 7. API Specification & Boundary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Validates admin credentials & sets HttpOnly JWT cookie (SameSite=None, Secure) |
| `POST` | `/api/auth/logout` | Protected | Clears authentication cookie |
| `GET` | `/api/auth/me` | Protected | Returns current admin session status |
| `GET` | `/api/blogs?page=1&limit=10&search=q` | Public | Returns published blog posts (supports search query & Load More pattern) |
| `GET` | `/api/blogs/:slug` | Public | Returns single blog post details by slug |
| `GET` | `/api/blogs/slugs?page=1&limit=50` | Public | Returns paginated list of all published slugs for Next.js dynamic sitemap |
| `GET` | `/api/admin/blogs` | Admin | Returns all published AND draft blog posts for admin dashboard |
| `POST` | `/api/blogs` | Admin | Creates a new blog post |
| `PUT` | `/api/blogs/:id` | Admin | Updates an existing blog post |
| `PATCH` | `/api/blogs/:id/toggle-publish` | Admin | Toggles post published/draft state |
| `DELETE` | `/api/blogs/:id` | Admin | Deletes a blog post (triggers confirmation modal & Cloudinary cleanup) |
| `GET` | `/api/videos?page=1&limit=10` | Public | Returns published videos list (filters out drafts) |
| `GET` | `/api/videos/:id` | Public | Returns single video details by ID |
| `GET` | `/api/admin/videos` | Admin | Returns all published AND draft videos for admin dashboard |
| `GET` | `/api/admin/stats` | Admin | Returns dashboard summary counts (total blogs, published/draft, total videos) |
| `POST` | `/api/videos` | Admin | Adds a new video link with title & thumbnail |
| `PUT` | `/api/videos/:id` | Admin | Updates video details |
| `PATCH` | `/api/videos/:id/toggle-publish` | Admin | Toggles video published/draft state |
| `DELETE` | `/api/videos/:id` | Admin | Deletes a video entry |

---

## 8. Frontend State & UI Feedback Architecture

- **Toast Notifications:** A centralized toast provider (e.g., `react-hot-toast` or `sonner`) displays real-time feedback for all Admin actions ("Post published successfully", "Failed to save post", "Invalid YouTube URL").
- **Modal Controls:** React state manages confirmation modals ("Are you sure you want to delete this post?") before invoking API endpoints.
- **Stateless Calculators:** React local state (`useState` / `useReducer`) manages form metrics. Calculation results render instantly upon clicking "Calculate", with event triggers sent to GA4 (`gtag('event', 'calculator_used', { tool_name: 'BMI' })`).

---

## 9. Deployment Architecture

- **Frontend Hosting:** Vercel (Global CDN, automatic SSL, Next.js optimization)
- **Backend Hosting:** Render / Railway (Node.js web service container)
- **Media CDN:** Cloudinary for automated image optimization and delivery

---

## 10. Scalability, Caching & Logging Strategy

- **Scalability:** The application relies on MongoDB Atlas M0. To prevent connection exhaustion, Mongoose connection pooling is utilized. Backend and Frontend are horizontally scalable via Render/Railway and Vercel respectively.
- **Caching:** Next.js Incremental Static Regeneration (ISR) is implemented for `/blogs` and `/videos` routes. Static assets and featured images are cached at the edge via Vercel and Cloudinary CDNs.
- **Logging:** A structured logger (e.g., Winston) is used in the backend. 
  - `info` level: Server start, DB connection success.
  - `warn`/`error` level: Failed admin logins, missing environment variables, DB connection drops, and failed Cloudinary API calls.
  - In production, logs are output to `stdout`/`stderr` and captured by the hosting provider (Render/Railway).
