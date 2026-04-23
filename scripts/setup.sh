#!/usr/bin/env bash
#
# First-time setup for claude-dispatch-monitor.
# Creates the directories the monitor reads from, prints next steps.
#
# Safe to re-run — idempotent.

set -euo pipefail

LOGS_DIR="${LOGS_DIR:-$HOME/.claude/work/logs}"
BRIEFS_DIR="${BRIEFS_DIR:-$HOME/.claude/work/briefs}"

mkdir -p "$LOGS_DIR" "$BRIEFS_DIR"

cat <<EOF
claude-dispatch-monitor — setup complete

  logs:    $LOGS_DIR
  briefs:  $BRIEFS_DIR

Next:

  1. Make sure Claude Code is installed and signed in:
     https://docs.claude.com/en/docs/claude-code

  2. Produce at least one compatible log:
       ./scripts/dispatch.sh <project> <slug> "<prompt>"

     Example:
       ./scripts/dispatch.sh demo-app add-readme "Write a one-paragraph README for this repo."

  3. Run the dashboard:
       npm install
       npm run dev

     Open http://localhost:5173

Until a log exists in \$LOGS_DIR, the UI shows mock data with a "MOCK" badge.
EOF
