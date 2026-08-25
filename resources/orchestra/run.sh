#!/usr/bin/env bash
# Copyright (c) 2026 René Antonio Casaña Amaya. All rights reserved.
# Licensed under the AGPL-3.0 License. See LICENSE in repository root.
# Orchestra v3 — Token Economy Edition
set -uo pipefail
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
BLOCKED_STREAK=0
MAX_HALLUCINATION_STREAK=5
IMPROVEMENT_STREAK=0
MAX_IMPROVEMENT_STREAK=10
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
    EXIT=${PIPESTATUS[0]}
  else
    "${CLAUDE_CMD[@]}" "${CLAUDE_ARGS[@]}" </dev/null 2>&1 \
      | while IFS= read -r line; do
          printf '%s\n' "$line"
          printf '%s\n' "$line" >> "$ITER_LOG"
          printf '%s\n' "$line" >> "$MASTER_LOG"
        done
    EXIT=${PIPESTATUS[0]}
  fi

  # ── Anti-Lazy Check (all agents) ────────────────────────────────────────
  END_COMMIT=$(git log -1 --format=%H 2>/dev/null || echo "none")
  if [ "$EXIT" -eq 0 ] && [ "$START_COMMIT" = "$END_COMMIT" ]; then
    # Check if agent correctly reported BLOCKED (not hallucinating — genuinely stuck)
    LEGIT_BLOCK=false
    if [ -f "$ITER_LOG" ]; then
      grep -qE 'CICLO BLOQUEADO|BLOCKED:' "$ITER_LOG" && LEGIT_BLOCK=true
    fi
    if [ "$LEGIT_BLOCK" = true ]; then
      # Agent honestly reported BLOCKED — don't count against hallucination streak
      BLOCKED_STREAK=$((BLOCKED_STREAK + 1))
      stamp "BLOCKED-RETRY: $AI_AGENT reported BLOCKED ($BLOCKED_STREAK/$MAX_HALLUCINATION_STREAK). Next iteration should enter IMPROVEMENT MODE."
      EXIT=1
      if [ "$BLOCKED_STREAK" -ge "$MAX_HALLUCINATION_STREAK" ]; then
        stamp "BLOCKED-LIMIT: $AI_AGENT could not find work after $MAX_HALLUCINATION_STREAK attempts. Stopping."
        touch .claude/ALTO
        break
      fi
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
    BLOCKED_STREAK=0
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
      # Honest product counting: exclude feat(i18n), feat(api):validate UUID, feat(ui):bind, etc.
      PRODUCT_COMMITS=$(git log --oneline "$START_COMMIT".."$END_COMMIT" 2>/dev/null | grep -iE '^[a-f0-9]+ feat' | grep -cviE 'i18n|uuid|validate|bind.*label|translat|hex.*color|color.*token|primeflex' || echo 0)
      QUALITY_COMMITS=$(git log --oneline "$START_COMMIT".."$END_COMMIT" 2>/dev/null | grep -ciE 'test|fix|refactor|quality' || echo 0)
      I18N_COMMITS=$(git log --oneline "$START_COMMIT".."$END_COMMIT" 2>/dev/null | grep -ciE 'i18n|translat|bind.*label' || echo 0)
      SECURITY_COMMITS=$(git log --oneline "$START_COMMIT".."$END_COMMIT" 2>/dev/null | grep -ciE 'security|uuid.*valid|validate.*uuid|auth|rbac|tenant' || echo 0)
      AUDIT_LINE="[audit] iter=$ITER commits=$REAL_COMMITS claimed=$CLAIMED product=$PRODUCT_COMMITS quality=$QUALITY_COMMITS i18n=$I18N_COMMITS security=$SECURITY_COMMITS product_weight=$PRODUCT_W"
      echo "[orchestra v$VERSION] $AUDIT_LINE" | tee -a "$MASTER_LOG"
      # Write to learnings file
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $AUDIT_LINE agent=$AI_AGENT model=$MODEL" >> .claude/CYCLE_LEARNINGS.md
    fi
    # Detect hallucinated hashes (claimed but not in git)
    if [ -f "$ITER_LOG" ] && [ "$CLAIMED" -gt 0 ]; then
      FAKE_COUNT=0
      while IFS= read -r hash; do
        git cat-file -t "$hash" >/dev/null 2>&1 || FAKE_COUNT=$((FAKE_COUNT + 1))
      done < <(grep -A1 '▸ ✔' "$ITER_LOG" | grep -oiE '[0-9a-f]{7,}' || true)
      if [ "$FAKE_COUNT" -gt 0 ]; then
        stamp "AUDIT-WARN: $FAKE_COUNT fake commit hashes detected in claimed output"
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) FAKE_HASHES=$FAKE_COUNT agent=$AI_AGENT" >> .claude/CYCLE_LEARNINGS.md
      fi
    fi
  fi

  # ── Anti-slop: detect category repetition + mislabeled commits ──────────
  if [ "$START_COMMIT" != "$END_COMMIT" ] && [ "$END_COMMIT" != "none" ]; then
    # Detect mislabeled feat() commits (i18n/UUID/style work labeled as feat)
    MISLABELED=$(git log --oneline "$START_COMMIT".."$END_COMMIT" 2>/dev/null | grep -ciE 'feat\(.*i18n|feat\(.*l10n|feat\(.*locali[zs]|feat\(.*uuid|feat\(.*bind|feat\(.*translat|feat\(.*hex|feat\(.*color.token|feat\(.*primeflex|feat\(.*sanitiz|feat\(.*valid' || echo 0)
    if [ "$MISLABELED" -gt 0 ]; then
      stamp "ANTI-SLOP: $MISLABELED mislabeled feat() commits detected (i18n/security/style work labeled as feat)"
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) MISLABELED_FEAT=$MISLABELED agent=$AI_AGENT — i18n/uuid/style work falsely labeled as feat()" >> .claude/CYCLE_LEARNINGS.md
    fi
    # Detect mechanical busywork (many tiny same-pattern commits)
    MECHANICAL=$(git log --oneline "$START_COMMIT".."$END_COMMIT" 2>/dev/null | grep -ciE 'bind [0-9]+ |translate [0-9]+ |validate uuid|validate UUID|replace.*hardcoded|rename.*variable|update.*import|fix.*typo|add.*missing.*type' || echo 0)
    if [ "$MECHANICAL" -gt 3 ]; then
      stamp "ANTI-SLOP: $MECHANICAL mechanical commits detected — should be batched into 1-2 commits"
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) MECHANICAL_BUSYWORK=$MECHANICAL agent=$AI_AGENT — unbatched repetitive commits" >> .claude/CYCLE_LEARNINGS.md
    fi
    # Detect module concentration (same file/module hit too many times)
    TOP_MODULE=$(git log --oneline "$START_COMMIT".."$END_COMMIT" 2>/dev/null | grep -oE '\([a-zA-Z_-]+\)' | sort | uniq -c | sort -rn | head -1 | awk '{print $1, $2}')
    TOP_COUNT=$(echo "$TOP_MODULE" | awk '{print $1}')
    TOP_NAME=$(echo "$TOP_MODULE" | awk '{print $2}')
    if [ "${TOP_COUNT:-0}" -gt 5 ]; then
      stamp "ANTI-SLOP: module $TOP_NAME hit $TOP_COUNT times in this iteration — concentration violation"
      echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) MODULE_CONCENTRATION=$TOP_NAME×$TOP_COUNT agent=$AI_AGENT" >> .claude/CYCLE_LEARNINGS.md
    fi

    # ── Improvement mode streak detection ──────────────────────────────────
    # Only count as improvement-only if there WERE real commits but none were product
    PRODUCT_W_CHECK=$(json_val "focus.product" "0" 2>/dev/null || echo 0)
    if [ "${REAL_COMMITS:-0}" -gt 0 ] && [ "${PRODUCT_COMMITS:-0}" -eq 0 ] && [ "$PRODUCT_W_CHECK" -gt 0 ]; then
      IMPROVEMENT_STREAK=$((IMPROVEMENT_STREAK + 1))
      if [ "$IMPROVEMENT_STREAK" -ge "$MAX_IMPROVEMENT_STREAK" ]; then
        stamp "IMPROVEMENT-LIMIT: $IMPROVEMENT_STREAK consecutive cycles with ZERO product work (budget=$PRODUCT_W_CHECK%). Injecting PRODUCT_REQUIRED directive."
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) IMPROVEMENT_LIMIT_HIT=$IMPROVEMENT_STREAK agent=$AI_AGENT — product budget=$PRODUCT_W_CHECK% but 0% actual for $IMPROVEMENT_STREAK cycles" >> .claude/CYCLE_LEARNINGS.md
        # Inject a product directive that the agent MUST read at next boot
        echo "⚠️ HARNESS OVERRIDE: You have done $IMPROVEMENT_STREAK consecutive cycles with ZERO product work. Product budget is $PRODUCT_W_CHECK%. Your NEXT cycle MUST be 100% product from ROADMAP.md. Check ALL unchecked features (P0, P1, P2) — if ANY exist, work on them. Do NOT enter IMPROVEMENT MODE." > .claude/PRODUCT_DIRECTIVE.md
      else
        stamp "PRODUCT-STARVATION: $IMPROVEMENT_STREAK/$MAX_IMPROVEMENT_STREAK cycles without product work (budget=$PRODUCT_W_CHECK%)"
      fi
    else
      IMPROVEMENT_STREAK=0
    fi
  fi

  # ── Smart Mix v2: aggressive self-regulation with category freeze ────────
  # Every 3 iterations, analyze last 50 commits and correct deviations.
  # Key fixes over v1: larger window, stronger corrections, budget-based floors,
  # category freeze when >2× budget, honest commit classification.
  SMART_MIX=$(json_val smartMix false)
  if [ "$SMART_MIX" = "true" ] && [ $((ITER % 3)) -eq 0 ] && [ "$ITER" -gt 0 ]; then
    python3 -u - "$CFG" <<'SMARTMIX_PY'
