import { Worker } from 'bullmq'
import { prisma } from '../config/database'
import { redisClient } from '../config/redis'
import { logger } from '../utils/logger'
import { googleSheetsService } from '../services/googleSheets.service'

const connection = { host: redisClient.options.host, port: redisClient.options.port }

const syncWorker = new Worker('sync', async (job) => {
  logger.info(`Processing sync job ${job.id}`)
  await googleSheetsService.syncInventory()
  return { success: true }
}, { connection })

syncWorker.on('failed', (job: any, err: any) => {
  logger.error(`Sync Job ${job?.id} failed with error ${err.message}`)
})

const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down sync worker gracefully`)
  await syncWorker.close()
  await prisma.$disconnect()
  await redisClient.quit()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

logger.info('Sync worker started')
