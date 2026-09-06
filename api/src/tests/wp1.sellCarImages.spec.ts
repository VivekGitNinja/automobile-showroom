import { createApp } from '../app'
import { invokeApp } from './testUtils'
import { prisma } from '../config/database'
import { storageService } from '../services/storage.service'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import fs from 'fs'
import path from 'path'

jest.mock('../config/database', () => ({
  prisma: {
    lead: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    sellCarSubmission: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}))

jest.mock('../config/bullmq', () => ({
  notificationQueue: {
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
  },
}))

const app = createApp()
const adminToken = jwt.sign(
  { userId: '11111111-1111-1111-1111-111111111111', role: 'admin' },
  env.JWT_ACCESS_SECRET,
  { expiresIn: '1h' }
)

describe('WP1 — Fix Sell-Car Image Data Loss', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('a) Storage service generates absolute URLs and writes files to public/uploads/sell-car-uploads', async () => {
    const fakeBuffer1 = Buffer.from('fake-image-data-1')
    const fakeBuffer2 = Buffer.from('fake-image-data-2')

    const uploadResult1 = await storageService.uploadFile({
      filename: `sell-car-uploads/test-${Date.now()}-front.jpg`,
      buffer: fakeBuffer1,
      mimeType: 'image/jpeg',
    })
    const uploadResult2 = await storageService.uploadFile({
      filename: `sell-car-uploads/test-${Date.now()}-rear.png`,
      buffer: fakeBuffer2,
      mimeType: 'image/png',
    })

    // Must return ABSOLUTE URLs built from BASE_URL/APP_URL
    expect(uploadResult1.url).toMatch(/^http:\/\/localhost:4000\/uploads\/sell-car-uploads\/.+\.jpg$/)
    expect(uploadResult2.url).toMatch(/^http:\/\/localhost:4000\/uploads\/sell-car-uploads\/.+\.png$/)

    // Verify files exist in public/uploads on disk
    const diskPath1 = path.join(process.cwd(), 'public', 'uploads', uploadResult1.key)
    const diskPath2 = path.join(process.cwd(), 'public', 'uploads', uploadResult2.key)
    expect(fs.existsSync(diskPath1)).toBe(true)
    expect(fs.existsSync(diskPath2)).toBe(true)
    expect(fs.readFileSync(diskPath1).toString()).toBe('fake-image-data-1')
    expect(fs.readFileSync(diskPath2).toString()).toBe('fake-image-data-2')
  })

  it('b) Verifies express.static is mounted on /uploads for serving static assets', () => {
    // Check that /uploads route layer exists in Express stack
    const hasUploadsRoute = (app as any)._router?.stack?.some((layer: any) => {
      return layer.name === 'serveStatic' || (layer.regexp && layer.regexp.test('/uploads/test.jpg'))
    })
    expect(hasUploadsRoute).toBe(true)
  })

  it('c) Persists imageUrls in SellCarSubmission.create() call & admin displays both images', async () => {
    const mockCreated = {
      id: 'sub-12345',
      fullName: 'VIP Seller',
      email: 'seller@apex.ae',
      phone: '+971501234567',
      carMake: 'Ferrari',
      carModel: 'SF90',
      carYear: 2023,
      imageUrls: [
        'http://localhost:4000/uploads/sell-car-uploads/photo1.jpg',
        'http://localhost:4000/uploads/sell-car-uploads/photo2.jpg',
      ],
      status: 'new',
      createdAt: new Date().toISOString(),
    }
    ;(prisma.sellCarSubmission.create as jest.Mock).mockResolvedValue(mockCreated)

    const postRes = await invokeApp(app, {
      method: 'POST',
      url: '/api/v1/leads/sell-car',
      body: {
        fullName: 'VIP Seller',
        email: 'seller@apex.ae',
        phone: '+971501234567',
        carMake: 'Ferrari',
        carModel: 'SF90',
        carYear: 2023,
        imageUrls: [
          'http://localhost:4000/uploads/sell-car-uploads/photo1.jpg',
          'http://localhost:4000/uploads/sell-car-uploads/photo2.jpg',
        ],
      },
    })

    expect(postRes.status).toBe(201)
    expect(prisma.sellCarSubmission.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fullName: 'VIP Seller',
        carMake: 'Ferrari',
        imageUrls: [
          'http://localhost:4000/uploads/sell-car-uploads/photo1.jpg',
          'http://localhost:4000/uploads/sell-car-uploads/photo2.jpg',
        ],
      }),
    })

    // Admin Sell-Car inbox shows submission with both images
    ;(prisma.sellCarSubmission.findMany as jest.Mock).mockResolvedValue([mockCreated])
    ;(prisma.sellCarSubmission.count as jest.Mock).mockResolvedValue(1)

    const adminRes = await invokeApp(app, {
      method: 'GET',
      url: '/api/v1/admin/leads/sell-car',
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    expect(adminRes.status).toBe(200)
    expect(adminRes.body.data[0].imageUrls).toHaveLength(2)
    expect(adminRes.body.data[0].imageUrls[0]).toBe('http://localhost:4000/uploads/sell-car-uploads/photo1.jpg')
    expect(adminRes.body.data[0].imageUrls[1]).toBe('http://localhost:4000/uploads/sell-car-uploads/photo2.jpg')
  })

  it('d) Lead without images still works (default [] — no regression)', async () => {
    const mockCreated = {
      id: 'sub-67890',
      fullName: 'Plain Seller',
      email: 'plain@apex.ae',
      phone: '+971509876543',
      carMake: 'Porsche',
      carModel: '911',
      carYear: 2022,
      imageUrls: [],
      status: 'new',
      createdAt: new Date().toISOString(),
    }
    ;(prisma.sellCarSubmission.create as jest.Mock).mockResolvedValue(mockCreated)

    const postRes = await invokeApp(app, {
      method: 'POST',
      url: '/api/v1/leads/sell-car',
      body: {
        fullName: 'Plain Seller',
        email: 'plain@apex.ae',
        phone: '+971509876543',
        carMake: 'Porsche',
        carModel: '911',
        carYear: 2022,
      },
    })

    expect(postRes.status).toBe(201)
    expect(prisma.sellCarSubmission.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fullName: 'Plain Seller',
        imageUrls: [],
      }),
    })
  })
})
