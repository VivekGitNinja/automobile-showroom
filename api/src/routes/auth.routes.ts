import { Router, Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { prisma } from '../config/database'
import { env } from '../config/env'
import { z } from 'zod'
import { loginLimiter } from '../middleware/rateLimit.middleware'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const refreshSchema = z.object({
  refreshToken: z.string(),
})

router.post('/login', loginLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body)

    let decoded: any
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET)
    } catch (jwtErr) {
      res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' } })
      return
    }

    const userId = decoded.userId
    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token payload' } })
      return
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found or inactive' } })
      return
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    )

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/logout
router.post('/logout', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found or inactive' } })
      return
    }

    res.json({ user })
  } catch (err) {
    next(err)
  }
})

export default router
