import fs from 'fs'
import path from 'path'

describe('WP13 — Audit Loose Ends Clean-Up', () => {
  const rootDir = path.resolve(__dirname, '../../..')

  it('frontend/app/HomeClient.tsx wires VIP Request Invitation button to BookingModal', () => {
    const homeClientPath = path.join(rootDir, 'frontend/app/HomeClient.tsx')
    const content = fs.readFileSync(homeClientPath, 'utf-8')

    expect(content).toContain("import BookingModal from '../components/BookingModal'")
    expect(content).toContain('isVipModalOpen')
    expect(content).toContain('setIsVipModalOpen(true)')
    expect(content).toContain('Request Invitation')
    expect(content).toContain('<BookingModal')
    expect(content).toContain('Apex Black Label VIP Access')
  })

  it('frontend/app/location/page.tsx includes noscript fallback and direct Google Maps navigation link with aria-label', () => {
    const locationPath = path.join(rootDir, 'frontend/app/location/page.tsx')
    const content = fs.readFileSync(locationPath, 'utf-8')

    expect(content).toContain('<noscript>')
    expect(content).toContain('Open in Google Maps')
    expect(content).toContain('https://www.google.com/maps/search/?api=1&query=')
    expect(content).toContain('aria-label="View showroom location on Google Maps"')
  })

  it('codebase hygiene: no stray TODO or FIXME comments in frontend components or app pages', () => {
    const checkDir = (dir: string) => {
      const files = fs.readdirSync(dir, { withFileTypes: true })
      for (const file of files) {
        const fullPath = path.join(dir, file.name)
        if (file.isDirectory()) {
          checkDir(fullPath)
        } else if (/\.(tsx|ts|jsx|js)$/.test(file.name)) {
          const content = fs.readFileSync(fullPath, 'utf-8')
          expect(content).not.toMatch(/\/\/\s*(TODO|FIXME):/i)
        }
      }
    }

    checkDir(path.join(rootDir, 'frontend/app'))
    checkDir(path.join(rootDir, 'frontend/components'))
  })

  it('codebase hygiene: no stray console.log statements in public app routes', () => {
    const appDir = path.join(rootDir, 'frontend/app')
    const checkDir = (dir: string) => {
      const files = fs.readdirSync(dir, { withFileTypes: true })
      for (const file of files) {
        const fullPath = path.join(dir, file.name)
        if (file.isDirectory() && !file.name.startsWith('admin')) {
          checkDir(fullPath)
        } else if (/\.(tsx|ts)$/.test(file.name) && !file.name.includes('.test.')) {
          const content = fs.readFileSync(fullPath, 'utf-8')
          expect(content).not.toContain('console.log(')
        }
      }
    }

    checkDir(appDir)
  })
})
