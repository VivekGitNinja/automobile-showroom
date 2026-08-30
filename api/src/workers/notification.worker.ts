import { Worker } from 'bullmq'
import { prisma } from '../config/database'
import { redisClient } from '../config/redis'
import sgMail from '@sendgrid/mail'
import { logger } from '../utils/logger'

const connection = { host: redisClient.options.host, port: redisClient.options.port }

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const notificationWorker = new Worker('notifications', async (job) => {
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

notificationWorker.on('failed', (job: any, err: any) => {
  logger.error(`Job ${job?.id} failed with error ${err.message}`)
  if (job && job.name === 'lead_notification' && job.data?.leadId && job.attemptsMade >= (job.opts?.attempts ?? 3)) {
    prisma.lead.update({
      where: { id: job.data.leadId },
      data: { status: 'notification_failed' },
    }).catch((e: any) => logger.error(`Failed to mark lead notification_failed: ${e.message}`))
  }
})

const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down notification worker gracefully`)
  await notificationWorker.close()
  await prisma.$disconnect()
  await redisClient.quit()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

logger.info('Notification worker started')
