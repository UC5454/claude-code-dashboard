#!/bin/bash
# Upload local JSONL log files and user-profile.json to Supabase Storage
# Multi-user layout: {uid}/{date}.jsonl, {uid}/profile.json
# Usage: ./scripts/seed-storage.sh

set -euo pipefail

SUPABASE_URL="https://vvyyyabwvoncugrvawdo.supabase.co"
SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eXl5YWJ3dm9uY3VncnZhd2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU2NjM2MCwiZXhwIjoyMDg2MTQyMzYwfQ.I_Qu96jIk4xsBtfNVfgihtleNiT_K9pyjh72TkSi3LY}"
BUCKET="dashboard-logs"
LOG_DIR="$HOME/.claude-code-dashboard/logs"
PROFILE="$HOME/.claude-code-dashboard/user-profile.json"

upload_file() {
  local filepath="$1"
  local objectname="$2"
  local content_type="${3:-application/octet-stream}"

  echo -n "  Uploading $objectname ... "
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectname}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: ${content_type}" \
    -H "x-upsert: true" \
    --data-binary "@${filepath}")

  if [ "$HTTP_CODE" = "200" ]; then
    echo "OK"
  else
    echo "FAILED (HTTP $HTTP_CODE)"
  fi
}

# Get UID from user-profile.json
UID_HASH=""
if [ -f "$PROFILE" ]; then
  UID_HASH=$(jq -r '.uid // empty' "$PROFILE" 2>/dev/null || echo "")
fi
if [ -z "$UID_HASH" ]; then
  GIT_EMAIL=$(git config user.email 2>/dev/null || echo "unknown")
  UID_HASH=$(echo -n "$GIT_EMAIL" | shasum -a 256 | cut -c1-8)
fi

echo "=== Seeding Supabase Storage (bucket: ${BUCKET}) ==="
echo "  User UID: ${UID_HASH}"

# Upload JSONL log files to {uid}/{date}.jsonl
if [ -d "$LOG_DIR" ]; then
  echo ""
  echo "Uploading JSONL files from $LOG_DIR ..."
  for f in "$LOG_DIR"/*.jsonl; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    upload_file "$f" "${UID_HASH}/${name}"
  done
else
  echo "WARNING: Log directory $LOG_DIR not found"
fi

# Upload user profile to {uid}/profile.json
if [ -f "$PROFILE" ]; then
  echo ""
  echo "Uploading profile.json ..."
  upload_file "$PROFILE" "${UID_HASH}/profile.json" "application/json"
else
  echo "WARNING: User profile $PROFILE not found"
fi

echo ""
echo "=== Done ==="
