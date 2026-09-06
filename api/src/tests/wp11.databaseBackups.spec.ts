import fs from 'fs'
import path from 'path'

describe('WP11 — Automated Database Backups', () => {
  const rootDir = path.resolve(__dirname, '../../..')

  it('docker-compose.yml defines automated backup service with 02:00 UTC schedule and 14-day retention', () => {
    const composePath = path.join(rootDir, 'docker-compose.yml')
    const content = fs.readFileSync(composePath, 'utf-8')

    expect(content).toContain('backup:')
    expect(content).toContain('postgres:15-alpine')
    expect(content).toContain('./backups:/backups')
    expect(content).toContain('RETENTION_DAYS: 14')
    expect(content).toContain('0 2 * * *')
    expect(content).toContain('crond -f -l 2')
  })

  it('scripts/backup.sh is executable and implements compression and retention pruning', () => {
    const scriptPath = path.join(rootDir, 'scripts/backup.sh')
    expect(fs.existsSync(scriptPath)).toBe(true)

    // Check executable bit
    expect(() => fs.accessSync(scriptPath, fs.constants.X_OK)).not.toThrow()

    const content = fs.readFileSync(scriptPath, 'utf-8')
    expect(content).toContain('pg_dump')
    expect(content).toContain('gzip')
    expect(content).toContain('RETENTION_DAYS')
    expect(content).toContain('showroom_backup_')
    expect(content).toContain('find "$BACKUP_DIR"')
  })

  it('SETUP.md documents automated backup service, manual triggers, and restore instructions', () => {
    const setupPath = path.join(rootDir, 'SETUP.md')
    const content = fs.readFileSync(setupPath, 'utf-8')

    expect(content).toContain('Automated Database Backups & Disaster Recovery')
    expect(content).toContain('./scripts/backup.sh')
    expect(content).toContain('gunzip -c')
    expect(content).toContain('psql')
  })

  it('.gitignore ignores backup files and archives', () => {
    const gitignorePath = path.join(rootDir, '.gitignore')
    const content = fs.readFileSync(gitignorePath, 'utf-8')

    expect(content).toContain('backups/')
    expect(content).toContain('*.sql.gz')
  })
})
