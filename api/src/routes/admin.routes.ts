import { Router, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import { prisma } from '../config/database'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { rbac } from '../middleware/rbac.middleware'
import { z } from 'zod'

const router = Router()

// Configure multer to save directly to the frontend public directory
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // The path should be relative to the api directory pointing to frontend/public/uploads
    const uploadPath = path.join(__dirname, '../../../frontend/public/uploads')
    cb(null, uploadPath)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

const upload = multer({ storage })

// ------------------------------------------------------------------
// GET /api/v1/admin/vehicles
// Full fleet view for the CMS — includes drafts, archived and soft-deleted
// vehicles plus aggregate counts for the dashboard stat cards.
// ------------------------------------------------------------------
router.get(
  '/vehicles',
  authMiddleware,
  rbac('viewer'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string || '1', 10))
      const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string || '100', 10)))
      const search = (req.query.search as string || '').trim()
      const status = req.query.status as string | undefined

      const where: any = {}
      if (status && status !== 'all') where.status = status
      if (search) {
        where.OR = [
          { make: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { sheetRowId: { contains: search, mode: 'insensitive' } },
        ]
      }

      const [total, publishedCount, draftCount, archivedCount, vehicles] = await Promise.all([
        prisma.vehicle.count({ where }),
        prisma.vehicle.count({ where: { ...where, status: 'published' } }),
        prisma.vehicle.count({ where: { ...where, status: 'draft' } }),
        prisma.vehicle.count({ where: { ...where, deletedAt: { not: null } } }),
        prisma.vehicle.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          include: {
            brand: true,
            images: { orderBy: { displayOrder: 'asc' } },
          },
        }),
      ])

      res.json({
        data: vehicles,
        stats: {
          total,
          published: publishedCount,
          draft: draftCount,
          archived: archivedCount,
        },
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    } catch (err) {
      next(err)
    }
  }
)

// ------------------------------------------------------------------
// GET /api/v1/admin/leads
// Lead pipeline for the sales team, newest first, optional type filter.
// ------------------------------------------------------------------
router.get(
  '/leads',
  authMiddleware,
  rbac('viewer'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string || '1', 10))
      const limit = Math.min(500, Math.max(1, parseInt(req.query.limit as string || '200', 10)))
      const leadType = req.query.leadType as string | undefined
      const status = req.query.status as string | undefined

      const where: any = {}
      if (leadType && leadType !== 'all') where.leadType = leadType
      if (status && status !== 'all') where.status = status

      const [total, newCount, convertedCount, leads] = await Promise.all([
        prisma.lead.count({ where }),
        prisma.lead.count({ where: { ...where, status: 'new' } }),
        prisma.lead.count({ where: { ...where, status: 'converted' } }),
        prisma.lead.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            vehicle: { select: { id: true, make: true, model: true, year: true, slug: true } },
          },
        }),
      ])

      res.json({
        data: leads,
        stats: { total, new: newCount, converted: convertedCount },
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    } catch (err) {
      next(err)
    }
  }
)

const leadAssignSchema = z.object({
  assignedTo: z.string().uuid(),
})

// ------------------------------------------------------------------
// PUT /api/v1/admin/leads/:id/assign — assign a lead to a sales rep
// ------------------------------------------------------------------
router.put(
  '/leads/:id/assign',
  authMiddleware,
  rbac('editor'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = leadAssignSchema.parse(req.body)
      const lead = await prisma.lead.update({
        where: { id: req.params.id },
        data: { assignedTo: data.assignedTo },
      })
      res.json({ data: lead })
    } catch (err: any) {
      if (err.code === 'P2025') {
        res.status(404).json({ error: 'Lead not found' })
        return
      }
      next(err)
    }
  }
)

const leadNoteSchema = z.object({
  note: z.string().min(1),
})

// ------------------------------------------------------------------
// POST /api/v1/admin/leads/:id/notes — append a note to the lead's history
// ------------------------------------------------------------------
router.post(
  '/leads/:id/notes',
  authMiddleware,
  rbac('editor'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = leadNoteSchema.parse(req.body)
      const lead = await prisma.lead.findUnique({ where: { id: req.params.id } })
      if (!lead) {
        res.status(404).json({ error: 'Lead not found' })
        return
      }
      const metadata = (lead.metadata as any) || {}
      const notes = Array.isArray(metadata.notes) ? metadata.notes : []
      const newNote = {
        note: data.note,
        authorId: (req as any).user?.id || null,
        createdAt: new Date().toISOString(),
      }
      const updated = await prisma.lead.update({
        where: { id: lead.id },
        data: { metadata: { ...metadata, notes: [...notes, newNote] } },
      })
      const resultNotes = ((updated.metadata as any)?.notes || [])
      res.json({ note: resultNotes[resultNotes.length - 1] })
    } catch (err) {
      next(err)
    }
  }
)

