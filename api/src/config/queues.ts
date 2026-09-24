import { Queue } from 'bullmq'
import { redisConnectionOptions } from './redis'

const connection = redisConnectionOptions

export const syncQueue = new Queue('sync', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 60000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
})
