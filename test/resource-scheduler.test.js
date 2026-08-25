import { describe, it, expect, beforeEach } from 'vitest'
import { ResourceScheduler } from '../resource-scheduler.js'

describe('ResourceScheduler', () => {
  let scheduler

  beforeEach(() => {
    scheduler = new ResourceScheduler()
  })

  describe('_retentionCurve', () => {
    it('returns ~10% for very low share', () => {
      const r = scheduler._retentionCurve(0)
      expect(r).toBeGreaterThanOrEqual(0.10)
      expect(r).toBeLessThan(0.15)
    })

    it('returns ~95% for very high share', () => {
      const r = scheduler._retentionCurve(1.0)
      expect(r).toBeGreaterThan(0.90)
      expect(r).toBeLessThanOrEqual(0.95)
    })

    it('inflects near 0.3 share', () => {
      const low = scheduler._retentionCurve(0.2)
      const mid = scheduler._retentionCurve(0.3)
      const high = scheduler._retentionCurve(0.4)
      // Mid should be around 0.525 (halfway on sigmoid)
      expect(mid).toBeGreaterThan(0.4)
      expect(mid).toBeLessThan(0.7)
      // Steepest change should be around the inflection point
      expect(high - mid).toBeGreaterThan(0)
      expect(mid - low).toBeGreaterThan(0)
    })
  })

  describe('computeAllocation', () => {
    it('returns default allocation for empty focus', () => {
      const alloc = scheduler.computeAllocation('/test', {})
      expect(alloc.nice).toBe(10)
      expect(alloc.tokenBudget).toBe(200_000)
      expect(alloc.avgIntensity).toBe(0)
    })

    it('maps higher intensity to lower nice value', () => {
      const low = scheduler.computeAllocation('/low', { product: 10 })
      const high = scheduler.computeAllocation('/high', { product: 90 })
      expect(high.nice).toBeLessThan(low.nice)
    })

    it('allocates more tokens for higher intensity', () => {
      const low = scheduler.computeAllocation('/low', { product: 10 })
      const high = scheduler.computeAllocation('/high', { product: 90 })
      expect(high.tokenBudget).toBeGreaterThan(low.tokenBudget)
    })

    it('token budget is between 200k and 1M', () => {
      const alloc = scheduler.computeAllocation('/test', { product: 50, quality: 50 })
      expect(alloc.tokenBudget).toBeGreaterThanOrEqual(200_000)
      expect(alloc.tokenBudget).toBeLessThanOrEqual(1_000_000)
    })

    it('computes category budgets with normalized shares', () => {
      const alloc = scheduler.computeAllocation('/test', { product: 60, quality: 40 })
      expect(alloc.categoryBudgets.product.normalizedShare).toBeCloseTo(0.6)
      expect(alloc.categoryBudgets.quality.normalizedShare).toBeCloseTo(0.4)
    })

    it('flags hot path for categories above 60', () => {
      const alloc = scheduler.computeAllocation('/test', { product: 70, quality: 30 })
      expect(alloc.categoryBudgets.product.hotPath).toBe(true)
      expect(alloc.categoryBudgets.quality.hotPath).toBe(false)
    })

    it('memory budget does not exceed 80% of total', () => {
      const alloc = scheduler.computeAllocation('/test', { product: 100 })
      const sys = scheduler.systemSnapshot()
      expect(alloc.memBudgetMB).toBeLessThanOrEqual(Math.floor(sys.totalMemMB * 0.8))
    })
  })

  describe('systemSnapshot', () => {
    it('returns valid system info', () => {
      const snap = scheduler.systemSnapshot()
      expect(snap.cpuCount).toBeGreaterThan(0)
      expect(snap.totalMemMB).toBeGreaterThan(0)
      expect(snap.freeMemMB).toBeGreaterThan(0)
      expect(snap.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('systemSnapshot caching', () => {
    it('caches CPU info across calls', () => {
      const snap1 = scheduler.systemSnapshot()
      const snap2 = scheduler.systemSnapshot()
      expect(snap1.cpuCount).toBe(snap2.cpuCount)
      expect(snap1.cpuModel).toBe(snap2.cpuModel)
      expect(scheduler._cpuCache).toBeDefined()
      expect(scheduler._cpuCache.count).toBe(snap1.cpuCount)
    })
  })

  describe('_retentionCurve edge cases', () => {
    it('is monotonically increasing', () => {
      let prev = 0
      for (let s = 0; s <= 1.0; s += 0.1) {
        const r = scheduler._retentionCurve(s)
        expect(r).toBeGreaterThanOrEqual(prev)
        prev = r
      }
    })

    it('handles negative input gracefully', () => {
      const r = scheduler._retentionCurve(-0.5)
      expect(r).toBeGreaterThanOrEqual(0.10)
      expect(r).toBeLessThan(0.15)
    })
  })

  describe('_updateEfficiency', () => {
    it('computes efficiency from sample history', () => {
      const alloc = scheduler.computeAllocation('/eff-test', { product: 50, quality: 50 })
      scheduler.samples.set('/eff-test', [
        { rssMB: 100, cpuPct: 30, memBudgetMB: alloc.memBudgetMB },
        { rssMB: 150, cpuPct: 40, memBudgetMB: alloc.memBudgetMB },
        { rssMB: 120, cpuPct: 35, memBudgetMB: alloc.memBudgetMB }
      ])
      scheduler._updateEfficiency('/eff-test')
      const eff = scheduler.efficiency.get('/eff-test')
      expect(eff).toBeDefined()
      expect(eff.avgMemMB).toBeCloseTo(123.3, 0)
      expect(eff.peakMemMB).toBe(150)
      expect(eff.samplesCount).toBe(3)
    })

    it('skips computation with fewer than 2 samples', () => {
      scheduler.computeAllocation('/short', { product: 50 })
      scheduler.samples.set('/short', [{ rssMB: 100, cpuPct: 30 }])
      scheduler._updateEfficiency('/short')
      expect(scheduler.efficiency.get('/short')).toBeUndefined()
    })
  })

  describe('computeAllocation edge cases', () => {
    it('handles single category at 100%', () => {
      const alloc = scheduler.computeAllocation('/solo', { product: 100 })
      expect(alloc.avgIntensity).toBe(100)
      expect(alloc.categoryBudgets.product.normalizedShare).toBe(1)
    })

    it('handles many categories with small weights', () => {
      const focus = {
        product: 5, backend: 5, frontend: 5, quality_tests: 5,
        security: 5, performance: 5, ux_accessibility: 5,
        data_db: 5, i18n: 5, refactoring: 5
      }
      const alloc = scheduler.computeAllocation('/spread', focus)
      const total = Object.values(alloc.categoryBudgets).reduce((s, b) => s + b.normalizedShare, 0)
      expect(total).toBeCloseTo(1.0, 5)
    })
  })

  describe('applyToProcess', () => {
    it('rejects non-integer pid', () => {
      expect(scheduler.applyToProcess({ pid: 'abc' }, { nice: 5 })).toBe(false)
    })

    it('rejects zero or negative pid', () => {
      expect(scheduler.applyToProcess({ pid: 0 }, { nice: 5 })).toBe(false)
      expect(scheduler.applyToProcess({ pid: -1 }, { nice: 5 })).toBe(false)
    })

    it('rejects non-integer nice value', () => {
      expect(scheduler.applyToProcess({ pid: 1234 }, { nice: 'bad' })).toBe(false)
    })

    it('rejects null/undefined child', () => {
      expect(scheduler.applyToProcess(null, { nice: 5 })).toBe(false)
      expect(scheduler.applyToProcess(undefined, { nice: 5 })).toBe(false)
    })
  })

  describe('_updateEfficiency edge cases', () => {
    it('computes memBudgetAdherence below 1 when peak exceeds budget', () => {
      scheduler.computeAllocation('/over', { product: 50 })
      const alloc = scheduler.allocations.get('/over')
      scheduler.samples.set('/over', [
        { rssMB: alloc.memBudgetMB + 100, cpuPct: 20 },
        { rssMB: alloc.memBudgetMB + 200, cpuPct: 30 }
      ])
      scheduler._updateEfficiency('/over')
      const eff = scheduler.efficiency.get('/over')
      expect(eff.memBudgetAdherence).toBeLessThan(100)
    })

    it('returns zero intensityCostRatio when avgIntensity is 0', () => {
      scheduler.allocations.set('/zero-int', scheduler.computeAllocation('/zero-int', {}))
      scheduler.samples.set('/zero-int', [
        { rssMB: 10, cpuPct: 5 },
        { rssMB: 12, cpuPct: 8 }
      ])
      scheduler._updateEfficiency('/zero-int')
      const eff = scheduler.efficiency.get('/zero-int')
      expect(eff.intensityCostRatio).toBe(0)
    })

    it('skips when allocation is missing', () => {
      scheduler.samples.set('/no-alloc', [
        { rssMB: 10, cpuPct: 5 },
        { rssMB: 12, cpuPct: 8 }
      ])
      scheduler._updateEfficiency('/no-alloc')
      expect(scheduler.efficiency.get('/no-alloc')).toBeUndefined()
    })
  })

  describe('getMetrics', () => {
    it('returns null fields for unknown directory', () => {
      const m = scheduler.getMetrics('/unknown')
      expect(m.allocation).toBeNull()
      expect(m.baseline).toBeNull()
      expect(m.lastSample).toBeNull()
      expect(m.efficiency).toBeNull()
      expect(m.sampleCount).toBe(0)
    })

    it('returns allocation after computeAllocation', () => {
      scheduler.computeAllocation('/gm', { product: 40 })
      const m = scheduler.getMetrics('/gm')
      expect(m.allocation).toBeDefined()
      expect(m.allocation.avgIntensity).toBe(40)
    })
  })

  describe('getSampleHistory', () => {
    it('returns empty array for unknown directory', () => {
      expect(scheduler.getSampleHistory('/unknown')).toEqual([])
    })

    it('returns all samples without limit', () => {
      scheduler.samples.set('/sh', [{ a: 1 }, { a: 2 }, { a: 3 }])
      expect(scheduler.getSampleHistory('/sh')).toHaveLength(3)
    })

    it('returns limited samples when limit specified', () => {
      scheduler.samples.set('/sh2', [{ a: 1 }, { a: 2 }, { a: 3 }])
      expect(scheduler.getSampleHistory('/sh2', 2)).toHaveLength(2)
      expect(scheduler.getSampleHistory('/sh2', 2)[0].a).toBe(2)
    })
  })

  describe('getActiveDirectories', () => {
    it('returns empty when no allocations', () => {
      expect(scheduler.getActiveDirectories()).toEqual([])
    })

    it('returns all tracked directories', () => {
      scheduler.computeAllocation('/x', { product: 50 })
      scheduler.computeAllocation('/y', { product: 30 })
      const dirs = scheduler.getActiveDirectories()
      expect(dirs).toHaveLength(2)
      expect(dirs).toContain('/x')
      expect(dirs).toContain('/y')
    })
  })

  describe('getAllAllocations', () => {
    it('returns summary of all tracked directories', () => {
      scheduler.computeAllocation('/a', { product: 30 })
      scheduler.computeAllocation('/b', { product: 70 })
      const all = scheduler.getAllAllocations()
      expect(Object.keys(all)).toHaveLength(2)
      expect(all['/a'].avgIntensity).toBe(30)
      expect(all['/b'].avgIntensity).toBe(70)
    })

    it('returns empty object when no allocations', () => {
      expect(scheduler.getAllAllocations()).toEqual({})
    })
  })

  describe('persistTelemetry', () => {
    it('uses atomic write (tmp + rename)', async () => {
      const fs = await import('fs')
      const os = await import('os')
      const path = await import('path')
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rs-tel-'))

      scheduler.computeAllocation(tmpDir, { product: 50 })
      scheduler.samples.set(tmpDir, [
        { rssMB: 100, cpuPct: 30 },
        { rssMB: 120, cpuPct: 40 }
      ])
      scheduler._updateEfficiency(tmpDir)
      scheduler.persistTelemetry(tmpDir)

      const file = path.join(tmpDir, '.claude', 'telemetry', 'resource-metrics.json')
      expect(fs.existsSync(file)).toBe(true)
      const data = JSON.parse(fs.readFileSync(file, 'utf8'))
      expect(data).toHaveLength(1)
      expect(data[0].avgMemMB).toBeDefined()
      expect(fs.existsSync(file + '.tmp')).toBe(false)
    })

    it('skips when no efficiency data exists', () => {
      scheduler.persistTelemetry('/no-eff')
    })
  })

  describe('cleanup', () => {
    it('clears all maps for a directory', () => {
      const alloc = scheduler.computeAllocation('/cleanup-test', { product: 50 })
      expect(scheduler.allocations.has('/cleanup-test')).toBe(true)
      scheduler.cleanup('/cleanup-test')
      expect(scheduler.allocations.has('/cleanup-test')).toBe(false)
      expect(scheduler.baselines.has('/cleanup-test')).toBe(false)
      expect(scheduler.samples.has('/cleanup-test')).toBe(false)
      expect(scheduler.efficiency.has('/cleanup-test')).toBe(false)
    })
  })
})
