#!/usr/bin/env bash
# Copyright (c) 2026 René Antonio Casaña Amaya. All rights reserved.
# Licensed under the AGPL-3.0 License. See LICENSE in repository root.
# Orchestra v3 — Token Economy Edition
set -u
cd "$(dirname "$0")"

PROMPT_FILE=".claude/commands/loop.md"
LOG_DIR=".claude/logs"
MASTER_LOG="$LOG_DIR/orchestra.log"
VERSION="$(cat .claude/ORCHESTRA_VERSION 2>/dev/null || echo unknown)"
mkdir -p "$LOG_DIR"
[ -f .claude/RUN_STARTED ] || date -u +"%Y-%m-%dT%H:%M:%SZ" > .claude/RUN_STARTED

# ── Read orchestra config ─────────────────────────────────────────────────────
CFG=".claude/orchestra.json"
json_val() { python3 -c "import json,sys;d=json.load(open('$CFG'));print(d.get('$1','$2'))" 2>/dev/null || echo "$2"; }

MODE=$(json_val mode perpetual)
MAX_ITER=$(json_val maxIterations 0)
CAVEMAN=$(json_val caveman true)
MODEL=$(json_val model sonnet)
MODEL_COMPLEX=$(json_val modelComplex opus)
COMPACT_AT=$(json_val compactAt 50)

stamp() { echo "[orchestra v$VERSION] $1 $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$MASTER_LOG"; }

# ── Signal trap ───────────────────────────────────────────────────────────────
cleanup() {
  stamp "SIGTERM recibido — terminando subprocesos."
  touch .claude/ALTO
  kill 0 2>/dev/null
  exit 0
}
trap cleanup SIGTERM SIGINT

# ── Build claude args ─────────────────────────────────────────────────────────
SHARED_MEMORY="$HOME/.director-suite/shared-memory"
mkdir -p "$SHARED_MEMORY"
CLAUDE_ARGS=(
  -p "$(cat "$PROMPT_FILE")"
  --dangerously-skip-permissions
  --output-format text
  --model "$MODEL"
  --add-dir "$SHARED_MEMORY"
  --mcp codebase-memory
)

# ── rtk integration (if installed) ────────────────────────────────────────────
if command -v rtk &>/dev/null; then
  stamp "rtk detected — CLI output compression active."
  # rtk wraps claude CLI to compress tool output
  CLAUDE_CMD=(rtk -- claude)
else
  CLAUDE_CMD=(claude)
fi

stamp "DOWNBEAT v3 — mode=$MODE maxIter=$MAX_ITER model=$MODEL caveman=$CAVEMAN compactAt=$COMPACT_AT"
echo "[orchestra v$VERSION] stop: touch .claude/ALTO. Logs: $LOG_DIR/iter-*.log"

