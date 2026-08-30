import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { logger } from '../utils/logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  })

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    })
  }

  // Validation errors → 400 with field-level details
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    })
  }

  // Known Prisma errors → precise status codes
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE', message: 'A record with these unique values already exists' },
        })
      case 'P2003':
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REFERENCE', message: 'A referenced record does not exist' },
        })
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Record not found' },
        })
    }
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  })
}
