import { createApp } from './app'
import { env } from './config/env'
import { logger } from './utils/logger'
import { prisma } from './config/database'
import { redisClient } from './config/redis'
import { startSyncScheduler } from './jobs/syncScheduler'
import { notificationWorker } from './config/bullmq'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
})

async function bootstrap() {
  // Validate DB and Redis connections
  try {
    await prisma.$connect()
    logger.info('PostgreSQL connected')
  } catch (err: any) {
    logger.warn(`PostgreSQL connection offline: ${err?.message || err}`)
  }

  try {
    await redisClient.connect()
    logger.info('Redis connected')
  } catch (err: any) {
    logger.warn(`Redis connection offline: ${err?.message || err}`)
  }

  const app = createApp()
  const port = parseInt(env.PORT, 10)

  app.listen(port, () => {
    logger.info(`API server running on port ${port} [${env.NODE_ENV}]`)
    logger.info(`Version: ${env.APP_VERSION}`)
  })

  // Start cron scheduler for Google Sheets sync
  if (env.NODE_ENV === 'production') {
    startSyncScheduler()
    logger.info(`Sync scheduler started: ${env.SYNC_CRON_SCHEDULE}`)
  }

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`)
    await notificationWorker.close()
    await prisma.$disconnect()
    await redisClient.quit()
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
