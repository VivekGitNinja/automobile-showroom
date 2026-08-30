# Luxury Automobile Showroom Website

A premium, high-performance informational website for a luxury automobile showroom/reseller in Dubai.

This project showcases vehicle inventory, captures sales leads, and allows non-technical staff to manage content without code changes.

> This is an original website experience. It may use a competitor/reference site only as a benchmark for customer journey and structure, not for copying design, content, assets, or code.

---

## Features

### Public Website

- Premium homepage with hero banner/video
- Featured vehicles section
- Inventory browsing with search and filters
- Brand pages
- Detailed vehicle pages with gallery, specs, price, and CTAs
- Enquiry / callback / booking forms
- Sell Your Car submission flow
- WhatsApp quick-contact button
- About, Contact, FAQ, and Showroom Location pages
- Optional Blog/Media section
- Fully responsive luxury design
- SEO-friendly server-rendered pages

### Admin / CMS

- Secure staff login
- Manage vehicles without code changes
- Upload and reorder vehicle images
- Manage pricing, specs, availability, and featured status
- Manage FAQ content for chatbot
- View and manage leads
- Configure site settings
- View inventory sync logs

### Inventory Sync

- Automated sync from Google Sheets or Excel
- Scheduled and manual sync options
- Add/update/disable vehicles automatically
- Row validation and error logging
- Safe handling of malformed data
- Soft-delete strategy for removed vehicles

### Lead Capture

- Booking requests
- Callback requests
- General enquiries
- Sell-your-car submissions
- Email notifications to sales team
- Optional CRM/webhook support

### Rule-Based Chatbot

- No LLM / no generative AI
- Menu-driven categories
- Pre-written FAQ answers
- Optional keyword matching
- Editable from CMS
- Human fallback via WhatsApp / callback / enquiry

---

## Tech Stack

- Frontend: Next.js App Router, React, TypeScript
- Styling: Tailwind CSS
- CMS/Admin: Payload CMS / Directus / Strapi
- Database: PostgreSQL
- Media Storage: Cloudinary or S3-compatible storage
- Authentication: CMS native auth or NextAuth
- Sync Service: Node.js worker / scheduled API job
- Email Notifications: Resend / SendGrid / SES
- SEO: Server-side rendering, metadata API, JSON-LD, sitemap
- Testing: Playwright, Vitest/Jest, Lighthouse CI
- Deployment: Vercel / Docker / Cloud VM

---

## Project Goals

1. Present vehicle inventory in a premium, fast, and SEO-friendly way
2. Allow non-technical staff to manage inventory and FAQs
3. Keep inventory synchronized automatically from a spreadsheet
4. Capture and notify sales leads reliably
5. Provide a controlled rule-based chatbot experience

---

## Out of Scope

- Online payments
- Checkout flows
- Customer accounts/login
- Generative AI chatbot responses
- Direct cloning of any reference website

---

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- pnpm / npm / yarn
- PostgreSQL database
- Cloudinary or S3 credentials
- Google Sheets API credentials if using sheet sync
- Email service API key

---

## Installation

```bash
# Clone the repository
git clone <repo-url>

# Go to project folder
cd luxury-automobile-showroom

# Install dependencies
pnpm install
```

---

## Environment Variables

Create a `.env` file based on `.env.example`.

### Example

```env
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/luxury_auto_db

# CMS/Auth
PAYLOAD_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret

# Media
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Spreadsheet Sync
SYNC_PROVIDER=google_sheets
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY=your-private-key
SYNC_CRON="*/30 * * * *"
SYNC_SECRET=your-cron-secret

# Missing Row Behavior: sold | hidden | delete
MISSING_ROW_ACTION=sold

# Email / Notifications
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-key
SALES_NOTIFICATION_EMAIL=sales@yourshowroom.com
ADMIN_ALERT_EMAIL=admin@yourshowroom.com

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=971500000000

# Optional CRM
CRM_WEBHOOK_URL=
```

---

## Run Locally

```bash
# Start database if using Docker
docker compose up -d

# Run migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed

# Start development server
pnpm dev
```

Open:

```text
http://localhost:3000
```

---

## Build for Production

```bash
pnpm build
pnpm start
```

---

