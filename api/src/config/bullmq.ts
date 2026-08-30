import { Queue, Worker } from 'bullmq'
import { redisClient } from './redis'
import sgMail from '@sendgrid/mail'
import { logger } from '../utils/logger'
import { prisma } from './database'

const connection = { host: redisClient.options.host, port: redisClient.options.port }

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const isTest = process.env.NODE_ENV === 'test'

// ─── Queues ──────────────────────────────────────────
export const notificationQueue: any = isTest
  ? { add: async (name: string, data: any) => ({ id: 'mock-job-id', name, data }) }
  : new Queue('notifications', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 30000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    })

// ─── Workers ─────────────────────────────────────────
// The API runs an inline worker by default so leads are notified even in
// single-container deployments. When a dedicated notification worker service
// exists (docker-compose "notif-worker"), set DISABLE_INLINE_WORKER=true on
// the API to avoid double-sending.
export const notificationWorker: any = (isTest || process.env.DISABLE_INLINE_WORKER === 'true')
  ? { on: () => {}, close: async () => {} }
  : new Worker('notifications', async (job) => {
      const { to, subject, text, html } = job.data

      if (!process.env.SENDGRID_API_KEY) {
        logger.warn('SENDGRID_API_KEY is not set. Skipping email send.')
        return { success: false, message: 'No SendGrid API Key' }
      }

      try {
        const recipients = Array.isArray(to) ? to : [to]
        for (const recipient of recipients) {
          const msg = {
            to: recipient,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@luxuryshowroom.com',
            subject,
            text,
            html,
          }
          await sgMail.send(msg)
          logger.info(`Email sent successfully to ${recipient}`)
        }
        if (job.name === 'lead_notification' && job.data.leadId) {
          await prisma.lead.updateMany({
            where: { id: job.data.leadId, status: 'new' },
            data: { status: 'notified' },
          }).catch((e: any) => logger.error(`Failed to mark lead notified: ${e.message}`))
        }
        return { success: true }
      } catch (error: any) {
        logger.error(`Failed to send email: ${error.message}`)
        throw error
      }
    }, { connection })

if (!isTest && notificationWorker && notificationWorker.on) {
  notificationWorker.on('failed', (job: any, err: any) => {
    logger.error(`Job ${job?.id} failed with error ${err.message}`)
    if (job && job.name === 'lead_notification' && job.data?.leadId && job.attemptsMade >= (job.opts?.attempts ?? 3)) {
      prisma.lead.update({
        where: { id: job.data.leadId },
        data: { status: 'notification_failed' },
      }).catch((e: any) => logger.error(`Failed to mark lead notification_failed: ${e.message}`))
    }
  })
}

export { connection as bullConnection }
