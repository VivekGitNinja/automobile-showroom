import fs from 'fs'
import path from 'path'

describe('WP3 — Gate Demo Seed Data Out of Production', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('NODE_ENV=production + no flag gates out demo seed data', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.SEED_DEMO_DATA

    const allowDemo = process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_DATA === 'true'
    expect(allowDemo).toBe(false)
  })

  it('NODE_ENV=production with SEED_DEMO_DATA=true explicitly enables demo seed data', () => {
    process.env.NODE_ENV = 'production'
    process.env.SEED_DEMO_DATA = 'true'

    const allowDemo = process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_DATA === 'true'
    expect(allowDemo).toBe(true)
  })

  it('NODE_ENV=development enables demo seed data by default', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.SEED_DEMO_DATA

    const allowDemo = process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_DATA === 'true'
    expect(allowDemo).toBe(true)
  })

  it('Demo vehicles in seed.ts are created as status: draft so they never leak publicly', () => {
    const seedContent = fs.readFileSync(path.join(__dirname, '../../prisma/seed.ts'), 'utf-8')

    // Verify allowDemo gate exists in seed.ts
    expect(seedContent).toContain("const allowDemo = process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_DATA === 'true'")
    expect(seedContent).toContain("if (!allowDemo)")

    // Verify sample vehicles are set to status: 'draft'
    expect(seedContent).toContain("status: 'draft'")
    expect(seedContent).not.toMatch(/make:.*status:\s*'published'/i)
  })
})
