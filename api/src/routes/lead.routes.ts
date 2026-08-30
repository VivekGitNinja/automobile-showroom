import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { z } from 'zod'
import { leadLimiter } from '../middleware/rateLimit.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { rbac } from '../middleware/rbac.middleware'
import { notificationQueue } from '../config/bullmq'
import multer from 'multer'
import { storageService } from '../services/storage.service'

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

    // Enrich the sales-team email with vehicle context (best effort — never
    // block lead creation on this lookup).
    let vehicleSummary = ''
    if (data.vehicleId) {
      try {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: data.vehicleId },
          select: { make: true, model: true, year: true },
        })
        if (vehicle) vehicleSummary = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      } catch { /* vehicle context is optional */ }
    }

    try {
      await notificationQueue.add('lead_notification', {
        leadId: lead.id,
        vehicleId: data.vehicleId || null,
        to: [data.email, salesEmail],
        subject: `New Lead: ${data.leadType.toUpperCase()} - ${data.fullName}`,
        text: [
          `New ${data.leadType} enquiry received.`,
          '',
          `Customer: ${data.fullName}`,
          `Email: ${data.email}`,
          `Phone: ${data.phone}`,
          vehicleSummary ? `Vehicle: ${vehicleSummary}` : null,
          `Lead ID: ${lead.id}`,
          '',
          'Message:',
          data.message || '(no message provided)',
        ].filter((l) => l !== null).join('\n') + '\n\nBest regards,\nLuxury Showroom',
        html: [
          `<h3>New ${data.leadType} enquiry received</h3>`,
          `<p><b>Customer:</b> ${data.fullName}<br>`,
          `<b>Email:</b> ${data.email}<br>`,
          `<b>Phone:</b> ${data.phone}<br>`,
          vehicleSummary ? `<b>Vehicle:</b> ${vehicleSummary}<br>` : '',
          `<b>Lead ID:</b> ${lead.id}</p>`,
          `<p><b>Message:</b><br>${data.message || '(no message provided)'}</p>`,
          `<p>Best regards,<br>Luxury Showroom</p>`,
        ].join(''),
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
        leadId: submission.id,
        to: [data.email, salesEmail],
        subject: `New Sell Car Enquiry: ${data.carYear} ${data.carMake} ${data.carModel}`,
        text: [
          'New sell-your-car submission received.',
          '',
          `Seller: ${data.fullName}`,
          `Email: ${data.email}`,
          `Phone: ${data.phone}`,
          `Vehicle: ${data.carYear} ${data.carMake} ${data.carModel}`,
          data.carMileage ? `Mileage: ${data.carMileage}` : null,
          data.askingPrice ? `Asking price: ${data.askingPrice}` : null,
          `Submission ID: ${submission.id}`,
          '',
          'Description:',
          data.description || '(no description provided)',
        ].filter((l) => l !== null).join('\n') + '\n\nBest regards,\nLuxury Showroom',
        html: [
          `<h3>New sell-your-car submission</h3>`,
          `<p><b>Seller:</b> ${data.fullName}<br>`,
          `<b>Email:</b> ${data.email}<br>`,
          `<b>Phone:</b> ${data.phone}<br>`,
          `<b>Vehicle:</b> ${data.carYear} ${data.carMake} ${data.carModel}<br>`,
          data.carMileage ? `<b>Mileage:</b> ${data.carMileage}<br>` : '',
          data.askingPrice ? `<b>Asking price:</b> ${data.askingPrice}<br>` : '',
          `<b>Submission ID:</b> ${submission.id}</p>`,
          `<p><b>Description:</b><br>${data.description || '(no description provided)'}</p>`,
          `<p>Best regards,<br>Luxury Showroom</p>`,
        ].join(''),
      })
    } catch (queueErr) {
      console.error('Failed to queue sell car notification:', queueErr)
    }

    res.status(201).json({ message: 'Sell car inquiry submitted', data: submission })
  } catch (err) {
    next(err)
  }
})

const upload = multer({ storage: multer.memoryStorage() })

// POST /api/v1/leads/upload
router.post('/upload', leadLimiter, upload.array('files', 5), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({ status: 'error', message: 'No files provided' })
      return
    }

    const urls = await Promise.all(
      req.files.map(async (file) => {
        const uploadResult = await storageService.uploadFile({
          filename: `sell-car-uploads/${Date.now()}-${file.originalname}`,
          buffer: file.buffer,
          mimeType: file.mimetype,
        })
        return (uploadResult as any).url || (uploadResult as any).fileUrl || ''
      })
    )

    res.json({ urls })
  } catch (err: any) {
    next(err)
  }
})

const updateLeadSchema = z.object({
  status: z.enum(['new', 'notified', 'notification_failed', 'contacted', 'qualified', 'converted', 'lost', 'follow_up']).optional(),
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
