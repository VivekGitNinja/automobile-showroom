import { createApp } from '../app'
import { invokeApp } from './testUtils'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../config/database'

jest.mock('../config/database', () => ({
  prisma: {
    vehicle: {
      findFirst: jest.fn(),
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
  },
}))

const app = createApp()
const editorToken = jwt.sign(
  { userId: '11111111-1111-1111-1111-111111111111', role: 'editor' },
  env.JWT_ACCESS_SECRET,
  { expiresIn: '1h' }
)
const adminToken = jwt.sign(
  { userId: '11111111-1111-1111-1111-111111111111', role: 'admin' },
  env.JWT_ACCESS_SECRET,
  { expiresIn: '1h' }
)

describe('Vehicle Sub-Resource CRUD and Edit/Soft-Delete', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PUT /api/v1/vehicles/:id', () => {
    it('should edit vehicle details', async () => {
      const mockVehicle = { id: 'veh-123', make: 'Ferrari', model: 'F8' }
      const mockUpdated = { id: 'veh-123', make: 'Ferrari', model: 'F8 Spider', price: 1200000 }
      ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(mockVehicle)
      ;(prisma.vehicle.update as jest.Mock).mockResolvedValue(mockUpdated)

      const response = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/vehicles/veh-123',
        headers: { Authorization: `Bearer ${editorToken}` },
        body: { model: 'F8 Spider', price: 1200000 },
      })

      expect(response.status).toBe(200)
      expect(response.body.data.model).toBe('F8 Spider')
    })
  })

  describe('DELETE /api/v1/vehicles/:id', () => {
    it('should soft delete vehicle', async () => {
      const mockVehicle = { id: 'veh-123', make: 'Ferrari' }
      ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(mockVehicle)
      ;(prisma.vehicle.update as jest.Mock).mockResolvedValue({ ...mockVehicle, status: 'archived' })

      const response = await invokeApp(app, {
        method: 'DELETE',
        url: '/api/v1/vehicles/veh-123',
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: true, message: 'Vehicle archived' })
    })
  })

  describe('Hotspot CRUD', () => {
    it('should create hotspot via POST /api/v1/vehicles/:id/hotspots', async () => {
      const mockVehicle = { id: 'veh-123' }
      const mockHotspot = { id: 'hs-1', title: 'Carbon Ceramic Brakes', xPosition: 50, yPosition: 60 }
      ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(mockVehicle)
      ;(prisma.vehicleHotspot.create as jest.Mock).mockResolvedValue(mockHotspot)

      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/vehicles/veh-123/hotspots',
        headers: { Authorization: `Bearer ${editorToken}` },
        body: { title: 'Carbon Ceramic Brakes', xPosition: 50, yPosition: 60 },
      })

      expect(response.status).toBe(201)
      expect(response.body.data.title).toBe('Carbon Ceramic Brakes')
    })

    it('should delete hotspot via DELETE /api/v1/vehicles/:id/hotspots/:hotspotId', async () => {
      (prisma.vehicleHotspot.delete as jest.Mock).mockResolvedValue({ id: 'hs-1' })

      const response = await invokeApp(app, {
        method: 'DELETE',
        url: '/api/v1/vehicles/veh-123/hotspots/hs-1',
        headers: { Authorization: `Bearer ${editorToken}` },
      })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: true, message: 'Hotspot deleted' })
    })
  })

  describe('Spec Config CRUD', () => {
    it('should create spec config via POST /api/v1/vehicles/:id/specs', async () => {
      const mockVehicle = { id: 'veh-123' }
      const mockSpec = { id: 'spec-1', name: 'Rosso Corsa', hexColor: '#FF0000', imageUrl: 'http://img.jpg' }
      ;(prisma.vehicle.findFirst as jest.Mock).mockResolvedValue(mockVehicle)
      ;(prisma.vehicleSpecConfig.create as jest.Mock).mockResolvedValue(mockSpec)

      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/vehicles/veh-123/specs',
        headers: { Authorization: `Bearer ${editorToken}` },
        body: { name: 'Rosso Corsa', hexColor: '#FF0000', imageUrl: 'http://img.jpg' },
      })

      expect(response.status).toBe(201)
      expect(response.body.data.name).toBe('Rosso Corsa')
    })

    it('should update spec config via PUT /api/v1/vehicles/:id/specs/:specId', async () => {
      const mockUpdatedSpec = { id: 'spec-1', name: 'Rosso Corsa Metallic' }
      ;(prisma.vehicleSpecConfig.update as jest.Mock).mockResolvedValue(mockUpdatedSpec)

      const response = await invokeApp(app, {
        method: 'PUT',
        url: '/api/v1/vehicles/veh-123/specs/spec-1',
        headers: { Authorization: `Bearer ${editorToken}` },
        body: { name: 'Rosso Corsa Metallic' },
      })

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe('Rosso Corsa Metallic')
    })

    it('should delete spec config via DELETE /api/v1/vehicles/:id/specs/:specId', async () => {
      (prisma.vehicleSpecConfig.delete as jest.Mock).mockResolvedValue({ id: 'spec-1' })

      const response = await invokeApp(app, {
        method: 'DELETE',
        url: '/api/v1/vehicles/veh-123/specs/spec-1',
        headers: { Authorization: `Bearer ${editorToken}` },
      })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: true, message: 'Spec config deleted' })
    })
  })
})
