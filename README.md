# Apex Luxury Automobiles — Dubai Flagship Showroom

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-orange?style=flat&logo=three.js)](https://threejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary-gold?style=flat)](#license)

A state-of-the-art, high-performance digital showroom platform engineered for premier luxury and exotic automobile dealerships in Dubai and the Middle East. Featuring an interactive 3D Virtual Engineering Studio, authentic supercar acoustic engines, Apple-style glassmorphic floating concierge orbs, and an enterprise multi-worker backend.

---

## Key Highlights & Features

### 1. Interactive 3D Virtual Engineering Studio & Digital Twin
- **WebGL / Three.js 60 FPS Viewport**: Photorealistic real-time 3D rendering with studio lighting presets (`Apex Gold`, `Midnight Stealth`, `Cyberpunk Neon`, `Daylight Studio`).
- **Archetype Intelligence**: Dynamically recognizes vehicle form factors (**Exotic Supercar**, **Luxury SUV**, **Grand Tourer Coupe**, **Stately Executive Saloon**) from specifications and normalizes scale and coordinates.
- **Top Aero Blueprint CAD Telemetry**: Instant toggle between 3D orbital inspection and top-down CAD engineering schematics displaying vehicle dimensions (Length, Width, Height, Wheelbase, Track, Ground Clearance, ALA Active Aero factor).
- **Holographic X-Ray Chassis**: High-tech wireframe mode allowing clients to inspect the internal chassis architecture and powertrain layout.
- **Mechanical Articulation Engine**: Smooth 60 FPS lerp transitions for opening/closing scissor/gullwing doors and engine bonnets with true hierarchical pivot anchoring and cockpit reveal.
- **Real-Time Paint Customizer**: Instant exterior lacquer configuration across factory shades (*Giallo Auge, Rosso Corsa, Verde Mantis, Grigio Telesto, Blu Nethuns, Bianco Monocerus*) with matching underglow ambiance.
- **Procedural Fail-Safe Twin**: Automatic fallback to procedural digital twins if a custom 3D mesh is not provided, ensuring the viewer never crashes or hangs.

### 2. High-Fidelity Supercar Acoustic Engine
- **Authentic Recorded Engine Sounds**: High-definition engine audio integrated across all manufacturer architectures:
  - **Lamborghini**: 6.5L Naturally Aspirated V12 cold start & rev.
  - **Ferrari**: Twin-Turbo V8 / Hybrid high-strung acoustic note.
  - **Porsche**: 4.0L High-revving Flat-6 GT3 engine symphony.
  - **Mercedes-AMG**: Handcrafted 4.0L BiTurbo V8 cross-plane growl.
  - **Aston Martin**: 5.2L Twin-Turbo V12 British Grand Tourer note.
  - **Rolls-Royce**: Stately 6.75L Twin-Turbo V12 silent glide & low rumble.
  - **McLaren & Bugatti**: Quad-turbo W16 & flat-plane V8 acoustics.
- **Ignite Engine Integration**: Mechanical ignition control triggers real exhaust notes, real-time chassis vibration oscillation, and exhaust heat glow.
- **Engine Symphony Deck**: Vehicle detail pages feature interactive 3-track audition players (*Cold Start & Idle*, *High-RPM Throttle Rev*, *Sport+ Track Mode*).

### 3. Inspect & Shop Performance Parts Drawer
- **Archetype 3D Hotspot Matrix**: Interactive markers positioned on powertrain, braking matrix, carbon splitters, and cockpits (mid-engine vs. front-engine vs. rear-engine).
- **Live Upgrades Catalog**: Hotspots launch an integrated drawer with compatible aftermarket components (Akrapovič Evolution Titanium Valved Exhausts, BMC Carbon Intakes, Novitec Stage 3 ECUs) priced in AED with direct routing.

### 4. Apple Glassmorphic Floating Interaction Orbs
- **Dual Decoupled Pucks**:
  - **Left Puck**: Direct WhatsApp VIP Concierge desk with status beacon.
  - **Right Puck**: Apex VIP Concierge live AI assistant with crown insignia.
- **Omnidirectional 2D Dragging**: Both pucks can be dragged anywhere across the screen (X and Y coordinates) with momentum physics, touch-screen gestures, and screen-boundary protection.
- **Integrated VIP Concierge Modal**: Sleek frosted-glass dialogue window with top drag handle for instant showroom inquiries, test drives, and valuations.

### 5. Enterprise Backend & Fleet Management
- **Autonomous Admin CMS**: Centralized management at `/admin` for vehicle inventory, spare parts, leads, appraisals, and site settings.
- **Bi-Directional Google Sheets Sync**: Automated cron worker synchronizing inventory updates with external Google Spreadsheets with safe offline fallback.
- **Canonical Automotive SEO**: Built-in 308 permanent redirects (`/marques` $\to$ `/brands`, `/sell-car` $\to$ `/sell-your-car`, `/vehicles` $\to$ `/inventory`).
- **Security & Hygiene**: Redis-backed rate limiting, honeypot spam protection, JWT secure cookies, and automated database backup routines.

---

## Architecture Overview

```
                      +-----------------------------+
                      |         Nginx 1.25          |
                      |   (SSL, Proxy, Rate-Limit)  |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                                             |
              v                                             v
+-----------------------------+             +-----------------------------+
|     Next.js 14 Frontend     |             |      Node.js Express API    |
|   (App Router, SSR, 3D)     |             |   (REST, JWT, Validation)   |
|         Port 3000           |             |          Port 4000          |
+--------------+--------------+             +--------------+--------------+
               |                                           |
               |                                           v
               |                            +-----------------------------+
               |                            |      PostgreSQL 15 DB       |
               |                            |          Port 5432          |
               |                            +--------------+--------------+
               |                                           |
               +-------------------------------------------+
                               |
                               v
                +-----------------------------+
                |        Redis 7 Cache        |
                |   (BullMQ Worker Queues)    |
                +-----------------------------+
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router, Standalone Output) |
| **3D & Visuals** | Three.js, WebGL, DRACO Loader, Meshopt |
| **Styling & Motion** | Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend API** | Node.js, Express, TypeScript |
| **ORM & Database** | Prisma ORM, PostgreSQL 15 |
| **Caching & Queues** | Redis 7, BullMQ |
| **Containerization** | Docker, Docker Compose |
| **Reverse Proxy** | Nginx 1.25 Alpine (HTTP/2, SSL) |

---

## Quick Start (Docker Production Setup)

### 1. Prerequisites
- Docker Engine $\ge$ 24.0
- Docker Compose $\ge$ 2.20

### 2. Configuration
Copy the environment template and verify your credentials:
```bash
cp .env.example .env
```

### 3. Build & Launch Containers
```bash
# Build and start all 5 core services in background
docker compose up -d --build

# Verify all services are healthy
docker compose ps
```

### 4. Seed Database (Optional)
```bash
# Development demo catalog
docker compose exec api npx prisma db seed

# Production baseline (Admin + Showroom Settings only)
docker compose exec -e NODE_ENV=production api npx prisma db seed
```

### 5. Access Points
- **Client Showroom:** [http://localhost:3000](http://localhost:3000)
- **REST API Health:** [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)
- **Admin CMS Portal:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Database Management (Adminer):** [http://localhost:8080](http://localhost:8080)

---

## Key Routes & Navigation

| Route | Description |
| :--- | :--- |
| `/` | Showroom Hero with 4-engine sound audition, featured inventory, & brand reel |
| `/inventory` | Full luxury catalog with filters (Make, Body Type, Price, Transmission) |
| `/inventory/[slug]` | Vehicle detail page, 3D Studio, Engine Symphony, & spec sheets |
| `/brands` (`/marques`) | Curated supercar and bespoke automotive marques directory |
| `/parts` | High-performance aftermarket upgrades and accessories catalog |
| `/sell-your-car` (`/sell-car`) | Multi-step vehicle appraisal and consignment intake form |
| `/faq` | Showroom purchase policies, export logistics, and financing guide |
| `/contact` | Dubai flagship location, private lounge booking, and direct desk |
| `/admin` | Secure dealership operations dashboard and sync center |

---

## Verification & Automated Testing

The platform includes end-to-end Playwright tests, API unit suites, and accessibility audits:

```bash
# Run API unit and security integration tests
docker compose exec api npm test

# Run frontend TypeScript type-check
npm run type-check --prefix frontend

# Run Playwright 3D Studio verification
node scratch/verify_3d_overhaul_live.js
```

---

## Operational Documentation
- [SETUP.md](SETUP.md) — Comprehensive launch guide, SSL configuration, and environment setup
- [ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) — Dealership staff operating manual
- [OPS_RUNBOOK.md](docs/OPS_RUNBOOK.md) — DevOps runbook, backup procedures, and monitoring

---

## Contact & Support
- **Flagship Location:** Sheikh Zayed Road, Al Quoz Industrial 3, Dubai, UAE
- **VIP Desk:** `+971 50 891 9441`
- **Email:** `sales@showroom.ae`
- **Technical Inquiries:** TechZoetic Solutions — [www.techzoetic.com](https://www.techzoetic.com)

---

## License
Proprietary & Confidential. Built for Apex Luxury Automobiles Showroom Dubai. Unauthorized duplication or redistribution is strictly prohibited.
