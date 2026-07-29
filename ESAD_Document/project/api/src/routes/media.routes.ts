import { Router, Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { storageService } from '../services/storage.service'
import { authMiddleware } from '../middleware/auth.middleware'
import { rbac } from '../middleware/rbac.middleware'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.use(authMiddleware, rbac('admin'))

/**
 * POST /api/v1/media/upload
 * Handles media upload to S3 / Cloudflare R2 with local fallback
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'No file provided' })
      return
    }

    const mediaType = req.body.mediaType || 'image_exterior'
    const title = req.body.title || req.file.originalname

    const uploadResult = await storageService.uploadFile({
      filename: req.file.originalname,
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
    })

    res.json({
      status: 'success',
      data: {
        ...uploadResult,
        mediaType,
        title,
        fileSize: req.file.size
      },
    })
  } catch (err: any) {
    next(err)
  }
})

/**
 * POST /api/v1/media/upload/batch
 * Enterprise DAM batch upload support
 */
router.post('/upload/batch', upload.array('files', 50), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({ status: 'error', message: 'No files provided' })
      return
    }

    const results = await Promise.all(
      req.files.map(async (file) => {
        const uploadResult = await storageService.uploadFile({
          filename: file.originalname,
          buffer: file.buffer,
          mimeType: file.mimetype,
        })
        return {
          ...uploadResult,
          fileSize: file.size,
          mimeType: file.mimetype,
          originalName: file.originalname
        }
      })
    )

    res.json({
      status: 'success',
      data: results,
    })
  } catch (err: any) {
    next(err)
  }
})

/**
 * GET /api/v1/media/status
 * Returns cloud storage configuration status
 */
router.get('/status', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    res.json({
      cloudConfigured: storageService.isCloudConfigured(),
      provider: process.env.R2_BUCKET ? 'cloudflare-r2' : process.env.AWS_S3_BUCKET ? 'aws-s3' : 'local-fallback',
    })
  } catch (err: any) {
    next(err)
  }
})

export default router
