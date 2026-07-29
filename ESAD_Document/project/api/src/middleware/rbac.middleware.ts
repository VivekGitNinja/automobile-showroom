import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'

const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 1, editor: 2, admin: 3, super_admin: 4,
}

export function rbac(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole  = req.user?.role ?? ''
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0
    const minLevel  = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] ?? 99))

    if (userLevel < minLevel) {
      return res.status(403).json({ success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } })
    }
    return next()
  }
}
