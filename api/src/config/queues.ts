import { Queue } from 'bullmq'
import { redisClient } from './redis'

const connection = { host: redisClient.options.host, port: redisClient.options.port }

export const syncQueue = new Queue('sync', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 60000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
})
