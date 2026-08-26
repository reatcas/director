import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const runSh = fs.readFileSync(path.join(ROOT, 'resources/orchestra/run.sh'), 'utf8')
const lines = runSh.split('\n')

describe('signal trap safety', () => {
  it('traps SIGTERM and SIGINT', () => {
    expect(runSh).toContain('trap cleanup SIGTERM SIGINT')
  })

  it('cleanup touches ALTO before killing subprocesses', () => {
    const cleanupBlock = runSh.split('cleanup()')[1]?.split('}')[0] || ''
    const altoIdx = cleanupBlock.indexOf('touch .claude/ALTO')
    const killIdx = cleanupBlock.indexOf('kill 0')
    expect(altoIdx).toBeGreaterThan(-1)
    expect(killIdx).toBeGreaterThan(-1)
    expect(altoIdx).toBeLessThan(killIdx)
  })
})

describe('backoff progression', () => {
  it('defines escalating backoff steps', () => {
    expect(runSh).toContain('BACKOFF_STEPS=(30 60 120 300 600 900)')
  })

  it('resets backoff index on exit 0', () => {
    expect(runSh).toContain('BACKOFF_IDX=0')
    const resetBlock = runSh.split('stamp "movement $ITER exited ($EXIT). Resetting backoff."')[1]?.split('\n')[0] || ''
    expect(runSh).toMatch(/exit.*0.*Resetting backoff/s)
  })

  it('increments backoff index on failure', () => {
    expect(runSh).toContain('BACKOFF_IDX=$((BACKOFF_IDX + 1))')
  })

  it('caps backoff at array length', () => {
    expect(runSh).toContain('$BACKOFF_IDX -lt $((${#BACKOFF_STEPS[@]} - 1))')
  })
})

describe('hallucination breaker', () => {
  it('creates ALTO on reaching MAX_HALLUCINATION_STREAK', () => {
    const halBlock = runSh.split('hallucinated $MAX_HALLUCINATION_STREAK consecutive')[1]?.split('break')[0] || ''
    expect(halBlock).toContain('touch .claude/ALTO')
  })

  it('writes to PENDING.md on hallucination limit', () => {
    expect(runSh).toContain('HALLUCINATION_STREAK_LIMIT')
    expect(runSh).toContain('>> PENDING.md')
  })

  it('resets both streaks on successful commit', () => {
    const resetBlock = runSh.split('HALLUCINATION_STREAK=0\n')[1]?.split('\n')[0] || ''
    expect(runSh).toContain('HALLUCINATION_STREAK=0\n    BLOCKED_STREAK=0')
  })

  it('sets MAX_HALLUCINATION_STREAK to 5', () => {
    expect(runSh).toContain('MAX_HALLUCINATION_STREAK=5')
  })
})

describe('blocked streak detection', () => {
  it('detects LEGIT_BLOCK via CICLO BLOQUEADO or BLOCKED: patterns', () => {
    expect(runSh).toContain("grep -qE 'CICLO BLOQUEADO|BLOCKED:'")
  })

  it('increments BLOCKED_STREAK for legitimate blocks', () => {
    const legitBlock = runSh.split('"$LEGIT_BLOCK" = true')[1]?.split('continue')[0] || ''
    expect(legitBlock).toContain('BLOCKED_STREAK=$((BLOCKED_STREAK + 1))')
  })

  it('creates ALTO when BLOCKED_STREAK reaches limit', () => {
    expect(runSh).toContain('BLOCKED-LIMIT')
    expect(runSh).toContain('touch .claude/ALTO')
  })

  it('does not increment HALLUCINATION_STREAK for legitimate blocks', () => {
    const legitBlock = runSh.split('"$LEGIT_BLOCK" = true')[1]?.split('continue')[0] || ''
    expect(legitBlock).not.toContain('HALLUCINATION_STREAK=$((HALLUCINATION_STREAK + 1))')
  })
})

