import { createApp } from '../app'
import { invokeApp } from './testUtils'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../config/database'
import { notificationQueue } from '../config/bullmq'

jest.mock('../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    lead: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    sellCarSubmission: {
      create: jest.fn(),
    },
  },
}))

jest.mock('../config/bullmq', () => ({
  notificationQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
  },
}))

const app = createApp()

describe('Challenger 2 — Milestone 2 Stress & Verification Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Requirement 1: Invalid Refresh Tokens produce 401', () => {
    it('1.1 Malformed refresh token returns 401', async () => {
      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/auth/refresh',
        body: { refreshToken: 'invalid.malformed.token' },
      })
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_TOKEN')
    })

    it('1.2 Refresh token signed with wrong secret returns 401', async () => {
      const wrongSecretToken = jwt.sign(
        { userId: '11111111-1111-1111-1111-111111111111' },
        'completely-different-and-wrong-secret-key',
        { expiresIn: '7d' }
      )
      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/auth/refresh',
        body: { refreshToken: wrongSecretToken },
      })
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_TOKEN')
    })

    it('1.3 Expired refresh token returns 401', async () => {
      const expiredToken = jwt.sign(
        { userId: '11111111-1111-1111-1111-111111111111' },
        env.JWT_REFRESH_SECRET,
        { expiresIn: '-1s' }
      )
      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/auth/refresh',
        body: { refreshToken: expiredToken },
      })
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('INVALID_TOKEN')
    })

    it('1.4 Refresh token for non-existent or inactive user returns 401', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      const validJwtToken = jwt.sign(
        { userId: '99999999-9999-9999-9999-999999999999' },
        env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )
      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/auth/refresh',
        body: { refreshToken: validJwtToken },
      })
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })
  })

  describe('Requirement 2: Token Logout Invalidation (Security Failure Verification)', () => {
    it('2.1 Demonstrates that access tokens ARE NOT invalidated upon logout', async () => {
      const mockUser = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'user@example.com',
        fullName: 'Test User',
        role: 'admin',
        isActive: true,
      }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const accessToken = jwt.sign(
        { userId: mockUser.id, role: mockUser.role },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      )

      // User logs out
      const logoutRes = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      expect(logoutRes.status).toBe(200)

      // Access token is reused AFTER logout
      const meRes = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      // Empirical Finding: Token remains valid (200 OK), proving logged out tokens CAN be reused.
      expect(meRes.status).toBe(200) 
      expect(meRes.body.user.email).toBe('user@example.com')
    })

    it('2.2 Demonstrates that refresh tokens ARE NOT invalidated upon logout', async () => {
      const mockUser = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'user@example.com',
        fullName: 'Test User',
        role: 'admin',
        isActive: true,
      }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const refreshToken = jwt.sign(
        { userId: mockUser.id },
        env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      // User logs out
      const logoutRes = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/auth/logout',
        body: { refreshToken },
      })
      expect(logoutRes.status).toBe(200)

      // Refresh token is reused AFTER logout
      const refreshRes = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/auth/refresh',
        body: { refreshToken },
      })

      // Empirical Finding: Refresh token remains valid (200 OK), proving logged out refresh tokens CAN be reused.
      expect(refreshRes.status).toBe(200)
      expect(refreshRes.body).toHaveProperty('accessToken')
    })
  })

  describe('Requirement 3: Email Notification Queue Job Payload Completeness (Defect Verification)', () => {
    it('3.1 Verifies lead notification queue job payload is COMPLETE', async () => {
      const leadInput = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+971501234567',
        vehicleId: '22222222-2222-2222-2222-222222222222',
        leadType: 'booking' as const,
        message: 'I am interested in booking a test drive.',
      }

      const createdLead = {
        id: 'lead-123-uuid',
        ...leadInput,
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.lead.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.lead.create as jest.Mock).mockResolvedValue(createdLead)

      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/leads',
        body: leadInput,
      })

      expect(res.status).toBe(201)
      expect(notificationQueue.add).toHaveBeenCalledTimes(1)

      const [, jobPayload] = (notificationQueue.add as jest.Mock).mock.calls[0]
      const payloadStr = JSON.stringify(jobPayload)

      // Fixed: the sales-team email now carries the full lead context
      expect(payloadStr).toContain(leadInput.phone)
      expect(payloadStr).toContain(createdLead.id)
      expect(payloadStr).toContain(leadInput.message)
      expect(payloadStr).toContain(leadInput.vehicleId)
    })

    it('3.2 Verifies sell-car notification queue job payload is COMPLETE', async () => {
      const sellCarInput = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+971509876543',
        carMake: 'Ferrari',
        carModel: 'SF90 Stradale',
        carYear: 2023,
        carMileage: '5,000 km',
        askingPrice: '1,800,000 AED',
        description: 'Pristine condition.',
      }

      const createdSubmission = {
        id: 'submission-456-uuid',
        ...sellCarInput,
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.sellCarSubmission.create as jest.Mock).mockResolvedValue(createdSubmission)

      const res = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/leads/sell-car',
        body: sellCarInput,
      })

      expect(res.status).toBe(201)
      expect(notificationQueue.add).toHaveBeenCalledTimes(1)

      const [, jobPayload] = (notificationQueue.add as jest.Mock).mock.calls[0]
      const payloadStr = JSON.stringify(jobPayload)

      // Fixed: the acquisition-team email now carries the full submission context
      expect(payloadStr).toContain(sellCarInput.phone)
      expect(payloadStr).toContain(sellCarInput.askingPrice)
      expect(payloadStr).toContain(sellCarInput.carMileage)
      expect(payloadStr).toContain(sellCarInput.description)
    })
  })
})
