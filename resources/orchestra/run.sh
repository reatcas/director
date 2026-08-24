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


BACKOFF_STEPS=(30 60 120 300 600 900)
BACKOFF_IDX=0
HALLUCINATION_STREAK=0
MAX_HALLUCINATION_STREAK=5
ITER=0
while :; do

  MODEL=$(json_val model sonnet)
  AI_AGENT=$(json_val agent "${DIRECTOR_AI_AGENT:-claude}")

  SHARED_MEMORY="$HOME/.director-suite/shared-memory"
  mkdir -p "$SHARED_MEMORY"
  PROMPT_CONTENT=$(cat "$PROMPT_FILE")
  if [ "$CAVEMAN" = "true" ]; then
    PROMPT_CONTENT="$PROMPT_CONTENT

CRITICAL INSTRUCTION: CAVEMAN MODE IS ENABLED.
Always use zero prose in responses. No pleasantries. No yapping. Save tokens.
You MUST also use MCP codebase memory to save tokens."
  fi

  # ── Agent-specific anti-hallucination augmentation ──────────────────────
  case "$AI_AGENT" in
    agy|gemini)
      PROMPT_CONTENT="$PROMPT_CONTENT

## GEMINI-SPECIFIC GUARDRAILS (MANDATORY)
You are running inside Director Orchestra. Your output is verified by an external harness.
1. The harness compares git HEAD before/after your session. Zero new commits = FAILURE.
2. After $HALLUCINATION_STREAK consecutive zero-commit sessions (max $MAX_HALLUCINATION_STREAK), you will be PERMANENTLY STOPPED.
3. Writing .md pattern/documentation files does NOT count as product work. Product = code, migrations, endpoints, UI components.
4. Do NOT print commit hashes from memory. After each git commit, run: git log -1 --format=%h — copy THAT hash into your log line.
5. If ROADMAP is exhausted or all items blocked: enter IMPROVEMENT MODE. Scan the codebase, find real code improvements (validation, tests, UI polish, security fixes, performance), write them to ROADMAP.md under ## Improvements, then implement them. You MUST produce real code commits.
6. Documentation-only cycles are VIOLATIONS. The harness will reject them.
7. You are working in the PROJECT DIRECTORY ($(pwd)). This is a real codebase. Use tools to explore it — ls, find, read files. Do NOT assume it's a knowledge base."
      ;;
  esac

  if [ "$AI_AGENT" = "claude" ]; then
    # Use stream-json for real-time output (text mode buffers until session end)
    CLAUDE_ARGS=(-p "$PROMPT_CONTENT" --dangerously-skip-permissions --output-format stream-json --verbose --model "$MODEL" --add-dir "$SHARED_MEMORY")
    if command -v rtk &>/dev/null; then
      CLAUDE_CMD=(rtk -- claude)
    else
      CLAUDE_CMD=(claude)
    fi
  else
    CLAUDE_ARGS=(-p "$PROMPT_CONTENT" --dangerously-skip-permissions --output-format text --model "$MODEL" --add-dir "$SHARED_MEMORY")
    CLAUDE_CMD=(claude)
  fi
  PROJECT_DIR="$(pwd)"
  case "$AI_AGENT" in
    agy) CLAUDE_CMD=(agy); CLAUDE_ARGS=(-p "$PROMPT_CONTENT" --dangerously-skip-permissions --output-format text --model "$MODEL" --add-dir "$SHARED_MEMORY" --add-dir "$PROJECT_DIR") ;;
    codex) CLAUDE_CMD=(codex exec --dangerously-bypass-approvals-and-sandbox --add-dir "$SHARED_MEMORY" --add-dir "$PROJECT_DIR"); CLAUDE_ARGS=("$PROMPT_CONTENT") ;;
    aider) CLAUDE_CMD=(aider --yes-always --no-auto-commits --model "$MODEL" --message); CLAUDE_ARGS=("$PROMPT_CONTENT") ;;
  esac

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
  CUSTOM_PORTS=$(json_val ports "3000 5173 8080 4200 4321")
  for PORT in $CUSTOM_PORTS; do
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
  START_COMMIT=$(git log -1 --format=%H 2>/dev/null || echo "none")

  # For claude: stream-json outputs NDJSON → python extracts text lines in real time.
  # For other agents: plain text passthrough.
  if [ "$AI_AGENT" = "claude" ]; then
    "${CLAUDE_CMD[@]}" "${CLAUDE_ARGS[@]}" </dev/null 2>&1 \
      | python3 -u -c "
