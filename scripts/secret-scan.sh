#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Secret Scan Script — Apex Luxury Automobiles
# Scans git-tracked files for leaked credentials, private keys, and API tokens.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "  APEX LUXURY AUTOMOBILES — GIT TRACKED SECRET SCAN"
echo "════════════════════════════════════════════════════════════════"

LEAKS=0

check_pattern() {
  local desc="$1"
  local pattern="$2"
  local exclude="${3:-}"
  local matches
  if [ -n "$exclude" ]; then
    matches=$(git grep -E "$pattern" 2>/dev/null | grep -vE "$exclude" || true)
  else
    matches=$(git grep -E "$pattern" 2>/dev/null || true)
  fi

  if [ -n "$matches" ]; then
    echo "  ❌ LEAK DETECTED: $desc"
    echo "$matches" | sed 's/^/     /'
    LEAKS=$((LEAKS + 1))
  else
    echo "  ✅ Clean: $desc"
  fi
}

# 1. Check known historical or hardcoded password constants
check_pattern "Hardcoded admin password constants" "zojgWBXZdARzCorN8nwa"

# 2. Check for tracked .env files
ENV_TRACKED=$(git ls-files | grep -E "(^|/)\.env(\.local|\.production|\.development)?$" || true)
if [ -n "$ENV_TRACKED" ]; then
  echo "  ❌ LEAK DETECTED: Tracked .env files found in git index:"
  echo "$ENV_TRACKED" | sed 's/^/     /'
  LEAKS=$((LEAKS + 1))
else
  echo "  ✅ Clean: No live .env files tracked in git"
fi

# 3. Check for private keys
check_pattern "Private RSA/EC/OpenSSH keys" "-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"

# 4. Check for live SendGrid production keys (format SG.<22 chars>.<43 chars>)
check_pattern "Live SendGrid API Keys" "SG\.[a-zA-Z0-9_\-]{22}\.[a-zA-Z0-9_\-]{43}"

# 5. Check for real AWS / Cloudflare Access Keys (ignoring dummy docs fixture AKIAIOSFODNN7EXAMPLE)
check_pattern "AWS / R2 Access Key IDs" "(AKIA|ASIA)[0-9A-Z]{16}" "AKIAIOSFODNN7EXAMPLE"

echo ""
echo "════════════════════════════════════════════════════════════════"
if [ "$LEAKS" -eq 0 ]; then
  echo "  ✅ SECRET SCAN PASSED: Zero credentials found in tracked files."
  echo "════════════════════════════════════════════════════════════════"
  exit 0
else
  echo "  ❌ SECRET SCAN FAILED: $LEAKS potential credential leak(s) found!"
  echo "════════════════════════════════════════════════════════════════"
  exit 1
fi
