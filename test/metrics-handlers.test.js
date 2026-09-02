import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

// ── metrics:resource ──────────────────────────────────────────────────────────

describe('metrics:resource handler', () => {
  const block = mainJs.split("'metrics:resource'")[1]?.split("'metrics:context'")[0] || ''

  it('returns null for missing dir', () => {
    expect(block).toMatch(/if \(!(dir|isKnownProject)/)
    expect(block).toContain('return null')
  })

  it('uses scheduler.getMetrics for live data', () => {
    expect(block).toContain('scheduler.getMetrics(dir)')
  })

  it('returns live data when allocation available', () => {
    expect(block).toContain('live.allocation')
    expect(block).toContain('return live')
  })

  it('falls back to scheduler.computeAllocation from orchestra.json', () => {
    expect(block).toMatch(/scheduler\.computeAllocation\(dir, cfg\.focus\)|readOrchJson/)
  })

  it('returns allocation shape with baseline/lastSample/efficiency nulls', () => {
    expect(block).toContain('baseline: null')
    expect(block).toContain('lastSample: null')
    expect(block).toContain('efficiency: null')
  })
})

// ── metrics:context ───────────────────────────────────────────────────────────

describe('metrics:context handler', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split("'metrics:coordination'")[0] || ''

  it('returns null for missing dir', () => {
    expect(block).toMatch(/if \(!(dir|isKnownProject)/)
    expect(block).toContain('return null')
  })

  it('uses contextProto.getMetrics for live data', () => {
    expect(block).toContain('contextProto.getMetrics(dir)')
  })

  it('returns live data when lastDelta available', () => {
    expect(block).toContain('live.lastDelta')
  })

  it('falls back to persisted telemetry file', () => {
    expect(block).toContain('context-metrics.json')
    expect(block).toContain('telemetry')
  })

  it('aggregates total tokens from history', () => {
    expect(block).toContain('totalTokensProcessed')
    expect(block).toContain('totalTokensSaved')
  })

  it('computes cumulative compression ratio', () => {
    expect(block).toContain('cumulativeCompression')
  })

  it('computes average tokens saved per cycle', () => {
    expect(block).toContain('avgSavedPerCycle')
  })

  it('includes historySize in response', () => {
    expect(block).toContain('historySize: hist.length')
  })
})

// ── metrics:coordination ──────────────────────────────────────────────────────

describe('metrics:coordination handler', () => {
  it('delegates to coordinator.getStatus()', () => {
    const block = mainJs.split("'metrics:coordination'")[1]?.split("'metrics:snapshot'")[0] || ''
    expect(block).toContain('coordinator.getStatus()')
  })

  it('requires no dir parameter (cross-project)', () => {
    const block = mainJs.split("'metrics:coordination'")[1]?.split("'metrics:snapshot'")[0] || ''
    expect(block).not.toContain('dir')
  })
})

// ── metrics:snapshot ──────────────────────────────────────────────────────────

describe('metrics:snapshot handler', () => {
  const block = mainJs.split("'metrics:snapshot'")[1]?.split("'metrics:allocation'")[0] || ''

  it('returns null for missing dir', () => {
    expect(block).toMatch(/if \(!(dir|isKnownProject)/)
    expect(block).toContain('return null')
  })

  it('reads orchestra.json focus weights', () => {
    expect(block).toMatch(/\.claude\/orchestra\.json|readOrchJson/)
  })

  it('delegates to contextProto.computeDelta', () => {
    expect(block).toMatch(/contextProto\.computeDelta\(dir, cfg\.focus|readOrchJson\(dir\)\.focus/)
  })
})

// ── metrics:allocation ────────────────────────────────────────────────────────

describe('metrics:allocation handler', () => {
  const block = mainJs.split("'metrics:allocation'")[1]?.split("'metrics:claude-usage'")[0] || ''

  it('returns null for missing dir', () => {
    expect(block).toMatch(/if \(!(dir|isKnownProject)/)
    expect(block).toContain('return null')
  })

  it('reads orchestra.json focus weights', () => {
    expect(block).toMatch(/\.claude\/orchestra\.json|readOrchJson/)
  })

  it('delegates to scheduler.computeAllocation', () => {
    expect(block).toContain('computeAllocation(dir,')
  })
})

// ── metrics:claude-usage ──────────────────────────────────────────────────────

describe('metrics:claude-usage handler', () => {
  const block = mainJs.split("'metrics:claude-usage'")[1]?.split('ipcMain.handle')[0] || ''

  it('returns null for missing dir', () => {
    expect(block).toMatch(/if \(!(dir|isKnownProject)/)
    expect(block).toContain('return null')
  })

  it('delegates to getClaudeUsage(dir)', () => {
    expect(block).toContain('getClaudeUsage(dir)')
  })
})

// ── orchestra:tail ────────────────────────────────────────────────────────────

describe('orchestra:tail handler', () => {
  const block = mainJs.split("'orchestra:tail'")[1]?.split("// ─── Mixer")[0] || ''

  it('validates dir parameter', () => {
    expect(block).toMatch(/if \(!(dir|isKnownProject)/)
  })

  it('reads master orchestration log', () => {
    expect(block).toContain('orchestra.log')
  })

  it('returns last N lines via _tailLines (default 400)', () => {
    expect(block).toContain('slice(-_tailLines)')
    expect(block).toContain('400')
  })

  it('returns empty string for missing log', () => {
    expect(block).toContain("return ''")
  })
})

// ── orchestra:readIterLog ─────────────────────────────────────────────────────

describe('orchestra:readIterLog handler', () => {
  const block = mainJs.split("'orchestra:readIterLog'")[1]?.split("'notes:read'")[0] || ''

  it('validates dir and logPath inputs', () => {
    expect(block).toContain("typeof logPath !== 'string'")
  })

  it('enforces path traversal prevention', () => {
    expect(block).toContain('path.resolve(dir, logPath)')
    expect(block).toContain('fullPath.startsWith(dir + path.sep)')
  })

  it('returns empty string for traversal attempts', () => {
    expect(block).toContain("return ''")
  })

  it('returns last 8 lines of log', () => {
    expect(block).toContain('slice(-8)')
  })

  it('trims empty lines before slicing', () => {
    expect(block).toContain('_rilLines')
  })
})

// ── getClaudeUsage cache ──────────────────────────────────────────────────────

describe('getClaudeUsage — usage tracking cache', () => {
  const body = mainJs.split('function getClaudeUsage')[1]?.split('\nfunction ')[0] || ''

  it('returns exhausted status when USAGE_LIMIT signal exists', () => {
    expect(body).toContain('USAGE_LIMIT_SIGNAL')
    expect(body).toContain('exhausted')
  })

  it('reads RUN_STARTED for cache key', () => {
    expect(body).toContain('RUN_STARTED')
    expect(body).toContain('runStarted')
  })

  it('caches results for 25 seconds', () => {
    expect(body).toContain('25_000')
  })

  it('scans iter-*.log files for token estimation', () => {
    expect(body).toMatch(/startsWith\('iter-'\)|iter-\[\\w\\-\.\]/)
  })

  it('estimates tokens at 1 byte = 0.25 tokens', () => {
    expect(body).toContain('totalBytes / 4')
  })

  it('filters iter logs by mtime >= runStarted', () => {
    expect(body).toContain('st.mtimeMs >= runStarted')
  })
})
