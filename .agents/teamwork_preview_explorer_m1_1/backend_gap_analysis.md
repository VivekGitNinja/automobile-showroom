# Backend API, Data & Sync Gap Analysis

**Project**: Luxury Automobile Showroom Website  
**Audit Target**: `/Users/vivek/Luxery /ESAD_Document/project/api`  
**Specification Reference**: Enterprise Software Architecture Document (ESAD) Items 1–9  
**Agent**: Explorer Subagent (Milestone 1)  
**Date**: 2026-07-29  

---

## 1. Executive Summary & Audit Overview

A comprehensive read-only investigation of the Node.js/Express/Prisma/PostgreSQL backend located in `/Users/vivek/Luxery /ESAD_Document/project/api` was conducted against the Enterprise Software Architecture Document (ESAD) requirements (Items 1 through 9). 

The backend has established core foundation modules:
- Express application setup with Helmet, CORS, Morgan, Compression, and Sentry error handling.
- PostgreSQL database schema using Prisma ORM with 13 data models.
- JWT-based authentication and role-based access control (RBAC) middleware.
- Redis-backed rate limiting using `rate-limit-redis`.
- Asynchronous notification queueing via BullMQ and Redis.
- Cloud media storage (S3/Cloudflare R2) with Sharp image processing and local disk fallback.
- Basic Google Sheets sync service and cron scheduler.

However, the audit revealed **critical architectural, functional, and schema gaps** that prevent full ESAD compliance:
1. **Google Sheets Sync Quarantine Engine Missing**: Failed or malformed sync rows are logged and dropped rather than routed to an isolated Quarantine table for admin review and resolution (Violates ESAD Item 4).
2. **FAQ Chatbot Query Endpoint Missing**: The chatbot router is mounted at `/api/v1/chatbot`, but `faq.routes.ts` lacks any `/query` search or rule-based matching logic (Violates ESAD Item 6).
3. **Incomplete JWT Lifecycle**: `POST /api/v1/auth/login` yields a refresh token, but no `POST /api/v1/auth/refresh` or `POST /api/v1/auth/logout` endpoints exist to manage token rotation or revocation.
4. **Environment Variable Configuration Mismatches**: Severe discrepancy between environment keys in `config/env.ts` (`GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`) and `services/googleSheets.service.ts` (`GOOGLE_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`), rendering the sync service unconfigured out-of-the-box.
5. **Incomplete CMS & Lead Admin Endpoints**: Lack of CRUD management endpoints for Journals, Vehicle Hotspots, Vehicle Spec Configs, and Sell-Car Submissions.
6. **Code Structure Deficiencies**: Empty directories (`controllers/`, `repositories/`, `validators/`, `workers/`) with route handlers mixing HTTP routing, Zod parsing, and direct Prisma queries.

---

## 2. Comprehensive Database Schema Gap Analysis (`schema.prisma`)

The Prisma schema defines 13 models (`User`, `Brand`, `Vehicle`, `VehicleImage`, `VehicleHotspot`, `VehicleSpecConfig`, `Lead`, `SellCarSubmission`, `FaqCategory`, `Faq`, `SyncLog`, `AuditLog`, `Journal`).

### Identified Schema Deficiencies

| Feature Domain | Existing Model / Field | Missing Schema Element | Impact / ESAD Violation |
|---|---|---|---|
| **Inventory Sync Quarantine** | `SyncLog` (stores `errorsJson` text array) | `QuarantineRecord` / `SyncQuarantine` table | Cannot store malformed sheet rows for admin inspection, manual editing, or re-syncing (ESAD Item 4). |
| **Authentication & Sessions** | `User.lastLogin` | `RefreshToken` or `UserSession` table | No token revocation, session tracking, or secure refresh token rotation mechanism. |
| **CMS Journal System** | `Journal` (`id`, `title`, `category`, `snippet`, `content`, `imageUrl`, `readTime`, `publishedAt`) | `slug` (unique), `status` (`draft`/`published`), `authorId`, `tags`, `createdBy`, `updatedBy` | Cannot support SEO slug-based URLs, draft/published workflows, or author attribution (ESAD Items 3 & 8). |
| **System Settings** | Environment variables (`.env`) | `SystemConfig` / `Setting` table | Cannot update sync frequency, spreadsheet ID, sales email routing, or site settings dynamically via Admin Panel. |
| **Soft Delete Coverage** | `Vehicle.deletedAt` | `deletedAt` on `Brand`, `Lead`, `SellCarSubmission`, `Faq`, `Journal` | Hard deletions purge historical data without audit compliance. |
| **Vehicle Specifications** | `Vehicle.specsJson` (unstructured JSON) | Validated spec attributes (e.g., `acceleration0100`, `topSpeed`, `horsepower`, `torque`) | Frontend comparison widget relies on unstructured JSON key matching. |

