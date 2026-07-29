import { logger } from '../utils/logger'
import cron from 'node-cron'
import { googleSheetsService } from '../services/googleSheets.service'

export function startSyncScheduler() {
  logger.info('Sync scheduler initialized')
  cron.schedule('0 3 * * *', async () => {
    logger.info('Running daily inventory sync...')
    await googleSheetsService.syncInventory()
  })
}
