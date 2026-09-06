import { createApp } from '../app'
import { invokeApp } from './testUtils'
import { prisma } from '../config/database'
import { notificationQueue } from '../config/bullmq'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

jest.mock('../config/database', () => ({
  prisma: {
    lead: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    vehicle: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('../config/bullmq', () => ({
  notificationQueue: {
    add: jest.fn().mockResolvedValue({ id: 'job-callback-1' }),
  },
}))

const app = createApp()
const adminToken = jwt.sign(
  { userId: '11111111-1111-1111-1111-111111111111', role: 'admin' },
  env.JWT_ACCESS_SECRET,
  { expiresIn: '1h' }
)

describe('WP2 — Build the Missing Callback Form', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('submits callback lead with vehicle context → returns 201 and queues notification', async () => {
    const testVehicleId = '22222222-2222-2222-2222-222222222222'
    const mockCreatedLead = {
      id: 'lead-callback-1',
      fullName: 'Sheikh Mohammed',
      email: 'mohammed@apex.ae',
      phone: '+971508919441',
      leadType: 'callback',
      vehicleId: testVehicleId,
      message: 'Callback request for 2023 Rolls-Royce Phantom. Preferred time: Afternoon (1:00 PM – 5:00 PM).',
      status: 'new',
      createdAt: new Date().toISOString(),
    }

    ;(prisma.lead.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.vehicle.findUnique as jest.Mock).mockResolvedValue({
      id: testVehicleId,
      make: 'Rolls-Royce',
      model: 'Phantom',
      year: 2023,
    })
    ;(prisma.lead.create as jest.Mock).mockResolvedValue(mockCreatedLead)

    const postRes = await invokeApp(app, {
      method: 'POST',
      url: '/api/v1/leads',
      body: {
        fullName: 'Sheikh Mohammed',
        email: 'mohammed@apex.ae',
        phone: '+971508919441',
        leadType: 'callback',
        vehicleId: testVehicleId,
        message: 'Callback request for 2023 Rolls-Royce Phantom. Preferred time: Afternoon (1:00 PM – 5:00 PM).',
      },
    })

    expect(postRes.status).toBe(201)
    expect(postRes.body.data.leadType).toBe('callback')
    expect(prisma.lead.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fullName: 'Sheikh Mohammed',
        email: 'mohammed@apex.ae',
        phone: '+971508919441',
        leadType: 'callback',
        vehicleId: testVehicleId,
      }),
    })

    // Verify notification worker queue received the job with vehicle summary
    expect(notificationQueue.add).toHaveBeenCalledWith(
      'lead_notification',
      expect.objectContaining({
        leadId: 'lead-callback-1',
        vehicleId: testVehicleId,
        subject: expect.stringContaining('CALLBACK'),
      })
    )
  })

  it('admin Leads UI can filter by leadType=callback and display vehicle context', async () => {
    const mockCallbackLeads = [
      {
        id: 'lead-callback-1',
        fullName: 'Sheikh Mohammed',
        email: 'mohammed@apex.ae',
        phone: '+971508919441',
        leadType: 'callback',
        vehicle: {
          id: '22222222-2222-2222-2222-222222222222',
          make: 'Rolls-Royce',
          model: 'Phantom',
          year: 2023,
          slug: 'rolls-royce-phantom-2023',
        },
        message: 'Callback request for 2023 Rolls-Royce Phantom. Preferred time: Afternoon (1:00 PM – 5:00 PM).',
        status: 'new',
        createdAt: new Date().toISOString(),
      },
    ]

    ;(prisma.lead.count as jest.Mock).mockResolvedValue(1)
    ;(prisma.lead.findMany as jest.Mock).mockResolvedValue(mockCallbackLeads)

    const adminRes = await invokeApp(app, {
      method: 'GET',
      url: '/api/v1/admin/leads?leadType=callback',
      headers: { Authorization: `Bearer ${adminToken}` },
      query: { leadType: 'callback' },
    })

    expect(adminRes.status).toBe(200)
    expect(adminRes.body.data).toHaveLength(1)
    expect(adminRes.body.data[0].leadType).toBe('callback')
    expect(adminRes.body.data[0].vehicle.make).toBe('Rolls-Royce')
    expect(adminRes.body.data[0].vehicle.model).toBe('Phantom')
    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ leadType: 'callback' }),
      })
    )
  })
})
