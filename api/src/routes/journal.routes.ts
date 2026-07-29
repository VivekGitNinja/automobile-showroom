import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'

const router = Router()

// GET /api/v1/journals
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const journals = await prisma.journal.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 3
    })

    res.json({ data: journals })
  } catch (err) {
    next(err)
  }
})

export default router
