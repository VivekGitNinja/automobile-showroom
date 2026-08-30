import { logger } from '../utils/logger'
import cron from 'node-cron'
import { env } from '../config/env'
import { googleSheetsService } from '../services/googleSheets.service'
import { syncQueue } from '../config/queues'

export function startSyncScheduler() {
  logger.info(`Sync scheduler initialized with schedule "${env.SYNC_CRON_SCHEDULE}"`)
  cron.schedule(env.SYNC_CRON_SCHEDULE, async () => {
    logger.info('Running scheduled inventory sync...')
    try {
      // Prefer the dedicated sync worker (docker-compose "sync-worker" service).
      await syncQueue.add('inventory_sync', { triggeredBy: 'cron' }, {
        jobId: `sync-${Date.now()}`,
      })
      logger.info('Sync job enqueued to BullMQ sync queue')
    } catch (err: any) {
      // No Redis/queue available — run the sync inline so the schedule still holds.
      logger.warn(`Sync queue unavailable (${err?.message}); running sync inline`)
      try {
        await googleSheetsService.syncInventory()
      } catch (syncErr: any) {
        logger.error(`Inline sync failed: ${syncErr?.message}`)
      }
    }
  })
}
