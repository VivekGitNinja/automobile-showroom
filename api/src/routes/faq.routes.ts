import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { authMiddleware } from '../middleware/auth.middleware'
import { rbac } from '../middleware/rbac.middleware'
import { z } from 'zod'

const router = Router()

// GET /api/v1/faqs
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.faqCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        faqs: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    })
    res.json({ data: categories })
  } catch (err) {
    next(err)
  }
})

const faqCategorySchema = z.object({
  label: z.string(),
  slug: z.string(),
  icon: z.string().optional(),
  displayOrder: z.number().optional(),
})

const faqCategoryUpdateSchema = faqCategorySchema.partial()

// POST /api/v1/faq-categories
router.post('/faq-categories', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = faqCategorySchema.parse(req.body)
    const category = await prisma.faqCategory.create({ data })
    res.status(201).json({ data: category })
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/faq-categories/:id
router.put('/faq-categories/:id', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const data = faqCategoryUpdateSchema.parse(req.body)
    const category = await prisma.faqCategory.update({ where: { id }, data })
    res.json({ data: category })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    next(err)
  }
})

// DELETE /api/v1/faq-categories/:id
router.delete('/faq-categories/:id', authMiddleware, rbac('admin'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.faqCategory.delete({ where: { id } })
    res.json({ success: true, message: 'Category deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    next(err)
  }
})

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
  categoryId: z.string().uuid().optional(),
  keywords: z.array(z.string()).optional(),
  displayOrder: z.number().optional(),
})

const faqUpdateSchema = faqSchema.partial()

// POST /api/v1/faqs
router.post('/', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = faqSchema.parse(req.body)
    const faq = await prisma.faq.create({ data })
    res.status(201).json({ data: faq })
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/faqs/:id
router.put('/:id', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const data = faqUpdateSchema.parse(req.body)
    const faq = await prisma.faq.update({ where: { id }, data })
    res.json({ data: faq })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'FAQ not found' })
      return
    }
    next(err)
  }
})

// DELETE /api/v1/faqs/:id
router.delete('/:id', authMiddleware, rbac('admin'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.faq.delete({ where: { id } })
    res.json({ success: true, message: 'FAQ deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'FAQ not found' })
      return
    }
    next(err)
  }
})

export default router
