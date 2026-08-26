import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

const parserBody = rendererJs.split('function parseLogLine')[1]?.split('\nwindow.director.onLine')[0] || ''

// ─── parseLogLine — core log routing ────────────────────────────────────────
describe('parseLogLine — log line routing engine', () => {
  it('is defined as a function', () => {
    expect(rendererJs).toContain('function parseLogLine')
  })

  it('skips lines from other projects', () => {
    expect(parserBody).toContain('dir !== current')
  })

  it('HTML-escapes angle brackets before processing', () => {
    expect(parserBody).toContain("replace(/</g, '&lt;')")
    expect(parserBody).toContain("replace(/>/g, '&gt;')")
  })

  it('trims input line', () => {
    expect(parserBody).toContain('line.trim()')
  })

  it('skips empty lines', () => {
    expect(parserBody).toContain('if (!cl) return')
  })
})

// ─── Rate limit / usage detection ───────────────────────────────────────────
describe('parseLogLine — rate limit detection', () => {
  it('detects rate limit keywords', () => {
    expect(parserBody).toContain('rate limit')
    expect(parserBody).toContain('quota')
  })

  it('detects usage exhaustion phrases', () => {
    expect(parserBody).toContain("you're out of")
    expect(parserBody).toContain('out of extra usage')
    expect(parserBody).toContain('usage limit')
  })

  it('detects waiting/retrying patterns', () => {
    expect(parserBody).toContain("cl.includes('Waiting ')")
    expect(parserBody).toContain("cl.includes('Retrying')")
  })

  it('detects reset time (AM/PM pattern)', () => {
    expect(parserBody).toContain("'resets'")
    expect(parserBody).toContain("'am'")
    expect(parserBody).toContain("'pm'")
  })

  it('extracts reset time with regex', () => {
    expect(parserBody).toContain('AM|PM|am|pm')
  })

  it('routes to addUsageEntry', () => {
    expect(parserBody).toContain('addUsageEntry(msg)')
  })
})

// ─── Perpetual loop start detection ─────────────────────────────────────────
describe('parseLogLine — perpetual loop start', () => {
  it('detects v1 format: perpetual loop started', () => {
    expect(parserBody).toContain("cl.includes('perpetual loop started')")
  })

  it('detects v2 format: DOWNBEAT', () => {
    expect(parserBody).toContain("cl.includes('DOWNBEAT')")
  })

  it('extracts date from start line', () => {
    expect(parserBody).toContain('started (.+?)')
  })

  it('sets orchestra state to interpreting', () => {
    expect(parserBody).toContain("setOrchestraState('interpreting')")
  })

  it('removes old interpreting indicator', () => {
    expect(parserBody).toContain("$('#le-interpreting-live')")
  })

  it('adds interpreting entry', () => {
    expect(parserBody).toContain('addInterpretingEntry()')
  })

  it('resets usage entry and retry count', () => {
    expect(parserBody).toContain('usageEntry = null')
    expect(parserBody).toContain('retryCount = 0')
  })
})

// ─── ALTO / FINE detection ──────────────────────────────────────────────────
describe('parseLogLine — ALTO/FINE detection', () => {
  it('detects ALTO detected', () => {
    expect(parserBody).toContain("cl.includes('ALTO detected')")
  })

  it('detects [orchestra FINE', () => {
    expect(parserBody).toContain("'FINE'")
  })

  it('routes to addActionEntry with fine type', () => {
    const fineSection = parserBody.split("cl.includes('ALTO detected')")[1]?.split('return')[0] || ''
    expect(fineSection).toContain("addActionEntry('fine'")
  })

  it('sets state to finished', () => {
    const fineSection = parserBody.split("cl.includes('ALTO detected')")[1]?.split('return')[0] || ''
    expect(fineSection).toContain("setOrchestraState('finished')")
  })
})

// ─── Iteration/movement exit detection ──────────────────────────────────────
describe('parseLogLine — iteration exit', () => {
  it('supports both iteration and movement keywords', () => {
    expect(parserBody).toContain("cl.includes('iteration')")
    expect(parserBody).toContain("cl.includes('movement')")
  })

  it('extracts iteration number and exit code', () => {
    expect(parserBody).toContain('(?:iteration|movement) (\\d+) exited \\((\\d+)\\)')
  })

  it('routes to addIterationEndEntry', () => {
    expect(parserBody).toContain('addIterationEndEntry')
  })

  it('fetches iteration summary from log file', () => {
    expect(parserBody).toContain('fetchIterSummary')
    expect(parserBody).toContain('Log:')
  })
})

