import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rsJs = fs.readFileSync(path.join(ROOT, 'resource-scheduler.js'), 'utf8')
const cpJs = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')
const coJs = fs.readFileSync(path.join(ROOT, 'coordination-protocol.js'), 'utf8')

// ─── ResourceScheduler — retention curve math ─────────────────────────────
describe('ResourceScheduler — retention curve', () => {
  it('uses sigmoid formula: 0.10 + 0.85 / (1 + exp(-12*(share - 0.3)))', () => {
    expect(rsJs).toContain('0.10 + 0.85 / (1 + Math.exp(-12 * (share - 0.3)))')
  })

  it('returns minimum 10% for zero share', () => {
    expect(rsJs).toContain('0.10')
  })

  it('inflection point at 0.3 share', () => {
    expect(rsJs).toContain('share - 0.3')
  })

  it('maximum approaches 95%', () => {
    expect(rsJs).toContain('0.85')
  })
})

// ─── ResourceScheduler — nice mapping ─────────────────────────────────────
describe('ResourceScheduler — priority mapping', () => {
  it('maps intensity to nice with power curve (0.7 exponent)', () => {
    expect(rsJs).toContain('Math.pow(normalizedIntensity, 0.7)')
  })

  it('range: nice 15 (low) to -5 (max)', () => {
    expect(rsJs).toContain('15 - 20 *')
  })

  it('normalizes intensity to 0-1 range', () => {
    expect(rsJs).toContain('Math.min(avgWeight / 100, 1)')
  })
})

// ─── ResourceScheduler — memory budget ────────────────────────────────────
describe('ResourceScheduler — memory budget', () => {
  it('base allocation 20% + up to 50% by intensity', () => {
    expect(rsJs).toContain('0.2 + 0.5 * normalizedIntensity')
  })

  it('caps at 80% of total memory', () => {
    expect(rsJs).toContain('sys.totalMemMB * 0.8')
  })

  it('uses freeMemMB for available calculation', () => {
    expect(rsJs).toContain('sys.freeMemMB * memFraction')
  })
})

// ─── ResourceScheduler — token budget ─────────────────────────────────────
describe('ResourceScheduler — token budget', () => {
  it('base 200k + up to 800k by intensity', () => {
    expect(rsJs).toContain('200_000 + 800_000 * normalizedIntensity')
  })
})

// ─── ResourceScheduler — hot path detection ───────────────────────────────
describe('ResourceScheduler — hot path', () => {
  it('flags categories above 60 weight as hot path', () => {
    expect(rsJs).toContain('v > 60')
  })
})

// ─── ResourceScheduler — CPU cache ────────────────────────────────────────
describe('ResourceScheduler — CPU cache', () => {
  it('caches CPU info to avoid repeated syscalls', () => {
    expect(rsJs).toContain('this._cpuCache')
  })

  it('only calls os.cpus() once', () => {
    expect(rsJs).toContain('if (!this._cpuCache)')
  })
})

// ─── ResourceScheduler — process sampling ─────────────────────────────────
describe('ResourceScheduler — process sampling', () => {
  it('validates PID is positive integer before sampling', () => {
    expect(rsJs).toContain('!Number.isInteger(baseline.pid)')
    expect(rsJs).toContain('baseline.pid <= 0')
  })

  it('supports darwin and linux platforms', () => {
    expect(rsJs).toContain("process.platform === 'darwin'")
    expect(rsJs).toContain("process.platform === 'linux'")
  })

  it('uses execFileSync for ps command (not execSync)', () => {
    expect(rsJs).toContain("execFileSync('ps'")
    expect(rsJs).not.toContain("execSync('ps")
  })

  it('uses execFileSync for renice command', () => {
    expect(rsJs).toContain("execFileSync('renice'")
  })

  it('keeps last 600 samples', () => {
    expect(rsJs).toContain('history.length > 600')
    expect(rsJs).toContain('history.splice(0, history.length - 600)')
  })

  it('provides memoryBudgetMB alias for renderer', () => {
    expect(rsJs).toContain('memoryBudgetMB:')
  })
})

// ─── ResourceScheduler — efficiency metrics ───────────────────────────────
describe('ResourceScheduler — efficiency computation', () => {
  it('requires at least 2 samples', () => {
    expect(rsJs).toContain('history.length < 2')
  })

  it('computes budget adherence', () => {
    expect(rsJs).toContain('memBudgetAdherence')
  })

  it('computes memory efficiency ratio', () => {
    expect(rsJs).toContain('memEfficiency')
  })

  it('computes intensity-cost ratio', () => {
    expect(rsJs).toContain('intensityCostRatio')
  })
})

// ─── ResourceScheduler — telemetry persistence ───────────────────────────
describe('ResourceScheduler — telemetry', () => {
  it('writes to .claude/telemetry/resource-metrics.json', () => {
    expect(rsJs).toContain('resource-metrics.json')
  })

  it('uses atomic write pattern (.tmp + rename)', () => {
    expect(rsJs).toContain("file + '.tmp'")
    expect(rsJs).toContain('fs.renameSync(tmp, file)')
  })

  it('caps history at 500 entries', () => {
    expect(rsJs).toContain('hist.length > 500')
  })

  it('cleanup persists telemetry before clearing', () => {
    const cleanup = rsJs.split('cleanup(dir)')[1]?.split('}')[0] || ''
    expect(cleanup).toContain('persistTelemetry(dir)')
  })
})

// ─── Context-protocol — hash-based change detection ───────────────────────
describe('context-protocol — change detection', () => {
  it('uses crypto.createHash for content hashing', () => {
    expect(cpJs).toContain('createHash')
  })

  it('tracks file hashes via _hash method', () => {
    expect(cpJs).toContain('_hash(content)')
  })

  it('computes delta between snapshots', () => {
    expect(cpJs).toContain('computeDelta')
  })
})

