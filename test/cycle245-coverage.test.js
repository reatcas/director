import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT      = path.resolve(import.meta.dirname, '..')
const mainJs    = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const coordJs   = fs.readFileSync(path.join(ROOT, 'coordination-protocol.js'), 'utf8')
const ctxJs     = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')

// ─── T-149: S-89 metricsResource/Context/Snapshot/Allocation guards ───────────

describe('preload metricsResource string guard (S-89)', () => {
  it('metricsResource validates p as non-empty string', () => {
    const block = preloadJs.split('metricsResource:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload metricsContext string guard (S-89)', () => {
  it('metricsContext validates p as non-empty string', () => {
    const block = preloadJs.split('metricsContext:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload metricsSnapshot string guard (S-89)', () => {
  it('metricsSnapshot validates p as non-empty string', () => {
    const block = preloadJs.split('metricsSnapshot:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload metricsAllocation string guard (S-89)', () => {
  it('metricsAllocation validates p as non-empty string', () => {
    const block = preloadJs.split('metricsAllocation:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

// ─── T-150: S-90 claudeUsage/complianceMetrics/roadmapFreshness + S-91 guards ─

describe('preload claudeUsage string guard (S-90)', () => {
  it('claudeUsage validates p as non-empty string', () => {
    const block = preloadJs.split('claudeUsage:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload complianceMetrics string guard (S-90)', () => {
  it('complianceMetrics validates p as non-empty string', () => {
    const block = preloadJs.split('complianceMetrics:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload blueprintLoad string guard (S-91)', () => {
  it('blueprintLoad validates p as non-empty string', () => {
    const block = preloadJs.split('blueprintLoad:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload notesRead string guard (S-91)', () => {
  it('notesRead validates dir as non-empty string', () => {
    const block = preloadJs.split('notesRead:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof dir !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

// ─── T-151: B-28 fine/kill coordination eviction + F-26 + P-74 + BL-22 ───────

describe('orchestra:fine evicts coordination cache (B-28)', () => {
  it('fine handler deletes coordination key', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:fine'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("_metricsCache.delete('coordination')")
  })
})

describe('orchestra:kill evicts coordination cache (B-28)', () => {
  it('kill handler deletes coordination key', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:kill'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("_metricsCache.delete('coordination')")
  })
})

describe('updateComplianceDisplay caches _complianceSparkEl ref (F-26)', () => {
  it('module declares _complianceSparkEl at module level', () => {
    expect(rendererJs).toContain('_complianceSparkEl')
  })

  it('updateComplianceDisplay lazy-initializes _complianceSparkEl', () => {
    const block = rendererJs.split('function updateComplianceDisplay')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('_complianceSparkEl')
    expect(block).toContain("$('#complianceSpark')")
  })
})

describe('_computePriority uses manual hotPaths counter (P-74)', () => {
  it('_computePriority does not use .filter() for hotPaths', () => {
    const block = coordJs.split('_computePriority(allocation) {')[1]?.split('\n  }')[0] || ''
    expect(block).not.toContain('.filter(')
    expect(block).toContain('hotPaths++')
  })
})

describe('ContextProtocol _retentionCache memoizes sigmoid (BL-22)', () => {
  it('constructor declares _retentionCache Map', () => {
    expect(ctxJs).toContain('_retentionCache')
    expect(ctxJs).toContain('new Map()')
  })

  it('_computeRetention uses _retentionCache for sigmoid', () => {
    const block = ctxJs.split('_computeRetention(focusWeights, snapshot) {')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('_retentionCache')
    expect(block).toContain('_retentionCache.set(')
  })
})
