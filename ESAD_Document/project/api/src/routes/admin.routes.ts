import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { rbac } from '../middleware/rbac.middleware'
import { z } from 'zod'

const router = Router()

router.use(authMiddleware, rbac('admin'))

// ─── Vehicles Admin ──────────────────────────────
router.get('/vehicles', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { brand: true },
    })
    res.json({ data: vehicles })
  } catch (err) {
    next(err)
  }
})

// ─── Lead Management ─────────────────────────────

const leadStatusEnum = z.enum([
  'new',
  'notified',
  'notification_failed',
  'contacted',
  'qualified',
  'converted',
  'lost',
  'follow_up',
])

const sellCarStatusEnum = z.enum([
  'new',
  'reviewing',
  'offer_made',
  'accepted',
  'rejected',
])

const leadTypeEnum = z.enum(['enquiry', 'booking', 'callback', 'sell_car'])

// GET /api/v1/admin/leads/sell-car (MUST come before GET /api/v1/admin/leads/:id)
router.get('/leads/sell-car', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10)
    const limit = parseInt(req.query.limit as string || '20', 10)
    const status = req.query.status as string

    const where: any = {}
    if (status && sellCarStatusEnum.safeParse(status).success) {
      where.status = status
    }

    const total = await prisma.sellCarSubmission.count({ where })
    const submissions = await prisma.sellCarSubmission.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { assignee: true },
    })

    res.json({
      data: submissions,
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

// PUT /api/v1/admin/leads/sell-car/:id
router.put('/leads/sell-car/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const schema = z.object({
      status: sellCarStatusEnum.optional(),
      assignedTo: z.string().uuid().nullable().optional(),
    })

    const data = schema.parse(req.body)
    const submission = await prisma.sellCarSubmission.update({
      where: { id },
      data,
      include: { assignee: true },
    })

    res.json({ data: submission })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Sell car submission not found' })
      return
    }
    next(err)
  }
})

// GET /api/v1/admin/leads (list with pagination, filtering by lead type, status, date range, assigned rep)
router.get('/leads', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10)
    const limit = parseInt(req.query.limit as string || '20', 10)
    const leadType = req.query.leadType as string
    const status = req.query.status as string
    const assignedTo = (req.query.assignedTo || req.query.assignedRep) as string
    const startDate = (req.query.startDate || req.query.fromDate) as string
    const endDate = (req.query.endDate || req.query.toDate) as string

    const where: any = {}

    if (leadType && leadTypeEnum.safeParse(leadType).success) {
      where.leadType = leadType
    }

    if (status && leadStatusEnum.safeParse(status).success) {
      where.status = status
    }

    if (assignedTo) {
      where.assignedTo = assignedTo
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const total = await prisma.lead.count({ where })
    const leads = await prisma.lead.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true, assignee: true },
    })

    res.json({
      data: leads,
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

// PUT /api/v1/admin/leads/:id/status (update lead lifecycle status)
router.put('/leads/:id/status', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const schema = z.object({
      status: leadStatusEnum,
    })

    const { status } = schema.parse(req.body)

    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
      include: { vehicle: true, assignee: true },
    })

    res.json({ data: lead })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Lead not found' })
      return
    }
    next(err)
  }
})

// PUT /api/v1/admin/leads/:id/assign (assign lead to sales rep)
router.put('/leads/:id/assign', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const schema = z.object({
      assignedTo: z.string().uuid().optional(),
      assignedRepId: z.string().uuid().optional(),
      userId: z.string().uuid().optional(),
    })

    const body = schema.parse(req.body)
    const targetUser = body.assignedTo || body.assignedRepId || body.userId

    if (!targetUser) {
      res.status(400).json({ error: 'Assigned user ID is required' })
      return
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { assignedTo: targetUser },
      include: { vehicle: true, assignee: true },
    })

    res.json({ data: lead })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Lead not found' })
      return
    }
    next(err)
  }
})

// POST /api/v1/admin/leads/:id/notes (add internal sales note)
router.post('/leads/:id/notes', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const schema = z.object({
      note: z.string().optional(),
      content: z.string().optional(),
      text: z.string().optional(),
    })

    const body = schema.parse(req.body)
    const noteText = body.note || body.content || body.text

    if (!noteText) {
      res.status(400).json({ error: 'Note text is required' })
      return
    }

    const lead = await prisma.lead.findUnique({ where: { id } })
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' })
      return
    }

    const currentMetadata = (lead.metadata as Record<string, any>) || {}
    const existingNotes = Array.isArray(currentMetadata.notes) ? currentMetadata.notes : []

    const newNote = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      note: noteText,
      authorId: req.user?.userId || null,
      createdAt: new Date().toISOString(),
    }

    const updatedMetadata = {
      ...currentMetadata,
      notes: [...existingNotes, newNote],
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { metadata: updatedMetadata },
      include: { vehicle: true, assignee: true },
    })

    res.json({ data: updatedLead, note: newNote })
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Lead not found' })
      return
    }
    next(err)
  }
})

export default router