---

## 3. Google Sheets Sync Engine & Quarantine Deep-Dive (ESAD Item 4)

### Current Implementation Assessment
- **Service**: `src/services/googleSheets.service.ts`
- **Route**: `POST /api/v1/admin/sync`, `GET /api/v1/admin/sync/status`, `GET /api/v1/admin/sync/logs`
- **Scheduler**: `src/jobs/syncScheduler.ts`

### Critical Findings & Gaps

1. **Quarantine Engine Defect (High Impact)**:
   - Lines 128-141 of `googleSheets.service.ts` process raw rows from range `Inventory!A2:Z`.
   - When a row fails validation (missing `sheetRowId`, `make`, `model`, `year`, `price`, or contains `NaN` values), it simply pushes a string error to `errors[]` and executes `continue;`.
   - The malformed row is **permanently discarded** from the pipeline.
   - **ESAD Requirement**: Malformed rows must be stored in a dedicated Quarantine table with failure reasons, allowing administrators to view, edit, approve, or re-process quarantined records via the Admin CMS.

2. **Environment Variable Discrepancy (Runtime Bug)**:
   - `src/config/env.ts` defines:
     - `GOOGLE_SHEET_ID`
     - `GOOGLE_SERVICE_ACCOUNT_JSON`
   - `src/services/googleSheets.service.ts` expects:
     - `process.env.GOOGLE_SPREADSHEET_ID`
     - `process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `process.env.GOOGLE_PRIVATE_KEY`
   - `src/routes/sync.routes.ts` checks `process.env.GOOGLE_SPREADSHEET_ID`.
   - **Result**: `isConfigured()` returns `false` at runtime unless duplicate non-standard environment variables are injected.

3. **Scheduler Configuration Ignored**:
   - `config/env.ts` specifies `SYNC_CRON_SCHEDULE` (defaulting to `*/15 * * * *`).
   - `syncScheduler.ts` hardcodes `cron.schedule('0 3 * * *', ...)` (daily at 3 AM), completely ignoring the environment setting.

4. **Missing Delta/Hash Sync**:
   - Every sync execution performs a full range scan and DB upsert for all rows. There is no timestamp checking or row hashing to optimize updates.

5. **Missing Cache Revalidation Hook**:
   - Updates performed by the sync worker do not invoke Next.js revalidation (`env.REVALIDATE_URL`), causing stale static pages on the frontend.

---

## 4. Rule-Based FAQ Chatbot Endpoint Analysis (ESAD Item 6)

### Current Implementation Assessment
- **File**: `src/routes/faq.routes.ts`
- **Mount Point in `app.ts`**: `app.use('/api/v1/chatbot', faqRoutes)`

### Critical Findings & Gaps

1. **Missing Query / Match Endpoint (High Impact)**:
   - In `app.ts`, line 60 mounts `faqRoutes` under `/api/v1/chatbot`.
   - `faq.routes.ts` contains only standard CRUD routes (`GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, and category CRUD).
   - There is **no endpoint handler** for `POST /api/v1/chatbot/query` or `POST /api/v1/chatbot`.
   - Requesting `POST /api/v1/chatbot/query` results in an Express `404 Not Found`.

2. **Missing Keyword Search Algorithm**:
   - ESAD Item 6 specifies a rule-based FAQ response chatbot (operating without LLM dependencies).
   - No search service or keyword relevance scoring logic exists in the backend to match natural language user queries against `Faq.question`, `Faq.answer`, or `Faq.keywords`.

