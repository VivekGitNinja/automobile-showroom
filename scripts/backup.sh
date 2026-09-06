#!/usr/bin/env bash
set -eo pipefail

# ==============================================================================
# Apex Luxury Automobiles — Database Backup Script
# Creates a compressed PostgreSQL database dump with 14-day automatic pruning.
# ==============================================================================

# 1. Resolve Target Directory
BACKUP_DIR="${BACKUP_DIR:-}"
if [ -z "$BACKUP_DIR" ]; then
  if [ -d "/backups" ]; then
    BACKUP_DIR="/backups"
  else
    BACKUP_DIR="./backups"
  fi
fi
mkdir -p "$BACKUP_DIR"

RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
TARGET_FILE="${BACKUP_DIR}/showroom_backup_${TIMESTAMP}.sql.gz"

echo "📦 [$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting database backup..."

# 2. Execute pg_dump
if [ -n "$DATABASE_URL" ]; then
  pg_dump "$DATABASE_URL" | gzip > "$TARGET_FILE"
else
  export PGHOST="${POSTGRES_HOST:-localhost}"
  export PGPORT="${POSTGRES_PORT:-5432}"
  export PGUSER="${POSTGRES_USER:-${DB_USER:-showroom_user}}"
  export PGDATABASE="${POSTGRES_DB:-showroom}"
  export PGPASSWORD="${PGPASSWORD:-${DB_PASS}}"

  pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" | gzip > "$TARGET_FILE"
fi

# 3. Verify Dump Success
if [ ! -s "$TARGET_FILE" ]; then
  echo "❌ Error: Backup output file is empty or was not created: $TARGET_FILE"
  rm -f "$TARGET_FILE"
  exit 1
fi

FILE_SIZE="$(du -h "$TARGET_FILE" | cut -f1)"
echo "✅ Backup successfully created: $TARGET_FILE (${FILE_SIZE})"

# 4. Prune Backups Older Than Retention Window
echo "🧹 Pruning backups older than ${RETENTION_DAYS} days in ${BACKUP_DIR}..."
find "$BACKUP_DIR" -name "showroom_backup_*.sql.gz" -mtime +"${RETENTION_DAYS}" -exec rm -f {} + 2>/dev/null || true

echo "🎉 Database backup cycle completed successfully."
exit 0
