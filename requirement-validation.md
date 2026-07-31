# Requirement Validation & Gap Audit Report - Rawnaf Care

This document provides a comprehensive audit of `prd.md` across 8 key validation categories. It highlights what is currently covered and flags missing requirements, ambiguities, and edge cases to review before proceeding to technical implementation.

---

## 1. Missing Flow
### Currently Covered in PRD:
- General User: Reading a blog post, watching a video, using a health tool, requesting an appointment via WhatsApp.
- Admin: Basic content creation & publishing flow (Login -> Dashboard -> Add Post/Video -> Publish).

### Missing / Ambiguous Flows:
- **Admin Content Editing Flow:** Step-by-step interaction for locating an existing post/video, loading existing data into the form, making changes, and updating.
- **Admin Content Deletion Flow:** Confirmation modal flow to prevent accidental deletion of blog posts or videos.
- **Publish / Unpublish Toggle Flow:** Clear user flow for switching a post or video between "Draft/Unpublished" and "Published" status without deleting it.
- **Featured Image Upload & Replacement Flow:** Step-by-step flow for uploading a new image versus replacing an existing featured image.
- **"Load More" Pagination Flow:** Step-by-step flow showing how clicking "Load More" appends items dynamically without resetting scroll position or reloading the page.

---

## 2. Edge Cases
### Currently Covered in PRD:
- Admin session expiration.
- Long article titles in card view (truncation).
- Broken or private YouTube video links.
- Extreme calculator input values (e.g., 500kg weight).
- WhatsApp app not installed on user device.

### Missing / Ambiguous Edge Cases:
- **Duplicate Blog Slugs:** If two blog posts have identical or similar titles, how is slug collision handled (e.g., auto-appending `-1`, `-2`)?
- **Special & Unicode Characters in Titles:** Handling Bengali script or special characters (`?`, `/`, `#`, `%`) in titles when generating clean, readable URL slugs.
- **Invalid YouTube URL Format:** Handling cases where the admin enters a non-YouTube URL, a shortened link with extra parameters, or an invalid video ID.
- **Concurrent Admin Sessions:** If the admin opens the dashboard in two tabs and edits the same post concurrently.
- **Javascript Errors During Calculation:** Handling client-side computational exceptions gracefully without freezing the browser UI.

---

## 3. Error Handling
### Currently Covered in PRD:
- Invalid admin credentials error message on login.
- Calculator input validation error messages.
- Empty state message for blog post list ("No articles available yet").

### Missing / Ambiguous Error Handling:
- **Backend API Down / DB Unreachable:** No defined UX for when public API calls (`GET /api/blogs`) fail due to server error or network outage (e.g., fallback banner, friendly error message, retry button).
- **API Request Timeouts:** No explicit behavior defined when an API call times out.
- **Failed Image Upload:** No defined feedback when a featured image fails to upload due to network disruption or cloud storage failure.

---

## 4. Security
### Currently Covered in PRD:
- Brute-force protection on the admin login route.
- Input form XSS sanitization across all forms.
- JWT-based authentication for admin endpoints.

### Missing / Ambiguous Security Requirements:
- **Rate Limiting on Public Endpoints:** No rate limiting requirement defined for public routes (`GET /api/blogs`, `GET /api/videos`) to prevent scraping or DDOS attacks.
- **File Upload Security:** Missing explicit constraints for featured image uploads (e.g., max file size limit of 2MB, allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, and blocking SVG script execution).
- **CORS Policy:** Not explicitly documented (should restrict API access to the approved frontend domain in production).
- **Admin Session Expiry & Token Storage:** Clear specification of token storage location (e.g., HttpOnly cookie) to protect against XSS token theft.

---

## 5. Validation Rules
### Currently Covered in PRD:
- Non-empty username and password for admin login.
- Positive numbers for BMI height/weight.
- Valid LMP date (not in future) and cycle length (20-45 days) for Fertile Window.
- Mandatory answers for all Diabetes Risk questions.
- Pediatric range validation for Child Growth metrics (age 0-12 yrs, weight, height, head circumference for 0-2 yrs).

### Missing / Ambiguous Validation Rules:
- **Blog Post Input Limits:** Maximum character limits for Blog Title (e.g., 150 chars), Short Excerpt (e.g., 300 chars), and Meta Title/Description overrides are undefined.
- **Rich Text Content Size:** Maximum allowed payload size for the blog body (e.g., max 5MB) is undefined.
- **YouTube URL Regex Validation:** Exact regex validation pattern for accepting valid YouTube URLs (e.g., `youtube.com/watch?v=...` or `youtu.be/...`).

---

## 6. Permissions & Access Control
### Currently Covered in PRD:
- Clear separation: General users have 100% public access with no login requirements; Admin routes require authentication.

### Findings & Confirmations:
- **Single-Role Sufficiency:** Single Admin role is **100% sufficient for the MVP**. Role-based access control (RBAC like Super Admin vs Editor) is unnecessary overhead for this stage.
- **Unauthenticated Direct API Protection:** *Confirmation Needed in PRD:* All write/delete API endpoints (`POST`, `PUT`, `DELETE`) must be strictly protected by JWT middleware so that unauthenticated users attempting to access admin API routes directly receive a `401 Unauthorized` response.

---

## 7. Notification & Feedback
### Currently Covered in PRD:
- None explicitly defined for system UI notifications.

### Missing / Ambiguous Notifications:
- **Admin Action Success Feedback:** UI toast/alert notifications confirming successful actions (e.g., "Post published successfully", "Video deleted").
- **Admin Action Failure Alerts:** UI toast/alert notifications when an operation fails (e.g., "Failed to save blog post, please try again").
- **Form Error Summary:** Clear visual indicators on specific form fields when validation fails.

---

## 8. Exception & Unhappy Path Handling
### Currently Covered in PRD:
- Extreme calculator input values display generic warnings.
- Device fallback for WhatsApp link when app is not installed.

### Missing / Ambiguous Exceptions:
- **Corrupted / Invalid File Uploads:** Handling non-image files disguised as images or corrupted file payloads.
- **Network Interruption During Admin Actions:** Behavior when internet connection drops while admin is saving a draft or uploading an image.
- **Special Character Slug Collision:** Graceful handling when generating URLs for titles containing non-ASCII / Bengali characters.
