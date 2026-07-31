# Database Schema Specifications

## 2. Schema Specifications

### 2.1 `Admin` Collection Schema
- **Purpose:** Stores admin authentication credentials.
- **Fields:**
  - `_id`: `ObjectId` — Auto-generated primary key.
  - `username`: `String` — Required, unique, trimmed, min 3 chars, max 50 chars.
  - `password`: `String` — Required, bcrypt hashed password string.
  - `createdAt`: `Date` — Timestamp of creation (Auto).
  - `updatedAt`: `Date` — Timestamp of last update (Auto).

### 2.2 `Blog` Collection Schema
- **Purpose:** Stores blog post articles, ASCII slugs, status, and Cloudinary image details.
- **Fields:**
  - `_id`: `ObjectId` — Auto-generated primary key.
  - `title`: `String` — Required, trimmed, max 150 characters.
  - `slug`: `String` — Required, unique, lowercase, ASCII-transliterated slug for SEO URLs.
  - `content`: `String` — Required, rich text HTML/Markdown content.
  - `excerpt`: `String` — Optional, trimmed, max 300 characters.
  - `featuredImage`: `Object` — Optional nested object:
    - `url`: `String` — Cloudinary secure URL (`https://res.cloudinary.com/...`).
    - `public_id`: `String` — Cloudinary asset identifier (used for cloud cleanup upon update/delete).
  - `isPublished`: `Boolean` — Default `false`. Controls visibility on public feed.
  - `metaTitle`: `String` — Optional, max 160 characters (SEO override).
  - `metaDescription`: `String` — Optional, max 160 characters (SEO override).
  - `createdBy`: `ObjectId` — Ref to `Admin` model (Optional).
  - `createdAt`: `Date` — Auto timestamp.
  - `updatedAt`: `Date` — Auto timestamp.

### 2.3 `Video` Collection Schema
- **Purpose:** Stores video advice metadata and YouTube embeds.
- **Fields:**
  - `_id`: `ObjectId` — Auto-generated primary key.
  - `title`: `String` — Required, trimmed, max 150 characters.
  - `youtubeUrl`: `String` — Required, validated YouTube URL regex.
  - `videoId`: `String` — Required, unique, extracted 11-character YouTube Video ID.
  - `thumbnailUrl`: `String` — Required, auto-derived thumbnail (`https://img.youtube.com/vi/<videoId>/hqdefault.jpg`).
  - `isPublished`: `Boolean` — Default `false`. Controls visibility on public video gallery.
  - `createdBy`: `ObjectId` — Ref to `Admin` model (Optional).
  - `createdAt`: `Date` — Auto timestamp.
  - `updatedAt`: `Date` — Auto timestamp.
