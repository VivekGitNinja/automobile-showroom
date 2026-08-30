import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'

const router = Router()

// GET /api/v1/journals?limit=3 — published posts, newest first
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string || '50', 10)))
    const journals = await prisma.journal.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    res.json({ data: journals })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/journals/:slug — single published post by slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const journal = await prisma.journal.findFirst({
      where: { slug: req.params.slug, status: 'PUBLISHED' },
    })

    if (!journal) {
      res.status(404).json({ error: 'Article not found' })
      return
    }

    res.json({ data: journal })
  } catch (err) {
    next(err)
  }
})

export default router
