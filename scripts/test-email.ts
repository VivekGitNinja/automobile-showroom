#!/usr/bin/env ts-node
/**
 * ==============================================================================
 * Apex Luxury Automobiles — Integration Proof: Test Email Dispatch
 * ==============================================================================
 * Usage:
 *   npx ts-node scripts/test-email.ts [recipient@domain.com]
 *
 * Verifies SendGrid / Mail Provider credentials by sending a live test notification.
 */

import https from 'https'

const targetEmail = process.argv[2] || process.env.SALES_EMAIL || 'sales@apexluxuryautomobiles.com'
const sendgridApiKey = process.env.SENDGRID_API_KEY
const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@apexluxuryautomobiles.com'
const fromName = process.env.FROM_NAME || 'Apex Luxury Automobiles Concierge'

console.log('════════════════════════════════════════════════════════════════')
console.log('  APEX LUXURY AUTOMOBILES — EMAIL INTEGRATION TEST')
console.log('════════════════════════════════════════════════════════════════')
console.log(`  Recipient:  ${targetEmail}`)
console.log(`  Sender:     ${fromName} <${fromEmail}>`)
console.log(`  Provider:   SendGrid v3 API`)

if (!sendgridApiKey || sendgridApiKey.startsWith('SG.xxx') || sendgridApiKey.length < 20) {
  console.log('\n❌ ERROR: SENDGRID_API_KEY is not configured or is a dummy placeholder.')
  console.log('   Please set a valid SendGrid key in api/.env (see SETUP.md §2).')
  process.exit(1)
}

const payload = JSON.stringify({
  personalizations: [
    {
      to: [{ email: targetEmail }],
      subject: 'Apex Luxury Automobiles — Integration Verification Test',
    },
  ],
  from: {
    email: fromEmail,
    name: fromName,
  },
  content: [
    {
      type: 'text/html',
      value: `
        <div style="background-color: #050505; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 12px; border: 1px solid #c9a227;">
          <h2 style="color: #c9a227; margin-top: 0; font-family: serif;">Apex Luxury Automobiles Dubai</h2>
          <p style="font-size: 14px; color: #cccccc;">This is a verified live integration proof test sent from the production lead notification worker.</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
          <ul style="font-size: 13px; color: #a0a0a0; line-height: 1.8;">
            <li><b>Status:</b> ✅ Operational</li>
            <li><b>Timestamp:</b> ${new Date().toISOString()}</li>
            <li><b>Environment:</b> ${process.env.NODE_ENV || 'production'}</li>
          </ul>
        </div>
      `,
    },
  ],
})

const options = {
  hostname: 'api.sendgrid.com',
  port: 443,
  path: '/v3/mail/send',
  method: 'POST',
  headers: {
    Authorization: `Bearer ${sendgridApiKey}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
}

console.log('\n📡 Dispatching test email to SendGrid v3 endpoint...')

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', () => {
    if (res.statusCode === 202 || res.statusCode === 200) {
      console.log(`✅ SUCCESS: SendGrid accepted message for delivery (HTTP ${res.statusCode}).`)
      console.log(`   Message queued for dispatch to: ${targetEmail}`)
      process.exit(0)
    } else {
      console.error(`❌ FAILED: SendGrid returned HTTP ${res.statusCode}`)
      console.error(`   Response: ${data}`)
      process.exit(1)
    }
  })
})

req.on('error', (err) => {
  console.error(`❌ Network error while communicating with SendGrid: ${err.message}`)
  process.exit(1)
})

req.write(payload)
req.end()