---

## 5. Lead Capture & Queue System Audit (ESAD Item 5)

### Current Implementation Assessment
- **Route**: `src/routes/lead.routes.ts`
- **Queue/Worker**: `src/config/bullmq.ts`

### Critical Findings & Gaps

1. **Lead Route Separation & Admin Management Gaps**:
   - `lead.routes.ts` exports `POST /` (general enquiry/booking/callback with 24-hr duplicate check) and `POST /sell-car` (sell-your-car form).
   - `PATCH /:id` allows updating lead status and assignee.
   - Lead listing is placed in `src/routes/admin.routes.ts` (`GET /api/v1/admin/leads`), but lacks:
     - Pagination parameters (`page`, `limit`).
     - Filtering by `leadType`, `status`, or date range.
     - Search by client name or email.
   - `SellCarSubmission` has **no GET or administrative management endpoints** anywhere in the API.

2. **Sales Team Email Notification Missing**:
   - BullMQ worker `notificationWorker` in `bullmq.ts` sends confirmation emails to the lead submitter (`to: data.email`).
   - It **does not send an alert email** to the internal showroom sales team (`SALES_EMAIL` configured in `.env`).

---

## 6. CMS & Inventory API Analysis (ESAD Items 1, 2, 3, 7)

### Current Implementation Assessment
- **Files**: `src/routes/vehicle.routes.ts`, `src/routes/journal.routes.ts`, `src/routes/media.routes.ts`

### Critical Findings & Gaps

1. **Incomplete Journal CMS Endpoints**:
   - `journal.routes.ts` contains only a single `GET /` route returning `take: 3` items.
   - Missing routes:
     - `GET /api/v1/journals/:id` (or `/:slug` for individual article view).
     - `POST /api/v1/journals` (create article).
     - `PUT /api/v1/journals/:id` (update article).
     - `DELETE /api/v1/journals/:id` (delete article).
     - `GET /api/v1/admin/journals` (admin list view with draft/published filter).

2. **Vehicle Hotspots & Spec Config Sub-Resource Management Missing**:
   - Vehicles contain nested `hotspots` and `specConfigs` in `schema.prisma`.
   - `vehicle.routes.ts` includes these relations on `GET`, but provides **no CRUD endpoints** to add, edit, or remove specific hotspots or color spec configurations for a vehicle.

3. **Weak Vehicle Creation Validation**:
   - `POST /api/v1/vehicles` uses basic inline checks (`if (!make || !model || !year)`) instead of a strict Zod validator schema.
   - Default fallback values (`mileage: '0'`, `fuelType: 'petrol'`, `exteriorColor: 'Black'`) are hardcoded when omitted.

4. **Media Upload Route Placement**:
   - `media.routes.ts` is mounted under `app.use('/api/v1/admin/media', mediaRoutes)`.
   - Inside `media.routes.ts`, handlers specify `/upload` and `/upload/batch`.
   - Effective paths: `/api/v1/admin/media/upload` and `/api/v1/admin/media/upload/batch`.
   - Storage service supports Sharp thumbnail generation and local disk fallback if S3/R2 credentials are missing.

---

## 7. Authentication, RBAC & Rate Limiting Analysis

### Current Implementation Assessment
- **Files**: `src/routes/auth.routes.ts`, `src/middleware/auth.middleware.ts`, `src/middleware/rbac.middleware.ts`, `src/middleware/rateLimit.middleware.ts`

### Critical Findings & Gaps

1. **Incomplete JWT Authentication Flow**:
   - `POST /api/v1/auth/login` generates both `accessToken` (15m expiration) and `refreshToken` (7d expiration).
   - There is **no `POST /api/v1/auth/refresh` endpoint** to exchange a refresh token for a new access token.
   - When the 15-minute access token expires, client applications are forced to prompt users for password re-entry.
   - Missing `POST /api/v1/auth/logout` and `GET /api/v1/auth/me`.

