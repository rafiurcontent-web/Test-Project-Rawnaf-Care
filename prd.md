# Product Requirements Document (PRD) - Rawnaf Care

## 1. Project Overview
**Rawnaf Care** is a health-focused web platform centered around the medical expertise of Dr. Nafia Islam. In Bangladesh, expecting parents and health-conscious individuals often struggle to find reliable, localized health information backed by a recognizable medical professional. Rawnaf Care solves this by consolidating expert blog content, video advice, and interactive health calculators into a single, easy-to-use platform. 

A key principle of this MVP is to maximize reach and minimize friction: the platform is completely free and accessible without any user signup or login requirements.

## 2. Target Users & Their Needs
- **Expecting Mothers and New Parents:** Need reliable advice on pregnancy and newborn care without navigating through complex medical jargon or untrusted sources.
- **Parents Concerned About Child Health:** Need quick, science-based tools (like growth trackers) and expert guidance on child development.
- **General Health-Conscious Individuals:** Need easy access to localized health tools (e.g., Diabetes Risk Calculator with South Asian cutoffs) and trustworthy health articles.

## 3. Core Features (MVP)

### 3.1. Admin System
**Overview:** Secure portal for the administrator to manage content.

### Functional Requirements
- Admin can create a new blog post.
- Admin can edit an existing blog post (selecting from list pre-fills form with existing data to edit and update).
- Admin can delete a blog post (triggers a "Are you sure?" confirmation modal before permanent deletion).
- Admin can toggle publish and unpublish status for blog posts via a dedicated toggle switch without deleting the item.
- Admin can upload or change a featured image.
- **Cloudinary Asset Cleanup:** Updating or deleting a post's featured image automatically triggers backend deletion of the old image asset from Cloudinary using its `public_id` to prevent storage accumulation.
- Admin can enter a blog title.
- Admin can write and edit rich text content.
- Admin can optionally add a short excerpt.
- Admin can optionally enter custom SEO Meta Title and Meta Description (by default auto-generated from Title and Excerpt).
- Admin can save and update changes.
- **Initial Admin Bootstrapping:** Initial admin account created via a backend seed script (`npm run seed:admin`) or environment variable bootstrap on deployment.
- **Configurable Appointment Contact:** WhatsApp phone number and prefilled message template configured via environment variables to prevent hardcoded clinic contact details.
- Display success and failure toast notifications for all admin actions (e.g., "Post published successfully", "Failed to save, please try again").

**For video management:**
- Admin can add a YouTube video URL, with manual entry of video title and thumbnail URL (or auto-derived standard YouTube thumbnail pattern using the Video ID).
- Admin can edit video information (pre-fills existing data and updates upon saving).
- Admin can delete a video (triggers a "Are you sure?" confirmation modal before deletion).
- Admin can toggle publish and unpublish status for videos via a toggle switch.
- Display success and failure toast notifications for all video admin actions.

**User Stories:**
- As an admin, I want to log in securely so that I can access the content management dashboard.
- As an admin, I want to create, edit, delete, and publish blog posts so that users have access to updated health articles.
- As an admin, I want to manage YouTube video links so that users can watch the latest health advice.

**Acceptance Criteria:**
- *Given* I am an admin on the login page, *when* I enter valid credentials, *then* I should be redirected to the dashboard.
- *Given* I am an admin, *when* I create a new blog post and click "Publish", *then* the post should immediately appear on the public frontend.

**Validation Requirements:**
- Username and password fields cannot be empty.
- Invalid credentials must display a clear error message (e.g., "Invalid username or password").

**Edge Cases:**
- Session expiration: Admin session relies on a fixed-expiry JWT (e.g., 24 hours). The frontend will prompt re-login when the token expires (no sliding session or refresh tokens for MVP).

### 3.2. Blog Section
**Overview:** Publicly accessible area for reading health articles.

**Functional Requirements:**
- Display a list of published articles using a "Load More" button pagination pattern to maintain fast page load performance.
- **Search Capability:** Public search bar allowing users to filter articles by title and excerpt keywords.
- **Input Character Limits:** Blog Title max 150 characters, Excerpt max 300 characters, Meta Title/Description override max 160 characters.
- **Slug Generation:** Auto-generated from title. Bengali/Unicode titles must generate clean ASCII slugs (transliteration or ID-based fallback). Duplicate slugs automatically get appended with `-1`, `-2`, etc.

