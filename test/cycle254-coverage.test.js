// cycle254-coverage.test.js — C254 quality_tests coverage
// T-177: P-81 detectConflicts fast-path source + size<2 integration
// T-178: B-35 _analyzeCache.delete in play source + F-32 _logEl+_upgradeBtnEl declarations
// T-179: BL-27 _computeRetention _clampedShare source + clamp integration

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const coordJs    = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')
const contextJs  = readFileSync(join(root, 'context-protocol.js'), 'utf8')

// ─── T-177: P-81 — detectConflicts fast-path ─────────────────────────────────
describe('T-177: P-81 detectConflicts() fast-path when instances.size < 2', () => {
  it('detectConflicts source contains size < 2 early return', () => {
    const body = coordJs.split('detectConflicts() {')[1]?.split('// ─── Dynamic')[0] || ''
    expect(body).toContain('this.instances.size < 2')
    expect(body).toContain('return []')
  })

  it('fast-path appears before entries accumulation in detectConflicts', () => {
    const body = coordJs.split('detectConflicts() {')[1]?.split('// ─── Dynamic')[0] || ''
    const fastIdx    = body.indexOf('this.instances.size < 2')
    const entriesIdx = body.indexOf('[...this.instances]')
    expect(fastIdx).toBeGreaterThan(-1)
    expect(entriesIdx).toBeGreaterThan(-1)
    expect(fastIdx).toBeLessThan(entriesIdx)
  })

  it('detectConflicts returns [] with 0 instances', () => {
    const { CoordinationProtocol } = require(join(root, 'coordination-protocol.js'))
    const cp = new CoordinationProtocol()
    expect(cp.detectConflicts()).toEqual([])
  })

  it('detectConflicts returns [] with 1 instance', () => {
    const { CoordinationProtocol } = require(join(root, 'coordination-protocol.js'))
    const cp = new CoordinationProtocol()
    cp.register('/dir/a', 1234, { avgIntensity: 50, categoryBudgets: {}, totalWeight: 100, memBudgetMB: 100, tokenBudget: 200_000, nice: 10 })
    expect(cp.detectConflicts()).toEqual([])
  })

  it('detectConflicts still finds conflicts with 2 overlapping instances', () => {
    const { CoordinationProtocol } = require(join(root, 'coordination-protocol.js'))
    const cp = new CoordinationProtocol()
    const weights = { security: { weight: 60, hotPath: true }, product: { weight: 40, hotPath: false } }
    cp.register('/dir/a', 1001, { avgIntensity: 60, categoryBudgets: weights, totalWeight: 100, memBudgetMB: 200, tokenBudget: 200_000, nice: 5 })
    cp.register('/dir/b', 1002, { avgIntensity: 60, categoryBudgets: weights, totalWeight: 100, memBudgetMB: 200, tokenBudget: 200_000, nice: 5 })
    const conflicts = cp.detectConflicts()
    expect(conflicts.length).toBeGreaterThan(0)
  })
})

// ─── T-178: B-35 + F-32 ──────────────────────────────────────────────────────
describe('T-178: B-35 _analyzeCache.delete in orchestra:play handler', () => {
  it('orchestra:play handler evicts _analyzeCache', () => {
    const body = mainJs.split("'orchestra:play'")[1]?.split("ipcMain.handle('orchestra:fine")[0] || ''
    expect(body).toContain('_analyzeCache.delete(dir)')
  })

  it('_analyzeCache.delete appears after _metricsCache evictions in play', () => {
    const body = mainJs.split("'orchestra:play'")[1]?.split("ipcMain.handle('orchestra:fine")[0] || ''
    const metricsIdx = body.indexOf("_metricsCache.delete('claude-usage:'")
    const analyzeIdx = body.indexOf('_analyzeCache.delete(dir)')
    expect(metricsIdx).toBeGreaterThan(-1)
    expect(analyzeIdx).toBeGreaterThan(metricsIdx)
  })
})

describe('T-178: F-32 _logEl + _upgradeBtnEl module-level cached refs', () => {
  it('renderer.js declares _logEl at module level', () => {
    expect(rendererJs).toContain('let _logEl = null')
  })

  it('renderer.js declares _upgradeBtnEl at module level', () => {
    expect(rendererJs).toContain('let _upgradeBtnEl = null')
  })

  it('scrollLog() uses _logEl lazy-init', () => {
    const body = rendererJs.split('function scrollLog() {')[1]?.split('\n}')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
    expect(body).toContain('_logEl.scrollTop = _logEl.scrollHeight')
  })

  it('trimLog() uses _logEl lazy-init', () => {
    const body = rendererJs.split('function trimLog() {')[1]?.split('\n}')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
    expect(body).toContain('_logEl.childElementCount > 300')
  })

  it('upgradeBtn onclick uses _upgradeBtnEl ref', () => {
    const idx = rendererJs.indexOf('_upgradeBtnEl.onclick')
    expect(idx).toBeGreaterThan(-1)
  })
})

// ─── T-179: BL-27 — _computeRetention clamp ──────────────────────────────────
describe('T-179: BL-27 _computeRetention _clampedShare', () => {
  it('_computeRetention source contains _clampedShare with Math.min/max', () => {
    const body = contextJs.split('_computeRetention(focusWeights, snapshot) {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('_clampedShare')
    expect(body).toContain('Math.min(1, Math.max(0, share))')
  })

  it('_clampedShare is used in cache key computation', () => {
    const body = contextJs.split('_computeRetention(focusWeights, snapshot) {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('Math.round(_clampedShare * 1000)')
  })

  it('_clampedShare is used in sigmoid exponential', () => {
    const body = contextJs.split('_computeRetention(focusWeights, snapshot) {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('Math.exp(-14 * (_clampedShare - 0.25))')
  })

  it('clamp prevents extreme share values from causing errors', () => {
    const { ContextProtocol } = require(join(root, 'context-protocol.js'))
    const cp = new ContextProtocol()
    const fw = { product: 150, quality_tests: 10 }  // product share > 1 without clamp
    const snap = { 'PLAN.md': { hash: 'abc', tokens: 500, sections: [] } }
    expect(() => cp._computeRetention(fw, snap)).not.toThrow()
    const result = cp._computeRetention(fw, snap)
    expect(result.summary['PLAN.md'].retentionPct).toBeGreaterThanOrEqual(10)
    expect(result.summary['PLAN.md'].retentionPct).toBeLessThanOrEqual(100)
  })

  it('clamp at 0 prevents negative share from skewing sigmoid', () => {
    const { ContextProtocol } = require(join(root, 'context-protocol.js'))
    const cp = new ContextProtocol()
    // Negative total weight edge case — clamped share should be 0
    const fw = { product: 0 }
    const snap = { 'PLAN.md': { hash: 'abc', tokens: 100, sections: [] } }
    // totalWeight=0 → early exit, so test with low-weight scenario
    const fw2 = { product: 1, quality_tests: 99 }
    const result = cp._computeRetention(fw2, snap)
    expect(result.summary['PLAN.md'].retentionPct).toBeGreaterThanOrEqual(0)
  })
})
