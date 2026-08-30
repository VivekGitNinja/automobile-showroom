import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { authMiddleware } from '../middleware/auth.middleware'
import { rbac } from '../middleware/rbac.middleware'
import { z } from 'zod'

const router = Router()

const defaultSettings = {
  id: 'global',
  showroomName: 'Apex Luxury Automobiles',
  address: 'Sheikh Zayed Road, Dubai, UAE',
  phone: '+971 4 123 4567',
  whatsappNumber: '+971 50 891 9441',
  email: 'concierge@apex.ae',
  openingHours: 'Mon-Sun: 9:00 AM - 9:00 PM',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115535.48529555694!2d55.197063!3d25.1884351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai!5e0!3m2!1sen!2sae!4v1700000000000!5m2!1sen!2sae',
  socialLinks: {
    instagram: 'https://instagram.com/apex_luxury',
    facebook: 'https://facebook.com/apexluxury',
    twitter: 'https://twitter.com/apexluxury',
  }
}

// GET /api/v1/settings (Public)
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } })
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: defaultSettings })
    }
    res.json({ data: settings })
  } catch (err) {
    next(err)
  }
})

const updateSettingsSchema = z.object({
  showroomName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional(),
  openingHours: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  socialLinks: z.any().optional(),
  heroBanner: z.any().optional(),
  featuredVehicleSelectionRules: z.any().optional(),
})

// PUT /api/v1/settings (Admin only)
router.put('/', authMiddleware, rbac('admin'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = updateSettingsSchema.parse(req.body)
    
    // Upsert to ensure it always succeeds
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'global' },
      update: data,
      create: {
        ...defaultSettings,
        ...data,
      } as any, // Cast since nested JSON types might not perfectly align with Prisma inputs without mapping
    })
    
    res.json({ data: settings })
  } catch (err) {
    next(err)
  }
})

export default router
