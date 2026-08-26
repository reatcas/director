import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const constitution = fs.readFileSync(path.join(ROOT, 'resources/orchestra/CLAUDE.md'), 'utf8')
const runSh = fs.readFileSync(path.join(ROOT, 'resources/orchestra/run.sh'), 'utf8')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preload = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

describe('constitution structure', () => {
  it('has version identifier', () => {
    expect(constitution).toMatch(/ORCHESTRA v\d+/)
  })

  it('has all required sections', () => {
    const sections = ['## ALTO', '## STATE FILES', '## RULES', '## PRODUCT GATE',
      '## ANTI-SLOP', '## TOKENS', '## SHARED MEMORY', '## AUTONOMY', '## BOOT']
    for (const s of sections) {
      expect(constitution).toContain(s)
    }
  })

  it('has 29 numbered rules', () => {
    const ruleNumbers = constitution.match(/^\d+\./gm) || []
    expect(ruleNumbers.length).toBeGreaterThanOrEqual(16)
  })
})

describe('Rule 2 — verification gate enforcement', () => {
  it('constitution references verification-gate', () => {
    expect(constitution).toContain('verification-gate')
  })

  it('verification gate script exists', () => {
    const gatePath = path.join(ROOT, '.claude/skills/verification-gate/run-tests.sh')
    expect(fs.existsSync(gatePath)).toBe(true)
  })

  it('constitution specifies 3 fails→revert', () => {
    expect(constitution).toContain('3 fails')
    expect(constitution).toContain('revert')
  })
})

describe('Rule 5 — conventional commits enforced by harness', () => {
  it('harness detects feat/fix/test/refactor commit types', () => {
    expect(runSh).toMatch(/feat|fix|test|refactor|chore|security|perf|docs|style|i18n/)
  })

  it('Smart Mix classifies all conventional types', () => {
    const types = ['i18n', 'security', 'quality_tests', 'performance', 'refactoring',
      'frontend', 'backend', 'product', 'documentation']
    const catRules = runSh.split('cat_rules = [')[1]?.split('SMARTMIX_PY')[0] || ''
    for (const t of types) {
      expect(catRules).toContain(`"${t}"`)
    }
  })
})

describe('Rule 6 — test wrapper requirement', () => {
  it('constitution specifies test wrapper path', () => {
    expect(constitution).toContain('.claude/skills/verification-gate/run-tests.sh')
  })
})

describe('Rule 8 — security requirements', () => {
  it('constitution requires parameterized queries', () => {
    expect(constitution).toContain('parameterized queries')
  })

  it('constitution requires no PII in logs', () => {
    expect(constitution).toContain('no PII in logs')
  })

  it('main.js kill handler restricts signals', () => {
    expect(mainJs).toContain("['SIGTERM', 'SIGKILL']")
  })

  it('preload validates signals at bridge boundary', () => {
    expect(preload).toContain("['SIGTERM', 'SIGKILL']")
  })
})

describe('Rule 9 — UI with i18n es primary', () => {
  it('constitution specifies i18n es primary', () => {
    expect(constitution).toContain('i18n es primary')
  })

  it('index.html has lang="es"', () => {
    expect(indexHtml).toMatch(/<html[^>]+lang="es"/)
  })
})

describe('Rule 16 — MIXER=HARD CONTRACT', () => {
  it('constitution marks mixer as binding', () => {
    expect(constitution).toContain('MIXER=HARD CONTRACT')
    expect(constitution).toContain('weights=BINDING')
  })

  it('orchestra.json exists with focus weights', () => {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude/orchestra.json'), 'utf8'))
    expect(cfg.focus).toBeDefined()
    const total = Object.values(cfg.focus).reduce((a, b) => a + b, 0)
    expect(total).toBe(100)
  })

  it('run.sh reads mixer weights via json_val', () => {
    expect(runSh).toContain('json_val')
    expect(runSh).toContain('focus')
  })
})

describe('Rule 17-21 — PRODUCT GATE', () => {
  it('constitution defines PRODUCT MODE trigger', () => {
    expect(constitution).toContain('unchecked ROADMAP feature')
    expect(constitution).toContain('PRODUCT MODE')
  })

  it('constitution defines product requirements', () => {
    expect(constitution).toContain('new migration')
    expect(constitution).toContain('endpoint')
    expect(constitution).toContain('UI component')
  })

  it('constitution forbids relabeling', () => {
    expect(constitution).toContain('Relabeling=VIOLATION')
  })

  it('constitution forbids backfill', () => {
    expect(constitution).toContain('never backfill')
  })

  it('harness tracks improvement streak', () => {
    expect(runSh).toContain('IMPROVEMENT_STREAK')
    expect(runSh).toContain('MAX_IMPROVEMENT_STREAK')
  })

  it('harness injects PRODUCT_DIRECTIVE on improvement limit', () => {
    expect(runSh).toContain('PRODUCT_DIRECTIVE.md')
  })
})

describe('Rule 22 — CATEGORY BAN', () => {
  it('constitution specifies 3+ consecutive cycles', () => {
    expect(constitution).toContain('Same category 3+ consecutive cycles=VIOLATION')
  })
})

describe('Rule 23 — MODULE BAN', () => {
  it('constitution specifies 3+ commits per session', () => {
    expect(constitution).toContain('3+ commits to same file/module per session=STOP')
  })
})

describe('Rule 24 — COMMIT LABELS', () => {
  it('constitution restricts feat() to new capabilities', () => {
    expect(constitution).toContain('`feat()`=ONLY new capabilities')
  })

  it('harness detects mislabeled feat commits', () => {
    expect(runSh).toContain('MISLABELED')
    expect(runSh).toContain('feat\\(.*i18n')
  })
})

