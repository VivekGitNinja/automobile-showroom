import path from 'path'
import fs from 'fs'
import { logger } from '../utils/logger'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

export interface UploadFileOptions {
  filename: string
  buffer: Buffer
  mimeType: string
}

export interface UploadResult {
  url: string
  thumbnailUrl?: string
  provider: 's3' | 'r2' | 'local'
  key: string
}

export class StorageService {
  private s3Client?: S3Client
  private bucket: string | undefined
  private region: string | undefined
  private endpoint: string | undefined
  private localStorageDir: string

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || process.env.R2_BUCKET
    this.region = process.env.AWS_REGION || 'us-east-1'
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY
    this.endpoint = process.env.AWS_S3_ENDPOINT || process.env.R2_ENDPOINT

    if (this.bucket && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        endpoint: this.endpoint,
        forcePathStyle: true,
      })
    }
    
    this.localStorageDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(this.localStorageDir)) {
      fs.mkdirSync(this.localStorageDir, { recursive: true })
    }
  }

  /**
   * Checks if cloud S3/R2 storage is configured
   */
  public isCloudConfigured(): boolean {
    return Boolean(this.s3Client && this.bucket)
  }

  /**
   * Uploads file to S3/R2 cloud storage if configured, otherwise falls back to local disk
   */
  public async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const key = `vehicles/${Date.now()}-${options.filename}`
    const thumbKey = `vehicles/thumb-${Date.now()}-${options.filename}`
    let thumbBuffer: Buffer | null = null

    // Generate thumbnail if image
    if (options.mimeType.startsWith('image/')) {
      try {
        thumbBuffer = await sharp(options.buffer)
          .resize(300, 300, { fit: 'inside' })
          .jpeg({ quality: 80 })
          .toBuffer()
      } catch (err: any) {
        logger.warn(`Failed to generate thumbnail for ${options.filename}: ${err.message}`)
      }
    }

    if (this.isCloudConfigured() && this.bucket && this.s3Client) {
      try {
        logger.info(`Uploading file ${key} to cloud bucket (${this.bucket})...`)
        
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: options.buffer,
            ContentType: options.mimeType,
          })
        )

        let thumbUrl: string | undefined
        if (thumbBuffer) {
          await this.s3Client.send(
            new PutObjectCommand({
              Bucket: this.bucket,
              Key: thumbKey,
              Body: thumbBuffer,
              ContentType: 'image/jpeg',
            })
          )
          thumbUrl = this.endpoint
            ? `${this.endpoint}/${this.bucket}/${thumbKey}`
            : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${thumbKey}`
        }

        const cloudUrl = this.endpoint
          ? `${this.endpoint}/${this.bucket}/${key}`
          : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`

        return {
          url: cloudUrl,
          thumbnailUrl: thumbUrl,
          provider: this.endpoint?.includes('r2.cloudflarestorage.com') ? 'r2' : 's3',
          key,
        }
      } catch (err: any) {
        logger.error(`Cloud upload failed, using local disk fallback: ${err.message}`)
      }
    }

    // Local Disk Fallback
    const filePath = path.join(this.localStorageDir, options.filename)
    await fs.promises.writeFile(filePath, options.buffer)
    
    let thumbUrl: string | undefined
    if (thumbBuffer) {
      const thumbPath = path.join(this.localStorageDir, `thumb-${options.filename}`)
      await fs.promises.writeFile(thumbPath, thumbBuffer)
      thumbUrl = `/uploads/thumb-${options.filename}`
    }

    logger.info(`Saved file locally to ${filePath}`)

    return {
      url: `/uploads/${options.filename}`,
      thumbnailUrl: thumbUrl,
      provider: 'local',
      key: options.filename,
    }
  }
}

export const storageService = new StorageService()