**User Stories:**
- As a general user, I want to browse a list of health articles so that I can find topics of interest.
- As a general user, I want to read the full text of an article so that I can learn about a specific health topic.

**Acceptance Criteria:**
- *Given* I am an unregistered visitor on the Blog page, *when* I scroll, *then* I should see a list of published articles without being prompted to log in.
- *Given* I am viewing the article feed, *when* I click on an article card, *then* I should be taken to the full article detail page.

**Validation Requirements:**
- Empty state: If no articles are published, display a friendly "No articles available yet" message.

**Edge Cases:**
- Handling of very long article titles on the card view (ensure truncation or text wrapping).

### 3.3. Health Advice Video
**Overview:** Curated gallery of YouTube videos.

**Functional Requirements:**
- Display video gallery items using a "Load More" button pagination pattern to prevent performance degradation.
- **YouTube URL Validation:** Accept standard formats (`youtube.com/watch?v=`, `youtu.be/`) via regex; reject and show a clear error message for invalid URLs.

**User Stories:**
- As a general user, I want to browse available health advice videos so that I can visually learn about health topics.
- As a general user, I want to play videos within a popup modal so that I am not redirected away from the platform.

**Acceptance Criteria:**
- *Given* I am on the Videos page, *when* I click a video thumbnail, *then* a modal popup opens and the YouTube video begins playing.
- *Given* the video modal is open, *when* I click 'Close' or click outside the modal, *then* the video stops and the modal closes.

**Edge Cases:**
- Broken or private YouTube links: Player should gracefully show the standard YouTube unavailable state without breaking the site layout.

### 3.4. Health Tools (Interactive Calculators)
*Note: All tools are calculate-only. No data is persisted in a database, and there is no user history.*
- **Unit Conversion & Input Toggles:** All calculators must support unit toggles (e.g., Height in Feet/Inches or Cm, Weight in Kg or Lbs) to accommodate user preferences, converting inputs to metric internally before executing calculation formulas.

#### 3.4.1. BMI Calculator
**User Story:** As a user, I want to calculate my BMI so that I can understand my health risk based on South Asian standards.
**Acceptance Criteria:**
- *Given* I have entered valid height and weight, *when* I click "Calculate", *then* I see my BMI score and risk category immediately.
- **South Asian Cutoffs:** <18.5 (Underweight), 18.5–22.9 (Normal), 23–24.9 (At risk), 25–29.9 (Overweight), ≥30 (Obese).
- **WHO Cutoffs:** <18.5 (Underweight), 18.5–24.9 (Normal), 25–29.9 (Overweight), ≥30 (Obesity). Both standards are shown alongside.
**Validation Requirements:** Height and weight must be positive numbers.
**Edge Cases:** Extreme values (e.g., weight 500kg) should still calculate but display a generic warning if out of logical bounds.

#### 3.4.2. Fertile Window Calculator
**User Story:** As a user, I want to calculate my fertile window based on my last menstrual period so that I can plan accordingly.
**Acceptance Criteria:**
- *Given* I input my LMP and cycle length, *when* I click "Calculate", *then* I see the estimated ovulation date and fertile days.
- *Given* the results are displayed, *then* there must be an explicit disclaimer stating that Safe Days / low-fertility estimates are not a guaranteed contraception method.
- *Given* the user's cycle is irregular, *then* results should be prominently labeled as "Estimated".
**Validation Requirements:** LMP date cannot be in the future. Cycle length must be within a realistic range (e.g., 20-45 days).

#### 3.4.3. Diabetes Risk Calculator
**User Story:** As a user, I want to check my diabetes risk so that I can take preventive health measures.
**Acceptance Criteria:**
- *Given* I complete the risk questionnaire, *when* I submit the form, *then* I receive a risk assessment score (max 145) based on South Asian cutoffs.
- **Scoring Model Parameters (Based on ADA/Finnish Risk Score adapted for South Asians):** Age (e.g., <40: 0, 40-49: 1, 50-59: 2, >60: 3 pts), gender, BMI (risk starts at 23, >25 adds more points), waist circumference (IDF South Asian cutoff: male ≥90cm, female ≥80cm), physical activity level, family history of diabetes, high blood pressure/medication, and prior high blood sugar reading.
- **Risk Categories:** Low (0–24 pts), Moderate (25–49 pts), High (50–79 pts), Very High (80–145 pts).
- *Given* specific combined risk factors (e.g., BMI + waist + family history), *then* the system applies specific point-based escalation to reach the final risk category score (max 145).
**Validation Requirements:** All required questions must be answered before calculation is permitted.

