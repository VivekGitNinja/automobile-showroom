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
 * Splits and validates comma, semicolon, or newline-delimited image URLs.
 * Invalid or malformed tokens are skipped and reported via onWarning callback.
 */
export function parseImageUrls(raw: any, onWarning?: (warn: string) => void): string[] {
  if (!raw) return []
  const text = String(raw).trim()
  if (!text) return []

  const tokens = text.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean)
  const validUrls: string[] = []

  for (const token of tokens) {
    try {
      const parsed = new URL(token)
      if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && token.length <= 500) {
        if (!validUrls.includes(token)) {
          validUrls.push(token)
        }
      } else {
        onWarning?.(`Invalid image URL (protocol or length): "${token}"`)
      }
    } catch {
      onWarning?.(`Malformed image URL: "${token}"`)
    }
  }

  return validUrls
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
      const [sheetRowId, brandName, make, model, yearStr, priceStr, mileage, transmission, fuelType, statusStr, rawImageUrls] = row

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

        // Handle Multi-Image Gallery Attachments (11th column K)
        if (rawImageUrls) {
          const validUrls = parseImageUrls(rawImageUrls, (warn) => {
            logs.push(`[${new Date().toLocaleTimeString()}] ⚠️ Row ${processedCount} (${make} ${model}): ${warn}`)
          })

          if (validUrls.length > 0) {
            const existingImages = await prisma.vehicleImage.findMany({
              where: { vehicleId: vehicle.id },
            })
            const existingMap = new Map(existingImages.map((img) => [img.urlOriginal, img]))

            for (let i = 0; i < validUrls.length; i++) {
              const url = validUrls[i]
              const shouldBePrimary = i === 0
              const existingImg = existingMap.get(url)

              if (existingImg) {
                if (existingImg.isPrimary !== shouldBePrimary || existingImg.displayOrder !== i) {
                  await prisma.vehicleImage.update({
                    where: { id: existingImg.id },
                    data: { isPrimary: shouldBePrimary, displayOrder: i },
                  })
                }
              } else {
                if (shouldBePrimary) {
                  await prisma.vehicleImage.updateMany({
                    where: { vehicleId: vehicle.id, isPrimary: true },
                    data: { isPrimary: false },
                  })
                }
                await prisma.vehicleImage.create({
                  data: {
                    vehicleId: vehicle.id,
                    urlOriginal: url,
                    isPrimary: shouldBePrimary,
                    displayOrder: i,
                    title: `${make} ${model} ${shouldBePrimary ? 'Exterior Primary' : `Gallery ${i + 1}`}`,
                    mediaCategory: shouldBePrimary ? 'Exterior' : 'Gallery',
                  },
                })
              }
            }

            // If updating sheet-sourced images, clean up images no longer in sheet
            if (vehicle.source === 'google_sheets') {
              const validUrlSet = new Set(validUrls)
              const toDelete = existingImages.filter((img) => !validUrlSet.has(img.urlOriginal))
              for (const delImg of toDelete) {
                await prisma.vehicleImage.delete({ where: { id: delImg.id } })
              }
            }

            logs.push(
              `[${new Date().toLocaleTimeString()}] 📷 Attached ${validUrls.length} image(s) to ${make} ${model} (Primary: ${validUrls[0]}).`
            )
          }
        }
      } catch (rowErr: any) {
        const reason = `Row ${processedCount} error: ${rowErr.message}`
        logs.push(`[${new Date().toLocaleTimeString()}] ❌ Failed to process row ${processedCount}: ${rowErr.message}`)
        errors.push(reason)
      }
    }

    // ── Removal pass ────────────────────────────────────────────────────
    // Vehicles that were synced from the sheet but are no longer present in
    // it are unpublished (not deleted) so the live site reflects removals.
    // Skipped when the sheet read came back empty, so a transient empty read
    // can never unpublish the whole inventory.
    let removedCount = 0
    const seenRowIds = rows
      .map((r) => (Array.isArray(r) ? String(r[0] || '').trim() : ''))
      .filter(Boolean)

    if (seenRowIds.length > 0) {
      const syncedVehicles = await prisma.vehicle.findMany({
        where: { source: 'google_sheets', sheetRowId: { not: null }, deletedAt: null },
        select: { id: true, sheetRowId: true, status: true, make: true, model: true },
      })
      const seen = new Set(seenRowIds)
      const missing = syncedVehicles.filter((v) => v.sheetRowId && !seen.has(v.sheetRowId))
      for (const v of missing) {
        if (v.status === 'published' || v.status === 'draft') {
          await prisma.vehicle.update({
            where: { id: v.id },
            data: { status: 'unpublished', updatedBy: null },
          })
          removedCount++
          logs.push(`[${new Date().toLocaleTimeString()}] 🗑️ Unpublished ${v.make} ${v.model} (row ${v.sheetRowId} removed from sheet).`)
        }
      }
      if (missing.length > 0) {
        logs.push(`[${new Date().toLocaleTimeString()}] ${missing.length} sheet row(s) no longer present; ${removedCount} listing(s) unpublished.`)
      }
    }

    logs.push(`[${new Date().toLocaleTimeString()}] ✅ Sync complete: ${insertedCount} inserted, ${updatedCount} updated, ${removedCount} removed, ${errors.length} quarantined/failed.`)

    const status = errors.length > 0 ? (insertedCount + updatedCount + removedCount > 0 ? 'partial' : 'failed') : 'completed'
    const result = await finish(
      status,
      processedCount,
      insertedCount + updatedCount,
      `Synchronized ${insertedCount + updatedCount} vehicle listings (${insertedCount} new, ${updatedCount} updated, ${removedCount} removed).`,
      errors,
      status !== 'failed'
    )
    return result
  }
}

export const googleSheetsService = new GoogleSheetsService()
