import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { redisClient } from '../config/redis'

// Use the Redis store in production (docker-compose always provides Redis so
// limits are shared across API instances); fall back to the in-memory store in
// dev/offline mode where Redis may never connect.
const store = () => {
  if (process.env.NODE_ENV === 'production') {
    return new RedisStore({ sendCommand: (...args: any[]) => (redisClient as any).sendCommand(args) })
  }
  return undefined
}

export const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  store: store(),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
})

export const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  store: store(),
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Submission limit reached. Please wait before trying again.' } },
})

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  store: store(),
  skipSuccessfulRequests: true,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many login attempts. Try again in 15 minutes.' } },
})

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  store: store(),
})
