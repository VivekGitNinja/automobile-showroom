import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthRequest extends Request {
  user?: { userId: string; role: string }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false,
      error: { code: 'UNAUTHORIZED', message: 'No token provided' } })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; role: string }
    req.user = decoded
    return next()
  } catch (err) {
    const code = err instanceof jwt.TokenExpiredError ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    return res.status(401).json({ success: false,
      error: { code, message: 'Invalid or expired token' } })
  }
}
