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
import faqRoutes       from './routes/faq.routes'
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
  }))
  app.use(cors({
    origin: [env.REVALIDATE_URL.replace('/api/revalidate',''), 'http://localhost:3000'],
    credentials: true,
  }))

  // ─── Parsing + Compression ───────────────────────
  app.use(compression())
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))

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
  app.use('/api/v1/faqs',      faqRoutes)
  app.use('/api/v1/auth',      authRoutes)
  app.use('/api/v1/settings',  settingsRoutes)
  app.use('/api/v1/parts',     partsRoutes)
  app.use('/api/v1/chatbot',   faqRoutes)   // Chatbot reuses FAQ routes
  app.use('/api/v1/admin/media',  mediaRoutes)
  app.use('/api/v1/admin/sync',   syncRoutes)
  app.use('/api/v1/admin',        adminRoutes)

  // ─── API Documentation ────────────────────────────
  setupSwagger(app)

  // ─── Global Error Handler ───────────────────────
  Sentry.setupExpressErrorHandler(app)
  app.use(errorMiddleware)

  return app
}
