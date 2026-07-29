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

## Documentation
See `docs/ESAD_Luxury_Automobile_Showroom.html` for the full
Enterprise Software Architecture Document.

## Contact
- Email: info@Techzoetic.com
- Phone: +971508919441
- Web:   www.techzoetic.com
