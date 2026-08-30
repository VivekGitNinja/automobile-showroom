import { google } from 'googleapis'
import { prisma } from '../config/database'
import { logger } from '../utils/logger'

export interface GoogleSheetsSyncResult {
  success: boolean
  processedCount: number
  updatedCount: number
  message: string
  logs: string[]
  timestamp: string
}

interface ServiceAccountCredentials {
  client_email: string
  private_key: string
}

/**
 * Resolves Google Sheets credentials from the supported environment contracts:
 *  - GOOGLE_SERVICE_ACCOUNT_JSON: raw or base64-encoded service-account JSON
 *  - GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY: explicit pair
 *  - GOOGLE_SPREADSHEET_ID or GOOGLE_SHEET_ID: target spreadsheet
 *  - GOOGLE_SHEET_NAME: tab name (default "Inventory")
 */
function resolveCredentials(): {
  spreadsheetId?: string
  credentials?: ServiceAccountCredentials
  sheetName: string
} {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Inventory'

  let credentials: ServiceAccountCredentials | undefined

  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (jsonRaw) {
    try {
      const decoded = jsonRaw.trim().startsWith('{')
        ? jsonRaw
        : Buffer.from(jsonRaw, 'base64').toString('utf-8')
      const parsed = JSON.parse(decoded)
      if (parsed.client_email && parsed.private_key) {
        credentials = {
          client_email: parsed.client_email,
          private_key: parsed.private_key.replace(/\\n/g, '\n'),
        }
      }
    } catch (err: any) {
      logger.error(`GOOGLE_SERVICE_ACCOUNT_JSON is set but could not be parsed: ${err?.message}`)
    }
  }

  if (!credentials && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }

  return { spreadsheetId, credentials, sheetName }
}

export class GoogleSheetsService {
  public isConfigured(): boolean {
    const { spreadsheetId, credentials } = resolveCredentials()
    return Boolean(spreadsheetId && credentials)
  }

