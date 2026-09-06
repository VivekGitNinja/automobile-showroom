import fs from 'fs'
import path from 'path'

describe('WP8 — Cross-Browser Playwright Matrix', () => {
  const rootDir = path.resolve(__dirname, '../../..')
  const frontendDir = path.join(rootDir, 'frontend')

  it('playwright.config.ts configures chromium, firefox, webkit, and mobile viewports', () => {
    const configPath = path.join(frontendDir, 'playwright.config.ts')
    expect(fs.existsSync(configPath)).toBe(true)

    const content = fs.readFileSync(configPath, 'utf-8')
    expect(content).toContain("name: 'chromium'")
    expect(content).toContain("name: 'firefox'")
    expect(content).toContain("name: 'webkit'")
    expect(content).toContain("name: 'Mobile Chrome'")
    expect(content).toContain("name: 'Mobile Safari'")
  })

  it('package.json includes test:e2e script', () => {
    const pkgPath = path.join(frontendDir, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    expect(pkg.scripts['test:e2e']).toBe('playwright test')
  })

  it('CI workflow includes matrix job across chromium, firefox, and webkit', () => {
    const ciPath = path.join(rootDir, '.github/workflows/ci.yml')
    const ciContent = fs.readFileSync(ciPath, 'utf-8')

    expect(ciContent).toContain('Playwright — Cross-Browser Matrix')
    expect(ciContent).toContain('project: [chromium, firefox, webkit]')
    expect(ciContent).toContain('playwright install')
    expect(ciContent).toContain('playwright test --project=${{ matrix.project }}')
  })
})