#### 3.4.4. Child Growth Tracker
**User Story:** As a parent, I want to check my child's growth percentiles so that I know if their development is on track.
**Acceptance Criteria:**
- *Given* I enter my child's age (newborn to 12 years), weight, height, and head circumference (if 0-2 years), *when* I click "Calculate", *then* I see the growth percentile based on standard WHO charts.
- *Given* the child's age, *then* the tool correctly applies either the WHO 0–5 years or 5–19 years reference dataset (stored statically as JSON in the frontend, e.g., `lib/data/who-percentiles.json`). Calculations will use the LMS method for standard Z-scores and percentiles.
- **Metrics Tracked:** Weight-for-age, Height-for-age, BMI-for-age (for older children), and Head Circumference-for-age (0–2 years only).
**Validation Requirements:** Age, weight, height, and head circumference must be positive numbers within valid pediatric ranges.

### 3.5. About/Credentials & Appointment Booking
**Overview:** Informational page about Dr. Nafia Islam with a manual booking call-to-action.

**User Stories:**
- As a user, I want to view Dr. Nafia's credentials so that I can trust the medical advice provided.
- As a user, I want to easily request an appointment via WhatsApp so that I can consult directly with the doctor.

**Acceptance Criteria:**
- *Given* I am on the About page, *when* I read the profile, *then* I should see the doctor's qualifications and professional background.
- *Given* I want to book an appointment, *when* I click "Contact via WhatsApp", *then* my WhatsApp application opens with a prefilled message addressed to the clinic.

**Edge Cases:**
- User does not have WhatsApp installed: The device will gracefully fallback to prompting app installation or opening WhatsApp Web in the browser.

### 3.6. Analytics & Tracking
**Overview:** Integration to measure user engagement and platform usage without collecting personally identifiable health data.

**Functional Requirements:**
- Integrate Google Analytics (GA4) for tracking page views and user navigation across the platform.
- Track event triggers for calculator interactions (e.g., "Calculate" button clicks for BMI, Fertile Window, Diabetes Risk, and Child Growth Tracker).
- Exclude Meta Pixel and third-party advertising pixels from the MVP.

## 4. User Flows

### 4.1. Reading a Blog Post (General User)
1. User lands on the platform and navigates to the "Blog" section.
2. User scrolls through the list of published articles.
3. User clicks on an article card.
4. User reads the full article content. 
*(No signup or login prompts appear at any point.)*

### 4.2. Watching a Video (General User)
1. User navigates to the "Videos" section.
2. User clicks on a video thumbnail.
3. A modal popup appears, embedding the YouTube player.
4. User watches the video and clicks 'Close' (or outside the modal) to return to the video list.
*(No signup or login prompts appear at any point.)*

### 4.3. Using a Health Tool (General User)
1. User navigates to the "Health Tools" section and selects a tool (e.g., BMI Calculator).
2. User enters required metrics in the provided input fields.
3. User clicks "Calculate".
4. The system instantly displays the result and corresponding health category.
5. User leaves the page or resets the form. The data is cleared and not saved anywhere.

### 4.4. Requesting an Appointment (General User)
1. User navigates to the "About/Appointments" section.
2. User clicks the "Contact via WhatsApp" button on the appointment callout card.
3. The user's device opens WhatsApp (web or app) with a prefilled message.
4. User sends the message. The rest of the booking process happens manually via chat.

### 4.5. Managing Content (Admin)
1. Admin navigates to the secure `/admin` login route.
2. Admin enters their username and password.
3. Admin accesses the dashboard and chooses to "Add New Blog Post" or "Add Video".
4. Admin provides the required content/link and clicks "Publish".
5. The new content is instantly visible on the public frontend.

## 5. Out of Scope (Future Phases)
The following features are explicitly excluded from this MVP phase to ensure a rapid and focused launch:
- Smart Diet Planner
- E-book Store
- Rawnaf Mart (E-commerce capabilities)
- Full appointment booking system (No custom form, no slot management, no payment gateway integration)
- Pregnancy Tracker
- Growth history tracking (No graphs or historical data tracking for children)
- General user accounts (No signup, login, or profile management for general visitors)
- Automated Admin Password Reset (Password resets will be handled manually by the developer by re-running the secure admin seed script `npm run seed:admin` with a new password environment variable, or via direct MongoDB Atlas UI modification)
- Meta Pixel and advertising tracking tools
- Direct YouTube Data API integration (Thumbnails auto-derived or manually input)

