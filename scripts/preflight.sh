#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Pre-flight configuration check — run before going live (and after any
# environment change). Verifies every external integration the platform
# depends on and prints a clear PASS/FAIL action table.
#
# Usage:
#   ./scripts/preflight.sh                  # checks a running API on :4000
#   API_URL=https://api.example.com ./scripts/preflight.sh
# ─────────────────────────────────────────────────────────────────────────────
set -u

API="${API_URL:-http://localhost:4000}"
ENV_FILE="$(dirname "$0")/../api/.env"
PASS=0; FAIL=0

ok()   { PASS=$((PASS+1)); printf "  ✅ %-22s %s\n" "$1" "$2"; }
bad()  { FAIL=$((FAIL+1)); printf "  ❌ %-22s %s\n" "$1" "$2"; }
head() { printf "\n%s\n" "$1"; }

# Read env values safely (no sourcing — .env values contain spaces/quotes)
envget() {
  for f in "$ENV_FILE" "$(dirname "$0")/../.env"; do
    [ -f "$f" ] || continue
    v=$(grep -m1 "^$1=" "$f" 2>/dev/null | cut -d= -f2- | sed 's/^["'\''"]//;s/["'\'']$//' | tr -d '\r')
    [ -n "$v" ] && { echo "$v"; return; }
  done
}
ADMIN_PASSWORD=$(envget ADMIN_PASSWORD)
ADMIN_EMAIL=$(envget ADMIN_EMAIL)
JWT_ACCESS_SECRET=$(envget JWT_ACCESS_SECRET)
SENDGRID_API_KEY=$(envget SENDGRID_API_KEY)
SALES_EMAIL=$(envget SALES_EMAIL)
SENDGRID_FROM_EMAIL=$(envget SENDGRID_FROM_EMAIL)
FROM_EMAIL=$(envget FROM_EMAIL)
NEXT_PUBLIC_SITE_URL=$(envget NEXT_PUBLIC_SITE_URL)
NEXT_PUBLIC_WHATSAPP_NUMBER=$(envget NEXT_PUBLIC_WHATSAPP_NUMBER)

echo "════════════════════════════════════════════════════════════════"
echo "  APEX LUXURY AUTOMOBILES — PRE-FLIGHT CONFIGURATION CHECK"
echo "  API: $API"
echo "════════════════════════════════════════════════════════════════"

# ── 1. Services up ─────────────────────────────────────────────────────────
head "1 · SERVICES"
HEALTH=$(curl -s -m 5 "$API/api/v1/health" 2>/dev/null || echo "")
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
  ok "API health" "healthy"
  echo "$HEALTH" | grep -q '"database":"up"' && ok "PostgreSQL" "up" || bad "PostgreSQL" "down"
  echo "$HEALTH" | grep -q '"redis":"up"' && ok "Redis" "up" || bad "Redis" "down (queues fall back / degrade)"
else
  bad "API health" "unreachable at $API — is the stack running?"
fi