import sys, json
for raw in sys.stdin:
    raw = raw.strip()
    if not raw: continue
    try:
        ev = json.loads(raw)
    except:
        print(raw, flush=True)
        continue
    t = ev.get('type','')
    if t == 'assistant':
        msg = ev.get('message',{})
        for c in msg.get('content',[]):
            if c.get('type') == 'text' and c.get('text'):
                print(c['text'], flush=True)
    elif t == 'tool_use':
        name = ev.get('name','')
        inp = str(ev.get('input',{}).get('command','') or ev.get('input',{}).get('pattern','') or '')[:80]
        if name: print(f'▸ … [{name}] {inp}', flush=True)
    elif t == 'tool_result':
        pass
    elif t == 'result':
        r = ev.get('result','')
        if r: print(r, flush=True)
" \
      | while IFS= read -r line; do
          printf '%s\n' "$line"
          printf '%s\n' "$line" >> "$ITER_LOG"
          printf '%s\n' "$line" >> "$MASTER_LOG"
        done
  else
    "${CLAUDE_CMD[@]}" "${CLAUDE_ARGS[@]}" </dev/null 2>&1 \
      | while IFS= read -r line; do
          printf '%s\n' "$line"
          printf '%s\n' "$line" >> "$ITER_LOG"
          printf '%s\n' "$line" >> "$MASTER_LOG"
        done
  fi
  EXIT=${PIPESTATUS[0]}

  # ── Anti-Lazy Check (all agents) ────────────────────────────────────────
  END_COMMIT=$(git log -1 --format=%H 2>/dev/null || echo "none")
  if [ "$EXIT" -eq 0 ] && [ "$START_COMMIT" = "$END_COMMIT" ]; then
    # Check if agent correctly reported BLOCKED (not hallucinating — genuinely stuck)
    LEGIT_BLOCK=false
    if [ -f "$ITER_LOG" ]; then
      grep -qE 'CICLO BLOQUEADO|BLOCKED:' "$ITER_LOG" && LEGIT_BLOCK=true
    fi
    if [ "$LEGIT_BLOCK" = true ]; then
      # Agent reported blocked but should enter improvement mode on next iteration
      # Only count as hallucination if it keeps reporting blocked without trying improvements
      HALLUCINATION_STREAK=$((HALLUCINATION_STREAK + 1))
      stamp "BLOCKED-RETRY: $AI_AGENT reported BLOCKED ($HALLUCINATION_STREAK/$MAX_HALLUCINATION_STREAK). Next iteration should enter IMPROVEMENT MODE."
      EXIT=1
      if [ "$HALLUCINATION_STREAK" -ge "$MAX_HALLUCINATION_STREAK" ]; then
        stamp "BLOCKED-LIMIT: $AI_AGENT could not find work after $MAX_HALLUCINATION_STREAK attempts. Stopping."
        touch .claude/ALTO
        break
      fi
      # Short backoff for blocked — give it one more chance with improvement mode
      sleep 10
      continue
    fi
    HALLUCINATION_STREAK=$((HALLUCINATION_STREAK + 1))
    stamp "ANTI-LAZY: $AI_AGENT exited 0 but made NO commits. Streak: $HALLUCINATION_STREAK/$MAX_HALLUCINATION_STREAK"
    EXIT=1
    if [ "$HALLUCINATION_STREAK" -ge "$MAX_HALLUCINATION_STREAK" ]; then
      stamp "ANTI-LAZY: $AI_AGENT hallucinated $MAX_HALLUCINATION_STREAK consecutive times. STOPPING to prevent waste."
      touch .claude/ALTO
      echo "HALLUCINATION_STREAK_LIMIT: $AI_AGENT produced no real commits in $MAX_HALLUCINATION_STREAK consecutive attempts." >> PENDING.md
      break
    fi
  else
    HALLUCINATION_STREAK=0
  fi

  # ── Iteration summary ──────────────────────────────────────────────────
  if [ -f "$ITER_LOG" ]; then
    SUMMARY=$(tail -20 "$ITER_LOG" | grep -E '^▸|^✔|^✕|commit|feat|fix|error' | tail -3)
    [ -n "$SUMMARY" ] && echo "[orchestra v$VERSION] summary: $SUMMARY" | tee -a "$MASTER_LOG"
  fi

  # ── Post-iteration self-audit (lightweight, no AI call) ────────────────
  if [ "$START_COMMIT" != "$END_COMMIT" ] && [ "$END_COMMIT" != "none" ]; then
    REAL_COMMITS=$(git log --oneline "$START_COMMIT".."$END_COMMIT" 2>/dev/null | wc -l | tr -d ' ')
    CLAIMED=$(grep -c '▸ ✔' "$ITER_LOG" 2>/dev/null || echo 0)
    # Mixer compliance check
    if [ -f "$CFG" ] && [ "$REAL_COMMITS" -gt 0 ]; then
      PRODUCT_W=$(json_val "focus.product" "0" 2>/dev/null || echo 0)
      PRODUCT_COMMITS=$(git log --oneline "$START_COMMIT".."$END_COMMIT" 2>/dev/null | grep -ciE 'feat|feature|product' || echo 0)
      QUALITY_COMMITS=$(git log --oneline "$START_COMMIT".."$END_COMMIT" 2>/dev/null | grep -ciE 'test|fix|refactor|quality' || echo 0)
      AUDIT_LINE="[audit] iter=$ITER commits=$REAL_COMMITS claimed=$CLAIMED product_commits=$PRODUCT_COMMITS quality_commits=$QUALITY_COMMITS product_weight=$PRODUCT_W"
      echo "[orchestra v$VERSION] $AUDIT_LINE" | tee -a "$MASTER_LOG"
      # Write to learnings file
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $AUDIT_LINE agent=$AI_AGENT model=$MODEL" >> .claude/CYCLE_LEARNINGS.md
    fi
    # Detect hallucinated hashes (claimed but not in git)
    if [ -f "$ITER_LOG" ] && [ "$CLAIMED" -gt 0 ]; then
      FAKE_COUNT=0
      while IFS= read -r hash; do
        git cat-file -t "$hash" >/dev/null 2>&1 || FAKE_COUNT=$((FAKE_COUNT + 1))
      done < <(grep '▸ ✔' "$ITER_LOG" | grep -oE '[0-9a-f]{7,}' || true)
      if [ "$FAKE_COUNT" -gt 0 ]; then
        stamp "AUDIT-WARN: $FAKE_COUNT fake commit hashes detected in claimed output"
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) FAKE_HASHES=$FAKE_COUNT agent=$AI_AGENT" >> .claude/CYCLE_LEARNINGS.md
      fi
    fi
  fi

  # ── Smart Mix Auto-Switch ───────────────────────────────────────────────
  # Every 5 iterations, analyze commit patterns and auto-adjust the mix profile.
  if [ $((ITER % 5)) -eq 0 ] && [ "$ITER" -gt 0 ] && [ -f .claude/CYCLE_LEARNINGS.md ]; then
    # Count recent commit categories from git log (last 15 commits)
    RECENT_PRODUCT=$(git log --oneline -15 2>/dev/null | grep -ciE 'feat' || echo 0)
    RECENT_QUALITY=$(git log --oneline -15 2>/dev/null | grep -ciE 'test|fix' || echo 0)
    RECENT_SECURITY=$(git log --oneline -15 2>/dev/null | grep -ciE 'security|auth|xss|sql.inject|csrf' || echo 0)
    RECENT_TOTAL=$((RECENT_PRODUCT + RECENT_QUALITY + RECENT_SECURITY))
    [ "$RECENT_TOTAL" -eq 0 ] && RECENT_TOTAL=1

    # Detect slop: >60% in one category → switch to complement
    PRODUCT_PCT=$((RECENT_PRODUCT * 100 / RECENT_TOTAL))
    QUALITY_PCT=$((RECENT_QUALITY * 100 / RECENT_TOTAL))

    NEW_MIX=""
    if [ "$PRODUCT_PCT" -gt 60 ]; then
      NEW_MIX="quality-first"
      stamp "AUTO-MIX: Product slop detected (${PRODUCT_PCT}%) — switching to Quality First"
    elif [ "$QUALITY_PCT" -gt 60 ]; then
      NEW_MIX="ship-fast"
      stamp "AUTO-MIX: Quality heavy (${QUALITY_PCT}%) — switching to Ship Fast"
    elif [ "$RECENT_SECURITY" -eq 0 ] && [ "$ITER" -ge 10 ]; then
      NEW_MIX="hardening"
      stamp "AUTO-MIX: Zero security work in 15 commits — switching to Hardening"
    fi

    if [ -n "$NEW_MIX" ] && [ -f .claude/default-mixes.json ]; then
      # Apply the new mix from presets
      python3 -c "
