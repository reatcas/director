import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const runSh = fs.readFileSync(path.join(ROOT, 'resources/orchestra/run.sh'), 'utf8')

// ─── Shebang and safety ───────────────────────────────────────────────────
describe('run.sh — shell safety', () => {
  it('starts with bash shebang', () => {
    expect(runSh.startsWith('#!/usr/bin/env bash')).toBe(true)
  })

  it('uses strict mode (set -uo pipefail)', () => {
    expect(runSh).toContain('set -uo pipefail')
  })

  it('changes to script directory', () => {
    expect(runSh).toContain('cd "$(dirname "$0")"')
  })

  it('has copyright header', () => {
    expect(runSh).toContain('Copyright (c) 2026')
  })

  it('has AGPL-3.0 license', () => {
    expect(runSh).toContain('AGPL-3.0')
  })
})

// ─── Configuration constants ──────────────────────────────────────────────
describe('run.sh — configuration constants', () => {
  it('defines PROMPT_FILE path', () => {
    expect(runSh).toContain('PROMPT_FILE=".claude/commands/loop.md"')
  })

  it('defines LOG_DIR path', () => {
    expect(runSh).toContain('LOG_DIR=".claude/logs"')
  })

  it('defines MASTER_LOG path', () => {
    expect(runSh).toContain('MASTER_LOG="$LOG_DIR/orchestra.log"')
  })

  it('reads VERSION from ORCHESTRA_VERSION file', () => {
    expect(runSh).toContain('.claude/ORCHESTRA_VERSION')
  })

  it('creates LOG_DIR if missing', () => {
    expect(runSh).toContain('mkdir -p "$LOG_DIR"')
  })

  it('reads config from .claude/orchestra.json', () => {
    expect(runSh).toContain('CFG=".claude/orchestra.json"')
  })
})

// ─── Config reader ────────────────────────────────────────────────────────
describe('run.sh — json_val reader', () => {
  it('defines json_val function', () => {
    expect(runSh).toContain('json_val()')
  })

  it('reads MODE defaulting to perpetual', () => {
    expect(runSh).toContain('json_val mode perpetual')
  })

  it('reads MAX_ITER defaulting to 0', () => {
    expect(runSh).toContain('json_val maxIterations 0')
  })

  it('reads CAVEMAN defaulting to true', () => {
    expect(runSh).toContain('json_val caveman true')
  })

  it('reads COMPACT_AT defaulting to 50', () => {
    expect(runSh).toContain('json_val compactAt 50')
  })
})

// ─── Stamp function ───────────────────────────────────────────────────────
describe('run.sh — stamp logging', () => {
  it('defines stamp function', () => {
    expect(runSh).toContain('stamp()')
  })

  it('prefixes with orchestra version', () => {
    expect(runSh).toContain('[orchestra v$VERSION]')
  })

  it('appends timestamp', () => {
    expect(runSh).toContain("date '+%Y-%m-%d %H:%M:%S'")
  })

  it('tees to master log', () => {
    expect(runSh).toContain('tee -a "$MASTER_LOG"')
  })
})

// ─── Main loop structure ──────────────────────────────────────────────────
describe('run.sh — main loop structure', () => {
  it('uses infinite while : loop', () => {
    expect(runSh).toContain('while :; do')
  })

  it('increments ITER each cycle', () => {
    expect(runSh).toContain('ITER=$((ITER+1))')
  })

  it('generates timestamped iter log name', () => {
    expect(runSh).toContain('TS=$(date -u +"%Y%m%dT%H%M%SZ")')
    expect(runSh).toContain('ITER_LOG="$LOG_DIR/iter-$TS.log"')
  })

  it('reads MODEL from config at start of each iteration', () => {
    expect(runSh).toContain('MODEL=$(json_val model sonnet)')
  })

  it('reads AI_AGENT with DIRECTOR_AI_AGENT env fallback', () => {
    expect(runSh).toContain('json_val agent "${DIRECTOR_AI_AGENT:-claude}"')
  })
})

// ─── Shared memory setup ──────────────────────────────────────────────────
describe('run.sh — shared memory', () => {
  it('sets SHARED_MEMORY path', () => {
    expect(runSh).toContain('SHARED_MEMORY="$HOME/.director-suite/shared-memory"')
  })

  it('creates shared memory dir', () => {
    expect(runSh).toContain('mkdir -p "$SHARED_MEMORY"')
  })

  it('passes --add-dir for shared memory', () => {
    expect(runSh).toContain('--add-dir "$SHARED_MEMORY"')
  })
})

