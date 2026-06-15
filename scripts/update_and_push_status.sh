#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/offspace/works/03_Work/offspace-ai-office"
LOG_DIR="$HOME/.hermes/logs"
LOG_FILE="$LOG_DIR/office-status-publish.log"
mkdir -p "$LOG_DIR"
cd "$ROOT"

record_publish_status() {
  local status="$1"
  local message="$2"
  OFFICE_PUBLISH_STATUS="$status" OFFICE_PUBLISH_MESSAGE="$message" \
    /usr/bin/python3 scripts/update_office_status.py
}

log_publish() {
  local status="$1"
  local message="$2"
  printf '%s [%s] %s\n' "$(/bin/date '+%Y-%m-%d %H:%M:%S %Z')" "$status" "$message" >> "$LOG_FILE"
}

/usr/bin/python3 scripts/update_office_status.py

# Avoid concurrent git operations.
if [ -f .git/index.lock ]; then
  msg="git index lock exists; skipping push"
  echo "$msg"
  log_publish "skipped" "$msg"
  record_publish_status "skipped" "$msg"
  exit 0
fi

# Only commit/push if generated status changed or is not tracked yet.
if [ -n "$(/usr/bin/git status --porcelain -- data/office-status.json)" ]; then
  /usr/bin/git add data/office-status.json
  /usr/bin/git commit -m "Update live office status" || true

  push_output_file="$(/usr/bin/mktemp)"
  if /usr/bin/git push >"$push_output_file" 2>&1; then
    msg="git push completed"
    echo "$msg"
    log_publish "success" "$msg"
    record_publish_status "success" "$msg"
  else
    status_code=$?
    msg="git push failed with exit $status_code; see $LOG_FILE"
    echo "$msg" >&2
    /usr/bin/sed -E 's#https://[^/@[:space:]]+@#https://***@#g' "$push_output_file" >> "$LOG_FILE"
    log_publish "failed" "$msg"
    record_publish_status "failed" "$msg"
    /bin/rm -f "$push_output_file"
    exit $status_code
  fi
  /bin/rm -f "$push_output_file"
else
  msg="no office-status change"
  echo "$msg"
  log_publish "skipped" "$msg"
fi