BACKOFF_STEPS=(30 60 120 300 600 900)
BACKOFF_IDX=0
ITER=0
while :; do
  [ -f .claude/ALTO ] && { stamp "FINE — ALTO detected after $ITER iterations."; break; }

  # ── Bounded mode ────────────────────────────────────────────────────────
  if [ "$MODE" != "perpetual" ] && [ "$MAX_ITER" -gt 0 ] && [ "$ITER" -ge "$MAX_ITER" ]; then
    stamp "FINE — max iterations ($MAX_ITER) reached."
    touch .claude/ALTO
    break
  fi

  ITER=$((ITER+1))
  TS=$(date -u +"%Y%m%dT%H%M%SZ")
  ITER_LOG="$LOG_DIR/iter-$TS.log"

  # ── Trim PLAN.md to last 3 cycles (prevents multi-minute boot on large projects) ──
  if [ -f PLAN.md ]; then
    TOTAL_LINES=$(wc -l < PLAN.md)
    if [ "$TOTAL_LINES" -gt 200 ]; then
      # Archive everything except last 150 lines
      ARCHIVE="$LOG_DIR/plan-archive-$TS.md"
      head -n $((TOTAL_LINES - 150)) PLAN.md >> "$ARCHIVE"
      TRIMMED=$(tail -150 PLAN.md)
      printf '# Plan (ciclos anteriores archivados en .claude/logs/plan-archive-*.md)\n\n%s\n' "$TRIMMED" > PLAN.md
      echo "[orchestra v$VERSION] PLAN.md trimmed: ${TOTAL_LINES} → 150 lines (archived)" | tee -a "$MASTER_LOG"
    fi
  fi

  echo "[orchestra v$VERSION] movement $ITER — $(date '+%H:%M:%S')" | tee -a "$MASTER_LOG"

  # ── Auto-capture DB Schema ──────────────────────────────────────────────────
  DB_VISION_DIR=".claude/skills/db-vision"
  if [ -x "$DB_VISION_DIR/db-extract.sh" ]; then
    bash "$DB_VISION_DIR/db-extract.sh" >/dev/null 2>&1 || true
  fi

  # ── Auto-capture A11Y Tree if local server is running ───────────────────
  ACTIVE_PORT=""
  for PORT in 3000 5173 8080 4200 4321; do
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
      ACTIVE_PORT=$PORT
      break
    fi
  done

  if [ -n "$ACTIVE_PORT" ]; then
    stamp "Capturing a11y tree from localhost:$ACTIVE_PORT"
    VISION_DIR=".claude/skills/browser-vision"
    if [ ! -d "$VISION_DIR/node_modules/puppeteer" ]; then
      stamp "Installing puppeteer for a11y capture..."
      (cd "$VISION_DIR" && npm install --no-save puppeteer >/dev/null 2>&1)
    fi
    node "$VISION_DIR/a11y.js" "http://localhost:$ACTIVE_PORT" > .claude/A11Y_TREE.md 2>/dev/null || true
  else
    rm -f .claude/A11Y_TREE.md
  fi

  # ── Run claude ──────────────────────────────────────────────────────────
  # PLAN.md trimmed above keeps boot fast. Usage-limit detection handles quota.
  # Kill button in Director handles true hangs.
  "${CLAUDE_CMD[@]}" "${CLAUDE_ARGS[@]}" 2>&1 \
    | tee -a "$ITER_LOG" "$MASTER_LOG"
  EXIT=${PIPESTATUS[0]}

  # ── Iteration summary ──────────────────────────────────────────────────
  if [ -f "$ITER_LOG" ]; then
    SUMMARY=$(tail -20 "$ITER_LOG" | grep -E '^▸|^✔|^✕|commit|feat|fix|error' | tail -3)
    [ -n "$SUMMARY" ] && echo "[orchestra v$VERSION] summary: $SUMMARY" | tee -a "$MASTER_LOG"
  fi

  echo "[orchestra v$VERSION] movement $ITER exited ($EXIT)" | tee -a "$MASTER_LOG"
  [ -f .claude/ALTO ] && continue

  # ── Single mode ─────────────────────────────────────────────────────────
  [ "$MODE" = "single" ] && { stamp "FINE — single-cycle mode complete."; touch .claude/ALTO; break; }

  # ── Usage limit detection: wait until reset instead of retrying ─────────
  USAGE_DETECTED=false
  if [ -f "$ITER_LOG" ]; then
    USAGE_HIT=$(grep -iE "you're out of|out of extra usage|usage limit|your limit resets|rate limit|exceeded.*quota|token.*limit|capacity.*reached" "$ITER_LOG" | tail -1)
    [ -n "$USAGE_HIT" ] && USAGE_DETECTED=true
  fi
  # Also detect via exit code (claude exits 2 for usage limits)
  [ "$EXIT" -eq 2 ] && USAGE_DETECTED=true

  if [ "$USAGE_DETECTED" = true ]; then
    touch .claude/USAGE_LIMIT
    # Try to parse reset time from Claude's message (e.g. "resets at 3:00 AM")
    RESET_TIME=""
    [ -n "$USAGE_HIT" ] && RESET_TIME=$(echo "$USAGE_HIT" | grep -oE '[0-9]{1,2}:[0-9]{2}\s*(AM|PM|am|pm)' | head -1)
    if [ -n "$RESET_TIME" ]; then
      RESET_EPOCH=$(date -j -f "%I:%M %p" "$RESET_TIME" +%s 2>/dev/null || date -d "$RESET_TIME" +%s 2>/dev/null || echo 0)
      NOW_EPOCH=$(date +%s)
      if [ "$RESET_EPOCH" -gt 0 ]; then
        [ "$RESET_EPOCH" -le "$NOW_EPOCH" ] && RESET_EPOCH=$((RESET_EPOCH + 86400))
        WAIT_SECS=$((RESET_EPOCH - NOW_EPOCH + 120))
        WAIT_MINS=$((WAIT_SECS / 60))
        stamp "USAGE LIMIT — esperando $WAIT_MINS min hasta reset ($RESET_TIME). Sin reintentos."
        sleep "$WAIT_SECS"
      else
        stamp "USAGE LIMIT — hora no parseada, esperando 3 horas."
        sleep 10800
      fi
    else
      # No reset time found — wait 3 hours (conservative, avoids noisy retries)
      stamp "USAGE LIMIT — sin hora de reset, esperando 3 horas."
      sleep 10800
    fi
    rm -f .claude/USAGE_LIMIT
    BACKOFF_IDX=0
    continue
  fi

  if [ "$EXIT" -eq 0 ]; then
    stamp "movement $ITER exited ($EXIT). Resetting backoff."
    BACKOFF_IDX=0
  else
    BACKOFF=${BACKOFF_STEPS[$BACKOFF_IDX]}
    stamp "movement $ITER exited ($EXIT). Backoff ${BACKOFF}s (idx $BACKOFF_IDX)."
    sleep $BACKOFF
    if [ $BACKOFF_IDX -lt $((${#BACKOFF_STEPS[@]} - 1)) ]; then
      BACKOFF_IDX=$((BACKOFF_IDX + 1))
    fi
  fi

  # ── Log rotation: keep last 50 ──────────────────────────────────────────
  ls -1t "$LOG_DIR"/iter-*.log 2>/dev/null | tail -n +51 | xargs rm -f 2>/dev/null || true
done
