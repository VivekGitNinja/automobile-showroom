import IORedis from 'ioredis'
import { env } from './env'

export const redisClient = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
})

redisClient.on('connect', () => console.log('Redis connected'))
redisClient.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Redis error:', err.message)
  }
})

export const redisConnectionOptions = {
  host: redisClient.options.host,
  port: redisClient.options.port,
  password: redisClient.options.password,
  username: redisClient.options.username,
  tls: redisClient.options.tls,
}

export default redisClient
