# Live Regression Test Suite — Apex Luxury Automobiles

This directory contains standalone, adversarial end-to-end regression scripts used during the zero-defect verification gate. Each script probes real, live running services (Next.js frontend on port 3000, Express API on port 4000, PostgreSQL database, and Redis).

## Prerequisites

1. **Stack Running**:
   - Backend API running on `http://localhost:4000`
   - Frontend Next.js running on `http://localhost:3000`
   - PostgreSQL running on port `5432` (`showroom_dev` database)
   - Redis running on port `6379`
2. **Dependencies**:
   Installed in the `frontend` root:
   - `@playwright/test`
   - `@axe-core/playwright`
   - `dotenv`

## Script Catalog & Execution Commands

Run all commands from the `frontend/` directory (or specify `NODE_PATH="./node_modules"`):

### 1. WCAG 2.1 AA Axe-Core Automated Audit (`run_axe_audit.js`)
Performs a live `@axe-core/playwright` scan against real rendered pages:
- `/` (Home)
- `/inventory` (Inventory catalogue)
- `/inventory/porsche-911-2023` (Vehicle detail)
- `/contact` (Contact concierge desk)

Enforces **0 Critical** and **0 Serious** accessibility violations.
```bash
NODE_PATH="./node_modules" node e2e/regression/run_axe_audit.js
```

### 2. Live Chatbot Conversational Regression (`regress_g3a_chatbot.js`)
Tests the VIP Concierge assistant across three critical flows:
1. **Category Selection**: "Warranty & Inspection" -> Question -> Verified accurate answer.
2. **Gibberish Fallback**: Nonsense inquiry -> Polite fallback message with direct WhatsApp CTA.
3. **Price Query Guardrail**: "how much is the ferrari sf90 price" -> Rule-based guardrail states tailored bespoke quotation message and DOES NOT state numeric pricing.
```bash
NODE_PATH="./node_modules" node e2e/regression/regress_g3a_chatbot.js
```

### 3. Four Public Forms Real Submission Probe (`test_four_forms_live.js`)
Exercises full client form submissions with network capture and DB verification:
- Contact Concierge (`/contact`)
- Sell Your Car (`/sell-your-car` with image upload simulation)
- Vehicle Inquiry / Viewing Booking (`/inventory/[slug]`)
- Spare Part Inquiry (`/parts/[slug]`)
```bash
NODE_PATH="./node_modules" node e2e/regression/test_four_forms_live.js
```

### 4. Callback Desk Consultation Probe (`test_callback_only.js`)
Verifies the dedicated telephone consultation / callback request flow across public desks.
```bash
NODE_PATH="./node_modules" node e2e/regression/test_callback_only.js
```

### 5. Page-by-Page Feature Regressions
- `regress_home.js`: Homepage hero, marquee, curated marque links, live inventory counts.
- `regress_inventory.js`: Search, filters (marque, year, price), pagination, sort orders.
- `regress_item5_vehicle.js`: Vehicle detail specs grid, 3D studio, 360 viewer, lead drawers.
- `regress_item6_7_admin.js`: Enterprise command center login, fleet table, DAM asset inspector, sync desk.
- `regress_item8_sell_car.js`: Valuation inbox, step-by-step appraisal form, client image uploads.
- `regress_item9_contact.js`: Showroom location map, concierge telephone links, inquiry dispatch.
- `regress_item10_11_modals.js`: VIP viewing booking modal, escape key dismiss, focus traps.
- `test_live_a11y.js`: Contrast verification, semantic landmark verification, ARIA attributes.
