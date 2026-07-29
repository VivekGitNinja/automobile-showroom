import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:                    z.enum(['development','test','production']).default('development'),
  PORT:                        z.string().default('4000'),
  DATABASE_URL:                z.string().default('postgresql://dev_user:dev_password@localhost:5432/showroom_dev'),
  REDIS_URL:                   z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET:           z.string().default('default-jwt-access-secret-32-characters-long-key-12345'),
  JWT_REFRESH_SECRET:          z.string().default('default-jwt-refresh-secret-32-characters-long-key-67890'),
  SENDGRID_API_KEY:            z.string().default('SG.mock_key_for_dev_mode'),
  SALES_EMAIL:                 z.string().email().default('sales@showroom.ae'),
  FROM_EMAIL:                  z.string().email().default('noreply@showroom.ae'),
  FROM_NAME:                   z.string().default('Luxury Showroom Dubai'),
  AWS_ACCESS_KEY_ID:           z.string().default('mock_aws_access_key'),
  AWS_SECRET_ACCESS_KEY:       z.string().default('mock_aws_secret_key'),
  AWS_REGION:                  z.string().default('us-east-1'),
  S3_BUCKET:                   z.string().default('showroom-vehicles-media'),
  CDN_BASE_URL:                z.string().default('http://localhost:4000'),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional(), // Using optional to not completely break dev instantly if sheet integration isn't used
  GOOGLE_SPREADSHEET_ID:       z.string().optional(),
  GOOGLE_SHEET_NAME:           z.string().default('Sheet1'),
  SYNC_CRON_SCHEDULE:          z.string().default('*/15 * * * *'),
  REVALIDATE_SECRET:           z.string().default('default-revalidate-secret-32-char-string'),
  REVALIDATE_URL:              z.string().default('http://localhost:3000/api/revalidate'),
  APP_VERSION:                 z.string().default('1.0.0'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
