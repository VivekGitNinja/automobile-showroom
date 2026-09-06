# Luxury Automobile Showroom Website

High-end informational website for a luxury automobile showroom in Dubai.
Built by **TechXoetic** — www.techzoetic.com

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL 15
- **Cache/Queue:** Redis 7 + BullMQ
- **Infrastructure:** Docker, Nginx, Cloudflare

## Quick Start (Development)

```bash
# 1. Clone and install
cp .env.example .env
# Fill in your .env values

# 2. Start all services
docker-compose -f docker-compose.dev.yml up -d

# 3. Run DB migrations
cd api && npx prisma migrate dev

# 4. Open browser
# Frontend: http://localhost:3000
# API:      http://localhost:4000/api/v1/health
# Admin:    http://localhost:3000/admin
```

## Database Seeding & Production Gating

The database seed (`api/prisma/seed.ts`) is safe for production use:
- **Production (`NODE_ENV=production`):** Creates or updates the administrator account, global showroom settings, system FAQ categories, and luxury marque brands. Demo vehicles, spare parts, and journal posts are **gated out by default** (`SEED_DEMO_DATA=false`) to ensure placeholder imagery never surfaces on the public website.
- **Development (`NODE_ENV=development`):** Seeds demo vehicles, parts, and articles in **`status: 'draft'`** so they can be reviewed and tested safely.
- **Explicit Override:** Set `SEED_DEMO_DATA=true` to seed demo catalog items in any environment.

```bash
# Development seeding
cd api && npx prisma db seed

# Production seeding (creates admin & baseline settings only)
NODE_ENV=production npx prisma db seed
```

## Documentation
- [SETUP.md](SETUP.md) — Comprehensive launch guide, environment configurations, and integration setup
- [ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) — Operational handbook for showroom management
- [OPS_RUNBOOK.md](docs/OPS_RUNBOOK.md) — Production operations and deployment runbook

## Contact
- Email: info@Techzoetic.com
- Phone: +971508919441
- Web:   www.techzoetic.com
