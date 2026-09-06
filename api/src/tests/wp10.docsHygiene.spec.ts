import fs from 'fs'
import path from 'path'

describe('WP10 — Admin Guide & Documentation Hygiene', () => {
  const rootDir = path.resolve(__dirname, '../../..')

  it('docs/ADMIN_GUIDE.md exists and covers all core showroom operational domains', () => {
    const adminGuidePath = path.join(rootDir, 'docs/ADMIN_GUIDE.md')
    expect(fs.existsSync(adminGuidePath)).toBe(true)

    const content = fs.readFileSync(adminGuidePath, 'utf-8')
    expect(content).toContain('Logging into the Administrative Portal')
    expect(content).toContain('Vehicle Catalog Management')
    expect(content).toContain('Google Sheets Inventory Synchronization')
    expect(content).toContain('VIP Leads, Viewing Bookings & Callback Desk')
    expect(content).toContain('Sell-Your-Car Valuation Inbox')
    expect(content).toContain('FAQ Concierge Chatbot Knowledge Base')
    expect(content).toContain('Global Showroom Settings & WhatsApp Configuration')
  })

  it('README.md documentation links all resolve to valid on-disk files', () => {
    const readmePath = path.join(rootDir, 'README.md')
    const readmeContent = fs.readFileSync(readmePath, 'utf-8')

    // Find all markdown links [label](path)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let match: RegExpExecArray | null

    const checkedLinks: string[] = []
    while ((match = linkRegex.exec(readmeContent)) !== null) {
      const target = match[2]
      // Only verify relative local file links (skip external http/https)
      if (!target.startsWith('http') && !target.startsWith('#')) {
        const resolvedPath = path.resolve(rootDir, target)
        expect(fs.existsSync(resolvedPath)).toBe(true)
        checkedLinks.push(target)
      }
    }

    expect(checkedLinks).toContain('SETUP.md')
    expect(checkedLinks).toContain('docs/ADMIN_GUIDE.md')
    expect(checkedLinks).toContain('docs/OPS_RUNBOOK.md')
  })

  it('.env.example and api/.env.example contain only sanitized placeholders with no leaked secrets', () => {
    const envFiles = [path.join(rootDir, '.env.example'), path.join(rootDir, 'api/.env.example')]

    envFiles.forEach((file) => {
      expect(fs.existsSync(file)).toBe(true)
      const content = fs.readFileSync(file, 'utf-8')

      // Ensure no real private keys or actual production tokens leaked (standard dummy placeholders allowed)
      const sgMatches = content.match(/SG\.[a-zA-Z0-9_-]{20,}/g) || []
      sgMatches.forEach((k) => {
        expect(k).toBe('SG.xxxxxxxxxxxxxxxxxxxx')
      })
      const akiaMatches = content.match(/AKIA[A-Z0-9]{16}/g) || []
      akiaMatches.forEach((k) => {
        expect(k).toBe('AKIAIOSFODNN7EXAMPLE')
      })
      expect(content).not.toContain('ghp_')
    })
  })
})
