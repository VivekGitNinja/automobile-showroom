import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { authMiddleware } from '../middleware/auth.middleware'
import { rbac } from '../middleware/rbac.middleware'
import { z } from 'zod'

const router = Router()

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

// GET /api/v1/parts?category=&search=&make=&condition=&page=&limit=&sort=
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10))
    const limit = Math.min(60, Math.max(1, parseInt(req.query.limit as string || '12', 10)))
    const category = req.query.category as string
    const search = (req.query.search as string || '').trim()
    const make = req.query.make as string
    const condition = req.query.condition as string
    const sort = (req.query.sort as string) || 'displayOrder'

    const where: any = { status: 'PUBLISHED' }
    if (category && category !== 'all') where.category = { slug: category }
    if (condition && condition !== 'all') where.condition = condition.toUpperCase()
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brandName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (make && make !== 'all') {
      // compatibleMakes is a JSON array of make names
      where.compatibleMakes = { array_contains: make }
    }

    const orderBy: any =
      sort === 'price' ? { price: 'asc' } :
      sort === '-price' ? { price: 'desc' } :
      sort === 'name' ? { name: 'asc' } :
      [{ displayOrder: 'asc' }, { name: 'asc' }]

    const [total, parts] = await Promise.all([
      prisma.part.count({ where }),
      prisma.part.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: { category: { select: { name: true, slug: true } } },
      }),
    ])

    res.json({
      data: parts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/parts/categories — nav + filter data with live counts
router.get('/categories', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.partCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { parts: { where: { status: 'PUBLISHED' } } } },
      },
    })
    res.json({
      data: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        displayOrder: c.displayOrder,
        count: c._count.parts,
      })),
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/parts/admin/all — includes drafts & archived
// (registered before /:slug so "admin" is not captured as a slug)
router.get('/admin/all', authMiddleware, rbac('viewer'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10))
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string || '100', 10)))
    const search = (req.query.search as string || '').trim()
    const status = req.query.status as string

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brandName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, parts, stats] = await Promise.all([
      prisma.part.count({ where }),
      prisma.part.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: { category: { select: { name: true, slug: true } } },
      }),
      prisma.part.groupBy({ by: ['status'], _count: { id: true } }),
    ])

    const statusCounts: Record<string, number> = {}
    for (const s of stats) statusCounts[s.status] = s._count.id

    res.json({
      data: parts,
      stats: statusCounts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/parts/:slug — detail
router.get('/:slug', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const part = await prisma.part.findFirst({
      where: { slug: req.params.slug, status: { not: 'ARCHIVED' } },
      include: { category: { select: { name: true, slug: true } } },
    })
    if (!part) {
      res.status(404).json({ error: 'Part not found' })
      return
    }
    const related = await prisma.part.findMany({
      where: { status: 'PUBLISHED', categoryId: part.categoryId, id: { not: part.id } },
      take: 4,
      orderBy: { displayOrder: 'asc' },
      include: { category: { select: { name: true, slug: true } } },
    })
    res.json({ data: { ...part, related } })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// Admin CRUD (staff-managed catalog, no code changes)
// ---------------------------------------------------------------------------

const partSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid().nullable().optional(),
  brandName: z.string().nullable().optional(),
  compatibleMakes: z.array(z.string()).optional(),
  condition: z.enum(['NEW', 'REFURBISHED', 'USED']).default('NEW'),
  price: z.number().nonnegative(),
  currency: z.string().default('AED'),
  stockQty: z.number().int().nonnegative().default(0),
  imageUrl: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  displayOrder: z.number().int().default(0),
})

const partUpdateSchema = partSchema.partial()

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base
  let n = 2
  while (await prisma.part.findFirst({ where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) } })) {
    slug = `${base}-${n++}`
  }
  return slug
}

// POST /api/v1/parts — create
router.post('/', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = partSchema.parse(req.body)
    const slug = await uniqueSlug(data.slug || slugify(`${data.name}-${data.sku}`))
    const part = await prisma.part.create({ data: { ...data, slug }, include: { category: true } })
    res.status(201).json({ data: part })
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'A part with this SKU already exists' })
      return
    }
    next(err)
  }
})

// PUT /api/v1/parts/:id — update
router.put('/:id', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = partUpdateSchema.parse(req.body)
    const existing = await prisma.part.findUnique({ where: { id: req.params.id } })
    if (!existing) {
      res.status(404).json({ error: 'Part not found' })
      return
    }
    const part = await prisma.part.update({
      where: { id: existing.id },
      data,
      include: { category: true },
    })
    res.json({ data: part })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Part not found' })
      return
    }
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'A part with this SKU already exists' })
      return
    }
    next(err)
  }
})

// DELETE /api/v1/parts/:id
router.delete('/:id', authMiddleware, rbac('admin'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.part.delete({ where: { id: req.params.id } })
    res.json({ message: 'Part deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Part not found' })
      return
    }
    next(err)
  }
})

// ---------------------------------------------------------------------------
// Part categories admin CRUD
// ---------------------------------------------------------------------------

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

router.post('/categories', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = categorySchema.parse(req.body)
    const slug = data.slug || slugify(data.name)
    const category = await prisma.partCategory.create({ data: { ...data, slug } })
    res.status(201).json({ data: category })
  } catch (err) {
    next(err)
  }
})

router.put('/categories/:id', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = categorySchema.partial().parse(req.body)
    const category = await prisma.partCategory.update({ where: { id: req.params.id }, data })
    res.json({ data: category })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    next(err)
  }
})

router.delete('/categories/:id', authMiddleware, rbac('admin'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const partsCount = await prisma.part.count({ where: { categoryId: req.params.id } })
    if (partsCount > 0) {
      res.status(409).json({ error: `Category still has ${partsCount} parts — move or delete them first` })
      return
    }
    await prisma.partCategory.delete({ where: { id: req.params.id } })
    res.json({ message: 'Category deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' })
      return
    }
    next(err)
  }
})

export default router
