import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { redisClient } from '../config/redis'

const store = () => {
  if (process.env.NODE_ENV === 'test') {
    return undefined
  }
  return new RedisStore({
    sendCommand: async (...args: string[]): Promise<any> => {
      return redisClient.call(args[0], ...args.slice(1))
    },
  })
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
