import { createApp } from '../app'
import { invokeApp } from './testUtils'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../config/database'

jest.mock('../config/database', () => ({
  prisma: {
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
const adminToken = jwt.sign(
  { userId: '11111111-1111-1111-1111-111111111111', role: 'admin' },
  env.JWT_ACCESS_SECRET,
  { expiresIn: '1h' }
)

describe('Admin Lead Management Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/v1/admin/leads', () => {
    it('should return paginated leads list', async () => {
      const mockLeads = [
        { id: 'lead-1', fullName: 'John Doe', email: 'john@example.com', status: 'new', leadType: 'enquiry' },
      ]
      ;(prisma.lead.count as jest.Mock).mockResolvedValue(1)
      ;(prisma.lead.findMany as jest.Mock).mockResolvedValue(mockLeads)

      const response = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/admin/leads?page=1&limit=10&status=new',
        headers: { Authorization: `Bearer ${adminToken}` },
        query: { page: '1', limit: '10', status: 'new' },
      })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 })
    })
  })

  describe('GET /api/v1/admin/leads/sell-car', () => {
    it('should return sell car submissions list', async () => {
      const mockSubmissions = [
        { id: 'sell-1', fullName: 'Jane Doe', carMake: 'Porsche', carModel: '911', status: 'new' },
      ]
      ;(prisma.sellCarSubmission.count as jest.Mock).mockResolvedValue(1)
      ;(prisma.sellCarSubmission.findMany as jest.Mock).mockResolvedValue(mockSubmissions)

      const response = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/admin/leads/sell-car',
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })
  })

  describe('PUT /api/v1/admin/leads/sell-car/:id', () => {
    it('should update sell car submission status', async () => {
      const mockUpdated = { id: 'sell-1', status: 'reviewing' }
      ;(prisma.sellCarSubmission.update as jest.Mock).mockResolvedValue(mockUpdated)

      const response = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/admin/leads/sell-car/sell-1',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { status: 'reviewing' },
      })

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('reviewing')
    })
  })

  describe('PUT /api/v1/admin/leads/:id/status', () => {
    it('should update lead status', async () => {
      const mockUpdatedLead = { id: 'lead-1', status: 'contacted' }
      ;(prisma.lead.update as jest.Mock).mockResolvedValue(mockUpdatedLead)

      const response = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/admin/leads/lead-1/status',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { status: 'contacted' },
      })

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('contacted')
    })
  })

  describe('PUT /api/v1/admin/leads/:id/assign', () => {
    it('should assign lead to sales rep', async () => {
      const repId = '22222222-2222-2222-2222-222222222222'
      const mockUpdatedLead = { id: 'lead-1', assignedTo: repId }
      ;(prisma.lead.update as jest.Mock).mockResolvedValue(mockUpdatedLead)

      const response = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/admin/leads/lead-1/assign',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { assignedTo: repId },
      })

      expect(response.status).toBe(200)
      expect(response.body.data.assignedTo).toBe(repId)
    })
  })

  describe('POST /api/v1/admin/leads/:id/notes', () => {
    it('should add note to lead metadata', async () => {
      const mockLead = { id: 'lead-1', metadata: {} }
      const mockUpdatedLead = {
        id: 'lead-1',
        metadata: { notes: [{ note: 'Followed up via call' }] },
      }
      ;(prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead)
      ;(prisma.lead.update as jest.Mock).mockResolvedValue(mockUpdatedLead)

      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/admin/leads/lead-1/notes',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { note: 'Followed up via call' },
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('note')
      expect(response.body.note.note).toBe('Followed up via call')
    })
  })
})
