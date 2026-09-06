import fs from 'fs'
import path from 'path'

describe('WP12 — Integration Proof Kit & Operations Runbook', () => {
  const rootDir = path.resolve(__dirname, '../../..')

  it('scripts/test-email.ts exists, is executable, validates credentials, and targets SendGrid v3', () => {
    const scriptPath = path.join(rootDir, 'scripts/test-email.ts')
    expect(fs.existsSync(scriptPath)).toBe(true)
    expect(() => fs.accessSync(scriptPath, fs.constants.X_OK)).not.toThrow()

    const content = fs.readFileSync(scriptPath, 'utf-8')
    expect(content).toContain('SENDGRID_API_KEY')
    expect(content).toContain('api.sendgrid.com')
    expect(content).toContain('/v3/mail/send')
    expect(content).toContain('Apex Luxury Automobiles — Integration Verification Test')
  })

  it('scripts/test-sync.ts exists, is executable, probes Google Sheets, and provides setup guidance when unconfigured', () => {
    const scriptPath = path.join(rootDir, 'scripts/test-sync.ts')
    expect(fs.existsSync(scriptPath)).toBe(true)
    expect(() => fs.accessSync(scriptPath, fs.constants.X_OK)).not.toThrow()

    const content = fs.readFileSync(scriptPath, 'utf-8')
    expect(content).toContain('GOOGLE_SHEET_ID')
    expect(content).toContain('GOOGLE_SERVICE_ACCOUNT')
    expect(content).toContain('google.sheets')
    expect(content).toContain('spreadsheets.readonly')
    expect(content).toContain('SETUP.md §3')
  })

  it('scripts/preflight.sh is executable and checks all platform integrations', () => {
    const scriptPath = path.join(rootDir, 'scripts/preflight.sh')
    expect(fs.existsSync(scriptPath)).toBe(true)
    expect(() => fs.accessSync(scriptPath, fs.constants.X_OK)).not.toThrow()

    const content = fs.readFileSync(scriptPath, 'utf-8')
    expect(content).toContain('/api/v1/health')
    expect(content).toContain('SENDGRID_API_KEY')
    expect(content).toContain('/api/v1/admin/sync/status')
    expect(content).toContain('NEXT_PUBLIC_SITE_URL')
    expect(content).toContain('openssl x509')
  })

  it('frontend SyncLogViewer fetches status and renders setup checklist when unconfigured', () => {
    const viewerPath = path.join(rootDir, 'frontend/app/admin/_components/SyncLogViewer.tsx')
    const content = fs.readFileSync(viewerPath, 'utf-8')

    expect(content).toContain('/admin/sync/status')
    expect(content).toContain('syncStatus && !syncStatus.configured')
    expect(content).toContain('Google Sheets Integration Not Configured')
    expect(content).toContain('GOOGLE_SHEET_ID')
    expect(content).toContain('test-sync.ts')
  })

  it('docs/OPS_RUNBOOK.md documents operational verification and runbooks', () => {
    const docPath = path.join(rootDir, 'docs/OPS_RUNBOOK.md')
    expect(fs.existsSync(docPath)).toBe(true)

    const content = fs.readFileSync(docPath, 'utf-8')
    expect(content).toContain('Apex Luxury Automobiles')
    expect(content).toContain('Operations Runbook')
    expect(content).toContain('preflight.sh')
    expect(content).toContain('test-email.ts')
    expect(content).toContain('test-sync.ts')
  })
})