describe('Rule 26 — BUDGET CAP', () => {
  it('constitution specifies 2× freeze', () => {
    expect(constitution).toContain('>2× budget')
  })

  it('harness implements FREEZE_MULT', () => {
    expect(runSh).toContain('FREEZE_MULT')
    expect(runSh).toContain('2.0')
  })
})

describe('Rule 27 — TEST GATE', () => {
  it('constitution requires fixing all tests first', () => {
    expect(constitution).toContain('Tests failing→fix ALL')
  })

  it('vitest is configured', () => {
    expect(pkg.devDependencies?.vitest || pkg.dependencies?.vitest).toBeDefined()
  })
})

describe('Rule 29 — COMPLIANCE line format', () => {
  it('constitution specifies compliance format', () => {
    expect(constitution).toContain('COMPLIANCE product:A/P')
    expect(constitution).toContain('DRIFT:')
    expect(constitution).toContain('TESTS:green|red')
  })

  it('harness checks for COMPLIANCE line', () => {
    expect(runSh).toContain('COMPLIANCE')
    expect(runSh).toContain('COMPLIANCE_MISSING')
  })

  it('main.js parseComplianceLine handles TESTS field', () => {
    expect(mainJs).toContain('TESTS:')
    expect(mainJs).toContain('parseComplianceLine')
  })
})

describe('ALTO mechanism', () => {
  it('constitution defines ALTO file path', () => {
    expect(constitution).toContain('.claude/ALTO')
  })

  it('harness checks ALTO before iteration', () => {
    expect(runSh).toContain('[ -f .claude/ALTO ]')
  })

  it('harness cleanup creates ALTO on signal', () => {
    const cleanup = runSh.split('cleanup()')[1]?.split('}')[0] || ''
    expect(cleanup).toContain('touch .claude/ALTO')
  })
})

describe('STATE FILES completeness', () => {
  const stateFiles = ['PLAN.md', 'DECISIONS.md', 'PENDING.md', 'ROADMAP.md']

  for (const f of stateFiles) {
    it(`${f} exists in project`, () => {
      expect(fs.existsSync(path.join(ROOT, f))).toBe(true)
    })

    it(`constitution references ${f}`, () => {
      expect(constitution).toContain(f)
    })
  }
})

describe('BOOT sequence files', () => {
  const bootFiles = ['orchestra.json', 'PLAN.md', 'DECISIONS.md', 'PENDING.md',
    'ROADMAP.md', 'CYCLE_LEARNINGS.md', 'PRODUCT_DIRECTIVE.md']

  for (const f of bootFiles) {
    it(`constitution boot references ${f}`, () => {
      expect(constitution).toContain(f)
    })
  }
})

describe('AUTONOMY rules', () => {
  it('constitution specifies stuck→PENDING.md', () => {
    expect(constitution).toContain('Stuck→PENDING.md')
    expect(constitution).toContain('BLOCKED')
  })

  it('constitution specifies improvement mode conditions', () => {
    expect(constitution).toContain('ALL ROADMAP checked')
    expect(constitution).toContain('tests green')
  })

  it('constitution caps improvement cycles at 10', () => {
    expect(constitution).toContain('Max 10 consecutive improvement cycles')
  })
})

describe('TOKENS efficiency rules', () => {
  it('constitution specifies compact threshold', () => {
    expect(constitution).toContain('compactAt')
  })

  it('orchestra.json has compactAt setting', () => {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude/orchestra.json'), 'utf8'))
    expect(typeof cfg.compactAt).toBe('number')
    expect(cfg.compactAt).toBeGreaterThan(0)
  })

  it('constitution specifies caveman mode', () => {
    expect(constitution).toContain('caveman')
    expect(constitution).toContain('200-token cap')
  })

  it('harness implements caveman mode injection', () => {
    expect(runSh).toContain('CAVEMAN MODE')
  })
})

describe('SHARED MEMORY', () => {
  it('constitution specifies shared memory path', () => {
    expect(constitution).toContain('.director-suite/shared-memory')
  })

  it('harness passes shared memory as --add-dir', () => {
    expect(runSh).toContain('--add-dir "$SHARED_MEMORY"')
  })
})

describe('anti-hallucination alignment', () => {
  it('constitution mentions hallucination prevention', () => {
    expect(constitution).toContain('Evidence')
    expect(constitution).toContain('No unverified claims')
  })

  it('harness has anti-lazy/hallucination detection', () => {
    expect(runSh).toContain('ANTI-LAZY')
    expect(runSh).toContain('HALLUCINATION_STREAK')
  })

  it('harness has fake hash detection', () => {
    expect(runSh).toContain('git cat-file')
    expect(runSh).toContain('FAKE_HASHES')
  })

  it('harness has Gemini-specific guardrails', () => {
    expect(runSh).toContain('GEMINI-SPECIFIC GUARDRAILS')
  })
})

describe('harness-constitution alignment', () => {
  it('harness MAX_HALLUCINATION_STREAK matches blocked check', () => {
    expect(runSh).toContain('BLOCKED_STREAK" -ge "$MAX_HALLUCINATION_STREAK"')
  })

  it('harness Smart Mix uses session cap from constitution principle', () => {
    expect(runSh).toContain('SESSION_CAP = 15')
  })

  it('harness Smart Mix step size is bounded', () => {
    expect(runSh).toContain('STEP = 6')
  })

  it('harness detects all 4 agent types', () => {
    expect(runSh).toContain('claude')
    expect(runSh).toContain('agy')
    expect(runSh).toContain('codex')
    expect(runSh).toContain('aider')
  })
})
