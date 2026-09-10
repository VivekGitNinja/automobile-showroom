import { createApp } from '../app'
import { invokeApp } from './testUtils'
import { prisma } from '../config/database'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

jest.mock('../config/database', () => ({
  prisma: {
    faqCategory: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    faq: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    lead: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    sellCarSubmission: {
      create: jest.fn(),
    },
    siteSettings: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('../config/bullmq', () => ({
  notificationQueue: {
    add: jest.fn().mockResolvedValue({ id: 'job-mock-id' }),
  },
}))

const app = createApp()

const editorToken = jwt.sign(
  { userId: '11111111-1111-1111-1111-111111111111', role: 'editor' },
  env.JWT_ACCESS_SECRET,
  { expiresIn: '1h' }
)

const adminToken = jwt.sign(
  { userId: '22222222-2222-2222-2222-222222222222', role: 'admin' },
  env.JWT_ACCESS_SECRET,
  { expiresIn: '1h' }
)

describe('Platform Comprehensive Verification Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('FAQ Categories Endpoints (/api/v1/faq-categories)', () => {
    it('GET /api/v1/faq-categories returns active categories', async () => {
      const mockCategories = [
        { id: 'cat-1', label: 'Purchasing & Ownership', slug: 'purchasing', displayOrder: 1, isActive: true },
      ]
      ;(prisma.faqCategory.findMany as jest.Mock).mockResolvedValue(mockCategories)

      const res = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/faq-categories',
      })

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].slug).toBe('purchasing')
    })

    it('POST /api/v1/faq-categories creates a category with editor auth', async () => {
      const mockCategory = { id: 'cat-2', label: 'Bespoke Orders', slug: 'bespoke', displayOrder: 2 }
      ;(prisma.faqCategory.create as jest.Mock).mockResolvedValue(mockCategory)

      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/faq-categories',
        headers: { Authorization: `Bearer ${editorToken}` },
        body: { label: 'Bespoke Orders', slug: 'bespoke', displayOrder: 2 },
      })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBe('cat-2')
    })

    it('PUT /api/v1/faq-categories/:id updates a category with editor auth', async () => {
      const mockUpdated = { id: 'cat-2', label: 'Bespoke & Commission', slug: 'bespoke-commission' }
      ;(prisma.faqCategory.update as jest.Mock).mockResolvedValue(mockUpdated)

      const res = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/faq-categories/cat-2',
        headers: { Authorization: `Bearer ${editorToken}` },
        body: { label: 'Bespoke & Commission' },
      })

      expect(res.status).toBe(200)
      expect(res.body.data.label).toBe('Bespoke & Commission')
    })

    it('DELETE /api/v1/faq-categories/:id deletes a category with admin auth', async () => {
      (prisma.faqCategory.delete as jest.Mock).mockResolvedValue({ id: 'cat-2' })

      const res = await invokeApp(app, {
        method: 'DELETE',
        url: '/api/v1/faq-categories/cat-2',
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('FAQ Items Endpoints (/api/v1/faqs)', () => {
    it('GET /api/v1/faqs returns nested categories with FAQs', async () => {
      const mockData = [
        {
          id: 'cat-1',
          label: 'Acquisition',
          slug: 'acquisition',
          faqs: [{ id: 'faq-1', question: 'How do I book a private viewing?', answer: 'Contact concierge.' }],
        },
      ]
      ;(prisma.faqCategory.findMany as jest.Mock).mockResolvedValue(mockData)

      const res = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/faqs',
      })

      expect(res.status).toBe(200)
      expect(res.body.data[0].faqs).toHaveLength(1)
    })

    it('POST /api/v1/faqs creates an FAQ item with editor auth', async () => {
      const mockFaq = {
        id: 'faq-2',
        question: 'What warranties are provided?',
        answer: 'All vehicles include a 12-month certified warranty.',
      }
      ;(prisma.faq.create as jest.Mock).mockResolvedValue(mockFaq)

      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/faqs',
        headers: { Authorization: `Bearer ${editorToken}` },
        body: {
          question: 'What warranties are provided?',
          answer: 'All vehicles include a 12-month certified warranty.',
        },
      })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBe('faq-2')
    })

    it('PUT /api/v1/faqs/:id updates an FAQ item with editor auth', async () => {
      const mockUpdated = {
        id: 'faq-2',
        question: 'Updated question?',
        answer: 'Updated answer.',
      }
      ;(prisma.faq.update as jest.Mock).mockResolvedValue(mockUpdated)

      const res = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/faqs/faq-2',
        headers: { Authorization: `Bearer ${editorToken}` },
        body: { question: 'Updated question?' },
      })

      expect(res.status).toBe(200)
      expect(res.body.data.question).toBe('Updated question?')
    })

    it('DELETE /api/v1/faqs/:id deletes an FAQ item with admin auth', async () => {
      (prisma.faq.delete as jest.Mock).mockResolvedValue({ id: 'faq-2' })

      const res = await invokeApp(app, {
        method: 'DELETE',
        url: '/api/v1/faqs/faq-2',
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('Sell-Car Image Submission Resiliency', () => {
    it('accepts both site-relative upload paths and absolute URLs', async () => {
      const mockSubmission = {
        id: 'sell-car-resilient-1',
        fullName: 'Hamdan Al Maktoum',
        email: 'hamdan@dubai.ae',
        phone: '+971501112233',
        carMake: 'Mercedes-Benz',
        carModel: 'G 63 AMG',
        carYear: 2024,
        imageUrls: [
          '/uploads/sell-car-uploads/178901-front.jpg',
          'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd',
        ],
      }
      ;(prisma.sellCarSubmission.create as jest.Mock).mockResolvedValue(mockSubmission)

      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/leads/sell-car',
        body: {
          fullName: 'Hamdan Al Maktoum',
          email: 'hamdan@dubai.ae',
          phone: '+971501112233',
          carMake: 'Mercedes-Benz',
          carModel: 'G 63 AMG',
          carYear: 2024,
          imageUrls: [
            '/uploads/sell-car-uploads/178901-front.jpg',
            'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd',
          ],
        },
      })

      expect(res.status).toBe(201)
      expect(res.body.data.imageUrls).toHaveLength(2)
      expect(res.body.data.imageUrls[0]).toBe('/uploads/sell-car-uploads/178901-front.jpg')
    })
  })

  describe('Global Settings Endpoints (/api/v1/settings)', () => {
    it('GET /api/v1/settings returns global settings', async () => {
      const mockSettings = {
        id: 'global',
        showroomName: 'Apex Luxury Automobiles',
        phone: '+971 4 123 4567',
      }
      ;(prisma.siteSettings.findUnique as jest.Mock).mockResolvedValue(mockSettings)

      const res = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/settings',
      })

      expect(res.status).toBe(200)
      expect(res.body.data.showroomName).toBe('Apex Luxury Automobiles')
    })

    it('PUT /api/v1/settings updates settings with admin auth', async () => {
      const updatedSettings = {
        id: 'global',
        showroomName: 'Apex Black Label Showroom',
        phone: '+971 4 999 8888',
      }
      ;(prisma.siteSettings.upsert as jest.Mock).mockResolvedValue(updatedSettings)

      const res = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/settings',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          showroomName: 'Apex Black Label Showroom',
          phone: '+971 4 999 8888',
        },
      })

      expect(res.status).toBe(200)
      expect(res.body.data.showroomName).toBe('Apex Black Label Showroom')
    })
  })
})
