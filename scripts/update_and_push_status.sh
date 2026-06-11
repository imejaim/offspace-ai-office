#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/offspace/works/03_Work/offspace-ai-office"
LOG_DIR="$HOME/.hermes/logs"
mkdir -p "$LOG_DIR"
cd "$ROOT"

/usr/bin/python3 scripts/update_office_status.py

# Avoid concurrent git operations.
if [ -f .git/index.lock ]; then
  echo "git index lock exists; skipping push"
  exit 0
fi

# Only commit/push if generated status changed or is not tracked yet.
if [ -n "$(/usr/bin/git status --porcelain -- data/office-status.json)" ]; then
  /usr/bin/git add data/office-status.json
  /usr/bin/git commit -m "Update live office status" || true
  /usr/bin/git push || true
else
  echo "no office-status change"
fi
