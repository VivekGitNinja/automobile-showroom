# BRIEFING — 2026-07-29T13:42:44+05:30

## Mission
Implement Milestone 2: Backend API, Prisma Schema & Lead Management for Apex Luxury Automobiles backend API.

## 🔒 My Identity
- Archetype: Worker / Implementer / QA / Specialist
- Roles: implementer, qa, specialist
- Working directory: /Users/vivek/Luxery /.agents/teamwork_preview_worker_m2
- Original parent: 82f6b47d-8817-4cda-b929-bfc28d375527
- Milestone: Milestone 2 (Backend API, Prisma Schema & Lead Management)

## 🔒 Key Constraints
- CODE_ONLY network mode: No external HTTP requests or web browsing.
- DO NOT CHEAT: Genuine implementations only, no hardcoded responses or dummy mocks.
- Layout & file structure discipline: Project API directory is /Users/vivek/Luxery /ESAD_Document/project/api.
- Clean build: `npm run build` must compile with zero errors.

## Current Parent
- Conversation ID: 82f6b47d-8817-4cda-b929-bfc28d375527
- Updated: 2026-07-29T13:42:44+05:30

## Task Summary
- **What to build**:
  1. Add `SyncQuarantine` model and update `Journal` model in Prisma schema; run `npx prisma generate`.
  2. Standardize Google Sheets env var to `GOOGLE_SPREADSHEET_ID` across `src/config/env.ts` and `src/services/googleSheets.service.ts`.
  3. Implement auth routes (`/refresh`, `/logout`, `/me`).
  4. Lead Capture & Sales Notification: Update BullMQ lead notification job to send emails to both customer and sales team (`process.env.SALES_EMAIL` or `sales@apexluxuryautomobiles.com`). Build Admin Lead Management endpoints (`GET /leads`, `PUT /leads/:id/status`, `PUT /leads/:id/assign`, `POST /leads/:id/notes`, `GET /leads/sell-car`, `PUT /leads/sell-car/:id`).
  5. Vehicle Sub-Resource CRUD: Hotspots, Spec Configs, Vehicle edit (`PUT /:id`), soft-delete (`DELETE /:id`).
  6. Verification: `npm run build` zero TypeScript errors. Document in `handoff.md`.
- **Success criteria**: Zero build errors, all API endpoints fully implemented and functional according to specification.

## Key Decisions Made
- Use `GOOGLE_SPREADSHEET_ID` standard environment key.
- Align schema updates with existing Prisma conventions.

## Change Tracker
- **Files modified**: [TBD]
- **Build status**: [TBD]
- **Pending issues**: None

## Quality Status
- **Build/test result**: [TBD]
- **Lint status**: Clean
- **Tests added/modified**: [TBD]

## Loaded Skills
- None explicitly assigned for this subagent context.

## Artifact Index
- `/Users/vivek/Luxery /.agents/teamwork_preview_worker_m2/ORIGINAL_REQUEST.md` — Original prompt request.
- `/Users/vivek/Luxery /.agents/teamwork_preview_worker_m2/BRIEFING.md` — Agent briefing & index.
- `/Users/vivek/Luxery /.agents/teamwork_preview_worker_m2/progress.md` — Heartbeat and step progress tracking.
