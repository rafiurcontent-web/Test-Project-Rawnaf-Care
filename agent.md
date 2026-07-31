# Agent Instructions — Rawnaf Care MVP

> **Read this file FIRST before touching any code or making any decisions.**
> This is the single source of truth for understanding the Rawnaf Care project. It consolidates all critical context from the planning documentation so you can orient quickly and build correctly.

---

## 1. Project Summary

**Rawnaf Care** is a health-focused web platform built around the medical expertise of **Dr. Nafia Islam**, targeting the Bangladeshi audience. In Bangladesh, expecting parents and health-conscious individuals struggle to find reliable, localized health information backed by a recognizable medical professional. Rawnaf Care solves this by consolidating expert blog content, YouTube video advice, and interactive health calculators (using South Asian medical standards) into a single, easy-to-use platform. A WhatsApp-based appointment callout card connects users directly with the doctor's clinic.

**Key principle:** The platform is **completely free and public** — no signup, no login, no paywall for general users. Only the admin (Dr. Nafia or her team) authenticates to manage content via a secure dashboard.

**Target Users:**
- Expecting mothers and new parents seeking pregnancy and newborn care advice
- Parents monitoring their child's growth and development
- General health-conscious individuals looking for localized health tools and trustworthy articles

---

## 2. Tech Stack & Architecture Pattern

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js (App Router) + Tailwind CSS + Lucide Icons |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas (M0 Free Tier) via Mongoose ORM |
| **Authentication** | JWT (JSON Web Tokens) in HttpOnly Cookies |
| **Media Storage** | Cloudinary (Free Tier) for blog featured images |
| **Analytics** | Google Analytics 4 (GA4) — client-side only |
| **Deployment** | Vercel (Frontend) + Render/Railway (Backend) + MongoDB Atlas (Database) |

### Architecture Pattern: Layered Monolith

The backend strictly enforces a **4-layer separation of concerns**:

```
Client Request → Route → Middleware (Auth / Validation) → Controller → Service → Repository → Mongoose Model → MongoDB
```

- **Route Layer:** Maps endpoint paths to controllers. Applies auth/rate-limit middleware.
- **Controller Layer:** Parses HTTP input, validates request shape, sets HTTP status codes, formats responses.
- **Service Layer:** Contains all business logic (slug generation, password comparison, JWT signing, YouTube parsing, Cloudinary cleanup).
- **Repository Layer:** Abstracted data access layer wrapping Mongoose queries. Controllers and services never call Mongoose directly.

---

## 3. Project Status

### Completed Documentation Files

| File | Purpose | Status |
| :--- | :--- | :--- |
| `idea.md` | Original project idea and problem statement | ✅ Complete |
| `prd.md` | Full Product Requirements Document with features, user stories, acceptance criteria | ✅ Complete |
| `prd-analysis.md` | Analysis summary of PRD — product goals, user types, requirements overview | ✅ Complete |
| `requirement-validation.md` | Gap audit across 8 categories (flows, edge cases, security, validation, etc.) | ✅ Complete |
| `architecture.md` | System architecture, folder structure, module breakdown, security design, deployment plan | ✅ Complete |
| `database.md` | Full database documentation — schemas, indexes, aggregation pipelines, ERD, sample data, Mongoose model code | ✅ Complete |
| `database-schema.md` | Standalone schema field reference (extracted from database.md) | ✅ Complete |
| `api-spec.md` | Complete REST API specification — all endpoints, request/response formats, error handling | ✅ Complete |
| `dfd.md` | Data Flow Diagrams (Context, Level 1, Level 2) with Mermaid + Draw.io XML | ✅ Complete |
| `prompt.md` | Step-by-step backend build prompts (11 phases, 30+ prompts) | ✅ Complete |
| `agent.md` | This file — agent onboarding instructions | ✅ Complete |

### Current Development Phase
- **Backend development has NOT started yet.** All planning and documentation is complete.
- The next step is to execute the prompts in `prompt.md` sequentially, starting from Phase 1 (Project Initialization).

---

## 4. Core Business Rules & Constraints

These are non-negotiable decisions that are baked into the architecture. Violating any of these will introduce bugs or break the product.

### 4.1 Authentication & Access Model
- **NO signup or login for general users.** Every public page (blogs, videos, health tools, about page) is freely accessible without any authentication wall.
- **Admin-only authentication** via JWT stored in an **HttpOnly cookie** with `SameSite=None; Secure` in production and `SameSite=Lax` in development.
- All admin write/delete API routes (`POST`, `PUT`, `PATCH`, `DELETE`) **must return `401 Unauthorized`** for unauthenticated requests.
- Admin session uses a fixed-expiry JWT (24 hours). No refresh tokens or sliding sessions in MVP.
- Initial admin account is bootstrapped via a seed script: `npm run seed:admin`.

