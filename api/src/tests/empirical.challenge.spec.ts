import { createApp } from '../app'
import { invokeApp } from './testUtils'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../config/database'

jest.mock('../config/database', () => ({
  prisma: {
    vehicle: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    vehicleHotspot: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    vehicleSpecConfig: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    lead: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    sellCarSubmission: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
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

describe('Empirical Challenge Suite - Milestone 2 Backend API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── SECTION 1: Boundary Values on Vehicle Sub-resources ─────────────────
  describe('1. Boundary Values on Vehicle Sub-resources (Hotspots & Specs)', () => {
    
    describe('Hotspot Sub-resource Boundaries', () => {
      it('EMPIRICAL BUG: allows hotspot title string length > 100 chars (exceeding DB VarChar(100))', async () => {
        const mockVehicle = { id: 'veh-123', slug: 'ferrari-f8' }
        ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(mockVehicle)
        
        const longTitle = 'A'.repeat(101) // Exceeds VarChar(100)
        ;(prisma.vehicleHotspot.create as jest.Mock).mockImplementation(() => {
          const err: any = new Error('Value too long for column title')
          err.code = 'P2000'
          throw err
        })

        const response = await invokeApp(app, {
          method: 'POST',
          url: '/api/v1/vehicles/veh-123/hotspots',
          headers: { Authorization: `Bearer ${editorToken}` },
          body: {
            title: longTitle,
            xPosition: 50,
            yPosition: 50,
          },
        })

        // Schema validation should fail with 400 before DB attempt, but currently passes Zod and throws DB 500 error
        expect(response.status).toBe(500)
      })

      it('EMPIRICAL BUG: accepts out-of-bounds coordinates (xPosition: -50, yPosition: 250)', async () => {
        const mockVehicle = { id: 'veh-123' }
        const mockCreatedHotspot = {
          id: 'hs-out-of-bounds',
          vehicleId: 'veh-123',
          title: 'Out of Bounds Spot',
          xPosition: -50,
          yPosition: 250,
        }
        ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(mockVehicle)
        ;(prisma.vehicleHotspot.create as jest.Mock).mockResolvedValue(mockCreatedHotspot)

        const response = await invokeApp(app, {
          method: 'POST',
          url: '/api/v1/vehicles/veh-123/hotspots',
          headers: { Authorization: `Bearer ${editorToken}` },
          body: {
            title: 'Out of Bounds Spot',
            xPosition: -50,
            yPosition: 250,
          },
        })

        // Unbounded coordinates accepted!
        expect(response.status).toBe(201)
        expect(response.body.data.xPosition).toBe(-50)
        expect(response.body.data.yPosition).toBe(250)
      })

      it('returns 404 when adding hotspot to non-existent vehicle', async () => {
        ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(null)

        const response = await invokeApp(app, {
          method: 'POST',
          url: '/api/v1/vehicles/non-existent-id/hotspots',
          headers: { Authorization: `Bearer ${editorToken}` },
          body: {
            title: 'Valid Title',
            xPosition: 10,
            yPosition: 20,
          },
        })

        expect(response.status).toBe(404)
        expect(response.body).toEqual({ error: 'Vehicle not found' })
      })
    })

    describe('Spec Config Sub-resource Boundaries', () => {
      it('EMPIRICAL BUG: accepts invalid hexColor formats (e.g. "not-a-hex", "#ZZZZZZ")', async () => {
        const mockVehicle = { id: 'veh-123' }
        const mockSpec = {
          id: 'spec-invalid-hex',
          vehicleId: 'veh-123',
          name: 'Custom Paint',
          hexColor: 'invalid-color-string',
          imageUrl: 'https://example.com/paint.jpg',
        }
        ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(mockVehicle)
        ;(prisma.vehicleSpecConfig.create as jest.Mock).mockResolvedValue(mockSpec)

        const response = await invokeApp(app, {
          method: 'POST',
          url: '/api/v1/vehicles/veh-123/specs',
          headers: { Authorization: `Bearer ${editorToken}` },
          body: {
            name: 'Custom Paint',
            hexColor: 'invalid-color-string',
            imageUrl: 'https://example.com/paint.jpg',
          },
        })

        // Zod passes invalid hex color without regex validation!
        expect(response.status).toBe(201)
        expect(response.body.data.hexColor).toBe('invalid-color-string')
      })

      it('EMPIRICAL BUG: allows hexColor string length > 20 chars (exceeding DB VarChar(20))', async () => {
        const mockVehicle = { id: 'veh-123' }
        ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(mockVehicle)
        
        const longHex = '#'.padEnd(25, 'F') // 25 chars, DB is VarChar(20)
        ;(prisma.vehicleSpecConfig.create as jest.Mock).mockImplementation(() => {
          const err: any = new Error('Value too long for column hex_color')
          err.code = 'P2000'
          throw err
        })

        const response = await invokeApp(app, {
          method: 'POST',
          url: '/api/v1/vehicles/veh-123/specs',
          headers: { Authorization: `Bearer ${editorToken}` },
          body: {
            name: 'Rosso Corsa',
            hexColor: longHex,
            imageUrl: 'https://example.com/spec.jpg',
          },
        })

        // Returns 500 error instead of 400 validation error
        expect(response.status).toBe(500)
      })
    })
  })

  // ─── SECTION 2: Soft-Deleted Vehicles Filtering in Public vs Admin ────────
  describe('2. Soft-Deleted Vehicles Filtering in Public vs Admin Queries', () => {

    it('Public list query (GET /api/v1/vehicles) filters out soft-deleted vehicles', async () => {
      ;(prisma.vehicle.count as jest.Mock).mockResolvedValue(1)
      ;(prisma.vehicle.findMany as jest.Mock).mockResolvedValue([
        { id: 'v-active', make: 'Ferrari', status: 'published', deletedAt: null },
      ])

      const response = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/vehicles',
      })

      expect(response.status).toBe(200)
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'published',
            deletedAt: null,
          }),
        })
      )
    })

    it('Public single vehicle lookup (GET /api/v1/vehicles/:slug) filters out soft-deleted vehicles', async () => {
      ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(null)

      const response = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/vehicles/archived-ferrari-slug',
      })

      expect(response.status).toBe(404)
      expect(prisma.vehicle.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            slug: 'archived-ferrari-slug',
            deletedAt: null,
          }),
        })
      )
    })

    it('Admin list query (GET /api/v1/admin/vehicles) includes soft-deleted vehicles', async () => {
      const mockVehicles = [
        { id: 'v-1', make: 'Ferrari', deletedAt: null },
        { id: 'v-2', make: 'Lamborghini', deletedAt: new Date() },
      ]
      ;(prisma.vehicle.findMany as jest.Mock).mockResolvedValue(mockVehicles)

      const response = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/admin/vehicles',
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
      // Admin query findMany does NOT restrict deletedAt: null
      const findManyCall = (prisma.vehicle.findMany as jest.Mock).mock.calls[0][0]
      expect(JSON.stringify(findManyCall.where ?? {})).not.toContain('deletedAt')
    })

    it('EMPIRICAL BUG: Sub-resource creation (POST /api/v1/vehicles/:id/hotspots) permits adding sub-resources to soft-deleted vehicles', async () => {
      const softDeletedVehicle = {
        id: 'v-deleted-123',
        slug: 'deleted-car',
        deletedAt: new Date(),
        status: 'archived',
      }
      ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(softDeletedVehicle)
      ;(prisma.vehicleHotspot.create as jest.Mock).mockResolvedValue({
        id: 'hs-on-deleted',
        vehicleId: 'v-deleted-123',
        title: 'Hotspot on soft deleted car',
      })

      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/vehicles/v-deleted-123/hotspots',
        headers: { Authorization: `Bearer ${editorToken}` },
        body: { title: 'Hotspot on soft deleted car', xPosition: 10, yPosition: 20 },
      })

      // Allowed because vehicle route findFirst does not check deletedAt: null for sub-resource operations!
      expect(response.status).toBe(201)
      expect(response.body.data.vehicleId).toBe('v-deleted-123')
    })
  })

  // ─── SECTION 3: Lead Status Updates & Invalid State Transitions ────────────
  describe('3. Lead Status Updates & Invalid State Transitions', () => {

    it('Zod validation error on invalid lead status returns 400 BAD_REQUEST with field details', async () => {
      const response = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/admin/leads/lead-123/status',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { status: 'INVALID_STATUS_STRING' },
      })

      // Fixed: error.middleware.ts now maps ZodError to 400 with field-level details
      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('EMPIRICAL BUG: No state machine transition guard - allows jumping directly from "new" to "converted"', async () => {
      const mockLeadConverted = { id: 'lead-123', status: 'converted' }

      ;(prisma.lead.update as jest.Mock).mockResolvedValue(mockLeadConverted)

      const response = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/admin/leads/lead-123/status',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { status: 'converted' },
      })

      // Unchecked state jump succeeds
      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('converted')
    })

    it('EMPIRICAL BUG: No terminal state guard - allows transitioning from terminal "converted" state back to "new"', async () => {
      const mockRevertedLead = { id: 'lead-123', status: 'new' }
      ;(prisma.lead.update as jest.Mock).mockResolvedValue(mockRevertedLead)

      const response = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/admin/leads/lead-123/status',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { status: 'new' },
      })

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('new')
    })

    it('PATCH /api/v1/leads/:id accepts "notification_failed" (consistency with admin PUT route)', async () => {
      ;(prisma.lead.update as jest.Mock).mockResolvedValue({ id: 'lead-123', status: 'notification_failed' })

      const response = await invokeApp(app, {
        method: 'PATCH',
        url: '/api/v1/leads/lead-123',
        headers: { Authorization: `Bearer ${editorToken}` },
        body: { status: 'notification_failed' },
      })

      // Fixed: notification_failed is now part of updateLeadSchema, matching the
      // admin PUT route and the Prisma LeadStatus enum.
      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('notification_failed')
    })
  })
})
