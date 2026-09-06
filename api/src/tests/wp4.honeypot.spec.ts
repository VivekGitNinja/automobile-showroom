import { createApp } from '../app'
import { invokeApp } from './testUtils'
import { prisma } from '../config/database'
import { notificationQueue } from '../config/bullmq'

jest.mock('../config/database', () => ({
  prisma: {
    lead: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    sellCarSubmission: {
      create: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('../config/bullmq', () => ({
  notificationQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
  },
}))

const app = createApp()

describe('WP4 — Honeypot Spam Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/v1/leads', () => {
    it('legitimate submission without honeypot creates lead and queues notification', async () => {
      ;(prisma.lead.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.lead.create as jest.Mock).mockResolvedValue({
        id: 'lead-real-1',
        fullName: 'Lord Alexander Wright',
        email: 'alexander@wright.co.uk',
        phone: '+971501234567',
        leadType: 'booking',
        message: 'VIP viewing request',
        status: 'new',
      })

      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/leads',
        body: {
          fullName: 'Lord Alexander Wright',
          email: 'alexander@wright.co.uk',
          phone: '+971501234567',
          leadType: 'booking',
          message: 'VIP viewing request',
          company_website: '',
        },
      })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBe('lead-real-1')
      expect(prisma.lead.create).toHaveBeenCalledTimes(1)
      expect(notificationQueue.add).toHaveBeenCalledTimes(1)
    })

    it('bot submission with filled honeypot returns 201 fake success but DOES NOT persist or queue', async () => {
      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/leads',
        body: {
          fullName: 'Spam Bot 3000',
          email: 'bot@spammer-domain.net',
          phone: '+1234567890',
          leadType: 'enquiry',
          message: 'Buy cheap watches here!',
          company_website: 'https://spammer-seo-link.com',
        },
      })

      expect(res.status).toBe(201)
      expect(res.body.message).toBe('Lead submitted successfully')
      expect(res.body.data.id).toBe('mock-honeypot-id')
      // Critical security check: DB write and background email job NEVER triggered
      expect(prisma.lead.findFirst).not.toHaveBeenCalled()
      expect(prisma.lead.create).not.toHaveBeenCalled()
      expect(notificationQueue.add).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/v1/leads/sell-car', () => {
    it('legitimate submission without honeypot creates submission and queues notification', async () => {
      ;(prisma.sellCarSubmission.create as jest.Mock).mockResolvedValue({
        id: 'sell-real-1',
        fullName: 'Mansour Al-Nahyan',
        email: 'mansour@alnahyan.ae',
        phone: '+971509998877',
        carMake: 'Ferrari',
        carModel: 'SF90 Stradale',
        carYear: 2022,
        imageUrls: [],
      })

      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/leads/sell-car',
        body: {
          fullName: 'Mansour Al-Nahyan',
          email: 'mansour@alnahyan.ae',
          phone: '+971509998877',
          carMake: 'Ferrari',
          carModel: 'SF90 Stradale',
          carYear: 2022,
          company_website: '',
        },
      })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBe('sell-real-1')
      expect(prisma.sellCarSubmission.create).toHaveBeenCalledTimes(1)
      expect(notificationQueue.add).toHaveBeenCalledTimes(1)
    })

    it('bot submission with filled honeypot returns 201 fake success but DOES NOT persist or queue', async () => {
      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/leads/sell-car',
        body: {
          fullName: 'Spam Bot 3000',
          email: 'bot@spammer-domain.net',
          phone: '+1234567890',
          carMake: 'Ferrari',
          carModel: 'SF90',
          carYear: 2022,
          company_website: 'https://spammer-seo-link.com',
        },
      })

      expect(res.status).toBe(201)
      expect(res.body.message).toBe('Sell car inquiry submitted')
      expect(res.body.data.id).toBe('mock-honeypot-id')
      // Critical security check: DB write and background email job NEVER triggered
      expect(prisma.sellCarSubmission.create).not.toHaveBeenCalled()
      expect(notificationQueue.add).not.toHaveBeenCalled()
    })
  })
})
