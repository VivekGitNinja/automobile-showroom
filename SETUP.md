# Launch Setup Guide

Everything in the codebase is production-ready. What remains before going live
is **your** credentials and domain. This guide has the exact steps for each.
Run `./scripts/preflight.sh` at any time to see what's still missing.

---

## 1 · Admin password (5 minutes)

The admin user is created/rotated by the database seed.

1. Generate a strong password:
   ```bash
   openssl rand -base64 24
   ```
2. Put it in `api/.env`:
   ```env
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=<the generated password>
   ```
3. Re-seed (this *rotates* the existing admin's password — it will not
   duplicate data; the seed is idempotent):
   ```bash
   cd api && npx prisma db seed
   ```
4. Log in at `/admin/login` with the new credentials.

> In production the seed **refuses to run** with a missing or weak
> (< 12 char) password, so a weak default can never ship.

---

## 2 · SendGrid — lead notification emails (10 minutes)

Right now lead emails are skipped because `SENDGRID_API_KEY` is a placeholder.

1. Create a free SendGrid account: https://signup.sendgrid.com
2. **Verify a single sender** (Settings → Sender Authentication → Verify a
   Sender) using an inbox you control, e.g. `noreply@yourdomain.com`.
   This email becomes the From address.
3. Create an API key (Settings → API Keys → Create API):
   - permissions: **Mail Send → Full Access** only
   - copy the key (starts with `SG.`) — it is shown once
4. Put in `api/.env`:
   ```env
   SENDGRID_API_KEY=SG.your-real-key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SALES_EMAIL=sales@yourdomain.com
   ```
5. Restart the API, submit a test enquiry on the site, and confirm both the
   customer confirmation and the sales notification arrive.

Free tier = 100 emails/day, plenty for lead notifications.

---

## 3 · Google Sheets — automated inventory sync (15 minutes)

Sync is in safe mode until credentials are set (it will never seed demo data).

1. Google Cloud Console → create/select a project → enable the
   **Google Sheets API** (APIs & Services → Library).
2. Create a **service account** (IAM & Admin → Service Accounts → Create).
   No project roles needed.
3. Open the service account → Keys → **Add Key → JSON** → download.
4. Open the JSON file and copy the full contents of `client_email` and
   `private_key`.
5. Share your inventory spreadsheet with the service account's
   `client_email` (Editor permission) — *this step is forgotten 90% of the time*.
6. Copy the spreadsheet ID from its URL:
   `https://docs.google.com/spreadsheets/d/`**`<THIS PART>`**`/edit`
7. Put in `api/.env`:
   ```env
   # Option A: Service Account Email + Private Key
   GOOGLE_SHEET_ID=<spreadsheet id>                     # alias: GOOGLE_SPREADSHEET_ID
   GOOGLE_SHEET_NAME=Inventory                          # exact tab name, default "Inventory"
   GOOGLE_SERVICE_ACCOUNT_EMAIL=sync-bot@your-project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n" # alias: GOOGLE_PRIVATE_KEY

   # Option B: Full Service Account JSON (raw string or base64)
   # GOOGLE_SHEET_ID=<spreadsheet id>
   # GOOGLE_SERVICE_ACCOUNT_JSON='{"type": "service_account", ...}'
   ```
   (keep the quotes around the private key; the `\n` escapes are fine)
8. Sheet columns (row 1 can be headers, sync reads from row 2):

   | A | B | C | D | E | F | G | H | I | J | K |
   |---|---|---|---|---|---|---|---|---|---|---|
   | RowID | Brand | Make | Model | Year | Price (AED) | Mileage | Transmission | Fuel | Status | Image URLs |

   - **Status** must be `published` for a car to go live; anything else = draft.
   - **RowID** is the stable key — deleting a row (or its RowID) unpublishes
     that vehicle on the next sync.
   - **Image URLs (Column K)**: Supports a full vehicle gallery. Separate multiple image URLs using commas (`,`), semicolons (`;`), or newlines (`\n`).
     - Example: `https://example.com/exterior-hero.jpg, https://example.com/interior.jpg; https://example.com/cockpit.jpg`
     - The **first valid URL** is assigned as the primary hero image (`isPrimary: true`, `displayOrder: 0`).
     - Subsequent valid URLs are added to the gallery (`isPrimary: false`, `displayOrder: 1, 2, ...`).
     - Malformed or invalid URLs are safely logged as warnings and skipped without interrupting the vehicle row import.
     - Existing manually uploaded images from the Admin CMS are strictly preserved.
9. Verify: Admin → Sync tab → **Trigger Sync**, or check
   `GET /api/v1/admin/sync/status`. Schedule defaults to every 15 min
   (`SYNC_CRON_SCHEDULE`).

---

## 4 · Production domain

1. Point DNS `A`/`CNAME` records for `yourdomain.com` (and `www`) at your server.
2. Set the real domain in `.env` (used for canonicals, sitemap, JSON-LD, OG):
   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   NEXT_PUBLIC_SITE_NAME=Your Showroom Name
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1   # via nginx proxy
   ```
3. Redeploy so metadata regenerates.

---

## 5 · SSL certificates for nginx

nginx terminates TLS using `nginx/ssl/fullchain.pem` + `privkey.pem`.

**Option A — Let's Encrypt (recommended, free, auto-renews):**
on the host with ports 80/443 open:
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem  nginx/ssl/
```

**Option B — start with a dev self-signed cert** (browser warning, staging only):
```bash
./scripts/generate-dev-certs.sh
```

---

## 6 · Deploy (docker compose)

```bash
docker compose up -d --build          # nginx + nextjs + api + workers + backup + postgres + redis
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed            # with ADMIN_PASSWORD set
curl localhost/api/v1/health                            # expect healthy
```

---

## 7 · Automated Database Backups & Disaster Recovery

The production stack includes an automated `backup` container:
- **Schedule**: Executes daily at 02:00 UTC via cron.
- **Compression**: Output is compressed with `gzip` to `./backups/showroom_backup_YYYYMMDD_HHMMSS.sql.gz`.
- **Retention**: Automatically prunes dumps older than 14 days.

### Manual Backup Trigger
```bash
./scripts/backup.sh
# Output: ✅ Backup successfully created: ./backups/showroom_backup_20260906_214200.sql.gz (1.2M)
```

### Restoration Procedure
```bash
# Decompress and restore from any archive:
gunzip -c ./backups/showroom_backup_YYYYMMDD_HHMMSS.sql.gz | docker compose exec -T postgres psql -U ${DB_USER:-showroom_user} -d showroom
```

---

## Pre-flight checklist

```bash
./scripts/preflight.sh
```

All ✅ = ready for launch. Every ❌ prints the reason and points at the
section of this guide that fixes it.