// ─── Caveman mode ─────────────────────────────────────────────────────────
describe('run.sh — caveman mode', () => {
  it('checks CAVEMAN flag', () => {
    expect(runSh).toContain('"$CAVEMAN" = "true"')
  })

  it('appends caveman instructions to prompt', () => {
    expect(runSh).toContain('CAVEMAN MODE IS ENABLED')
    expect(runSh).toContain('zero prose')
    expect(runSh).toContain('Save tokens')
  })

  it('mentions MCP codebase memory', () => {
    expect(runSh).toContain('MCP codebase memory')
  })
})

// ─── Agent command construction ───────────────────────────────────────────
describe('run.sh — agent command construction', () => {
  it('uses --dangerously-skip-permissions for claude', () => {
    expect(runSh).toContain('--dangerously-skip-permissions')
  })

  it('uses stream-json for claude agent', () => {
    expect(runSh).toContain('--output-format stream-json')
  })

  it('uses text format for non-claude agents', () => {
    expect(runSh).toContain('--output-format text')
  })

  it('supports rtk wrapper if available', () => {
    expect(runSh).toContain('command -v rtk')
    expect(runSh).toContain('rtk -- claude')
  })

  it('configures agy with project dir', () => {
    expect(runSh).toContain('agy)')
    expect(runSh).toContain('--add-dir "$PROJECT_DIR"')
  })

  it('configures codex with bypass sandbox', () => {
    expect(runSh).toContain('codex exec --dangerously-bypass-approvals-and-sandbox')
  })

  it('configures aider with no auto-commits', () => {
    expect(runSh).toContain('aider --yes-always --no-auto-commits')
  })
})

// ─── Post-iteration audit line ────────────────────────────────────────────
describe('run.sh — post-iteration audit', () => {
  it('counts REAL_COMMITS via git log', () => {
    expect(runSh).toContain('git log --oneline "$START_COMMIT".."$END_COMMIT"')
    expect(runSh).toContain("wc -l | tr -d ' '")
  })

  it('counts CLAIMED from ▸ ✔ markers', () => {
    expect(runSh).toContain("grep -c '▸ ✔'")
  })

  it('counts PRODUCT_COMMITS excluding mislabeled feats', () => {
    expect(runSh).toContain("grep -iE '^[a-f0-9]+ feat'")
    expect(runSh).toContain('grep -cviE')
    expect(runSh).toContain('i18n|uuid|validate|bind.*label|translat|hex.*color|color.*token|primeflex')
  })

  it('counts QUALITY_COMMITS', () => {
    expect(runSh).toContain("grep -ciE 'test|fix|refactor|quality'")
  })

  it('counts I18N_COMMITS', () => {
    expect(runSh).toContain("grep -ciE 'i18n|translat|bind.*label'")
  })

  it('counts SECURITY_COMMITS', () => {
    expect(runSh).toContain("grep -ciE 'security|uuid.*valid|validate.*uuid|auth|rbac|tenant'")
  })

  it('formats audit line with all fields', () => {
    expect(runSh).toContain('[audit] iter=$ITER commits=$REAL_COMMITS claimed=$CLAIMED')
    expect(runSh).toContain('product=$PRODUCT_COMMITS quality=$QUALITY_COMMITS')
    expect(runSh).toContain('i18n=$I18N_COMMITS security=$SECURITY_COMMITS')
    expect(runSh).toContain('product_weight=$PRODUCT_W')
  })

  it('writes audit to CYCLE_LEARNINGS.md', () => {
    expect(runSh).toContain('>> .claude/CYCLE_LEARNINGS.md')
  })

  it('reads product weight for audit', () => {
    expect(runSh).toContain('PRODUCT_W=$(json_val "focus.product" "0"')
  })
})