const sellCarStatusSchema = z.object({
  status: z.enum(['new', 'reviewing', 'offer_made', 'accepted', 'rejected']),
})

// ------------------------------------------------------------------
// GET /api/v1/admin/leads/sell-car — "Sell your car" inbox
// ------------------------------------------------------------------
router.get(
  '/leads/sell-car',
  authMiddleware,
  rbac('viewer'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string || '1', 10))
      const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string || '100', 10)))
      const status = req.query.status as string | undefined

      const where: any = {}
      if (status && status !== 'all') where.status = status

      const [total, submissions] = await Promise.all([
        prisma.sellCarSubmission.count({ where }),
        prisma.sellCarSubmission.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
      ])

      res.json({
        data: submissions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    } catch (err) {
      next(err)
    }
  }
)

// ------------------------------------------------------------------
// PUT /api/v1/admin/leads/sell-car/:id — move a sell-car submission
// ------------------------------------------------------------------
router.put(
  '/leads/sell-car/:id',
  authMiddleware,
  rbac('editor'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = sellCarStatusSchema.parse(req.body)
      const submission = await prisma.sellCarSubmission.update({
        where: { id: req.params.id },
        data,
      })
      res.json({ data: submission })
    } catch (err: any) {
      if (err.code === 'P2025') {
        res.status(404).json({ error: 'Submission not found' })
        return
      }
      next(err)
    }
  }
)

const leadStatusSchema = z.object({
  status: z.enum(['new', 'notified', 'notification_failed', 'contacted', 'qualified', 'converted', 'lost', 'follow_up']),
  assignedTo: z.string().uuid().optional(),
})

// ------------------------------------------------------------------
// PUT /api/v1/admin/leads/:id/status
// Move a lead through the sales pipeline.
// ------------------------------------------------------------------
router.put(
  '/leads/:id/status',
  authMiddleware,
  rbac('editor'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = leadStatusSchema.parse(req.body)
      const lead = await prisma.lead.update({
        where: { id: req.params.id },
        data: {
          status: data.status,
          ...(data.assignedTo ? { assignedTo: data.assignedTo } : {}),
        },
        include: {
          vehicle: { select: { id: true, make: true, model: true, year: true, slug: true } },
        },
      })
      res.json({ data: lead })
    } catch (err: any) {
      if (err.code === 'P2025') {
        res.status(404).json({ error: 'Lead not found' })
        return
      }
      next(err)
    }
  }
)

// ------------------------------------------------------------------
// GET /api/v1/admin/sell-car-submissions
// "Sell your car" inbox for the acquisition team.
// ------------------------------------------------------------------
router.get(
  '/sell-car-submissions',
  authMiddleware,
  rbac('viewer'),
  async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submissions = await prisma.sellCarSubmission.findMany({
        take: 200,
        orderBy: { createdAt: 'desc' },
      })
      res.json({ data: submissions })
    } catch (err) {
      next(err)
    }
  }
)