import json, subprocess, sys, re, os

cfg_path = sys.argv[1]
cfg = json.load(open(cfg_path))
focus = cfg.get("focus", {})
original_focus = dict(focus)

# Analyze last 50 commits (v1 only did 20 — too small a window)
try:
    log = subprocess.check_output(["git", "log", "--oneline", "-50"], text=True, timeout=5)
except Exception:
    sys.exit(0)

lines = [l.strip() for l in log.strip().split("\n") if l.strip()]
if len(lines) < 5:
    sys.exit(0)

# Honest category detection — prevents mislabeling exploits
# Order matters: specific patterns first, broad ones last
cat_rules = [
    # i18n FIRST — catches feat(i18n), fix(i18n), i18n:, chore(i18n), bind.*label, translate
    ("i18n",            r"i18n|bind.*label|translate|hardcoded.*string|hardcoded.*label"),
    # security — UUID validation, auth, injection, sanitization
    ("security",        r"security|auth[^o]|xss|csrf|inject|sanitiz|rate.limit|uuid.*valid|validate.*uuid|rbac|tenant.*guard"),
    # tests
    ("quality_tests",   r"^[a-f0-9]+ test[\(:]|add.*test|handler test|validation test"),
    # performance
    ("performance",     r"perf[\(:]|optim|n\+1|cache|lazy|bundle|count.*over"),
    # style/chore — color tokens, CSS cleanup, PrimeFlex, hex replacement
    ("refactoring",     r"style[\(:]|chore[\(:]|refactor|hex.*color|color.*token|primeflex|purge|cleanup|clean.up"),
    # ux/a11y
    ("ux_accessibility",r"a11y|accessib|aria|keyboard|responsive|empty.state|loading.state|ux[\(:]"),
    # data/db
    ("data_db",         r"migrat|schema|database|constraint|check.*constraint"),
    # frontend — UI features (NOT i18n, NOT style)
    ("frontend",        r"feat\(ui|feat\(webapp|feat\(mobile|fix\(ui|feat\(component"),
    # backend — API features (NOT UUID validation)
    ("backend",         r"feat\(api|feat\(backend|fix\(api|fix\(backend"),
    # product — true new features only (must have feat( and NOT match above)
    ("product",         r"feat\((?!i18n|test|style|chore)"),
    # docs
    ("documentation",   r"docs[\(:]|readme|documentation"),
    # architecture — state files, conventions, ADRs, Phase 0 setup
    ("architecture",    r"DECISIONS|PLAN\.md|PENDING|convention|ADR|phase.0|architecture"),
]