describe('usage limit handling', () => {
  it('detects usage limit from log patterns', () => {
    expect(runSh).toContain("you're out of")
    expect(runSh).toContain('usage limit')
    expect(runSh).toContain('rate limit')
    expect(runSh).toContain('individual quota reached')
  })

  it('detects usage limit from exit code 2', () => {
    expect(runSh).toContain('"$EXIT" -eq 2')
  })

  it('creates USAGE_LIMIT file', () => {
    expect(runSh).toContain('touch .claude/USAGE_LIMIT')
  })

  it('removes USAGE_LIMIT file after wait', () => {
    expect(runSh).toContain('rm -f .claude/USAGE_LIMIT')
  })

  it('parses "Resets in NhNm" format', () => {
    expect(runSh).toContain("[Rr]esets in [0-9]+h[0-9]+m")
  })

  it('parses "resets at H:MM AM/PM" format', () => {
    expect(runSh).toContain("[0-9]{1,2}:[0-9]{2}\\s*(AM|PM|am|pm)")
  })

  it('falls back to 3 hours if no reset time parsed', () => {
    expect(runSh).toContain('sleep 10800')
  })

  it('adds 120s buffer to parsed wait time', () => {
    expect(runSh).toContain('+ 120')
  })
})

describe('log rotation', () => {
  it('keeps only last 50 iter logs', () => {
    expect(runSh).toContain("tail -n +51 | xargs rm -f")
  })

  it('sorts by time before trimming', () => {
    expect(runSh).toContain('ls -1t "$LOG_DIR"/iter-*.log')
  })
})

describe('bounded and single mode', () => {
  it('checks MAX_ITER in bounded mode', () => {
    expect(runSh).toContain('"$ITER" -ge "$MAX_ITER"')
  })

  it('skips bounded check in perpetual mode', () => {
    expect(runSh).toContain('"$MODE" != "perpetual"')
  })

  it('single mode exits after one cycle', () => {
    expect(runSh).toContain('"$MODE" = "single"')
    expect(runSh).toContain('single-cycle mode complete')
  })
})

describe('PLAN.md trimming', () => {
  it('trims PLAN.md when over 200 lines', () => {
    expect(runSh).toContain('"$TOTAL_LINES" -gt 200')
  })

  it('archives old content before trimming', () => {
    expect(runSh).toContain('plan-archive-$TS.md')
    expect(runSh).toContain('head -n $((TOTAL_LINES - 150))')
  })

  it('keeps last 150 lines', () => {
    expect(runSh).toContain('tail -150 PLAN.md')
  })
})

describe('cycle close validation (F-01)', () => {
  it('checks for COMPLIANCE line in iter log', () => {
    expect(runSh).toContain("grep -q 'COMPLIANCE' \"$ITER_LOG\"")
  })

  it('stamps COMPLIANCE_MISSING when absent', () => {
    expect(runSh).toContain('COMPLIANCE_MISSING')
  })

  it('only checks when there are real commits', () => {
    expect(runSh).toContain('"$REAL_COMMITS" -gt 0')
  })
})

describe('anti-slop: mislabeled feat detection', () => {
  it('catches feat(i18n) and feat(l10n) mislabeling', () => {
    const mislabelRegex = runSh.split('MISLABELED=')[1]?.split('|| echo 0)')[0] || ''
    expect(mislabelRegex).toContain('feat\\(.*i18n')
    expect(mislabelRegex).toContain('feat\\(.*l10n')
    expect(mislabelRegex).toContain('feat\\(.*locali')
  })

  it('catches feat(uuid) mislabeling', () => {
    const mislabelRegex = runSh.split('MISLABELED=')[1]?.split('|| echo 0)')[0] || ''
    expect(mislabelRegex).toContain('feat\\(.*uuid')
  })

  it('stamps ANTI-SLOP when mislabeled commits found', () => {
    expect(runSh).toContain('ANTI-SLOP: $MISLABELED mislabeled feat()')
  })
})