## 6. Assumptions & Open Questions
- *All initial assumptions and open questions regarding MVP calculators and admin access have been confirmed and resolved.*

## Tech Stack
- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Node.js (Express.js)
- **Database:** MongoDB Atlas
- **Architecture Pattern:** Layered Monolith (to be detailed further in architecture.md)

## 7. Non-Functional Requirements
- **Performance:** Core pages (especially the blog feed and health tools) must load in under 2 seconds on standard 3G/4G mobile connections.
- **Security:** 
  - The admin route must be protected against brute force attacks (e.g., using `express-rate-limit` middleware, blocking IP after 5 failed attempts for 15 minutes). All input forms in health tools must be sanitized to prevent XSS attacks.
  - **File Upload Constraints:** Featured images restricted to max 2MB file size and allowed MIME types `image/jpeg`, `image/png`, `image/webp` only.
  - **CORS Policy:** API restricted to approved frontend domain in production.
  - **Token Security:** JWT tokens stored in HttpOnly cookies to prevent XSS token theft.
  - **Route Protection:** All admin write/delete API routes (`POST`, `PUT`, `DELETE`) must return `401 Unauthorized` for unauthenticated requests.
- **Scalability:** The application must gracefully handle traffic spikes without crashing. Since it's read-heavy (blog/videos), database operations should be optimized.
- **Caching:** Next.js ISR (Incremental Static Regeneration) should be used for blog and video feeds to minimize database queries and improve load times.
- **Logging:** Implement structured logging (e.g., using Winston or Pino) for backend API routes. Important events (like failed admin logins, DB connection issues) should be logged at `error` or `warn` level.
- **Error Handling:** 
  - Display a generic user-friendly error message when public API calls fail (e.g., "Something went wrong, please try again later") without complex retry logic.
  - Display a simple error message on failed image upload without auto-retry.
  - If Cloudinary image cleanup (`destroy`) fails during post update/deletion, gracefully log the error without breaking the main post deletion flow (best-effort cleanup).
- **Accessibility:** Ensure high color contrast for text and clear, descriptive labels on all calculator inputs for screen reader support (WCAG basics).
- **Mobile Responsiveness:** The entire application (particularly the health tools and video modals) must be fully usable, responsive, and visually appealing on all mobile device sizes.
- **Browser Compatibility:** Support the latest stable versions of Chrome, Safari, Firefox, and Edge.
- **SEO:** Blog posts must support basic SEO metadata (Title, Meta Description, Open Graph tags) to enable organic search discovery.
  - SEO-friendly URLs (slugs) for blog posts.
  - Automatic XML sitemap generation.
  - robots.txt support.
  - Canonical URL support for blog pages.
  - Open Graph metadata for social media sharing.
- **Privacy:** Since no user data is persisted, state clearly in a minimal privacy notice that the health tools do not collect or store personal health information.

## 8. Success Criteria
The MVP will be considered successful when:
1. **Seamless Public Access:** A visitor can successfully browse the blog feed, read articles, and watch videos in the modal without encountering any login barriers or access errors.
2. **Functional Tools:** A visitor can use all four health calculators to get instant, accurate results without application crashes.
3. **Data Privacy (by design):** The system successfully operates without persisting any general user data or health metrics to the backend.
4. **Admin Autonomy:** The admin can successfully log in, create, edit, and publish blog and video content independently through the dashboard.

## Glossary
- **MVP:** Minimum Viable Product, the most basic version of a product that can be released to users.
- **BMI:** Body Mass Index, a measure of body fat based on height and weight.
- **LMP:** Last Menstrual Period, used to calculate fertile windows and pregnancy due dates.
- **WHO:** World Health Organization, the UN agency responsible for international public health.
- **South Asian BMI:** Modified BMI cutoffs that identify health risks at lower values for South Asian populations.
- **XSS:** Cross-Site Scripting, a security vulnerability where attackers inject malicious scripts into web pages.
- **SEO:** Search Engine Optimization, the practice of improving a website's visibility in search engine results.
- **Open Graph:** A protocol that allows web pages to become rich objects in a social graph, commonly used for sharing links on social media.
