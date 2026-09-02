import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { CoordinationProtocol } from '../coordination-protocol.js'
import { ResourceScheduler } from '../resource-scheduler.js'

const ROOT         = path.resolve(import.meta.dirname, '..')
const schedulerJs  = fs.readFileSync(path.join(ROOT, 'resource-scheduler.js'), 'utf8')
const coordJs      = fs.readFileSync(path.join(ROOT, 'coordination-protocol.js'), 'utf8')
const mainJs       = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

// ─── T-124: P-67 single-pass _updateEfficiency ────────────────────────────────

describe('_updateEfficiency uses single-pass loop instead of 4 reduce/map calls (P-67)', () => {
  it('uses for...of loop over history', () => {
    const block = schedulerJs.split('_updateEfficiency(dir) {')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('for (const h of history)')
  })

  it('no longer calls history.reduce for avgMem', () => {
    const block = schedulerJs.split('_updateEfficiency(dir) {')[1]?.split('\n  }')[0] || ''
    expect(block).not.toContain('history.reduce')
  })

  it('no longer calls Math.max(...history.map', () => {
    const block = schedulerJs.split('_updateEfficiency(dir) {')[1]?.split('\n  }')[0] || ''
    expect(block).not.toContain('Math.max(...history.map')
  })

  it('sums mem and CPU in a single accumulator loop', () => {
    expect(schedulerJs).toContain('_sumMem += h.rssMB')
    expect(schedulerJs).toContain('_sumCPU += h.cpuPct')
  })

  it('tracks peak values with conditional comparison', () => {
    expect(schedulerJs).toContain('if (h.rssMB > _peakMem)')
    expect(schedulerJs).toContain('if (h.cpuPct > _peakCPU)')
  })
})

describe('ResourceScheduler _updateEfficiency integration (P-67)', () => {
  let scheduler

  beforeEach(() => { scheduler = new ResourceScheduler() })

  it('computes avgMem correctly from samples', () => {
    const dir = '/test/dir'
    scheduler.allocations.set(dir, { memBudgetMB: 1000, avgIntensity: 50, normalizedIntensity: 0.5 })
    scheduler.samples.set(dir, [
      { rssMB: 100, cpuPct: 10, elapsedSec: 1 },
      { rssMB: 200, cpuPct: 20, elapsedSec: 2 }
    ])
    scheduler._updateEfficiency(dir)
    const eff = scheduler.efficiency.get(dir)
    expect(eff.avgMemMB).toBe(150)
  })

  it('computes peakCPU correctly from samples', () => {
    const dir = '/test/dir2'
    scheduler.allocations.set(dir, { memBudgetMB: 1000, avgIntensity: 50, normalizedIntensity: 0.5 })
    scheduler.samples.set(dir, [
      { rssMB: 100, cpuPct: 15, elapsedSec: 1 },
      { rssMB: 150, cpuPct: 80, elapsedSec: 2 },
      { rssMB: 120, cpuPct: 5, elapsedSec: 3 }
    ])
    scheduler._updateEfficiency(dir)
    const eff = scheduler.efficiency.get(dir)
    expect(eff.peakCPUPct).toBe(80)
  })
})

// ─── T-125: BL-15 releaseLock logs heldMs ────────────────────────────────────

describe('releaseLock logs heldMs — lock hold duration (BL-15)', () => {
  it('source computes heldMs from lock.grantedAt', () => {
    expect(coordJs).toContain('lock.grantedAt ? Date.now() - new Date(lock.grantedAt).getTime() : null')
  })

  it('source passes heldMs to _logEvent', () => {
    const block = coordJs.split('releaseLock(')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('heldMs')
  })
})

// ─── T-126 + T-127: DD-01 _LC_TYPES pruning filter ──────────────────────────

describe('persistLifecycleEvent pruning filter evicts unknown-type events (DD-01)', () => {
  it('includes _LC_TYPES.has(e.type) in the persistLifecycleEvent filter', () => {
    const persistBlock = mainJs.split('function persistLifecycleEvent')[1]?.split('\nfunction')[0] || ''
    expect(persistBlock).toContain('_LC_TYPES.has(e.type)')
  })

  it('filter evicts events with type not in _LC_TYPES', () => {
    const persistBlock = mainJs.split('function persistLifecycleEvent')[1]?.split('\nfunction')[0] || ''
    expect(persistBlock).toContain('_pePruned')
    expect(persistBlock).toContain('_LC_TYPES.has')
  })
})

describe('orchestra:clearLog pruning filter evicts unknown-type events (DD-01)', () => {
  it('includes _LC_TYPES.has(e.type) in the clearLog lifecycle filter', () => {
    const clearBlock = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''
    expect(clearBlock).toContain('_LC_TYPES.has(e.type)')
  })

  it('clearLog filter and persistLifecycleEvent filter both contain _LC_TYPES guard', () => {
    const count = (mainJs.match(/_LC_TYPES\.has\(e\.type\)/g) || []).length
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

// ─── T-128: CoordinationProtocol releaseLock integration ─────────────────────

describe('CoordinationProtocol releaseLock integration (BL-15)', () => {
  let coord

  beforeEach(() => { coord = new CoordinationProtocol() })

  it('returns false when resource is unknown', () => {
    expect(coord.releaseLock('/dir', 'gpu:0')).toBe(false)
  })

  it('returns false when dir is not the lock holder', () => {
    coord.instances.set('/a', { priority: 50 })
    coord.locks.set('gpu:0', { holder: '/a', priority: 50, grantedAt: new Date().toISOString() })
    expect(coord.releaseLock('/b', 'gpu:0')).toBe(false)
  })

  it('returns true and deletes lock when holder releases', () => {
    coord.instances.set('/a', { priority: 50 })
    coord.locks.set('gpu:0', { holder: '/a', priority: 50, grantedAt: new Date().toISOString() })
    expect(coord.releaseLock('/a', 'gpu:0')).toBe(true)
    expect(coord.locks.has('gpu:0')).toBe(false)
  })

  it('logs lock_released event with heldMs field', () => {
    coord.instances.set('/a', { priority: 50 })
    coord.locks.set('net', { holder: '/a', priority: 50, grantedAt: new Date(Date.now() - 100).toISOString() })
    coord.releaseLock('/a', 'net')
    const ev = coord.events.find(e => e.type === 'lock_released')
    expect(ev).toBeDefined()
    expect(typeof ev.heldMs).toBe('number')
    expect(ev.heldMs).toBeGreaterThanOrEqual(0)
  })

  it('heldMs is null when grantedAt is missing', () => {
    coord.instances.set('/a', { priority: 50 })
    coord.locks.set('net', { holder: '/a', priority: 50 })
    coord.releaseLock('/a', 'net')
    const ev = coord.events.find(e => e.type === 'lock_released')
    expect(ev).toBeDefined()
    expect(ev.heldMs).toBeNull()
  })
})
