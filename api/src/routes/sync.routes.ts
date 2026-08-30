import { Router, Request, Response, NextFunction } from 'express'
import { googleSheetsService } from '../services/googleSheets.service'
import { prisma } from '../config/database'
import { authMiddleware } from '../middleware/auth.middleware'
import { rbac } from '../middleware/rbac.middleware'

const router = Router()

router.use(authMiddleware, rbac('admin'))

/**
 * POST /api/v1/admin/sync
 * Triggers Google Sheets Inventory Sync.
 * 400 when the integration is not configured (operator-fixable),
 * 500 when a configured sync actually fails.
 */
router.post('/', async (_req: Request, res: Response) => {
  const result = await googleSheetsService.syncInventory()

  if (!result.success && result.processedCount === 0 && /not configured/i.test(result.message)) {
    res.status(400).json({
      status: 'error',
      data: result,
    })
    return
  }

  res.status(result.success ? 200 : 500).json({
    status: result.success ? 'success' : 'error',
    data: result,
  })
})

/**
 * GET /api/v1/admin/sync/status
 * Returns sync configuration status (covers both env contracts)
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    configured: googleSheetsService.isConfigured(),
    spreadsheetConfigured: Boolean(process.env.GOOGLE_SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID),
    serviceAccountJsonConfigured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    serviceAccountPairConfigured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY),
    sheetName: process.env.GOOGLE_SHEET_NAME || 'Inventory',
  })
})

/**
 * GET /api/v1/admin/sync/logs
 * Fetches the last 20 SyncLog records
 */
router.get('/logs', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await prisma.syncLog.findMany({
      take: 20,
      orderBy: { startedAt: 'desc' },
    })
    res.json({ data: logs })
  } catch (err) {
    next(err)
  }
})

export default router
