#!/bin/bash
# PostgreSQL daily backup to AWS S3
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="showroom_backup_${TIMESTAMP}.sql.gz"
S3_PATH="s3://${S3_BACKUP_BUCKET}/postgres/${BACKUP_FILE}"

echo "[$(date)] Starting backup: ${BACKUP_FILE}"

# Dump and compress
PGPASSWORD="${DB_PASS}" pg_dump   -h postgres   -U "${DB_USER}"   -d showroom   --no-password   --format=plain   --clean   | gzip > "/tmp/${BACKUP_FILE}"

# Upload to S3
aws s3 cp "/tmp/${BACKUP_FILE}" "${S3_PATH}"   --storage-class STANDARD_IA

# Cleanup local file
rm "/tmp/${BACKUP_FILE}"

# Delete backups older than 30 days
aws s3 ls "s3://${S3_BACKUP_BUCKET}/postgres/"   | awk '{print $4}'   | while read file; do
      file_date=$(echo $file | grep -oP '\d{8}')
      if [[ $(date -d "${file_date}" +%s) -lt $(date -d "30 days ago" +%s) ]]; then
        aws s3 rm "s3://${S3_BACKUP_BUCKET}/postgres/${file}"
        echo "Deleted old backup: ${file}"
      fi
    done

echo "[$(date)] Backup complete: ${S3_PATH}"
