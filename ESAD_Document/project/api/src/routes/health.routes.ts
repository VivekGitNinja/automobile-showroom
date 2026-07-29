import { Router } from 'express'
import { prisma } from '../config/database'
import { redisClient } from '../config/redis'
import { env } from '../config/env'

const router = Router()

router.get('/', async (_req, res): Promise<void> => {
  let dbStatus = 'down'
  let redisStatus = 'down'

  let hasError = false
  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'up'
  } catch (err) {
    dbStatus = 'down'
    hasError = true
  }

  try {
    if (redisClient.status === 'ready' || redisClient.status === 'connecting') {
      redisStatus = 'up'
    } else {
      redisStatus = 'down'
      hasError = true
    }
  } catch (err) {
    redisStatus = 'down'
    hasError = true
  }

  res.status(hasError ? 503 : 200).json({
    status: hasError ? 'unhealthy' : 'healthy',
    timestamp: new Date().toISOString(),
    version: env.APP_VERSION,
    environment: env.NODE_ENV,
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  })
})

export default router