import json, sys
mixes = json.load(open('.claude/default-mixes.json'))
cfg = json.load(open('$CFG'))
target = [m for m in mixes if m['id'] == 'preset-$NEW_MIX']
if target:
    cfg['focus'] = target[0]['focus']
    json.dump(cfg, open('$CFG', 'w'), indent=2)
    print('Applied: ' + target[0]['name'])
" 2>/dev/null | tee -a "$MASTER_LOG"
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) AUTO-MIX=$NEW_MIX product_pct=$PRODUCT_PCT quality_pct=$QUALITY_PCT" >> .claude/CYCLE_LEARNINGS.md
    fi
  fi

  echo "[orchestra v$VERSION] movement $ITER exited ($EXIT)" | tee -a "$MASTER_LOG"
  [ -f .claude/ALTO ] && continue

  # ── Single mode ─────────────────────────────────────────────────────────
  [ "$MODE" = "single" ] && { stamp "FINE — single-cycle mode complete."; touch .claude/ALTO; break; }

  # ── Usage limit detection: wait until reset instead of retrying ─────────
  USAGE_DETECTED=false
  if [ -f "$ITER_LOG" ]; then
    USAGE_HIT=$(grep -iE "you're out of|out of extra usage|usage limit|your limit resets|hit your limit|rate limit|exceeded.*quota|token.*limit|capacity.*reached|individual quota reached|upgrade your subscription|resets in [0-9]+h" "$ITER_LOG" | tail -1)
    [ -n "$USAGE_HIT" ] && USAGE_DETECTED=true
  fi
  # Also detect via exit code (claude exits 2 for usage limits)
  [ "$EXIT" -eq 2 ] && USAGE_DETECTED=true

  if [ "$USAGE_DETECTED" = true ]; then
    touch .claude/USAGE_LIMIT
    # Try to parse reset time — supports "resets at 3:00 AM" and "Resets in 68h16m35s"
    WAIT_SECS=0
    if [ -n "$USAGE_HIT" ]; then
      # Format 1: "Resets in NhNmNs" (Antigravity/agy)
      DURATION_MATCH=$(echo "$USAGE_HIT" | grep -oE '[Rr]esets in [0-9]+h[0-9]+m' | head -1)
      if [ -n "$DURATION_MATCH" ]; then
        RESET_H=$(echo "$DURATION_MATCH" | grep -oE '[0-9]+h' | grep -oE '[0-9]+')
        RESET_M=$(echo "$DURATION_MATCH" | grep -oE '[0-9]+m' | grep -oE '[0-9]+')
        WAIT_SECS=$(( (${RESET_H:-0} * 3600) + (${RESET_M:-0} * 60) + 120 ))
      fi
      # Format 2: "resets at 3:00 AM" (Claude)
      if [ "$WAIT_SECS" -eq 0 ]; then
        RESET_TIME=$(echo "$USAGE_HIT" | grep -oE '[0-9]{1,2}:[0-9]{2}\s*(AM|PM|am|pm)' | head -1)
        if [ -n "$RESET_TIME" ]; then
          RESET_EPOCH=$(date -j -f "%I:%M %p" "$RESET_TIME" +%s 2>/dev/null || date -d "$RESET_TIME" +%s 2>/dev/null || echo 0)
          NOW_EPOCH=$(date +%s)
          if [ "$RESET_EPOCH" -gt 0 ]; then
            [ "$RESET_EPOCH" -le "$NOW_EPOCH" ] && RESET_EPOCH=$((RESET_EPOCH + 86400))
            WAIT_SECS=$((RESET_EPOCH - NOW_EPOCH + 120))
          fi
        fi
      fi
    fi
    if [ "$WAIT_SECS" -gt 0 ]; then
      WAIT_MINS=$((WAIT_SECS / 60))
      stamp "USAGE LIMIT — esperando ${WAIT_MINS}min hasta reset. Sin reintentos."
      sleep "$WAIT_SECS"
    else
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