## Useful Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build production app
pnpm start            # Start production server
pnpm lint             # Run linting
pnpm test             # Run unit/integration tests
pnpm e2e              # Run Playwright tests
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed sample data
pnpm sync:dry-run     # Test spreadsheet sync without saving
pnpm sync:run         # Run inventory sync manually
```

---

## Folder Structure

```text
/
├── src/
│   ├── app/                  # Next.js app routes
│   │   ├── (public)/         # Public pages
│   │   ├── admin/            # Admin/CMS pages if custom
│   │   └── api/              # API routes
│   ├── components/           # Reusable UI components
│   ├── features/
│   │   ├── vehicles/         # Vehicle browsing/detail logic
│   │   ├── leads/            # Lead capture logic
│   │   ├── chatbot/          # Rule-based chatbot
│   │   └── sync/             # Inventory sync logic
│   ├── lib/                  # Utilities, validators, services
│   ├── server/               # Server-side services
│   └── styles/               # Global styles/theme
├── public/                   # Static assets
├── scripts/                  # CLI scripts, sync helpers
├── tests/                    # E2E/integration tests
└── README.md
```

---

## Inventory Spreadsheet Format

The sync system expects one row per vehicle.

### Required Columns

- Stock ID
- Make
- Model
- Year
- Price
- Status
- Image URLs

### Recommended Columns

- VIN
- Trim
- Currency
- Mileage
- Body Type
- Transmission
- Drivetrain
- Fuel Type
- Engine
- Exterior Color
- Interior Color
- Description
- Features
- Featured
- SEO Title
- SEO Description

### Example

| Stock ID | Make | Model | Year | Price | Status | Image URLs |
|---|---|---|---|---|---|---|
| AC-1001 | Ferrari | 488 GTB | 2018 | 899000 | available | https://cdn.../1.jpg;https://cdn.../2.jpg |

### Rules

- Stock ID must be unique
- Image URLs must be publicly accessible or uploadable
- Use consistent status values:
  - available
  - reserved
  - sold
  - coming_soon
  - hidden
- Avoid merged cells
- Keep header names stable

---

## Inventory Sync Behavior

### Add

If a new Stock ID appears, a new vehicle is created.

### Update

If an existing Stock ID changes, the vehicle is updated.

### Remove

If a Stock ID disappears from the sheet:

- by default vehicle is marked as sold or hidden
- hard delete only if explicitly configured

### Validation

Rows are validated before saving.

Invalid rows are:

- skipped
- logged
- shown in admin sync logs

This prevents malformed data from breaking the live site.

---

## Admin Guide

### Managing Vehicles

1. Log in to admin panel
2. Go to Vehicles
3. Click Add Vehicle or Edit
4. Enter vehicle details
5. Upload images
6. Set status and featured flag
7. Save/Publish

### Managing FAQs

1. Go to FAQ Categories / FAQ Items
2. Add/edit categories
3. Add questions and answers
4. Add keywords for optional matching
5. Enable/disable entries

### Managing Leads

1. Go to Leads
2. View submission details
3. Update status:
   - New
   - Contacted
   - Qualified
   - Closed
   - Spam

### Viewing Sync Logs

1. Go to Sync Logs
2. Check latest sync status
3. Review skipped rows and errors

---

## Lead Capture Forms

Supported forms:

- Book a Viewing
- Request Callback
- General Enquiry
- Sell Your Car

Each submission:

- validates input
- saves to database
- notifies sales team
- appears in admin dashboard

---

## WhatsApp Integration

The site supports WhatsApp quick contact via:

- global floating button
- vehicle-specific CTA
- chatbot fallback

Use a valid international format without `+` in the URL.

Example:

```text
https://wa.me/971500000000?text=Hello%2C%20I%20am%20interested%20in%20the%20Ferrari%20488%20GTB
```

---

## Chatbot Behavior

The chatbot is fully rule-based.

It does not use:

- LLMs
- generative AI
- open-ended AI responses

It uses:

- predefined categories
- scripted answers
- optional keyword matching
- fallback to human contact

---

## SEO

Implemented features:

- server-rendered pages
- clean URLs
- unique metadata per page
- Open Graph tags
- JSON-LD structured data
- sitemap.xml
- robots.txt
- canonical URLs

### Important URLs

- `/inventory`
- `/vehicle/[slug]`
- `/brands/[make]`
- `/sell-your-car`
- `/contact`
- `/faq`

---

## Performance Guidelines

- Use optimized images
- Prefer AVIF/WebP
- Lazy-load non-critical images
- Paginate inventory results
- Use ISR/CDN caching
- Avoid heavy client-side libraries

---

## Security Notes

- Protect admin routes with authentication
- Use role-based access control
- Validate all form inputs
- Rate-limit public endpoints
- Sanitize uploads
- Store secrets only in environment variables
- Enable database backups

---

## Testing

```bash
# Unit tests
pnpm test

# End-to-end tests
pnpm e2e

# Lighthouse audit
pnpm lighthouse
```

Recommended coverage:

- search/filter behavior
- lead form submissions
- sync validation
- chatbot matching
- vehicle detail page rendering

---

## Deployment

### Option 1: Vercel + Managed Postgres

- Deploy frontend/CMS to Vercel
- Use Neon/Supabase Postgres
- Use Cloudinary for media
- Use Vercel Cron or QStash for sync schedule

### Option 2: Docker / VPS

- Deploy with Docker Compose
- Use PostgreSQL container or managed DB
- Use Nginx reverse proxy
- Use cron job or queue worker for sync

---

## Go-Live Checklist

- [ ] Production environment configured
- [ ] Database backups enabled
- [ ] Spreadsheet source finalized
- [ ] Sync tested with full dataset
- [ ] Lead notifications tested
- [ ] WhatsApp links tested
- [ ] Chatbot fallback tested
- [ ] SEO metadata verified
- [ ] Sitemap submitted
- [ ] Core Web Vitals checked
- [ ] Admin training completed
- [ ] Error monitoring enabled

---

## Troubleshooting

### Sync fails

- Check sheet permissions
- Verify required columns exist
- Check Stock ID uniqueness
- Review sync logs

### Images not showing

- Confirm image URLs are accessible
- Confirm media provider credentials
- Check upload size limits

### Leads not arriving

- Verify email provider API key
- Check spam/junk folder
- Review notification logs

### Chatbot gives no answer

- Confirm FAQ items are active
- Improve keywords
- Ensure fallback options are enabled

---

## License

Proprietary. All rights reserved.

---

## Support

For technical support or CMS assistance, contact the project administrator or development team.