2. **RBAC Middleware Hierarchy**:
   - `rbac.middleware.ts` defines `ROLE_HIERARCHY`: `viewer` (1), `editor` (2), `admin` (3), `super_admin` (4).
   - Middleware correctly checks `userLevel < minLevel`.
   - All admin routes enforce `rbac('admin')` or `rbac('editor')`.

3. **Rate Limiting Setup**:
   - Redis store fallback configured in `rateLimit.middleware.ts`.
   - `publicLimiter` (200 req/min) mounted globally at `/api/v1`.
   - `leadLimiter` (10 req/hr) used on lead POST routes.
   - `loginLimiter` (5 req/15min) used on `/auth/login`.

---

## 8. Summary Gap Matrix

| ESAD Section | Requirement | Current Status | Gap Severity | Action Required |
|---|---|---|---|---|
| **Item 4** | Google Sheets Sync & Quarantine Engine | Sync implemented without Quarantine table or admin review queue | **CRITICAL** | Create `SyncQuarantine` Prisma model, update `googleSheets.service.ts` to log invalid rows to quarantine, add quarantine admin API endpoints (`GET /admin/sync/quarantine`, `POST /admin/sync/quarantine/:id/resolve`). |
| **Item 4** | Sync Environment & Cron Config | Key naming mismatch (`GOOGLE_SHEET_ID` vs `GOOGLE_SPREADSHEET_ID`); Cron schedule hardcoded | **HIGH** | Unify environment variable names in `env.ts` & `googleSheets.service.ts`. Wire `env.SYNC_CRON_SCHEDULE` to `syncScheduler.ts`. |
| **Item 6** | Rule-Based FAQ Chatbot API | Router mounted at `/api/v1/chatbot`, but query endpoint is missing | **CRITICAL** | Implement `POST /api/v1/chatbot/query` route and rule-based keyword matching algorithm against stored FAQs. |
| **Item 5** | Lead Capture & Queue Notifications | Lead capture works; missing internal sales alert & SellCar admin API | **HIGH** | Add sales team alert job in `bullmq.ts` (`SALES_EMAIL`), add GET/PATCH routes for `SellCarSubmission` in `admin.routes.ts`. |
| **Items 1, 2, 3, 7** | CMS & Inventory APIs | Vehicle CRUD works; Journal CRUD & Hotspot/Spec sub-resource CRUD missing | **HIGH** | Implement full Journal CRUD, add Vehicle Hotspot & Spec Config sub-resource CRUD endpoints, add `slug` and status fields to `Journal` schema. |
| **Auth & RBAC** | JWT Session & Token Management | Login returns refresh token, but refresh & logout endpoints do not exist | **HIGH** | Add `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`, and `RefreshToken` model in `schema.prisma`. |
| **Architecture** | Layered Code Architecture | Controllers/repositories directories are empty; routes contain inline queries | **MEDIUM** | Refactor inline route handlers into controller classes and repository/service classes. |

---

## 9. Next Steps for Implementation (Milestone 2 Roadmap)

1. **Schema Refactoring**:
   - Add `SyncQuarantine` model to `schema.prisma`.
   - Update `Journal` model with `slug`, `status`, `authorId`, `tags`, `createdBy`, `updatedBy`.
   - Add `RefreshToken` model for session management.
   - Run Prisma migration (`npx prisma migrate dev`).

2. **Sync Engine & Quarantine Implementation**:
   - Align env variable keys across `env.ts`, `googleSheets.service.ts`, and `sync.routes.ts`.
   - Update `googleSheets.service.ts` to insert malformed rows into `SyncQuarantine`.
   - Build admin quarantine management endpoints (`GET /api/v1/admin/sync/quarantine`, `POST /api/v1/admin/sync/quarantine/:id/resolve`, `DELETE /api/v1/admin/sync/quarantine/:id`).

3. **FAQ Chatbot Query Endpoint**:
   - Create `POST /api/v1/chatbot/query` endpoint with keyword matching algorithm.

4. **Auth & CMS Endpoint Completion**:
   - Implement `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
   - Build complete Journal CRUD and Sell-Car Admin Management endpoints.
