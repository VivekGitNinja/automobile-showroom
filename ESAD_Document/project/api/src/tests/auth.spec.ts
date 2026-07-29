import { createApp } from '../app'
import { invokeApp } from './testUtils'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../config/database'

jest.mock('../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const app = createApp()

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 401 if refresh token is invalid', async () => {
      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/auth/refresh',
        body: { refreshToken: 'invalid-token' },
      })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('should return new tokens when refresh token is valid', async () => {
      const mockUser = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'admin',
        isActive: true,
      }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const refreshToken = jwt.sign({ userId: mockUser.id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/auth/refresh',
        body: { refreshToken },
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body.user.email).toBe('admin@example.com')
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    it('should return 200 and success message', async () => {
      const response = await invokeApp(app, {
        method: 'POST',
        url: '/api/v1/auth/logout',
      })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ success: true, message: 'Logged out successfully' })
    })
  })

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 if no auth header', async () => {
      const response = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/auth/me',
      })

      expect(response.status).toBe(401)
    })

    it('should return user profile when authenticated', async () => {
      const mockUser = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'admin',
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const token = jwt.sign(
        { userId: mockUser.id, role: mockUser.role },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      )

      const response = await invokeApp(app, {
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: { Authorization: `Bearer ${token}` },
      })

      expect(response.status).toBe(200)
      expect(response.body.user).toHaveProperty('email', 'admin@example.com')
    })
  })
})