describe('anti-slop: mechanical busywork', () => {
  it('detects repetitive patterns', () => {
    const mechanicalRegex = runSh.split('MECHANICAL=')[1]?.split('|| echo 0)')[0] || ''
    expect(mechanicalRegex).toContain('bind [0-9]')
    expect(mechanicalRegex).toContain('translate [0-9]')
    expect(mechanicalRegex).toContain('replace.*hardcoded')
  })

  it('triggers on more than 3 mechanical commits', () => {
    expect(runSh).toContain('"$MECHANICAL" -gt 3')
  })
})

describe('anti-slop: module concentration', () => {
  it('extracts module name from commit scope', () => {
    expect(runSh).toContain("grep -oE '\\([a-zA-Z_-]+\\)'")
  })

  it('triggers on more than 5 commits to same module', () => {
    expect(runSh).toContain('"${TOP_COUNT:-0}" -gt 5')
  })
})

describe('improvement streak tracking', () => {
  it('sets MAX_IMPROVEMENT_STREAK to 10', () => {
    expect(runSh).toContain('MAX_IMPROVEMENT_STREAK=10')
  })

  it('injects PRODUCT_DIRECTIVE.md on improvement limit', () => {
    expect(runSh).toContain('PRODUCT_DIRECTIVE.md')
    expect(runSh).toContain('HARNESS OVERRIDE')
  })

  it('only counts as improvement when real commits exist but zero product', () => {
    expect(runSh).toContain('"${REAL_COMMITS:-0}" -gt 0')
    expect(runSh).toContain('"${PRODUCT_COMMITS:-0}" -eq 0')
  })

  it('resets improvement streak when product commits exist', () => {
    const resetLine = lines.find(l => l.trim() === 'IMPROVEMENT_STREAK=0' && !l.includes('IMPROVEMENT_STREAK=0\n'))
    expect(resetLine).toBeDefined()
  })
})

describe('fake hash detection', () => {
  it('uses git cat-file to verify claimed hashes', () => {
    expect(runSh).toContain('git cat-file -t "$hash"')
  })

  it('extracts hashes from ▸ ✔ lines', () => {
    expect(runSh).toContain("grep -A1 '▸ ✔'")
    expect(runSh).toContain("grep -oiE '[0-9a-f]{7,}'")
  })

  it('stamps AUDIT-WARN for fake hashes', () => {
    expect(runSh).toContain('AUDIT-WARN')
    expect(runSh).toContain('fake commit hashes')
  })
})

describe('iteration summary extraction', () => {
  it('extracts key markers from iter log', () => {
    expect(runSh).toContain("grep -E '^▸|^✔|^✕|commit|feat|fix|error'")
  })

  it('limits summary to last 3 lines of matched output', () => {
    expect(runSh).toContain('tail -3')
  })
})

describe('agent-specific augmentation', () => {
  it('adds Gemini guardrails for agy agent', () => {
    expect(runSh).toContain('GEMINI-SPECIFIC GUARDRAILS')
  })

  it('warns Gemini about hallucination streak', () => {
    expect(runSh).toContain('$HALLUCINATION_STREAK consecutive zero-commit sessions')
  })

  it('uses stream-json for claude agent only', () => {
    expect(runSh).toContain('--output-format stream-json')
    expect(runSh).toContain('"$AI_AGENT" = "claude"')
  })

  it('supports aider agent', () => {
    expect(runSh).toContain('aider --yes-always --no-auto-commits')
  })
})

