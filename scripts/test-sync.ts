#!/usr/bin/env ts-node
/**
 * ==============================================================================
 * Apex Luxury Automobiles — Integration Proof: Google Sheets Sync Test
 * ==============================================================================
 * Usage:
 *   npx ts-node scripts/test-sync.ts
 *
 * Performs a read-only probe against the configured Google Sheets spreadsheet.
 */

let google: any
try {
  google = require('googleapis').google
} catch {
  const path = require('path')
  const resolved = require.resolve('googleapis', { paths: [path.join(__dirname, '../api'), path.join(__dirname, '../api/node_modules')] })
  google = require(resolved).google
}

const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID
const sheetName = process.env.GOOGLE_SHEET_NAME || 'Inventory'

console.log('════════════════════════════════════════════════════════════════')
console.log('  APEX LUXURY AUTOMOBILES — GOOGLE SHEETS INTEGRATION PROOF')
console.log('════════════════════════════════════════════════════════════════')
console.log(`  Spreadsheet ID:  ${spreadsheetId || '(not set)'}`)
console.log(`  Target Tab:      ${sheetName}`)

let clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
let privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim()
    const decoded = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8')
    const parsed = JSON.parse(decoded)
    clientEmail = parsed.client_email
    privateKey = parsed.private_key
  } catch (e: any) {
    console.error(`❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON: ${e?.message}`)
  }
}

if (!spreadsheetId || !clientEmail || !privateKey) {
  console.log('\n⚠️  STATUS: Google Sheets sync is UNCONFIGURED.')
  console.log('   The platform remains in safe mode without altering database inventory.')
  console.log('\n   To configure synchronization:')
  console.log('   1. Create a Google Cloud Service Account with Sheets API enabled.')
  console.log('   2. Share your spreadsheet with Editor access to:')
  console.log(`      ${clientEmail || '<service-account-email>'}`)
  console.log('   3. Set the following in api/.env:')
  console.log('      GOOGLE_SHEET_ID=<spreadsheet_id>')
  console.log('      GOOGLE_SHEET_NAME=Inventory')
  console.log('      GOOGLE_SERVICE_ACCOUNT_EMAIL=<email>')
  console.log('      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."')
  console.log('   (See SETUP.md §3 for step-by-step instructions)\n')
  process.exit(0)
}

console.log(`  Service Account: ${clientEmail}`)
console.log('\n📡 Probing Google Sheets API v4 (Read-Only)...')

async function runProbe() {
  try {
    const auth = new google.auth.JWT(
      clientEmail,
      undefined,
      privateKey!.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    )

    const sheets = google.sheets({ version: 'v4', auth })
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z`,
    })

    const rows = response.data.values || []
    console.log(`✅ SUCCESS: Connected to Google Sheets API successfully.`)
    console.log(`   Spreadsheet Title: "${sheetName}"`)
    console.log(`   Rows Detected:     ${rows.length} total rows (including header)`)
    if (rows.length > 0) {
      console.log(`   Headers (Row 1):   ${rows[0].join(' | ')}`)
      if (rows.length > 1) {
        console.log(`   Vehicle Rows:      ${rows.length - 1} inventory row(s) ready for sync.`)
      }
    }
  } catch (err: any) {
    console.error(`❌ FAILED to read Google Sheet: ${err.message}`)
    if (err.message?.includes('The caller does not have permission')) {
      console.error(`   👉 ACTION REQUIRED: Open your Google Sheet → Share → Add Editor permission for:`)
      console.error(`      ${clientEmail}`)
    }
    process.exit(1)
  }
}

runProbe()
