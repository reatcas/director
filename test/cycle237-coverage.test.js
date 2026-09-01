import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { ContextProtocol } from '../context-protocol.js'

const ROOT       = path.resolve(import.meta.dirname, '..')
const mainJs     = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs  = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const schedulerJs = fs.readFileSync(path.join(ROOT, 'resource-scheduler.js'), 'utf8')

// ─── T-129: P-68 _updateAggregated running sum ──────────────────────────────

describe('_updateAggregated uses _aggRunning for incremental O(1) update (P-68)', () => {
  it('source declares _aggRunning Map in constructor', () => {
    const ctxJs = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')
    expect(ctxJs).toContain('_aggRunning')
    expect(ctxJs).toContain('new Map()')
  })

  it('source checks hist.length === running.len + 1 for incremental path', () => {
    const ctxJs = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')
    const block = ctxJs.split('_updateAggregated(dir) {')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('running.len + 1')
    expect(block).toContain('_aggRunning')
  })

  it('source still has full recompute fallback loop', () => {
    const ctxJs = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')
    const block = ctxJs.split('_updateAggregated(dir) {')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('for (const entry of hist)')
  })
})

describe('ContextProtocol _updateAggregated integration (P-68)', () => {
  let proto

  beforeEach(() => { proto = new ContextProtocol() })

  it('O(1) incremental: running sum matches full sum after sequential pushes', () => {
    const dir = '/test/aggrunning'
    const makeEntry = (tokens, saved) => ({ metrics: { totalTokens: tokens, totalTokensSaved: saved }, delta: {}, retentionPlan: {} })
    proto.deltaHistory.set(dir, [makeEntry(100, 30)])
    proto._updateAggregated(dir)
    proto.deltaHistory.get(dir).push(makeEntry(200, 60))
    proto._updateAggregated(dir)
    const agg = proto.aggregated.get(dir)
    expect(agg.totalTokensProcessed).toBe(300)
    expect(agg.totalTokensSaved).toBe(90)
    expect(agg.cycles).toBe(2)
  })

  it('full recompute on first call (running.len starts 0)', () => {
    const dir = '/test/aggfull'
    proto.deltaHistory.set(dir, [
      { metrics: { totalTokens: 50, totalTokensSaved: 10 }, delta: {}, retentionPlan: {} },
      { metrics: { totalTokens: 150, totalTokensSaved: 40 }, delta: {}, retentionPlan: {} }
    ])
    proto._updateAggregated(dir)
    const agg = proto.aggregated.get(dir)
    expect(agg.totalTokensProcessed).toBe(200)
    expect(agg.totalTokensSaved).toBe(50)
  })
})

// ─── T-130: B-22 _metricsCache trim no-sort ──────────────────────────────────

describe('_metricsCache trim uses insertion-order delete not sort (B-22)', () => {
  it('trim block does not call .sort(', () => {
    const sizeBlock = mainJs.split('_metricsCache.size > _METRICS_CACHE_MAX')[1] || ''
    expect(sizeBlock).not.toContain('.sort(')
  })

  it('trim block uses _metricsCache.delete(k) in loop', () => {
    const sizeBlock = mainJs.split('_metricsCache.size > _METRICS_CACHE_MAX')[1] || ''
    expect(sizeBlock).toContain('_metricsCache.delete(k)')
    expect(sizeBlock).toContain('_METRICS_CACHE_TRIM')
  })

  it('does not spread _metricsCache.entries() for sort', () => {
    const sizeBlock = mainJs.split('_metricsCache.size > _METRICS_CACHE_MAX')[1] || ''
    expect(sizeBlock).not.toContain('[..._metricsCache.entries()]')
  })
})

// ─── T-131: S-75/S-76/S-77 preload guards ────────────────────────────────────

describe('preload mixerSavedDelete id guard (S-75)', () => {
  it('mixerSavedDelete validates id with /^[0-9a-z]+$/', () => {
    const block = preloadJs.split('mixerSavedDelete')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('/^[0-9a-z]+$/')
    expect(block).toContain('length > 64')
  })

  it('mixerSavedExport validates id with same pattern', () => {
    const block = preloadJs.split('mixerSavedExport')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('/^[0-9a-z]+$/')
  })
})

describe('preload blueprintSave data guard (S-76)', () => {
  it('blueprintSave rejects null', () => {
    const block = preloadJs.split('blueprintSave')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('typeof d !== \'object\'')
    expect(block).toContain('Array.isArray(d)')
  })

  it('blueprintSave enforces JSON size cap', () => {
    const block = preloadJs.split('blueprintSave')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('524288')
  })
})

describe('preload lifecycleList param guards (S-77)', () => {
  it('sanitizes limit to integer 1-500', () => {
    const block = preloadJs.split('lifecycleList')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('Number.isInteger(limit)')
    expect(block).toContain('500')
  })

  it('sanitizes typeFilter with regex pattern', () => {
    const block = preloadJs.split('lifecycleList')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('typeFilter')
    expect(block).toContain('/^[\\w\\-]+$/')
  })

  it('sanitizes before with ISO date prefix check', () => {
    const block = preloadJs.split('lifecycleList')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('before')
    expect(block).toContain('\\d{4}-\\d{2}-\\d{2}T')
  })
})
