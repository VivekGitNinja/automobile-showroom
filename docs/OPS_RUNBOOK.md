# Apex Luxury Automobiles — Operations Runbook

Production operations, incident triage, and service management runbook for **Apex Luxury Automobiles Dubai**.

---

## 1. System Architecture & Service Ports

| Service | Container / Process | Port | Health Check |
|---|---|---|---|
| Nginx Reverse Proxy | `nginx` | 80, 443 | `http://localhost/api/v1/health` |
| Next.js Frontend | `nextjs` | 3000 | `http://localhost:3000/` |
| Express API | `api` | 4000 | `http://localhost:4000/api/v1/health` |
| Sync Worker | `sync-worker` | - | BullMQ / Redis |
| Notification Worker | `notif-worker` | - | BullMQ / Redis |
| PostgreSQL DB | `postgres` | 5432 | `pg_isready -U postgres` |
| Redis Cache / Queue | `redis` | 6379 | `redis-cli ping` |

---

## 2. Pre-Flight Verification & Integration Proof Kit

Before taking the platform live or after updating environment configuration, execute the pre-flight check suite:

```bash
# Full environment pre-flight inspection
./scripts/preflight.sh
```

### Integration Probes
- **Email Dispatch Proof (SendGrid v3)**:
  ```bash
  npx ts-node scripts/test-email.ts [recipient@domain.com]
  ```
- **Google Sheets Sync Probe (Read-Only)**:
  ```bash
  npx ts-node scripts/test-sync.ts
  ```

---

## 3. Common Incident Triage

### 2.1 API Unhealthy (`/api/v1/health` fails)
1. Check container status:
   ```bash
   docker compose ps
   docker compose logs -f --tail=100 api
   ```
2. Verify database connection:
   ```bash
   docker compose exec postgres pg_isready -U postgres
   ```
3. Restart API service if memory spike or stale connection pool:
   ```bash
   docker compose restart api
   ```

### 2.2 Google Sheets Sync Recovery
- **Symptoms**: Inventory not updating, sync log shows `failed` or `partial`.
- **Triaging steps**:
  1. Verify Service Account permission: Ensure the Google Sheet is shared with Editor permissions to the Service Account email.
  2. Verify credentials in `.env`: Check that `GOOGLE_SHEET_ID` matches the spreadsheet ID in the URL.
  3. Inspect quarantined rows: Navigate to **Admin → Sync Logs → Quarantine Inspector**. Correct any missing Make/Model/Year/Price cells in the spreadsheet.
  4. Trigger manual re-sync via Admin UI or curl:
     ```bash
     curl -X POST http://localhost:4000/api/v1/admin/sync/trigger \
       -H "Authorization: Bearer <ADMIN_TOKEN>"
     ```

### 2.3 Email & Lead Notification Fallback
- **Symptoms**: Customer submissions succeed (HTTP 201), but notification emails are not arriving.
- **Triaging steps**:
  1. Check BullMQ notification worker logs:
     ```bash
     docker compose logs -f --tail=100 notif-worker
     ```
  2. Test mail provider credentials:
     ```bash
     # Verify SENDGRID_API_KEY or SMTP credentials
     npx ts-node scripts/test-email.ts sales@yourdomain.com
     ```
  3. Check leads inbox in Admin Desk: Even if email delivery fails, all leads and sell-car submissions are permanently recorded in Postgres and visible in `/admin`.

---

## 4. Database Backup & Disaster Recovery

### Automated Backups
- Database dumps run daily at 02:00 UTC and are stored in `/backups` with 14-day retention.
- Manual backup trigger:
  ```bash
  ./scripts/backup.sh
  ```

### Restoration Procedure
```bash
# Decompress and restore from backup file
gunzip -c /backups/showroom_backup_YYYYMMDD_HHMMSS.sql.gz | docker compose exec -T postgres psql -U postgres -d showroom
```

---

*Apex Luxury Automobiles — DevOps & Technical Operations*
