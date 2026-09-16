import path from 'path'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import { logger } from './utils/logger'
import { env } from './config/env'
import * as Sentry from '@sentry/node'
import { setupSwagger } from './config/swagger'

// Routes
import vehicleRoutes   from './routes/vehicle.routes'
import leadRoutes      from './routes/lead.routes'
import faqRoutes, { faqCategoryRouter } from './routes/faq.routes'
import authRoutes      from './routes/auth.routes'
import mediaRoutes     from './routes/media.routes'
import syncRoutes      from './routes/sync.routes'
import adminRoutes     from './routes/admin.routes'
import healthRoutes    from './routes/health.routes'
import journalRoutes   from './routes/journal.routes'
import settingsRoutes  from './routes/settings.routes'
import partsRoutes     from './routes/parts.routes'

// Middleware
import { errorMiddleware } from './middleware/error.middleware'
import { publicLimiter }   from './middleware/rateLimit.middleware'

export function createApp() {
  const app = express()

  // ─── Security ───────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false,  // Managed by Nginx/Cloudflare
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }))
  const allowedOrigins = [
    env.REVALIDATE_URL.replace('/api/revalidate', ''),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1',
    'https://showroom.ae',
    'https://www.showroom.ae',
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[]

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.some(ao => origin === ao || origin.startsWith(ao)) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true,
  }))

  // ─── Parsing + Compression ───────────────────────
  app.use(compression())
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))

  // ─── Static Uploads ──────────────────────────────
  app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), { maxAge: '30d', immutable: true }))

  // ─── Logging ────────────────────────────────────
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.url === '/api/v1/health',
  }))

  // ─── Rate Limiting (public) ─────────────────────
  app.use('/api/v1', publicLimiter)

  // ─── Routes ─────────────────────────────────────
  app.use('/api/v1/health',    healthRoutes)
  app.use('/api/v1/vehicles',  vehicleRoutes)
  app.use('/api/v1/journals',  journalRoutes)
  app.use('/api/v1/leads',     leadRoutes)
  app.use('/api/v1/faqs',           faqRoutes)
  app.use('/api/v1/faq-categories', faqCategoryRouter)
  app.use('/api/v1/auth',           authRoutes)
  app.use('/api/v1/settings',  settingsRoutes)
  app.use('/api/v1/parts',     partsRoutes)
  app.use('/api/v1/chatbot',   faqRoutes)   // Chatbot reuses FAQ routes
  app.use('/api/v1/admin/media',  mediaRoutes)
  app.use('/api/v1/admin/sync',   syncRoutes)
  app.use('/api/v1/admin',        adminRoutes)

  // ─── API Documentation ────────────────────────────
  setupSwagger(app)

  // ─── Root & API Index Landing ─────────────────────
  const apiIndexHandler = (req: express.Request, res: express.Response): void => {
    if (req.accepts('html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Luxury Automobiles — API</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #060608;
      color: #E2E6EA;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #0E0E12;
      border: 1px solid rgba(201, 162, 39, 0.25);
      border-radius: 16px;
      max-width: 620px;
      width: 100%;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10B981;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }
    h1 {
      font-family: Georgia, serif;
      font-size: 32px;
      color: #FFFFFF;
      margin-bottom: 10px;
      letter-spacing: -0.01em;
    }
    .gold { color: #C9A227; }
    p {
      color: #9CA3AF;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-gold {
      background: #C9A227;
      color: #060608;
    }
    .btn-gold:hover {
      background: #dfb738;
      box-shadow: 0 0 16px rgba(201, 162, 39, 0.4);
    }
    .btn-outline {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
    }
    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(201, 162, 39, 0.5);
      color: #C9A227;
    }
    .endpoints {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
    }
    .endpoints h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #6B7280;
      margin-bottom: 12px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .endpoint-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      color: #D1D5DB;
      text-decoration: none;
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      transition: all 0.15s;
    }
    .endpoint-link:hover {
      border-color: #C9A227;
      color: #C9A227;
      background: rgba(201, 162, 39, 0.05);
    }
    .method {
      font-size: 10px;
      font-weight: 700;
      color: #10B981;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="dot"></span>
      API Online & Healthy
    </div>
    <h1>Apex <span class="gold">Automobiles</span></h1>
    <p>Luxury Showroom REST Engine v${env.APP_VERSION || '1.0.0'}. Serving inventory, 3D assets, spare parts, lead generation, and authentication.</p>
    
    <div class="actions">
      <a href="/docs" class="btn btn-gold">Interactive API Docs (Swagger) →</a>
      <a href="http://localhost:3000" class="btn btn-outline" target="_blank">Open Showroom Frontend ↗</a>
      <a href="/api/v1/health" class="btn btn-outline">Health Check</a>
    </div>

    <div class="endpoints">
      <h3>Core API Endpoints</h3>
      <div class="grid">
        <a href="/api/v1/vehicles" class="endpoint-link">
          <span>/api/v1/vehicles</span>
          <span class="method">GET</span>
        </a>
        <a href="/api/v1/parts" class="endpoint-link">
          <span>/api/v1/parts</span>
          <span class="method">GET</span>
        </a>
        <a href="/api/v1/journals" class="endpoint-link">
          <span>/api/v1/journals</span>
          <span class="method">GET</span>
        </a>
        <a href="/api/v1/faqs" class="endpoint-link">
          <span>/api/v1/faqs</span>
          <span class="method">GET</span>
        </a>
      </div>
    </div>
  </div>
</body>
</html>`)
      return
    }

    res.json({
      name: 'Apex Luxury Automobiles REST API',
      version: env.APP_VERSION || '1.0.0',
      status: 'online',
      docs: '/docs',
      health: '/api/v1/health',
      frontend: 'http://localhost:3000',
      endpoints: {
        vehicles: '/api/v1/vehicles',
        parts: '/api/v1/parts',
        journals: '/api/v1/journals',
        faqs: '/api/v1/faqs',
        settings: '/api/v1/settings',
      },
    })
  }

  app.get('/', apiIndexHandler)
  app.get('/api', apiIndexHandler)
  app.get('/api/v1', apiIndexHandler)

  // ─── Global Error Handler ───────────────────────
  Sentry.setupExpressErrorHandler(app)
  app.use(errorMiddleware)

  return app
}
