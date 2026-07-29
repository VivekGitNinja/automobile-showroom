import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { authMiddleware } from '../middleware/auth.middleware'
import { rbac } from '../middleware/rbac.middleware'
import { z } from 'zod'

const router = Router()

// GET /api/v1/vehicles
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10)
    const limit = parseInt(req.query.limit as string || '12', 10)
    const brand = req.query.brand as string
    const make = req.query.make as string
    const featured = req.query.featured === 'true'
    
    // New query parameters
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : undefined
    const fuelType = req.query.fuelType as string
    const transmission = req.query.transmission as string
    const search = req.query.search as string
    const sort = req.query.sort as string || '-createdAt'

    const where: any = {
      status: 'published',
      deletedAt: null,
    }

    if (featured) {
      where.isFeatured = true
    }

    if (make && make !== 'All') {
      where.make = { equals: make, mode: 'insensitive' }
    }

    if (brand) {
      where.brand = { slug: brand }
    }
    
    if (maxPrice) {
      where.price = { lte: maxPrice }
    }
    
    if (fuelType && fuelType !== 'All') {
      where.fuelType = { equals: fuelType, mode: 'insensitive' }
    }
    
    if (transmission && transmission !== 'All') {
      where.transmission = { equals: transmission, mode: 'insensitive' }
    }
    
    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Determine sorting
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price') orderBy = { price: 'asc' }
    else if (sort === '-price') orderBy = { price: 'desc' }
    else if (sort === 'year') orderBy = { year: 'asc' }
    else if (sort === '-year') orderBy = { year: 'desc' }
    else if (sort === 'mileage') orderBy = { mileage: 'asc' }
    else if (sort === '-mileage') orderBy = { mileage: 'desc' }

    const total = await prisma.vehicle.count({ where })
    const vehicles = await prisma.vehicle.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        brand: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        hotspots: {
          orderBy: { displayOrder: 'asc' }
        },
        specConfigs: {
          orderBy: { displayOrder: 'asc' }
        }
      },
    })

    res.json({
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/vehicles/featured
router.get('/featured', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: 'published',
        isFeatured: true,
        deletedAt: null,
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: true,
        images: { orderBy: { displayOrder: 'asc' } },
        hotspots: { orderBy: { displayOrder: 'asc' } },
        specConfigs: { orderBy: { displayOrder: 'asc' } }
      },
    })
    res.json({ data: vehicles })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/vehicles/:slug
router.get('/:slug', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params
    const vehicle = await prisma.vehicle.findFirst({
      where: { slug, deletedAt: null },
      include: {
        brand: true,
        images: { orderBy: { displayOrder: 'asc' } },
        hotspots: { orderBy: { displayOrder: 'asc' } },
        specConfigs: { orderBy: { displayOrder: 'asc' } }
      },
    })

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' })
      return
    }

    res.json({ data: vehicle })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/vehicles
router.post('/', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { make, model, year, price, transmission, status, slug } = req.body
    
    // Quick validation
    if (!make || !model || !year) {
      res.status(400).json({ error: 'Make, model, and year are required' })
      return
    }

    const vehicleSlug = slug || `${make}-${model}-${year}`.toLowerCase().replace(/\s+/g, '-')

    const vehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        year: parseInt(year, 10),
        price: price ? parseInt(price, 10) : 0,
        transmission: transmission || 'automatic',
        status: status || 'published',
        slug: vehicleSlug,
        mileage: '0',
        fuelType: 'petrol',
        exteriorColor: 'Black',
        interiorColor: 'Black',
      },
    })

    res.status(201).json({ data: vehicle })
  } catch (err) {
    next(err)
  }
})

const updateVehicleSchema = z.object({
  brandId: z.string().uuid().nullable().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  trim: z.string().nullable().optional(),
  year: z.number().int().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  mileage: z.string().nullable().optional(),
  transmission: z.string().nullable().optional(),
  fuelType: z.string().nullable().optional(),
  bodyType: z.string().nullable().optional(),
  exteriorColor: z.string().nullable().optional(),
  interiorColor: z.string().nullable().optional(),
  engine: z.string().nullable().optional(),
  doors: z.number().int().optional(),
  description: z.string().nullable().optional(),
  specsJson: z.any().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'unpublished', 'archived']).optional(),
})