  public async syncInventory(): Promise<GoogleSheetsSyncResult> {
    const timestamp = new Date().toISOString()
    const logs: string[] = [
      `[${new Date().toLocaleTimeString()}] Initializing Google Sheets Inventory Sync Worker...`,
    ]

    let syncLogRecord: { id: string } | undefined
    try {
      syncLogRecord = await prisma.syncLog.create({
        data: {
          status: 'running',
          triggeredBy: process.env.SYNC_TRIGGERED_BY || 'manual_or_cron',
        },
      })
    } catch (e) {
      logger.error('Failed to create syncLog record', e)
    }

    const finish = async (
      status: 'completed' | 'partial' | 'failed',
      processedCount: number,
      updatedCount: number,
      message: string,
      errors: string[],
      success: boolean
    ): Promise<GoogleSheetsSyncResult> => {
      if (syncLogRecord) {
        await prisma.syncLog.update({
          where: { id: syncLogRecord.id },
          data: {
            status,
            rowsProcessed: processedCount,
            rowsUpdated: updatedCount,
            errorsJson: errors.length > 0 ? JSON.stringify(errors) : undefined,
            completedAt: new Date(),
          },
        }).catch((e) => logger.error('Failed to finalize syncLog record', e))
      }
      return { success, processedCount, updatedCount, message, logs, timestamp }
    }

    const { spreadsheetId, credentials, sheetName } = resolveCredentials()

    if (!spreadsheetId || !credentials) {
      const msg = 'Google Sheets sync is not configured. Set GOOGLE_SHEET_ID (or GOOGLE_SPREADSHEET_ID) and GOOGLE_SERVICE_ACCOUNT_JSON (or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY).'
      logs.push(`[${new Date().toLocaleTimeString()}] ❌ ${msg}`)
      logs.push(`[${new Date().toLocaleTimeString()}] No demo data was seeded — the website inventory is untouched.`)
      return finish('failed', 0, 0, msg, [msg], false)
    }

    let rows: any[] = []
    try {
      logs.push(`[${new Date().toLocaleTimeString()}] Authenticating with Google Sheets API v4...`)
      const auth = new google.auth.JWT(
        credentials.client_email,
        undefined,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets.readonly']
      )
      const sheets = google.sheets({ version: 'v4', auth })
      logs.push(`[${new Date().toLocaleTimeString()}] Fetching data from Spreadsheet ID: ${spreadsheetId} [${sheetName}!A2:Z]...`)
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A2:Z`,
      })
      rows = response.data.values || []
    } catch (err: any) {
      const errorMsg = `Google Sheets API error: ${err?.message || 'Unknown error'}`
      logs.push(`[${new Date().toLocaleTimeString()}] ❌ ERROR: ${errorMsg}`)
      return finish('failed', 0, 0, errorMsg, [errorMsg], false)
    }

    if (!rows || rows.length === 0) {
      logs.push(`[${new Date().toLocaleTimeString()}] ⚠️ WARNING: No data found to sync.`)
      return finish('completed', 0, 0, 'No data found.', [], true)
    }

    logs.push(`[${new Date().toLocaleTimeString()}] Processing ${rows.length} rows...`)

    let processedCount = 0
    let updatedCount = 0
    let insertedCount = 0
    const errors: string[] = []

    for (const row of rows) {
      processedCount++
      const [sheetRowId, brandName, make, model, yearStr, priceStr, mileage, transmission, fuelType, statusStr, imageUrl] = row

      // Validation: a malformed row must never break the sync or corrupt a
      // listing — it is quarantined for staff review instead.
      const validationErrors: string[] = []
      if (!sheetRowId) validationErrors.push('Missing RowID')
      if (!make) validationErrors.push('Missing Make')
      if (!model) validationErrors.push('Missing Model')
      const year = parseInt(String(yearStr || ''), 10)
      if (!yearStr || isNaN(year)) validationErrors.push('Missing or invalid Year')
      const price = parseFloat(String(priceStr || '').replace(/[^0-9.-]+/g, ''))
      if (!priceStr || isNaN(price)) validationErrors.push('Missing or invalid Price')

      if (validationErrors.length > 0) {
        const reason = `Row ${processedCount}: ${validationErrors.join('; ')}`
        logs.push(`[${new Date().toLocaleTimeString()}] ⚠️ Row quarantined: ${reason}`)
        errors.push(reason)
        try {
          await prisma.syncQuarantine.create({
            data: {
              sheetRowId: sheetRowId || null,
              rawRowData: JSON.parse(JSON.stringify(row)),
              validationErrors: JSON.parse(JSON.stringify(validationErrors)),
            },
          })
        } catch (qErr: any) {
          logger.error(`Failed to quarantine row ${processedCount}: ${qErr?.message}`)
        }
        continue
      }

      try {
        const slug = `${make}-${model}-${year}-${sheetRowId}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')

        let brandId = null
        if (brandName) {
          const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          const brand = await prisma.brand.upsert({
            where: { slug: brandSlug },
            update: {},
            create: { name: brandName, slug: brandSlug }
          })
          brandId = brand.id
        }

        let vehicleStatus: 'draft' | 'published' | 'unpublished' | 'archived' = 'draft'
        if (statusStr && statusStr.toLowerCase() === 'published') vehicleStatus = 'published'

        const existing = await prisma.vehicle.findUnique({ where: { sheetRowId: String(sheetRowId) } })

        const payload = {
          make: String(make),
          model: String(model),
          year,
          price,
          mileage: mileage ? String(mileage) : null,
          transmission: transmission ? String(transmission) : null,
          fuelType: fuelType ? String(fuelType) : null,
          status: vehicleStatus,
          brandId,
        }

        const vehicle = existing
          ? await prisma.vehicle.update({ where: { id: existing.id }, data: payload })
          : await prisma.vehicle.create({
              data: {
                ...payload,
                slug,
                sheetRowId: String(sheetRowId),
                source: 'google_sheets',
              }
            })

        if (existing) updatedCount++
        else insertedCount++

        // Handle Image Attachments (if provided in 11th column)
        if (imageUrl) {
          const existingImage = await prisma.vehicleImage.findFirst({
            where: { vehicleId: vehicle.id, urlOriginal: String(imageUrl) }
          })
          if (!existingImage) {
            // New sheet image becomes the primary; previous primary is demoted.
            await prisma.vehicleImage.updateMany({
              where: { vehicleId: vehicle.id, isPrimary: true },
              data: { isPrimary: false },
            })
            await prisma.vehicleImage.create({
              data: {
                vehicleId: vehicle.id,
                urlOriginal: String(imageUrl),
                isPrimary: true,
                title: `${make} ${model} Exterior`
              }
            })
            logs.push(`[${new Date().toLocaleTimeString()}] 📷 Attached primary image to ${make} ${model}.`)
          }
        }
      } catch (rowErr: any) {
        const reason = `Row ${processedCount} error: ${rowErr.message}`
        logs.push(`[${new Date().toLocaleTimeString()}] ❌ Failed to process row ${processedCount}: ${rowErr.message}`)
        errors.push(reason)
      }
    }

    logs.push(`[${new Date().toLocaleTimeString()}] ✅ Sync complete: ${insertedCount} inserted, ${updatedCount} updated, ${errors.length} quarantined/failed.`)

    const status = errors.length > 0 ? (insertedCount + updatedCount > 0 ? 'partial' : 'failed') : 'completed'
    const result = await finish(
      status,
      processedCount,
      insertedCount + updatedCount,
      `Synchronized ${insertedCount + updatedCount} vehicle listings (${insertedCount} new, ${updatedCount} updated).`,
      errors,
      status !== 'failed'
    )
    return result
  }
}

export const googleSheetsService = new GoogleSheetsService()
