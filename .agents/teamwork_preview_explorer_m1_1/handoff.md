# Handoff Report: Milestone 1 — Backend API, Data & Sync Gap Analysis

**Agent**: Explorer Subagent (`teamwork_preview_explorer_m1_1`)  
**Target Codebase**: `/Users/vivek/Luxery /ESAD_Document/project/api`  
**Working Directory**: `/Users/vivek/Luxery /.agents/teamwork_preview_explorer_m1_1`  
**Date**: 2026-07-29  

---

## 1. Observation

Direct code inspection of the backend at `/Users/vivek/Luxery /ESAD_Document/project/api` yielded the following findings:

1. **Google Sheets Sync & Missing Quarantine**:
   - `src/services/googleSheets.service.ts` (lines 128–141): Invalid rows missing required fields (`sheetRowId`, `make`, `model`, `year`, `price`) or containing `NaN` values are logged to string arrays and skipped (`continue;`).
   - `prisma/schema.prisma`: Schema contains `SyncLog` (lines 323–335) but **no `SyncQuarantine` or `QuarantineRecord` table**.
   - `src/routes/sync.routes.ts`: Exposes `POST /`, `GET /status`, and `GET /logs`, but **no quarantine management endpoints** (`GET /quarantine`, `POST /quarantine/:id/resolve`).
   - Environment key mismatch: `src/config/env.ts` defines `GOOGLE_SHEET_ID` and `GOOGLE_SERVICE_ACCOUNT_JSON` (lines 19–20), whereas `src/services/googleSheets.service.ts` reads `process.env.GOOGLE_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY` (lines 20–22).
   - Cron schedule mismatch: `env.SYNC_CRON_SCHEDULE` defaults to `*/15 * * * *`, but `src/jobs/syncScheduler.ts` hardcodes `cron.schedule('0 3 * * *', ...)` (line 7).

2. **Missing FAQ Chatbot Query Endpoint**:
   - `src/app.ts` (line 60): Mounts `app.use('/api/v1/chatbot', faqRoutes)`.
   - `src/routes/faq.routes.ts`: Implements standard category and FAQ CRUD (`GET /`, `POST /`, `PUT /:id`, `DELETE /:id`), but **lacks any `POST /query` or rule-based keyword matching endpoint**.

3. **Incomplete Auth Token Lifecycle**:
   - `src/routes/auth.routes.ts` (lines 38–42): `POST /login` issues a `refreshToken`, but there are **no `POST /refresh`, `POST /logout`, or `GET /me` routes**.
   - `prisma/schema.prisma`: No `RefreshToken` or `UserSession` model exists.

4. **Incomplete CMS & Lead Admin Routes**:
   - `src/routes/journal.routes.ts`: Contains only `GET /` with `take: 3`. Lacks `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`. `Journal` schema lacks `slug`, `status`, `authorId`, and `tags`.
   - `src/routes/lead.routes.ts`: `POST /` and `POST /sell-car` create submissions. `notificationWorker` in `src/config/bullmq.ts` sends confirmation emails to clients (`to: data.email`), but **does not send alert emails to the sales team** (`SALES_EMAIL`). `SellCarSubmission` entries have no administrative listing or edit endpoints in `admin.routes.ts`.

5. **Directory Structure**:
   - Directories `src/controllers/`, `src/repositories/`, `src/validators/`, `src/workers/`, `src/types/` are present but empty. Express route files directly include Zod schemas and Prisma queries.

---

## 2. Logic Chain

1. **Observation**: `googleSheets.service.ts` drops malformed rows with `continue;`, and `schema.prisma` lacks a quarantine model.
   - **Reasoning**: Without a quarantine model or table, malformed inventory rows cannot be persisted for inspection. Without quarantine API routes, administrators cannot review or resolve bad sheet entries from the CMS.
   - **Conclusion**: The current Google Sheets sync implementation fails ESAD Requirement Item 4.

2. **Observation**: `app.ts` mounts `faqRoutes` under `/api/v1/chatbot`, but `faq.routes.ts` has no query route.
   - **Reasoning**: A request to `POST /api/v1/chatbot/query` reaches Express router matching `/api/v1/chatbot`, but fails to match any inner route in `faq.routes.ts`, returning HTTP 404.
   - **Conclusion**: The rule-based FAQ chatbot endpoint (ESAD Requirement Item 6) is missing.

3. **Observation**: `POST /auth/login` returns a `refreshToken`, but no `/auth/refresh` route exists.
   - **Reasoning**: JWT access tokens expire in 15 minutes (`expiresIn: '15m'`). Without a refresh route, client applications cannot obtain new access tokens when they expire.
   - **Conclusion**: The authentication and session management lifecycle is incomplete.

4. **Observation**: `src/config/env.ts` and `src/services/googleSheets.service.ts` use different environment variable names for Google credentials.
   - **Reasoning**: If a user configures `.env` according to `env.ts` (`GOOGLE_SHEET_ID`), `googleSheetsService.isConfigured()` will check `process.env.GOOGLE_SPREADSHEET_ID` and evaluate to `false`.
   - **Conclusion**: Google Sheets sync will fail by default due to environment key discrepancies.

---

## 3. Caveats

1. **Network Sandbox Restriction**: Operations were performed in read-only CODE_ONLY mode without executing live PostgreSQL or Redis database connections.
2. **Third-Party Integrations**: SendGrid API key and Google Cloud Service Account credentials were not live-tested with external APIs.
3. **Frontend Integration**: Frontend components were not modified or tested for full endpoint alignment (assigned to separate Milestone).

---

## 4. Conclusion

The existing backend in `/Users/vivek/Luxery /ESAD_Document/project/api` provides a solid starting structure (Prisma models, Express setup, rate limiting, S3/R2 storage, BullMQ queue), but requires **critical refactoring and feature additions** to achieve full ESAD compliance:
- **Priority 1**: Create `SyncQuarantine` Prisma model, align environment variable keys, update `googleSheets.service.ts` to route invalid rows to Quarantine, and build admin quarantine API endpoints.
- **Priority 2**: Build `POST /api/v1/chatbot/query` with rule-based keyword matching.
- **Priority 3**: Add `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`, and token schema support.
- **Priority 4**: Expand Journal CMS routes/schema, add Vehicle Hotspot/Spec Config sub-resource CRUD routes, and implement SellCar admin management.

---

## 5. Verification Method

To independently verify the observations and gaps reported in this document:

1. **Verify Quarantine Defect**:
   - Inspect `/Users/vivek/Luxery /ESAD_Document/project/api/src/services/googleSheets.service.ts` at line 128–141. Confirm invalid rows execute `continue;` without database insertion.
   - Inspect `/Users/vivek/Luxery /ESAD_Document/project/api/prisma/schema.prisma`. Confirm no `Quarantine` model exists.

2. **Verify Missing Chatbot Query Endpoint**:
   - Inspect `/Users/vivek/Luxery /ESAD_Document/project/api/src/app.ts` line 60 and `/Users/vivek/Luxery /ESAD_Document/project/api/src/routes/faq.routes.ts`. Confirm no `POST /query` handler is defined.

3. **Verify Auth Refresh Token Gap**:
   - Inspect `/Users/vivek/Luxery /ESAD_Document/project/api/src/routes/auth.routes.ts`. Confirm only `/login` is defined.

4. **Verify Environment Key Discrepancy**:
   - Compare `GOOGLE_SHEET_ID` in `src/config/env.ts` line 20 with `GOOGLE_SPREADSHEET_ID` in `src/services/googleSheets.service.ts` line 20.