// PUT /api/v1/vehicles/:id
router.put('/:id', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const data = updateVehicleSchema.parse(req.body)

    const existing = await prisma.vehicle.findFirst({
      where: { OR: [{ id: id }, { slug: id }] },
    })

    if (!existing) {
      res.status(404).json({ error: 'Vehicle not found' })
      return
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: existing.id },
      data,
      include: { brand: true, images: true, hotspots: true, specConfigs: true },
    })

    res.json({ data: vehicle })
  } catch (err: any) {
    next(err)
  }
})

// DELETE /api/v1/vehicles/:id
router.delete('/:id', authMiddleware, rbac('admin'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params

    const existing = await prisma.vehicle.findFirst({
      where: { OR: [{ id: id }, { slug: id }] },
    })

    if (!existing) {
      res.status(404).json({ error: 'Vehicle not found' })
      return
    }

    await prisma.vehicle.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        status: 'archived',
      },
    })
    res.json({ success: true, message: 'Vehicle archived' })
  } catch (err: any) {
    next(err)
  }
})

// ─── Hotspot Sub-Resource CRUD ──────────────────────────────────────────

const hotspotSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().default(''),
  details: z.string().optional().default(''),
  stat: z.string().optional().default(''),
  xPosition: z.number(),
  yPosition: z.number(),
  iconType: z.string().optional().default('default'),
  partImageUrl: z.string().nullable().optional(),
  displayOrder: z.number().int().optional().default(0),
})

// POST /api/v1/vehicles/:id/hotspots
router.post('/:id/hotspots', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const data = hotspotSchema.parse(req.body)

    const vehicle = await prisma.vehicle.findFirst({
      where: { OR: [{ id: id }, { slug: id }] },
    })

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' })
      return
    }

    const hotspot = await prisma.vehicleHotspot.create({
      data: {
        vehicleId: vehicle.id,
        ...data,
      },
    })

    res.status(201).json({ data: hotspot })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/vehicles/:id/hotspots/:hotspotId
router.delete('/:id/hotspots/:hotspotId', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { hotspotId } = req.params

    await prisma.vehicleHotspot.delete({
      where: { id: hotspotId },
    })

    res.json({ success: true, message: 'Hotspot deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Hotspot not found' })
      return
    }
    next(err)
  }
})

// ─── Spec Config Sub-Resource CRUD ─────────────────────────────────────

const specSchema = z.object({
  name: z.string().min(1),
  hexColor: z.string().min(1),
  imageUrl: z.string().min(1),
  displayOrder: z.number().int().optional().default(0),
})

const updateSpecSchema = z.object({
  name: z.string().optional(),
  hexColor: z.string().optional(),
  imageUrl: z.string().optional(),
  displayOrder: z.number().int().optional(),
})

// POST /api/v1/vehicles/:id/specs
router.post('/:id/specs', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const data = specSchema.parse(req.body)

    const vehicle = await prisma.vehicle.findFirst({
      where: { OR: [{ id: id }, { slug: id }] },
    })

    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' })
      return
    }

    const spec = await prisma.vehicleSpecConfig.create({
      data: {
        vehicleId: vehicle.id,
        ...data,
      },
    })

    res.status(201).json({ data: spec })
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/vehicles/:id/specs/:specId
router.put('/:id/specs/:specId', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { specId } = req.params
    const data = updateSpecSchema.parse(req.body)

    const spec = await prisma.vehicleSpecConfig.update({
      where: { id: specId },
      data,
    })

    res.json({ data: spec })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Spec config not found' })
      return
    }
    next(err)
  }
})

// DELETE /api/v1/vehicles/:id/specs/:specId
router.delete('/:id/specs/:specId', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { specId } = req.params

    await prisma.vehicleSpecConfig.delete({
      where: { id: specId },
    })

    res.json({ success: true, message: 'Spec config deleted' })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Spec config not found' })
      return
    }
    next(err)
  }
})

export default router
