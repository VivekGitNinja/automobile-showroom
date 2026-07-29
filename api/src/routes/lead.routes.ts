import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { z } from 'zod'
import { leadLimiter } from '../middleware/rateLimit.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { rbac } from '../middleware/rbac.middleware'
import { notificationQueue } from '../config/bullmq'

const router = Router()

const leadSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  vehicleId: z.string().uuid().optional(),
  leadType: z.enum(['enquiry', 'booking', 'callback', 'sell_car']).default('enquiry'),
  message: z.string().optional(),
})

// POST /api/v1/leads
router.post('/', leadLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = leadSchema.parse(req.body)

    // Check for duplicates
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: data.email,
        vehicleId: data.vehicleId || null,
        createdAt: { gte: twentyFourHoursAgo },
      }
    })

    if (existingLead) {
      res.status(409).json({ error: 'A similar enquiry was already submitted recently' })
      return
    }

    const lead = await prisma.lead.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        vehicleId: data.vehicleId || null,
        leadType: data.leadType,
        message: data.message || '',
      },
    })

    const salesEmail = process.env.SALES_EMAIL || 'sales@apexluxuryautomobiles.com'
    try {
      await notificationQueue.add('lead_notification', {
        to: [data.email, salesEmail],
        subject: `New Lead: ${data.leadType.toUpperCase()} - ${data.fullName}`,
        text: `Hello ${data.fullName},\n\nWe have received your ${data.leadType} enquiry and will get back to you soon.\n\nBest regards,\nLuxury Showroom`,
        html: `<p>Hello ${data.fullName},</p><p>We have received your ${data.leadType} enquiry and will get back to you soon.</p><p>Best regards,<br>Luxury Showroom</p>`,
      })
    } catch (queueErr) {
      console.error('Failed to queue lead notification:', queueErr)
    }

    res.status(201).json({ message: 'Lead submitted successfully', data: lead })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/leads/sell-car
router.post('/sell-car', leadLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellCarSchema = z.object({
      fullName: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(7),
      carMake: z.string().min(1),
      carModel: z.string().min(1),
      carYear: z.number().int().min(1900),
      carMileage: z.string().optional(),
      description: z.string().optional(),
      askingPrice: z.string().optional(),
    })

    const data = sellCarSchema.parse(req.body)
    const submission = await prisma.sellCarSubmission.create({
      data,
    })

    const salesEmail = process.env.SALES_EMAIL || 'sales@apexluxuryautomobiles.com'
    try {
      await notificationQueue.add('sell_car_notification', {
        to: [data.email, salesEmail],
        subject: `New Sell Car Enquiry: ${data.carYear} ${data.carMake} ${data.carModel}`,
        text: `Hello ${data.fullName},\n\nWe have received your sell car enquiry for ${data.carYear} ${data.carMake} ${data.carModel} and will get back to you soon.\n\nBest regards,\nLuxury Showroom`,
        html: `<p>Hello ${data.fullName},</p><p>We have received your sell car enquiry for ${data.carYear} ${data.carMake} ${data.carModel} and will get back to you soon.</p><p>Best regards,<br>Luxury Showroom</p>`,
      })
    } catch (queueErr) {
      console.error('Failed to queue sell car notification:', queueErr)
    }

    res.status(201).json({ message: 'Sell car inquiry submitted', data: submission })
  } catch (err) {
    next(err)
  }
})

const updateLeadSchema = z.object({
  status: z.enum(['new', 'notified', 'contacted', 'qualified', 'converted', 'lost', 'follow_up']).optional(),
  assignedTo: z.string().uuid().optional(),
  message: z.string().optional(),
})

// PATCH /api/v1/leads/:id
router.patch('/:id', authMiddleware, rbac('editor'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const data = updateLeadSchema.parse(req.body)
    
    const lead = await prisma.lead.update({
      where: { id },
      data,
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

export default router
