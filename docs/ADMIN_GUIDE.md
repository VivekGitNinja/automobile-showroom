# Apex Luxury Automobiles — Operational Admin Guide

This operational manual is designed for showroom managers, sales concierges, acquisition specialists, and administrative staff managing **Apex Luxury Automobiles Dubai**.

---

## Table of Contents
1. [Logging into the Administrative Portal](#1-logging-into-the-administrative-portal)
2. [Vehicle Catalog Management](#2-vehicle-catalog-management)
3. [Google Sheets Inventory Synchronization](#3-google-sheets-inventory-synchronization)
4. [VIP Leads, Viewing Bookings & Callback Desk](#4-vip-leads-viewing-bookings--callback-desk)
5. [Sell-Your-Car Valuation Inbox](#5-sell-your-car-valuation-inbox)
6. [FAQ Concierge Chatbot Knowledge Base](#6-faq-concierge-chatbot-knowledge-base)
7. [Spare Parts Catalog & Journal Publishing](#7-spare-parts-catalog--journal-publishing)
8. [Global Showroom Settings & WhatsApp Configuration](#8-global-showroom-settings--whatsapp-configuration)

---

## 1. Logging into the Administrative Portal

### Accessing the Portal
- **URL**: Navigate to `https://yourdomain.com/admin` (or `http://localhost:3000/admin` in development).
- **Credentials**: Enter your authorized corporate email and password.
- **Session Duration**: Administrative JWT tokens are securely issued with automatic refresh mechanisms.

### Password Security & Rotation
- To update your administrative credentials, re-run database seeding with the `ADMIN_PASSWORD` environment variable set, or contact your technical operations team.
- Production environments enforce a minimum password length of 12 characters.

---

## 2. Vehicle Catalog Management

The **Vehicles** tab is your central hub for curating hypercar and luxury automobile inventory.

### Creating and Editing Listings
1. Click **+ Add Vehicle** to open the listing creator.
2. Fill in the core vehicle specifications:
   - **Marque / Make**: (e.g., Rolls-Royce, Ferrari, Bugatti, Lamborghini, Porsche).
   - **Model & Trim**: (e.g., Phantom Series VIII, SF90 Stradale Assetto Fiorano).
   - **Year & Price**: Displayed in UAE Dirhams (AED).
   - **Mileage**: In kilometers (e.g., `500 km`).
   - **Transmission & Fuel Type**: Automatic, PDK, F1 Dual-Clutch; Petrol, Hybrid, Electric.
3. **Publication Status**:
   - `Draft`: Hidden from the public website, visible only in the Admin Desk. Use this while preparing professional photography and verifying VIN provenance.
   - `Published`: Immediately live on the public showroom floor and inventory index.
   - `Unpublished`: Temporarily hidden from customer view without deleting historical records.
   - `Archived`: Vehicle sold or de-listed from active rotation.
4. **Editorial & Trust Flags**:
   - `Featured Flagship`: Pin vehicle to the homepage cinematic hero grid.
   - `Certified Provenance`: Displays the 150-Point Inspection certification badge.
   - `GCC Verified`: Confirms GCC-specification compliance.
   - `Warranty & Finance Available`: Signals VIP concierge financing and warranty packages.

### Media Gallery & Multi-Angle Photography
- Use the **Media Manager** to attach high-resolution exterior, interior, cockpit, and engine bay imagery.
- The image designated with `isPrimary: true` serves as the primary hero image across cards and search previews.
- Reorder gallery sequences using the display order index.

---

## 3. Google Sheets Inventory Synchronization

For dealerships that manage fleet updates through Google Drive spreadsheets, Apex provides an automated synchronization worker.

### How the Sync Operates
- Synchronizes every 15 minutes automatically via background cron, or on-demand via the **Trigger Sync** button in Admin → Sync tab.
- **RowID (Column A)**: Serves as the immutable database key. If a row is removed from Google Sheets, the listing is automatically transitioned to `unpublished` so stale inventory never lingers on the live website.

### Multi-Image Column K Formatting
Column K in Google Sheets supports full image galleries. Separate multiple URLs using:
- Comma: `https://.../img1.jpg, https://.../img2.jpg`
- Semicolon: `https://.../img1.jpg; https://.../img2.jpg`
- Newline: Each URL on a new line within the cell.
- The first valid URL becomes the primary showcase image; subsequent URLs form the vehicle gallery.

### Inspecting Sync Logs & Quarantine
- The **Sync Logs** tab displays the timestamp, rows processed, listings updated, and listings inserted.
- If a row is missing required parameters (Make, Model, Year, or Price), the row is safely quarantined in the **Quarantine Inspector** without breaking the synchronization pass.

---

## 4. VIP Leads, Viewing Bookings & Callback Desk

All customer inquiries from the website funnel directly into the **Leads** panel in real time.

### Lead Classifications
- **Enquiry**: General questions regarding purchase or international export.
- **Booking**: Private viewing appointments at the Dubai Flagship showroom.
- **Callback**: Dedicated callback requests with preferred time windows (Morning, Afternoon, Evening).

### Processing Leads
1. Filter leads by status (`New`, `Contacted`, `Qualified`, `Converted`, `Closed`).
2. Filter by lead type (`Enquiry`, `Booking`, `Callback`).
3. Click any lead to inspect vehicle context, customer phone, email, and special viewing requests.
4. Assign lead ownership to individual sales concierge personnel.

---

## 5. Sell-Your-Car Valuation Inbox

Hypercar owners looking to consign or sell their automobiles outright submit specifications through the `/sell-your-car` portal.

### Reviewing Valuation Inquiries
1. Navigate to the **Sell Car Inbox** tab.
2. Each submission contains:
   - Seller contact details (Full name, phone, email).
   - Vehicle details: Year, Make, Model, Mileage, and Asking Price.
   - Seller's condition description.
   - Up to 12 high-resolution vehicle photographs uploaded directly by the owner.
3. Click any thumbnail to expand full-resolution imagery for acquisition assessment.
4. Acquisition specialists should review submissions and reach out to the client within 2 hours of receipt.

---

## 6. FAQ Concierge Chatbot Knowledge Base

The public AI Concierge is a rule-based assistant strictly grounded in your showroom's official knowledge base. It never hallucinates unverified vehicle prices or terms.

### Managing Categories & Questions
1. Navigate to **Admin → FAQ Knowledge Base**.
2. Organize topics into customer-facing categories:
   - *Acquisition & Payment* (Wire transfers, letters of credit, cryptocurrency).
   - *Worldwide Air-Freight & Maritime Logistics*.
   - *150-Point Technical Quality Inspection & Provenance*.
   - *Consignment & Outright Purchase*.
3. Add search keywords to each question to optimize customer inquiry matching.
4. Questions that cannot be answered automatically route customers seamlessly to **WhatsApp VIP Concierge** or the **Callback Desk**.

---

## 7. Spare Parts Catalog & Journal Publishing

### Spare Parts Management
- Catalog bespoke OEM components, performance exhaust systems, carbon fiber aerodynamics, and forged wheels.
- Track part numbers, manufacturer marques, compatibility lists, and inventory status.

### The Apex Journal (Editorial CMS)
- Publish luxury lifestyle, hypercar release features, and Dubai automotive events.
- Draft, preview, and publish rich markdown articles with featured hero imagery.

---

## 8. Global Showroom Settings & WhatsApp Configuration

Navigate to **Admin → Settings** to manage global operational metadata:
- **Primary Showroom WhatsApp Number**: Formatted with international dial code (`+971 50 891 9441`). Updating this automatically updates the floating WhatsApp concierge, vehicle desk buttons, and chatbot handoff links across the entire website.
- **Showroom Address & Hours**: Configured for Dubai Flagship Sheikh Zayed Road location.
- **Sales & Acquisition Notification Inboxes**: Corporate email routing for lead dispatch.

---
*Apex Luxury Automobiles Dubai — Confidential Administrative Documentation*