// ─── Iteration/movement start detection ─────────────────────────────────────
describe('parseLogLine — iteration start', () => {
  it('detects iteration/movement with em dash', () => {
    expect(parserBody).toContain("cl.includes('—')")
  })

  it('extracts number and date', () => {
    expect(parserBody).toContain('(?:iteration|movement) (\\d+)')
  })

  it('routes to addIterationStartEntry', () => {
    expect(parserBody).toContain('addIterationStartEntry')
  })
})

// ─── USAGE LIMIT (v3 format) ────────────────────────────────────────────────
describe('parseLogLine — USAGE LIMIT v3', () => {
  it('detects USAGE LIMIT marker', () => {
    expect(parserBody).toContain("cl.includes('USAGE LIMIT')")
  })

  it('routes to addUsageEntry', () => {
    const usageLimitSection = parserBody.split("'USAGE LIMIT'")[1]?.split('return')[0] || ''
    expect(usageLimitSection).toContain('addUsageEntry')
  })
})

// ─── Sleep/backoff detection ────────────────────────────────────────────────
describe('parseLogLine — sleep/backoff', () => {
  it('detects sleeping and backoff keywords', () => {
    expect(parserBody).toContain("cl.includes('sleeping')")
    expect(parserBody).toContain("cl.includes('backoff')")
  })

  it('extracts seconds and backoff index', () => {
    expect(parserBody).toContain('(?:sleeping|backoff) (\\d+)s')
  })

  it('routes to addSleepEntry', () => {
    expect(parserBody).toContain('addSleepEntry')
  })
})

// ─── Audit line parsing ─────────────────────────────────────────────────────
describe('parseLogLine — audit lines', () => {
  it('detects [audit] prefix', () => {
    expect(parserBody).toContain("[audit]")
  })

  it('extracts commits, claimed, product, quality counts', () => {
    expect(parserBody).toContain('commits=(\\d+)')
    expect(parserBody).toContain('claimed=(\\d+)')
    expect(parserBody).toContain('product_commits=(\\d+)')
    expect(parserBody).toContain('quality_commits=(\\d+)')
  })

  it('detects drift between commits and claimed', () => {
    expect(parserBody).toContain('+commits !== +claimed')
  })

  it('routes to addSummaryEntry with AUDIT prefix', () => {
    expect(parserBody).toContain("addSummaryEntry(`AUDIT")
  })
})

// ─── Hot-reload detection ───────────────────────────────────────────────────
describe('parseLogLine — hot-reload', () => {
  it('detects [director] prefix', () => {
    expect(parserBody).toContain("cl.includes('[director]')")
  })

  it('detects Hot-reload keyword', () => {
    expect(parserBody).toContain("cl.includes('Hot-reload')")
  })

  it('routes to addActionEntry with reload type', () => {
    expect(parserBody).toContain("addActionEntry('reload'")
  })
})

// ─── Anti-lazy / blocked detection ──────────────────────────────────────────
describe('parseLogLine — anti-lazy/blocked warnings', () => {
  it('detects ANTI-LAZY', () => {
    expect(parserBody).toContain("cl.includes('ANTI-LAZY')")
  })

  it('detects BLOCKED-RETRY', () => {
    expect(parserBody).toContain("cl.includes('BLOCKED-RETRY')")
  })

  it('detects BLOCKED-LIMIT', () => {
    expect(parserBody).toContain("cl.includes('BLOCKED-LIMIT')")
  })

  it('routes to addErrorEntry', () => {
    const blockSection = parserBody.split("cl.includes('ANTI-LAZY')")[1]?.split('return')[0] || ''
    expect(blockSection).toContain('addErrorEntry')
  })
})

// ─── ▸ prefix sub-type detection ────────────────────────────────────────────
describe('parseLogLine — ▸ prefix routing', () => {
  it('detects ▸ prefixed lines', () => {
    expect(parserBody).toContain("cl.startsWith('▸')")
  })

  it('routes ✕ to addErrorEntry', () => {
    expect(parserBody).toContain("cl.includes('✕')")
  })

  it('routes ▶ to addFeatureEntry', () => {
    expect(parserBody).toContain("cl.includes('▶')")
    expect(parserBody).toContain('addFeatureEntry')
  })

  it('persists feature to lifecycle', () => {
    expect(parserBody).toContain("window.director.lifecycleAdd(current, 'feature'")
  })

  it('routes ✔ to addCycleEntry + trackCommit', () => {
    expect(parserBody).toContain("cl.includes('✔')")
    expect(parserBody).toContain('trackCommit(current)')
  })

  it('persists commit to lifecycle', () => {
    expect(parserBody).toContain("window.director.lifecycleAdd(current, 'commit'")
  })

  it('detects COMPLIANCE and updates display', () => {
    expect(parserBody).toContain("cl.includes('COMPLIANCE')")
    expect(parserBody).toContain('updateComplianceFromLog')
  })

  it('persists cycle_close to lifecycle', () => {
    expect(parserBody).toContain("window.director.lifecycleAdd(current, 'cycle_close'")
  })
})

