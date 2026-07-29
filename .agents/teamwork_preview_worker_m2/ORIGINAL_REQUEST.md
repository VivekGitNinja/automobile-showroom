## 2026-07-29T08:10:18Z
You are a Worker subagent assigned to Milestone 2: Backend API, Prisma Schema & Lead Management.
Your working directory is: /Users/vivek/Luxery /.agents/teamwork_preview_worker_m2

Project API Directory: /Users/vivek/Luxery /ESAD_Document/project/api
ESAD Specification: /Users/vivek/acb/ESAD_Luxury_Automobile_Showroom.html
Master Project Specification: /Users/vivek/Luxery /.agents/orchestrator/PROJECT.md

IMPLEMENTATION OBJECTIVES:
1. **Prisma Schema Update**:
   - In `/Users/vivek/Luxery /ESAD_Document/project/api/prisma/schema.prisma`, add `SyncQuarantine` model with fields:
     - `id` (String @id @default(uuid()))
     - `sheetRowId` (String?)
     - `rawRowData` (Json)
     - `validationErrors` (Json)
     - `status` (String @default("PENDING"))
     - `createdAt` (DateTime @default(now()))
     - `updatedAt` (DateTime @updatedAt)
   - Update `Journal` model in `schema.prisma` to include `slug` (String @unique), `status` (String @default("DRAFT")), `authorId` (String?), `tags` (String[]).
   - Run `npx prisma generate` inside `/Users/vivek/Luxery /ESAD_Document/project/api`.
2. **Environment Variable Alignment**:
   - Fix environment key discrepancy between `src/config/env.ts` (`GOOGLE_SHEET_ID`) and `src/services/googleSheets.service.ts` (`GOOGLE_SPREADSHEET_ID`), standardizing on `GOOGLE_SPREADSHEET_ID`.
3. **Auth Endpoints Implementation**:
   - In `src/routes/auth.routes.ts`, implement:
     - `POST /api/v1/auth/refresh` (refresh expired JWT access token).
     - `POST /api/v1/auth/logout` (invalidate refresh session).
     - `GET /api/v1/auth/me` (get authenticated admin user profile).
4. **Lead Capture & Sales Notification**:
   - In `src/config/bullmq.ts` (or notification worker service), update lead notification job handler to send email notifications both to the customer AND to the sales team email (`process.env.SALES_EMAIL` or `sales@apexluxuryautomobiles.com`).
   - In `src/routes/admin.routes.ts` (or lead controller), build Admin Lead Management endpoints:
     - `GET /api/v1/admin/leads` (list leads with pagination, filtering by lead type, status, date range, assigned rep).
     - `PUT /api/v1/admin/leads/:id/status` (update lead lifecycle status).
     - `PUT /api/v1/admin/leads/:id/assign` (assign lead to sales rep).
     - `POST /api/v1/admin/leads/:id/notes` (add internal sales note).
     - `GET /api/v1/admin/leads/sell-car` (list Sell-Your-Car submissions).
     - `PUT /api/v1/admin/leads/sell-car/:id` (update Sell-Your-Car submission status).
5. **Vehicle Sub-Resource CRUD**:
   - In `src/routes/vehicle.routes.ts` or `admin.routes.ts`:
     - Hotspot CRUD (`POST /:id/hotspots`, `DELETE /:id/hotspots/:hotspotId`).
     - Spec Config CRUD (`POST /:id/specs`, `PUT /:id/specs/:specId`, `DELETE /:id/specs/:specId`).
     - Vehicle edit (`PUT /:id`) and soft-delete (`DELETE /:id`).
6. **Build & Verification**:
   - Run `npm run build` inside `/Users/vivek/Luxery /ESAD_Document/project/api`. Ensure TypeScript compiles with zero errors.
   - Document all changes and build results in `/Users/vivek/Luxery /.agents/teamwork_preview_worker_m2/handoff.md`.
