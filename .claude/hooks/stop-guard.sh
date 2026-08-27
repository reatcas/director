#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$DIR/ALTO" ]; then
  exit 0
fi
if [ -f "$DIR/../PLAN.md" ] || [ -f "$DIR/../PENDING.md" ]; then
  cat <<'JSON'
{"decision":"block","reason":"The perpetual loop is active (no ALTO flag). Do not conclude. Read PLAN.md, announce [Cycle N | elapsed | unit], and execute the next action. If the cycle plan is exhausted, run the backlog-generator skill and start the next cycle. If the owner wrote ALTO in chat, create the file .claude/ALTO and perform graceful shutdown."}
JSON
  exit 0
fi
exit 0