// ─── Error and milestone detection ──────────────────────────────────────────
describe('parseLogLine — error and milestone detection', () => {
  it('detects error keyword (case-insensitive)', () => {
    expect(parserBody).toContain("lower.includes('error')")
  })

  it('detects exception keyword', () => {
    expect(parserBody).toContain("lower.includes('exception')")
  })

  it('excludes warnings from error detection', () => {
    expect(parserBody).toContain("!lower.startsWith('warning')")
  })

  it('detects milestone keywords: all green, completed, pushed, etc', () => {
    expect(parserBody).toContain("'all green'")
    expect(parserBody).toContain("'all tests pass'")
    expect(parserBody).toContain("'completed'")
    expect(parserBody).toContain("'pushed'")
  })

  it('requires minimum length for milestone (>30)', () => {
    expect(parserBody).toContain('cl.length > 30')
  })

  it('requires sentence-ending punctuation for milestone', () => {
    expect(parserBody).toContain("[.!…]$")
  })

  it('requires >60 chars for Claude prose detection', () => {
    expect(parserBody).toContain('cl.length > 60')
  })

  it('excludes structured output from Claude prose', () => {
    expect(parserBody).toContain("!cl.startsWith('[')")
    expect(parserBody).toContain("!cl.startsWith('{')")
  })

  it('falls through to addNormalLine', () => {
    expect(parserBody).toContain('addNormalLine(cl)')
  })
})

// ─── onLine handler ─────────────────────────────────────────────────────────
describe('onLine handler — line dispatch', () => {
  const body = rendererJs.split('window.director.onLine')[1]?.split('\nwindow.director.on')[0] || ''

  it('checks dir matches current project', () => {
    expect(body).toContain('dir === current')
  })

  it('recovers from finished state on new data', () => {
    expect(body).toContain("orchestraState === 'finished'")
    expect(body).toContain("setOrchestraState('interpreting')")
  })

  it('splits chunks into individual lines', () => {
    expect(body).toContain("line.split('\\n')")
  })

  it('passes each line to parseLogLine', () => {
    expect(body).toContain('parseLogLine(dir, l)')
  })

  it('caches lines for non-current projects', () => {
    expect(body).toContain('logCache.get(dir)')
    expect(body).toContain('logCache.set(dir')
  })

  it('limits cache to 200KB, truncating to 150KB', () => {
    expect(body).toContain('200000')
    expect(body).toContain('150000')
  })
})

// ─── onExit handler ─────────────────────────────────────────────────────────
describe('onExit handler — cleanup', () => {
  const body = rendererJs.split('window.director.onExit')[1]?.split('\n// ─')[0] || ''

  it('clears log cache for exited project', () => {
    expect(body).toContain('logCache.delete(dir)')
  })

  it('stops clock', () => {
    expect(body).toContain('stopClock()')
  })

  it('sets status to STOP', () => {
    expect(body).toContain("setStatus('STOP')")
  })

  it('sets state to finished', () => {
    expect(body).toContain("setOrchestraState('finished')")
  })

  it('shows success/failure exit message', () => {
    expect(body).toContain('code === 0')
    expect(body).toContain('finished successfully')
    expect(body).toContain('terminated with code')
  })
})

// ─── Drag and drop ──────────────────────────────────────────────────────────
describe('drag and drop — project adding', () => {
  it('sets up dropzone with hot class', () => {
    expect(rendererJs).toContain("$('#dropzone')")
    expect(rendererJs).toContain("classList.add('hot')")
    expect(rendererJs).toContain("classList.remove('hot')")
  })

  it('auto-installs orchestra on drop if not installed', () => {
    expect(rendererJs).toContain('!proj().installed')
    expect(rendererJs).toContain('window.director.install(dir)')
  })
})

// ─── Process monitor ────────────────────────────────────────────────────────
describe('process monitor — PROC_TYPE_STYLE', () => {
  it('defines styles for process types', () => {
    expect(rendererJs).toContain('PROC_TYPE_STYLE')
  })

  it('covers orchestra, claude, wrapper, monitor, mcp, director', () => {
    const block = rendererJs.split('PROC_TYPE_STYLE')[1]?.split('\nasync function')[0] || ''
    const types = ['orchestra', 'claude', 'wrapper', 'monitor', 'mcp', 'director']
    for (const t of types) {
      expect(block).toContain(t)
    }
  })
})