describe('Smart Mix v3 category classification', () => {
  it('classifies i18n before product to prevent mislabeling', () => {
    const catRules = runSh.split('cat_rules = [')[1]?.split('SMARTMIX_PY')[0] || ''
    const i18nIdx = catRules.indexOf('("i18n"')
    const productIdx = catRules.indexOf('("product"')
    expect(i18nIdx).toBeGreaterThan(-1)
    expect(productIdx).toBeGreaterThan(-1)
    expect(i18nIdx).toBeLessThan(productIdx)
  })

  it('classifies security before product', () => {
    const catRules = runSh.split('cat_rules = [')[1]?.split('SMARTMIX_PY')[0] || ''
    const secIdx = catRules.indexOf('("security"')
    const productIdx = catRules.indexOf('("product"')
    expect(secIdx).toBeGreaterThan(-1)
    expect(secIdx).toBeLessThan(productIdx)
  })

  it('falls back unmatched commits to refactoring, not product', () => {
    expect(runSh).toContain('counts["refactoring"] = counts.get("refactoring", 0) + 1')
  })
})

describe('Smart Mix v3 freeze and starve', () => {
  it('freezes categories exceeding 2× budget', () => {
    expect(runSh).toContain('FREEZE_MULT = 2.0')
    expect(runSh).toContain('actual > target * FREEZE_MULT')
  })

  it('boosts starved categories with 0% actual', () => {
    expect(runSh).toContain('actual == 0 and target >= 5')
    expect(runSh).toContain('adjustments[cat] = STEP')
  })
})

describe('Smart Mix v3 normalization', () => {
  it('normalizes weights to sum to 100', () => {
    expect(runSh).toContain('total_new != 100')
    expect(runSh).toContain('100.0 / total_new')
  })

  it('distributes remainder to largest category', () => {
    expect(runSh).toContain('diff = 100 - sum(new_focus.values())')
    expect(runSh).toContain('new_focus[largest] += diff')
  })

  it('enforces floor at half of original budget', () => {
    expect(runSh).toContain('floor = max(base // 2, 1) if base > 0 else 0')
  })

  it('caps individual category at 50', () => {
    expect(runSh).toContain('min(50, new_val)')
  })
})

describe('auto-capture guards', () => {
  it('only captures DB schema if script exists and is executable', () => {
    expect(runSh).toContain('[ -x "$DB_VISION_DIR/db-extract.sh" ]')
  })

  it('only captures A11Y tree if local server is running', () => {
    expect(runSh).toContain('lsof -Pi :$PORT -sTCP:LISTEN')
  })

  it('removes A11Y tree if no server detected', () => {
    expect(runSh).toContain('rm -f .claude/A11Y_TREE.md')
  })

  it('reads custom ports from config', () => {
    expect(runSh).toContain('json_val ports "3000 5173 8080 4200 4321"')
  })
})

describe('ALTO detection in main loop', () => {
  it('checks for ALTO before each iteration', () => {
    expect(runSh).toContain('[ -f .claude/ALTO ] && { stamp "FINE')
  })

  it('also checks for ALTO after iteration', () => {
    expect(runSh).toContain('[ -f .claude/ALTO ] && continue')
  })
})

describe('json_val helper', () => {
  it('uses python3 for JSON parsing', () => {
    expect(runSh).toContain("python3 -c \"import json,sys")
  })

  it('provides default fallback', () => {
    expect(runSh).toContain("d.get('$1','$2')")
  })
})

describe('RUN_STARTED tracking', () => {
  it('creates RUN_STARTED only once', () => {
    expect(runSh).toContain('[ -f .claude/RUN_STARTED ] || date')
  })

  it('uses UTC timestamp', () => {
    expect(runSh).toContain('date -u +"%Y-%m-%dT%H:%M:%SZ"')
  })
})

describe('stream-json parser', () => {
  it('extracts text from assistant messages', () => {
    expect(runSh).toContain("t == 'assistant'")
    expect(runSh).toContain("c.get('type') == 'text'")
  })

  it('extracts tool use names for progress display', () => {
    expect(runSh).toContain("t == 'tool_use'")
    expect(runSh).toContain("ev.get('name','')")
  })

  it('handles non-JSON lines gracefully', () => {
    expect(runSh).toContain('except:')
    expect(runSh).toContain('print(raw, flush=True)')
  })

  it('truncates tool input to 80 chars', () => {
    expect(runSh).toContain("[:80]")
  })
})
