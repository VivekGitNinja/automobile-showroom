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

export class GoogleSheetsService {
  private spreadsheetId: string | undefined
  private clientEmail: string | undefined
  private privateKey: string | undefined

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
    this.clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    this.privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined
  }

  /**
   * Validates if Google Service Account credentials are configured
   */
  public isConfigured(): boolean {
    return Boolean(this.spreadsheetId && this.clientEmail && this.privateKey)
  }

  /**
   * Syncs vehicle inventory from Google Sheets
   */
  public async syncInventory(): Promise<GoogleSheetsSyncResult> {
    const timestamp = new Date().toISOString()
    const logs: string[] = [
      `[${new Date().toLocaleTimeString()}] Initializing Google Sheets Inventory Sync Worker...`,
    ]

    let syncLogRecord
    try {
      syncLogRecord = await prisma.syncLog.create({
        data: {
          status: 'running',
          triggeredBy: 'manual_or_cron',
        },
      })
    } catch (e) {
      logger.error('Failed to create syncLog record', e)
    }

    if (!this.isConfigured()) {
      const msg = 'Google Sheets credentials missing (GOOGLE_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY).'
      logs.push(`[${new Date().toLocaleTimeString()}] ⚠️ WARNING: ${msg}`)
      logs.push(`[${new Date().toLocaleTimeString()}] 💡 System using fallback internal database inventory. No records altered.`)
      logger.warn(msg)

      if (syncLogRecord) {
        await prisma.syncLog.update({
          where: { id: syncLogRecord.id },
          data: { status: 'failed', errorsJson: JSON.stringify([msg]), completedAt: new Date() }
        })
      }

      return {
        success: false,
        processedCount: 0,
        updatedCount: 0,
        message: 'Sync failed: Missing Google API credentials in .env.',
        logs,
        timestamp,
      }
    }

    try {
      logs.push(`[${new Date().toLocaleTimeString()}] Authenticating with Google Sheets API v4...`)
      
      const auth = new google.auth.JWT(
        this.clientEmail,
        undefined,
        this.privateKey,
        ['https://www.googleapis.com/auth/spreadsheets.readonly']
      )

      const sheets = google.sheets({ version: 'v4', auth })

      logs.push(`[${new Date().toLocaleTimeString()}] Fetching data from Spreadsheet ID: ${this.spreadsheetId}...`)
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Inventory!A2:Z', // Assumes a sheet named 'Inventory' with headers in row 1
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) {
        logs.push(`[${new Date().toLocaleTimeString()}] ⚠️ WARNING: No data found in the specified range.`)
        if (syncLogRecord) {
          await prisma.syncLog.update({
            where: { id: syncLogRecord.id },
            data: { status: 'completed', completedAt: new Date() }
          })
        }
        return {
          success: true,
          processedCount: 0,
          updatedCount: 0,
          message: 'No data found in Google Sheets.',
          logs,
          timestamp,
        }
      }

      logs.push(`[${new Date().toLocaleTimeString()}] Processing ${rows.length} rows...`)
      
      let processedCount = 0
      let updatedCount = 0
      let errors = []

      // Standard headers assumed: [RowID, Brand, Make, Model, Year, Price, Mileage, Transmission, FuelType, Status]
      for (const row of rows) {
        processedCount++
        try {
          const [sheetRowId, brandName, make, model, yearStr, priceStr, mileage, transmission, fuelType, statusStr] = row
          
          if (!sheetRowId || !make || !model || !yearStr || !priceStr) {
             logs.push(`[${new Date().toLocaleTimeString()}] ⚠️ Row skipped: missing required fields (RowID, Make, Model, Year, Price).`)
             errors.push(`Row ${processedCount} missing fields.`)
             continue
          }

          const year = parseInt(yearStr, 10)
          const price = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""))

          if (isNaN(year) || isNaN(price)) {
             logs.push(`[${new Date().toLocaleTimeString()}] ⚠️ Row skipped: invalid year or price for ${make} ${model}.`)
             errors.push(`Row ${processedCount} invalid numbers.`)
             continue
          }

          const slug = `${make}-${model}-${year}-${sheetRowId}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')

          // Upsert Brand if necessary (simplified for sync)
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

          await prisma.vehicle.upsert({
            where: { sheetRowId: sheetRowId },
            update: {
              make,
              model,
              year,
              price,
              mileage,
              transmission,
              fuelType,
              status: vehicleStatus,
              brandId
            },
            create: {
              make,
              model,
              year,
              slug,
              price,
              mileage,
              transmission,
              fuelType,
              sheetRowId,
              status: vehicleStatus,
              source: 'google_sheets',
              brandId
            }
          })

          updatedCount++
        } catch (rowErr: any) {
           logs.push(`[${new Date().toLocaleTimeString()}] ❌ Failed to process row ${processedCount}: ${rowErr.message}`)
           errors.push(`Row ${processedCount} error: ${rowErr.message}`)
        }
      }

      logs.push(`[${new Date().toLocaleTimeString()}] ✅ Sync complete: ${updatedCount} vehicles updated in database.`)

      if (syncLogRecord) {
        await prisma.syncLog.update({
          where: { id: syncLogRecord.id },
          data: { 
            status: errors.length > 0 ? (updatedCount > 0 ? 'partial' : 'failed') : 'completed', 
            rowsProcessed: processedCount,
            rowsUpdated: updatedCount,
            errorsJson: JSON.stringify(errors),
            completedAt: new Date() 
          }
        })
      }

      return {
        success: true,
        processedCount,
        updatedCount,
        message: `Successfully synchronized ${updatedCount} vehicle listings from Google Sheets.`,
        logs,
        timestamp,
      }
    } catch (err: any) {
      const errorMsg = `Google Sheets sync error: ${err?.message || 'Unknown error'}`
      logs.push(`[${new Date().toLocaleTimeString()}] ❌ ERROR: ${errorMsg}`)
      logger.error(errorMsg)

      if (syncLogRecord) {
        await prisma.syncLog.update({
          where: { id: syncLogRecord.id },
          data: { status: 'failed', errorsJson: JSON.stringify([errorMsg]), completedAt: new Date() }
        })
      }

      return {
        success: false,
        processedCount: 0,
        updatedCount: 0,
        message: errorMsg,
        logs,
        timestamp,
      }
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()
