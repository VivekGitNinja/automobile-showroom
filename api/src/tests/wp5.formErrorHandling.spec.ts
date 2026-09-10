import { createApp } from '../app'
import { invokeApp } from './testUtils'
import { prisma } from '../config/database'
import fs from 'fs'
import path from 'path'

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

describe('WP5 — Eliminate Silent Form Error Swallowing', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('API error responses contract', () => {
    it('returns HTTP 409 with error explanation when a duplicate lead is submitted', async () => {
      (prisma.lead.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-lead-1',
        email: 'vip@client.com',
      })

      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/leads',
        body: {
          fullName: 'VIP Client',
          email: 'vip@client.com',
          phone: '+971500000000',
          leadType: 'booking',
          message: 'Viewing request',
        },
      })

      expect(res.status).toBe(409)
      expect(res.body.error).toBe('A similar enquiry was already submitted recently')
      expect(prisma.lead.create).not.toHaveBeenCalled()
    })

    it('returns HTTP 400 validation error for invalid payload on sell-car submission', async () => {
      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/leads/sell-car',
        body: {
          fullName: 'A', // too short (< 2)
          email: 'not-an-email',
          phone: '123',
          carMake: 'Ferrari',
          carModel: 'SF90',
          carYear: 1850, // invalid year (< 1900)
        },
      })

      expect(res.status).toBe(400)
      expect(prisma.sellCarSubmission.create).not.toHaveBeenCalled()
    })
  })

  describe('Frontend forms error handling audit', () => {
    const frontendDir = path.resolve(__dirname, '../../../frontend')

    const formFiles = [
      { name: 'BookingModal', filePath: path.join(frontendDir, 'components/BookingModal.tsx') },
      { name: 'CallbackModal', filePath: path.join(frontendDir, 'components/CallbackModal.tsx') },
      { name: 'ContactPage', filePath: path.join(frontendDir, 'app/contact/page.tsx') },
      { name: 'SellYourCarPage', filePath: path.join(frontendDir, 'app/sell-your-car/page.tsx') },
    ]

    formFiles.forEach(({ name, filePath }) => {
      it(`${name} verifies res.ok, sets submitError on failure, and does not set submitted in finally`, () => {
        const content = fs.readFileSync(filePath, 'utf-8')

        // Must check res.ok
        expect(content).toContain('!res.ok')

        // Must maintain submitError state
        expect(content).toMatch(/setSubmitError|submitError/)

        // Must NOT set submitted(true) inside finally block
        const finallyBlocks = content.match(/finally\s*\{[\s\S]*?\}/g) || []
        finallyBlocks.forEach((block) => {
          expect(block).not.toContain('setSubmitted(true)')
        })

        // Must render error alert UI for submitError
        expect(content).toContain('submitError')
      })
    })
  })
})