// ─── Smart Mix v3 python — detailed invariants ────────────────────────────
describe('run.sh — Smart Mix v3 python algorithm', () => {
  const pyBlock = runSh.split("<<'SMARTMIX_PY'")[1]?.split('SMARTMIX_PY')[0] || ''

  it('runs every 3 iterations', () => {
    expect(runSh).toContain('$((ITER % 3)) -eq 0')
  })

  it('only runs when smartMix is true', () => {
    expect(runSh).toContain('SMART_MIX=$(json_val smartMix false)')
    expect(runSh).toContain('"$SMART_MIX" = "true"')
  })

  it('only runs when ITER > 0', () => {
    expect(runSh).toContain('"$ITER" -gt 0')
  })

  it('preserves original focus for session cap', () => {
    expect(pyBlock).toContain('original_focus = dict(focus)')
  })

  it('defines STEP = 6', () => {
    expect(pyBlock).toContain('STEP = 6')
  })

  it('defines DEAD_ZONE = 5', () => {
    expect(pyBlock).toContain('DEAD_ZONE = 5')
  })

  it('defines SMOOTHING = 0.3', () => {
    expect(pyBlock).toContain('SMOOTHING = 0.3')
  })

  it('defines SESSION_CAP = 15', () => {
    expect(pyBlock).toContain('SESSION_CAP = 15')
  })

  it('skips zero-target categories (weight=0)', () => {
    expect(pyBlock).toContain('if target == 0:')
    expect(pyBlock).toContain('continue')
  })

  it('still corrects zero-target if actual > 5%', () => {
    expect(pyBlock).toContain('if actual > 5:')
    expect(pyBlock).toContain('adjustments[cat] = -STEP')
  })

  it('uses atomic write for config (os.replace)', () => {
    expect(pyBlock).toContain('os.replace(tmp_path, cfg_path)')
  })

  it('writes to .tmp before replacing', () => {
    expect(pyBlock).toContain('tmp_path = cfg_path + ".tmp"')
  })

  it('requires minimum 5 commits to analyze', () => {
    expect(pyBlock).toContain('if len(lines) < 5:')
  })

  it('analyzes last 50 commits', () => {
    expect(pyBlock).toContain('git", "log", "--oneline", "-50"')
  })

  it('strips hash from commit message before classification', () => {
    expect(pyBlock).toContain('msg = line.split(" ", 1)[1]')
  })

  it('halves deviation for proportional correction', () => {
    expect(pyBlock).toContain('-deviation // 2')
  })

  it('applies exponential smoothing to adjustments', () => {
    expect(pyBlock).toContain('damped_adj = round(adj * SMOOTHING)')
  })

  it('reports FROZEN categories', () => {
    expect(pyBlock).toContain('FROZEN:')
  })

  it('reports STARVED categories', () => {
    expect(pyBlock).toContain('STARVED:')
  })

  it('reports no adjustment when balanced', () => {
    expect(pyBlock).toContain('balanced — no adjustment needed')
  })

  it('outputs adjustment deltas', () => {
    expect(pyBlock).toContain("adj:[{','.join(adj_parts)}]")
  })
})

// ─── Smart Mix category rules ordering ────────────────────────────────────
describe('run.sh — Smart Mix category rules', () => {
  const catRules = runSh.split('cat_rules = [')[1]?.split('SMARTMIX_PY')[0] || ''

  it('has 13 category rules', () => {
    const ruleCount = (catRules.match(/\("(\w+)"/g) || []).length
    expect(ruleCount).toBe(13)
  })

  it('i18n is first category (before product)', () => {
    const firstCat = catRules.match(/\("(\w+)"/)?.[1]
    expect(firstCat).toBe('i18n')
  })

  it('product is after security, quality_tests, performance', () => {
    const productIdx = catRules.indexOf('"product"')
    const secIdx = catRules.indexOf('"security"')
    const qualIdx = catRules.indexOf('"quality_tests"')
    const perfIdx = catRules.indexOf('"performance"')
    expect(productIdx).toBeGreaterThan(secIdx)
    expect(productIdx).toBeGreaterThan(qualIdx)
    expect(productIdx).toBeGreaterThan(perfIdx)
  })

  it('product uses negative lookahead to exclude mislabeled', () => {
    expect(catRules).toContain('feat\\((?!i18n|test|style|chore)')
  })

  it('refactoring catches style() and chore()', () => {
    const refactorRule = catRules.split('"refactoring"')[1]?.split('),')[0] || ''
    expect(refactorRule).toContain('style[\\(:]')
    expect(refactorRule).toContain('chore[\\(:]')
  })

  it('architecture catches DECISIONS and PLAN.md', () => {
    expect(catRules).toContain('DECISIONS')
    expect(catRules).toContain('PLAN\\.md')
  })
})

// ─── ALTO pre-iteration check ─────────────────────────────────────────────
describe('run.sh — ALTO check', () => {
  it('checks ALTO before each iteration', () => {
    expect(runSh).toContain('[ -f .claude/ALTO ] && { stamp "FINE')
  })

  it('breaks loop on ALTO', () => {
    const altoCheck = runSh.split('[ -f .claude/ALTO ] && {')[1]?.split('}')[0] || ''
    expect(altoCheck).toContain('break')
  })

  it('also checks ALTO after iteration', () => {
    expect(runSh).toContain('[ -f .claude/ALTO ] && continue')
  })
})
