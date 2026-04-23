#!/usr/bin/env bash
#
# Run `claude -p` with the log written to a filename the dashboard can parse.
#
# Usage:
#   ./scripts/dispatch.sh <project> <slug> "<prompt>"
#
# Produces:
#   $LOGS_DIR/<project>-YYYYMMDD-HHmm-<slug>.log  (stream-JSON)
#
# Env:
#   LOGS_DIR   where to write the log (default: ~/.claude/work/logs)
#   CLAUDE_BIN path to the claude binary (default: `claude` from $PATH)

set -euo pipefail

usage() {
  echo "Usage: $0 <project> <slug> \"<prompt>\"" >&2
  echo >&2
  echo "Example: $0 demo-app add-readme \"Write a short README.\"" >&2
  exit 1
}

[[ $# -eq 3 ]] || usage

PROJECT="$1"
SLUG="$2"
PROMPT="$3"

# Safety: project and slug are used in a filename — restrict to [A-Za-z0-9._-].
if ! [[ "$PROJECT" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "error: project name must match [A-Za-z0-9._-]+ (got: $PROJECT)" >&2
  exit 1
fi
if ! [[ "$SLUG" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "error: slug must match [A-Za-z0-9._-]+ (got: $SLUG)" >&2
  exit 1
fi

LOGS_DIR="${LOGS_DIR:-$HOME/.claude/work/logs}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"

mkdir -p "$LOGS_DIR"

if ! command -v "$CLAUDE_BIN" >/dev/null 2>&1; then
  echo "error: '$CLAUDE_BIN' not on PATH — install Claude Code first" >&2
  echo "  https://docs.claude.com/en/docs/claude-code" >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M)"
STEM="${PROJECT}-${STAMP}-${SLUG}"
LOG="${LOGS_DIR}/${STEM}.log"

echo "→ $LOG"

"$CLAUDE_BIN" -p "$PROMPT" \
  --output-format stream-json \
  --verbose \
  > "$LOG"

echo "✓ done — refresh the dashboard to see it"