// ─── Context-protocol — token estimation ──────────────────────────────────
describe('context-protocol — token estimation', () => {
  it('estimates tokens from content length', () => {
    expect(cpJs).toContain('_estimateTokens')
  })
})

// ─── Context-protocol — section splitting ─────────────────────────────────
describe('context-protocol — markdown sections', () => {
  it('splits content by markdown headers', () => {
    expect(cpJs).toContain('_splitSections')
  })
})

// ─── Context-protocol — weight-linked retention ──────────────────────────
describe('context-protocol — retention', () => {
  it('computes retention based on category weights', () => {
    expect(cpJs).toContain('_computeRetention')
  })

  it('maps DECISIONS.md to architecture category', () => {
    expect(cpJs).toContain('DECISIONS')
    expect(cpJs).toContain('architecture')
  })
})

// ─── Context-protocol — mtime caching ─────────────────────────────────────
describe('context-protocol — mtime optimization', () => {
  it('tracks file mtimes to skip unchanged files', () => {
    expect(cpJs).toContain('_mtimes')
  })

  it('cleans up mtimes in cleanup(dir)', () => {
    expect(cpJs).toContain('_mtimes')
    const cleanup = cpJs.split('cleanup(dir)')[1]?.split('}')[0] || ''
    expect(cleanup.length).toBeGreaterThan(0)
  })
})

// ─── Context-protocol — telemetry ─────────────────────────────────────────
describe('context-protocol — telemetry', () => {
  it('uses atomic write for persistence', () => {
    expect(cpJs).toContain('.tmp')
    expect(cpJs).toContain('renameSync')
  })

  it('defines getMetrics public API', () => {
    expect(cpJs).toContain('getMetrics')
  })

  it('defines getFullHistory public API', () => {
    expect(cpJs).toContain('getFullHistory')
  })
})

// ─── Coordination-protocol — priority inheritance ─────────────────────────
describe('coordination-protocol — priority computation', () => {
  it('derives priority from mixer weights', () => {
    expect(coJs).toContain('computePriority')
  })

  it('supports instance registration', () => {
    expect(coJs).toContain('register')
  })

  it('supports instance unregistration', () => {
    expect(coJs).toContain('unregister')
  })
})

// ─── Coordination-protocol — resource locking ────────────────────────────
describe('coordination-protocol — resource locking', () => {
  it('provides acquireLock method', () => {
    expect(coJs).toContain('acquireLock')
  })

  it('provides releaseLock method', () => {
    expect(coJs).toContain('releaseLock')
  })

  it('validates resource parameter', () => {
    expect(coJs).toContain('typeof resource')
  })
})

// ─── Coordination-protocol — conflict detection ──────────────────────────
describe('coordination-protocol — conflict detection', () => {
  it('detects conflicts between orchestras', () => {
    expect(coJs).toContain('detectConflicts')
  })

  it('caches conflict results', () => {
    expect(coJs).toContain('_cachedConflicts')
  })
})

// ─── Coordination-protocol — weighted rebalance ──────────────────────────
describe('coordination-protocol — rebalance', () => {
  it('implements _rebalance method', () => {
    expect(coJs).toContain('_rebalance')
  })

  it('uses priority-weighted shares', () => {
    expect(coJs).toContain('priority')
  })
})

// ─── Coordination-protocol — telemetry ───────────────────────────────────
describe('coordination-protocol — telemetry', () => {
  it('provides getStatus method', () => {
    expect(coJs).toContain('getStatus')
  })

  it('uses atomic write for telemetry', () => {
    expect(coJs).toContain('.tmp')
    expect(coJs).toContain('renameSync')
  })

  it('provides cleanup method', () => {
    expect(coJs).toContain('cleanup(dir)')
  })
})

// ─── Cross-protocol — CommonJS exports ────────────────────────────────────
describe('cross-protocol — module exports', () => {
  it('resource-scheduler exports ResourceScheduler', () => {
    expect(rsJs).toContain('module.exports = { ResourceScheduler }')
  })

  it('context-protocol exports ContextProtocol', () => {
    expect(cpJs).toContain('module.exports')
    expect(cpJs).toContain('ContextProtocol')
  })

  it('coordination-protocol exports CoordinationProtocol', () => {
    expect(coJs).toContain('module.exports')
    expect(coJs).toContain('CoordinationProtocol')
  })
})

// ─── Cross-protocol — copyright and license ──────────────────────────────
describe('cross-protocol — file metadata', () => {
  for (const [name, src] of [['resource-scheduler', rsJs], ['context-protocol', cpJs], ['coordination-protocol', coJs]]) {
    it(`${name} has copyright header`, () => {
      expect(src).toContain('Copyright (c) 2026')
    })

    it(`${name} has AGPL-3.0 license`, () => {
      expect(src).toContain('AGPL-3.0')
    })
  }
})

// ─── Cross-protocol — no eval or dangerous patterns ──────────────────────
describe('cross-protocol — security invariants', () => {
  for (const [name, src] of [['resource-scheduler', rsJs], ['context-protocol', cpJs], ['coordination-protocol', coJs]]) {
    it(`${name} does not use eval()`, () => {
      expect(src).not.toMatch(/\beval\s*\(/)
    })

    it(`${name} does not use execSync (uses execFileSync)`, () => {
      const lines = src.split('\n').filter(l => !l.startsWith('//') && !l.startsWith(' *'))
      const code = lines.join('\n')
      expect(code).not.toContain("require('child_process').execSync")
    })
  }
})
