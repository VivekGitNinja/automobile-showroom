import fs from 'fs'
import path from 'path'

describe('WP7 — Performance: Lazy-Load 3D/360 + Lighthouse CI', () => {
  const rootDir = path.resolve(__dirname, '../../..')
  const frontendDir = path.join(rootDir, 'frontend')

  it('lighthouserc.json exists and enforces Core Web Vitals thresholds', () => {
    const lhciPath = path.join(rootDir, 'lighthouserc.json')
    expect(fs.existsSync(lhciPath)).toBe(true)

    const config = JSON.parse(fs.readFileSync(lhciPath, 'utf-8'))
    const assertions = config.ci.assert.assertions

    expect(assertions['largest-contentful-paint'][1].maxNumericValue).toBeLessThanOrEqual(2500)
    expect(assertions['cumulative-layout-shift'][1].maxNumericValue).toBeLessThanOrEqual(0.1)
    expect(assertions['total-blocking-time'][1].maxNumericValue).toBeLessThanOrEqual(300)
    expect(assertions['categories:performance'][1].minScore).toBeGreaterThanOrEqual(0.8)
  })

  it('VehicleClient lazy loads Three.js 3D Studio and 360 viewers with ssr: false', () => {
    const vehicleClientPath = path.join(frontendDir, 'app/inventory/[slug]/VehicleClient.tsx')
    const content = fs.readFileSync(vehicleClientPath, 'utf-8')

    // Must use dynamic import
    expect(content).toContain("import dynamic from 'next/dynamic'")

    // Must dynamically import Vehicle3DStudio with ssr: false and skeleton fallback
    expect(content).toMatch(/Vehicle3DStudio\s*=\s*dynamic\(\(\)\s*=>\s*import\('\.\/_components\/Vehicle3DStudio'\),\s*\{[\s\S]*?ssr:\s*false/)
    
    // Must dynamically import Exterior360Viewer with ssr: false
    expect(content).toMatch(/Exterior360Viewer\s*=\s*dynamic\(\(\)\s*=>\s*import\('\.\/_components\/Exterior360Viewer'\),\s*\{[\s\S]*?ssr:\s*false/)

    // Must dynamically import Interior360Panorama with ssr: false
    expect(content).toMatch(/Interior360Panorama\s*=\s*dynamic\(\(\)\s*=>\s*import\('\.\/_components\/Interior360Panorama'\),\s*\{[\s\S]*?ssr:\s*false/)
  })

  it('Hero videos configure preload="none" to prevent bandwidth contention on critical path', () => {
    const homeClientPath = path.join(frontendDir, 'app/HomeClient.tsx')
    const homeContent = fs.readFileSync(homeClientPath, 'utf-8')
    expect(homeContent).toContain('preload="none"')

    const heroPath = path.join(frontendDir, 'components/Hero.tsx')
    const heroContent = fs.readFileSync(heroPath, 'utf-8')
    expect(heroContent).toContain('preload="none"')
  })

  it('CI workflow includes lighthouse audit step', () => {
    const ciPath = path.join(rootDir, '.github/workflows/ci.yml')
    const ciContent = fs.readFileSync(ciPath, 'utf-8')
    expect(ciContent).toContain('lighthouse')
    expect(ciContent).toContain('lighthouserc.json')
  })
})