### 4.2 Health Tools — Client-Side Only
- All four health calculators (**BMI, Fertile Window, Diabetes Risk, Child Growth Tracker**) execute **100% in the browser**. They make **zero API requests** and persist **zero data** to any database.
- Calculator logic lives in the Next.js frontend (`lib/` directory). React local state (`useState` / `useReducer`) manages form inputs and results.
- WHO percentile data for the Child Growth Tracker is stored as a **static JSON file** (`lib/data/who-percentiles.json`) loaded into browser memory.

### 4.3 Diabetes Risk Calculator Score Bands
- **Low:** 0–24 pts
- **Moderate:** 25–49 pts
- **High:** 50–79 pts
- **Very High:** 80–145 pts
- Maximum possible score: **145 points**
- Scoring model is adapted from ADA/Finnish Risk Score for **South Asian** populations.

### 4.4 BMI Calculator Cutoffs
- **South Asian Cutoffs:** <18.5 (Underweight), 18.5–22.9 (Normal), 23–24.9 (At Risk), 25–29.9 (Overweight), ≥30 (Obese)
- **WHO Cutoffs:** <18.5 (Underweight), 18.5–24.9 (Normal), 25–29.9 (Overweight), ≥30 (Obesity)
- Both standards are displayed side by side.

### 4.5 File Upload Constraints
- **Max file size:** 2MB hard cap (enforced by Multer middleware)
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp` only
- Images are uploaded to Cloudinary with auto quality and WebP conversion.

### 4.6 Slug Generation
- Blog slugs are auto-generated from the title using the `slugify` npm package.
- **Bengali/Unicode titles** that produce empty slugs after transliteration get a timestamp-based fallback (e.g., `post-1722345678901`).
- Duplicate slugs are resolved by appending `-1`, `-2`, `-3`, etc.
- Slugs are enforced unique via a MongoDB `{ slug: 1 }` unique index.

### 4.7 Cloudinary Asset Cleanup
- Updating or deleting a blog post's featured image triggers **async Cloudinary cleanup** (`cloudinary.uploader.destroy(public_id)`).
- If Cloudinary cleanup fails, the error is **logged but NOT thrown** — the main database operation must not be rolled back (best-effort cleanup).
- MongoDB Atlas M0 does **not support multi-document ACID transactions**, so all complex operations rely on application-level try-catch.

### 4.8 Content Pagination
- Both blog feed and video gallery use a **"Load More" button** pattern — not infinite scroll, not numbered pages.

### 4.9 Appointment Booking
- Appointment requests are handled via a **WhatsApp `wa.me` link** with a prefilled message. No custom forms, no slot management, no payment integration.
- The WhatsApp phone number and message template are configured via **environment variables** (`WHATSAPP_PHONE`, `WHATSAPP_MESSAGE`), not hardcoded.

### 4.10 Blog Route Ordering (Critical)
- The `/api/blogs/slugs` route **MUST be defined before** `/api/blogs/:slug` in the Express router, otherwise Express will match `"slugs"` as a dynamic `:slug` parameter.

---

## 5. Code Style & Conventions

### Naming
- **JavaScript variables & functions:** `camelCase` (e.g., `findPublishedBlogs`, `generateUniqueSlug`)
- **File names:** `kebab-case` (e.g., `auth.controller.js`, `blog.repository.js`, `rateLimit.middleware.js`)
- **Mongoose models:** `PascalCase` (e.g., `Admin.js`, `Blog.js`, `Video.js`)
- **Environment variables:** `SCREAMING_SNAKE_CASE` (e.g., `MONGODB_URI`, `JWT_SECRET`)

### API Response Format
All API responses follow a **strict JSON schema**:

**Success:**
```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Short Error Type",
  "message": "Human-readable message for frontend toast.",
  "stack": "..." // Only in NODE_ENV === 'development'
}
```

### Folder Structure Reference

```text
rawnaf-care/
├── frontend/                     # Next.js App Router Frontend
│   ├── public/                   # Static images, favicon, robots.txt
│   ├── src/
│   │   ├── app/                  # Pages & Layouts
│   │   │   ├── (public)/         # Public layout routes
│   │   │   ├── admin/            # Protected Admin Dashboard routes
│   │   │   └── api/              # Optional Next.js proxy routes
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI primitives
│   │   │   ├── blog/             # Blog Cards, Detail View
│   │   │   ├── calculators/      # BMI, Fertile Window, Diabetes, Child Growth
│   │   │   └── admin/            # Post Editor, Video Form, Confirmation Modals
│   │   ├── lib/                  # Calculator logic, GA4 helpers, slug utilities
│   │   │   └── data/             # who-percentiles.json (Static WHO dataset)
│   │   └── hooks/                # Custom React hooks (useAuth, usePagination)
│   ├── package.json
│   └── next.config.js
│
└── backend/                      # Express.js REST API Backend
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
    ├── .env
    └── package.json