# ── 2. Admin security ──────────────────────────────────────────────────────
head "2 · ADMIN SECURITY"
if [ -n "${ADMIN_PASSWORD:-}" ]; then
  LEN=${#ADMIN_PASSWORD}
  [ "$LEN" -ge 12 ] && ok "ADMIN_PASSWORD" "set (${LEN} chars)" || bad "ADMIN_PASSWORD" "too short (${LEN} chars — use 12+)"
else
  bad "ADMIN_PASSWORD" "not set — seed would use the dev default"
fi
[ -n "${JWT_ACCESS_SECRET:-}" ] && [ ${#JWT_ACCESS_SECRET} -ge 32 ] && ok "JWT secrets" "configured" || bad "JWT_ACCESS_SECRET" "missing or < 32 chars"
grep -q "^JWT_ACCESS_SECRET=" "$(dirname "$0")/../frontend/.env.local" 2>/dev/null && ok "Frontend JWT" "cookie middleware secret present" || bad "Frontend JWT" "frontend/.env.local missing JWT_ACCESS_SECRET (admin login will fail closed)"

# ── 3. Lead notifications (SendGrid) ───────────────────────────────────────
head "3 · LEAD NOTIFICATIONS"
if [ -n "${SENDGRID_API_KEY:-}" ] && [[ "${SENDGRID_API_KEY:0:3}" == "SG." && ${#SENDGRID_API_KEY} -gt 20 ]] && ! echo "${SENDGRID_API_KEY}" | grep -qE "SG\.(mock|test|xxx)"; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 \
    -X POST https://api.sendgrid.com/v3/mail/send \
    -H "Authorization: Bearer $SENDGRID_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"personalizations":[{"to":[{"email":"preflight@apex.ae"}]}],"from":{"email":"preflight@apex.ae"},"subject":"preflight","content":[{"type":"text/plain","value":"x"}]}' 2>/dev/null || echo "000")
  # 202 = accepted (may still be sender-blocked) · 401/403 = bad key
  case "$CODE" in
    202|200) ok "SendGrid key" "valid (API accepted request)" ;;
    401|403) bad "SendGrid key" "rejected by SendGrid (401/403) — check the key" ;;
    *) ok "SendGrid key" "format ok (HTTP $CODE from API — verify sender if not 202)" ;;
  esac
  [ -n "${SALES_EMAIL:-}" ] && ok "SALES_EMAIL" "$SALES_EMAIL" || bad "SALES_EMAIL" "not set"
  [ -n "${SENDGRID_FROM_EMAIL:-}${FROM_EMAIL:-}" ] && ok "From address" "configured" || bad "From address" "SENDGRID_FROM_EMAIL / FROM_EMAIL not set"
else
  bad "SendGrid key" "missing or placeholder — lead emails will NOT send (see SETUP.md §2)"
fi

# ── 4. Google Sheets sync ──────────────────────────────────────────────────
head "4 · GOOGLE SHEETS SYNC"
if [ -n "${ADMIN_PASSWORD:-}" ]; then
  TOKEN=$(curl -s -m 5 -X POST "$API/api/v1/auth/login" -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL:-admin@apex.ae}\",\"password\":\"$ADMIN_PASSWORD\"}" 2>/dev/null | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
  if [ -n "$TOKEN" ]; then
    STATUS=$(curl -s -m 5 "$API/api/v1/admin/sync/status" -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "")
    echo "$STATUS" | grep -q '"configured":true' && ok "Sheets sync" "configured" || bad "Sheets sync" "not configured (see SETUP.md §3)"
  else
    bad "Admin login" "could not authenticate against the API (check ADMIN_EMAIL/ADMIN_PASSWORD vs the seeded user)"
  fi
else
  bad "Sheets sync" "skipped — ADMIN_PASSWORD unset"
fi

# ── 5. Site identity ───────────────────────────────────────────────────────
head "5 · SITE IDENTITY / SEO"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-}"
case "$SITE_URL" in
  ""|http://localhost*|http://127.0.0.1*) bad "NEXT_PUBLIC_SITE_URL" "still local ('$SITE_URL') — set the production domain" ;;
  https://*) ok "NEXT_PUBLIC_SITE_URL" "$SITE_URL" ;;
  *) bad "NEXT_PUBLIC_SITE_URL" "not HTTPS ('$SITE_URL')" ;;
esac
[ -n "${NEXT_PUBLIC_WHATSAPP_NUMBER:-}" ] && ok "WhatsApp number" "$NEXT_PUBLIC_WHATSAPP_NUMBER" || bad "WhatsApp number" "not set"

# ── 6. SSL (only relevant on the deployment host) ──────────────────────────
head "6 · SSL CERTIFICATES (deployment host)"
CERT_DIR="$(dirname "$0")/../nginx/ssl"
if [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
  EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_DIR/fullchain.pem" 2>/dev/null | cut -d= -f2)
  if [ -n "$EXPIRY" ] && openssl x509 -checkend 2592000 -noout -in "$CERT_DIR/fullchain.pem" >/dev/null 2>&1; then
    ok "TLS certificate" "valid beyond 30 days (expires $EXPIRY)"
  else
    bad "TLS certificate" "missing, self-signed dev cert, or expiring within 30 days — issue a real one (SETUP.md §5)"
  fi
else
  bad "TLS certificate" "nginx/ssl/fullchain.pem not found (SETUP.md §5)"
fi

# ── Summary ────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  RESULT: $PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "  ✅ READY FOR LAUNCH" || echo "  ⚠️  Fix the ❌ items above — see SETUP.md for exact steps"
echo "════════════════════════════════════════════════════════════════"
exit $FAIL
