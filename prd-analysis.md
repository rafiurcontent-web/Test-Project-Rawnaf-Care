# PRD Analysis Report - Rawnaf Care

## 1. Overview & Product Goals
**Rawnaf Care** is positioned as a frictionless, specialized health information platform targeting the Bangladeshi demographic. 
- **Core Value Proposition:** Combining trusted medical expertise (Dr. Nafia Islam) with instant, localized health calculators.
- **Business Goal:** Maximize reach, establish authority, and drive patient acquisition via WhatsApp appointment booking.
- **Frictionless Strategy:** By removing user authentication (no signup/login walls), the platform optimizes for maximum engagement and lowest barrier to entry.

## 2. User Types
1. **General Visitors:**
   - *Demographics:* Expecting mothers, parents of young children, general health-conscious individuals.
   - *Needs:* Trustworthy articles, video advice, and easy-to-use health tools with localized standards (e.g., South Asian BMI cutoffs).
2. **Administrator (Dr. Nafia / Team):**
   - *Needs:* A secure, simple, and autonomous dashboard to manage blog posts and YouTube video links without developer assistance.

## 3. Functional Requirements Summary
- **Admin System:** JWT-based secure login, CMS dashboard for Blogs (CRUD, rich text, featured image) and Videos (CRUD). Password resets handled manually via DB.
- **Content Delivery:** Publicly accessible blog feed, detailed article view, and modal-based YouTube video gallery.
- **Health Calculators:** Four distinct stateless tools (BMI, Fertile Window, Diabetes Risk, Child Growth). Calculations run instantly on the client side without backend data persistence.
- **Appointment Booking:** Client-side WhatsApp redirection (`wa.me`) with prefilled messaging for manual appointment scheduling.

## 4. Non-Functional Requirements Summary
- **Performance:** Sub-2 second load times for core pages.
- **Security:** Brute-force protection for admin login, XSS sanitization for all input fields.
- **Accessibility & UX:** Mobile-responsive design, clear labeling, WCAG contrast compliance.
- **SEO:** Slugs, XML sitemap, robots.txt, Canonical URLs, and Open Graph metadata implementation for blog posts.
- **Data Privacy:** Explicit policy stating no health or personal data is collected or persisted.

## 5. Resolved Requirements & Clarifications

All previously identified functional gaps have been reviewed and resolved:

- **A. Analytics & Tracking:** Google Analytics (GA4) will be integrated to track page views and calculator usage events ("Calculate" button clicks). Meta Pixel is explicitly out of scope.
- **B. Content Pagination:** Both Blog feed and Video gallery will use a "Load More" button pagination pattern to preserve sub-2s load performance.
- **C. YouTube Metadata:** Admin will manually enter the video title and thumbnail URL (or thumbnail auto-derived from standard YouTube ID URL pattern). No YouTube API integration in MVP.
- **D. SEO Input Fields:** Meta Title and Meta Description will auto-generate from Title and Excerpt by default, with optional override input fields in the Admin dashboard.