counts = {k: 0 for k in focus}
for line in lines:
    matched = False
    msg = line.split(" ", 1)[1] if " " in line else line  # strip hash
    for cat, pat in cat_rules:
        if cat in counts and re.search(pat, msg, re.I):
            counts[cat] += 1
            matched = True
            break
    if not matched:
        # Unmatched goes to "other" bucket — NOT product (v1 bug: inflated product)
        counts["refactoring"] = counts.get("refactoring", 0) + 1

total = max(sum(counts.values()), 1)

# Calculate deviations and corrections — Smart Mix v3 (damped)
STEP = 6          # max adjustment per check (v2 was 8 — caused oscillation)
DEAD_ZONE = 5     # tolerance in percentage points (v2 was 3 — too tight)
FREEZE_MULT = 2.0 # freeze category if actual > target × this multiplier
SMOOTHING = 0.3   # exponential smoothing: 30% new signal, 70% current weight
SESSION_CAP = 15  # max total drift from original per session (prevents runaway)

adjustments = {}
frozen = []
starved = []

for cat in focus:
    target = focus[cat]
    actual = round(counts.get(cat, 0) * 100 / total)

    if target == 0:
        if actual > 5:
            adjustments[cat] = -STEP
        continue

    deviation = actual - target  # positive = over-represented

    # FREEZE: if category is >2× its budget, block it entirely
    if target > 0 and actual > target * FREEZE_MULT and actual > 10:
        frozen.append(f"{cat}({actual}%>{target}%)")
        adjustments[cat] = -STEP
        continue

    # STARVED: if category has 0% actual but >0% target
    if actual == 0 and target >= 5:
        starved.append(f"{cat}(0%<{target}%)")
        adjustments[cat] = STEP
        continue

    if abs(deviation) <= DEAD_ZONE:
        adjustments[cat] = 0
    elif deviation > 0:
        adjustments[cat] = max(-STEP, -deviation // 2)
    else:
        adjustments[cat] = min(STEP, (-deviation) // 2)

# Apply adjustments with damping and floor enforcement
new_focus = {}
for cat in focus:
    base = original_focus[cat]
    adj = adjustments.get(cat, 0)
    # Exponential smoothing: blend suggested adjustment with zero (current weight)
    damped_adj = round(adj * SMOOTHING)
    new_val = focus[cat] + damped_adj
    # Session cap: don't let any category drift more than SESSION_CAP from its original
    new_val = max(base - SESSION_CAP, min(base + SESSION_CAP, new_val))
    # Floor = half of original budget
    floor = max(base // 2, 1) if base > 0 else 0
    new_val = max(floor, min(50, new_val))
    new_focus[cat] = new_val

# Normalize to 100%
total_new = sum(new_focus.values())
if total_new > 0 and total_new != 100:
    factor = 100.0 / total_new
    remainder = 0
    for cat in sorted(new_focus.keys()):
        exact = new_focus[cat] * factor + remainder
        rounded = int(exact)
        remainder = exact - rounded
        new_focus[cat] = rounded
    diff = 100 - sum(new_focus.values())
    if diff != 0:
        largest = max(new_focus, key=lambda k: new_focus[k])
        new_focus[largest] += diff

# Build status message
changed = {k: new_focus[k] - focus.get(k, 0) for k in new_focus if new_focus[k] != focus.get(k, 0)}
parts = []
if frozen:
    parts.append(f"FROZEN:[{','.join(frozen)}]")
if starved:
    parts.append(f"STARVED:[{','.join(starved)}]")

if changed:
    cfg["focus"] = new_focus
    tmp_path = cfg_path + ".tmp"
    json.dump(cfg, open(tmp_path, "w"), indent=2)
    os.replace(tmp_path, cfg_path)
    adj_parts = [f"{k}:{'+' if v > 0 else ''}{v}" for k, v in changed.items() if v != 0]
    parts.append(f"adj:[{','.join(adj_parts)}]")
    print(f"SMART-MIX v3: {' '.join(parts)}")
else:
    print("SMART-MIX v3: balanced — no adjustment needed")
SMARTMIX_PY
    SMART_RESULT=$?
    if [ "$SMART_RESULT" -eq 0 ]; then
      SMART_OUT=$(tail -1 "$MASTER_LOG" 2>/dev/null | grep "SMART-MIX" || echo "")
      [ -n "$SMART_OUT" ] && echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $SMART_OUT" >> .claude/CYCLE_LEARNINGS.md
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