// ------------------------------------------------------------------
// GET /api/v1/admin/stats — dashboard overview in one call
// ------------------------------------------------------------------
router.get(
  '/stats',
  authMiddleware,
  rbac('viewer'),
  async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [totalVehicles, publishedVehicles, totalLeads, newLeads, convertedLeads, sellCarSubmissions, lastSync] =
        await Promise.all([
          prisma.vehicle.count(),
          prisma.vehicle.count({ where: { status: 'published', deletedAt: null } }),
          prisma.lead.count(),
          prisma.lead.count({ where: { status: 'new' } }),
          prisma.lead.count({ where: { status: 'converted' } }),
          prisma.sellCarSubmission.count(),
          prisma.syncLog.findFirst({ orderBy: { startedAt: 'desc' } }),
        ])

      res.json({
        data: {
          totalVehicles,
          publishedVehicles,
          totalLeads,
          newLeads,
          convertedLeads,
          sellCarSubmissions,
          lastSync,
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// ------------------------------------------------------------------
// POST /api/v1/admin/vehicles/:id/upload-asset
// Uploads a real asset for a vehicle (image, 360 view, or engine sound)
// ------------------------------------------------------------------
router.post(
  '/vehicles/:id/upload-asset',
  authMiddleware,
  rbac('admin'),
  upload.single('asset'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const assetType = req.body.assetType // 'primary', 'gallery', '360', 'audio'

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' })
        return
      }

      const vehicle = await prisma.vehicle.findUnique({ where: { id } })
      if (!vehicle) {
        res.status(404).json({ error: 'Vehicle not found' })
        return
      }

      // The frontend will serve it from /uploads/<filename>
      const publicUrl = `/uploads/${req.file.filename}`

      if (assetType === 'primary') {
        // Primary image lives on VehicleImage.isPrimary — demote any existing
        // primary first so there is exactly one.
        await prisma.vehicleImage.updateMany({
          where: { vehicleId: id, isPrimary: true },
          data: { isPrimary: false },
        })
        const existingPrimary = await prisma.vehicleImage.findFirst({
          where: { vehicleId: id, urlOriginal: publicUrl },
        })
        if (existingPrimary) {
          await prisma.vehicleImage.update({
            where: { id: existingPrimary.id },
            data: { isPrimary: true },
          })
        } else {
          await prisma.vehicleImage.create({
            data: {
              vehicleId: id,
              urlOriginal: publicUrl,
              mediaCategory: 'exterior',
              isPrimary: true,
              displayOrder: 0,
              title: `${vehicle.make} ${vehicle.model} — Primary`,
              fileSize: req.file.size,
              mimeType: req.file.mimetype,
            },
          })
        }
        res.json({ message: 'Primary image updated', url: publicUrl })
        return
      }

      if (assetType === 'gallery') {
        const lastImage = await prisma.vehicleImage.findFirst({
          where: { vehicleId: id },
          orderBy: { displayOrder: 'desc' }
        })
        const newOrder = lastImage ? lastImage.displayOrder + 1 : 0

        const newImage = await prisma.vehicleImage.create({
          data: {
            vehicleId: id,
            urlOriginal: publicUrl,
            mediaCategory: 'exterior',
            isPrimary: false,
            displayOrder: newOrder,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
          }
        })
        res.json({ message: 'Gallery image uploaded', url: publicUrl, asset: newImage })
        return
      }

      if (assetType === '360') {
        const lastFrame = await prisma.vehicle360Frame.findFirst({
          where: { vehicleId: id },
          orderBy: { displayOrder: 'desc' }
        })
        const newOrder = lastFrame ? lastFrame.displayOrder + 1 : 0

        const newFrame = await prisma.vehicle360Frame.create({
          data: {
            vehicleId: id,
            imageUrl: publicUrl,
            displayOrder: newOrder
          }
        })
        res.json({ message: '360 frame uploaded', url: publicUrl, asset: newFrame })
        return
      }

      if (assetType === 'audio') {
        const newSound = await prisma.vehicleSound.create({
          data: {
            vehicleId: id,
            soundType: 'engine_start',
            audioUrl: publicUrl
          }
        })
        res.json({ message: 'Engine sound uploaded', url: publicUrl, asset: newSound })
        return
      }

      if (assetType === 'video') {
        await prisma.vehicle.update({
          where: { id },
          data: { videoUrl: publicUrl },
        })
        res.json({ message: 'Vehicle video updated', url: publicUrl })
        return
      }

      res.status(400).json({ error: 'Invalid assetType' })
    } catch (err) {
      next(err)
    }
  }
)

// ------------------------------------------------------------------
// Journal (Blog/Media) management — staff editable without code changes
// ------------------------------------------------------------------
const journalSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(2),
  snippet: z.string().min(10),
  content: z.string().optional(),
  // Accept absolute URLs or site-relative paths (e.g. /images/journals/x.jpg)
  imageUrl: z.string().min(1).refine(
    (v) => /^https?:\/\//.test(v) || v.startsWith('/'),
    'Must be an absolute URL or a site-relative path starting with /'
  ),
  readTime: z.string().default('5 min read'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
})

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

router.get(
  '/journals',
  authMiddleware,
  rbac('viewer'),
  async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const journals = await prisma.journal.findMany({ orderBy: { publishedAt: 'desc' } })
      res.json({ data: journals })
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  '/journals',
  authMiddleware,
  rbac('editor'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = journalSchema.parse(req.body)
      const base = slugify(data.title)
      let slug = base
      let n = 2
      while (await prisma.journal.findUnique({ where: { slug } })) {
        slug = `${base}-${n++}`
      }
      const journal = await prisma.journal.create({
        data: {
          ...data,
          slug,
          authorId: (req as any).user?.id || null,
          publishedAt: data.status === 'PUBLISHED' ? new Date() : undefined,
        },
      })
      res.status(201).json({ data: journal })
    } catch (err) {
      next(err)
    }
  }
)

router.put(
  '/journals/:id',
  authMiddleware,
  rbac('editor'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = journalSchema.partial().parse(req.body)
      const journal = await prisma.journal.update({
        where: { id: req.params.id },
        data,
      })
      res.json({ data: journal })
    } catch (err: any) {
      if (err.code === 'P2025') {
        res.status(404).json({ error: 'Journal entry not found' })
        return
      }
      next(err)
    }
  }
)

router.delete(
  '/journals/:id',
  authMiddleware,
  rbac('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.journal.delete({ where: { id: req.params.id } })
      res.json({ message: 'Journal entry deleted' })
    } catch (err: any) {
      if (err.code === 'P2025') {
        res.status(404).json({ error: 'Journal entry not found' })
        return
      }
      next(err)
    }
  }
)

export default router