```

### Key Libraries & Their Roles
| Package | Purpose |
| :--- | :--- |
| `express` | HTTP server framework |
| `mongoose` | MongoDB ORM with schema validation |
| `bcryptjs` | Password hashing (12 salt rounds for seed script) |
| `jsonwebtoken` | JWT signing and verification |
| `cookie-parser` | Parse cookies from incoming requests |
| `cors` | Cross-origin resource sharing (restricted to frontend domain) |
| `helmet` | Security headers |
| `multer` | Multipart file upload handling (memory storage) |
| `cloudinary` | Image upload, optimization, and deletion |
| `express-rate-limit` | Brute-force protection on login (5 attempts / 15 min) |
| `slugify` | Title-to-slug conversion |
| `winston` | Structured logging (info/warn/error levels) |
| `dotenv` | Environment variable loading |
| `nodemon` | Development auto-restart (dev dependency) |

---

## 6. What NOT to Do — Out of Scope (MVP)

> **These features are explicitly excluded from this MVP.** Do NOT build, scaffold, or add database schemas for any of these, even if they seem like natural extensions.

| ❌ Excluded Feature | Why |
| :--- | :--- |
| Smart Diet Planner | Future phase |
| E-book Store | Future phase |
| Rawnaf Mart (E-commerce) | Future phase |
| Full appointment booking system (form, slot management, payment) | Future phase — MVP uses WhatsApp only |
| Pregnancy Tracker | Future phase |
| Growth history tracking (graphs, stored data) | Future phase — MVP calculates instantly with no persistence |
| General user accounts (signup, login, profiles) | Future phase — MVP is 100% public access |
| Automated admin password reset | Manual process via seed script or MongoDB Atlas UI |
| Meta Pixel / advertising trackers | Only GA4 in MVP |
| Direct YouTube Data API integration | Thumbnails are auto-derived from video ID pattern or manually entered |
| Refresh tokens or sliding sessions | Fixed 24h JWT expiry only |
| Multi-role admin (RBAC, Super Admin vs Editor) | Single admin role is sufficient for MVP |

---

## 7. How to Use This Project's Documentation

Each file answers a specific category of questions. **Don't guess — look it up.**

| Question | Read This File |
| :--- | :--- |
| "What is this product? Who is it for?" | `idea.md` |
| "What exactly should this feature do? What are the acceptance criteria?" | `prd.md` |
| "Was this requirement validated? Are there known gaps?" | `requirement-validation.md` |
| "What's the high-level product analysis?" | `prd-analysis.md` |
| "What's the system architecture? How are layers organized?" | `architecture.md` |
| "What are the database schemas, indexes, and sample data?" | `database.md` + `database-schema.md` |
| "What does the API contract look like? Request/response formats?" | `api-spec.md` |
| "How does data flow through the system?" | `dfd.md` |
| "What are the step-by-step build prompts for the backend?" | `prompt.md` |
| "What are the critical rules and constraints I must follow?" | `agent.md` (this file) |

### Quick Reference Shortcuts
- **API error response format →** `api-spec.md` Section 6
- **Mongoose schema code (copy-paste ready) →** `database.md` Section 9
- **Aggregation pipelines →** `database.md` Section 6
- **Full folder structure →** `architecture.md` Section 5
- **Security & CORS config →** `architecture.md` Section 6
- **Route-to-controller mapping →** `architecture.md` Section 7
- **Environment variables list →** `prompt.md` Prompt 1.1
- **Cookie settings (sameSite, secure, httpOnly) →** `prompt.md` Prompt 7.1

---

## 8. Instructions for Future Agents

> **Mandatory Protocol — Follow this every time, without exception.**

1. **Read `agent.md` first** (this file). Understand the project context, constraints, and what's out of scope before writing a single line of code.

2. **Check the relevant detailed doc** before implementing anything:
   - Building an API endpoint? Read `api-spec.md` for the exact contract.
   - Writing a Mongoose model? Read `database.md` for the schema, indexes, and validation rules.
   - Implementing business logic? Read `prd.md` for the acceptance criteria and edge cases.
   - Setting up the project structure? Read `architecture.md` for the folder layout and layer responsibilities.
   - Starting backend development? Follow `prompt.md` **sequentially** — each prompt builds on the previous one.

3. **Do NOT assume.** If something is ambiguous or missing from the documentation, **ask the user before proceeding**. Do not invent requirements, add undocumented features, or "improve" the architecture without explicit approval.

4. **Do NOT build out-of-scope features.** Refer to Section 6 of this file. If a feature is listed there, it does not exist in this MVP — period.

5. **Preserve the layered architecture.** Controllers must never contain business logic. Services must never make direct Mongoose calls. Repositories must never format HTTP responses. Every layer has a single responsibility.

6. **Follow the response format.** Every API response must use `{ success, message, data }` for success and `{ success, error, message }` for errors. No exceptions.

7. **Test after building.** After completing each phase, run the corresponding verification prompts from `prompt.md` Phase 11 to confirm everything works correctly.

8. **When in doubt, re-read the docs.** The answer is almost always already documented. These files were written specifically to eliminate ambiguity.
