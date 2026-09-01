import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { ResourceScheduler } from '../resource-scheduler.js'

const ROOT      = path.resolve(import.meta.dirname, '..')
const mainJs    = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')

// ─── T-132: S-78 configWrite guard + S-79 mixerHistory guard ─────────────────

describe('preload configWrite object guard (S-78)', () => {
  it('configWrite rejects null and non-object', () => {
    const block = preloadJs.split('configWrite')[1]?.split('\n  },')[0] || ''
    expect(block).toContain("typeof c !== 'object'")
    expect(block).toContain('Array.isArray(c)')
    expect(block).toContain('!c ||')
  })

  it('configWrite returns false on invalid input', () => {
    const block = preloadJs.split('configWrite')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('Promise.resolve(false)')
  })
})

describe('preload mixerHistory integer guard (S-79)', () => {
  it('mixerHistory validates n with Number.isInteger and upper bound 100', () => {
    const block = preloadJs.split('mixerHistory')[1]?.split('\n  ')[0] || ''
    expect(block).toContain('Number.isInteger(n)')
    expect(block).toContain('100')
  })

  it('mixerHistory passes undefined for invalid n', () => {
    const block = preloadJs.split('mixerHistory')[1]?.split('\n  ')[0] || ''
    expect(block).toContain('undefined')
  })
})

// ─── T-133: P-69 computeAllocation single-pass ───────────────────────────────

describe('computeAllocation single-pass totalWeight+maxWeight (P-69)', () => {
  it('source uses single for-of loop for totalWeight and maxWeight', () => {
    const schedulerJs = fs.readFileSync(path.join(ROOT, 'resource-scheduler.js'), 'utf8')
    const block = schedulerJs.split('computeAllocation(dir, focus) {')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('let totalWeight = 0, maxWeight = 0')
    expect(block).toContain('for (const [, v] of entries)')
    expect(block).toContain('if (v > maxWeight) maxWeight = v')
  })

  it('source does not use separate reduce for totalWeight', () => {
    const schedulerJs = fs.readFileSync(path.join(ROOT, 'resource-scheduler.js'), 'utf8')
    const block = schedulerJs.split('computeAllocation(dir, focus) {')[1]?.split('\n  }')[0] || ''
    expect(block).not.toContain('.reduce((s')
  })
})

describe('ResourceScheduler computeAllocation integration (P-69)', () => {
  let sched

  beforeEach(() => { sched = new ResourceScheduler() })

  it('totalWeight and maxWeight computed correctly in single pass', () => {
    const focus = { backend: 60, frontend: 40, security: 80 }
    const alloc = sched.computeAllocation('/test/sp', focus)
    expect(alloc.totalWeight).toBe(180)
    expect(alloc.maxIntensity).toBe(80)
  })

  it('avgIntensity equals totalWeight / entry count', () => {
    const focus = { backend: 30, frontend: 70 }
    const alloc = sched.computeAllocation('/test/avg', focus)
    expect(alloc.avgIntensity).toBe(50)
    expect(alloc.totalWeight).toBe(100)
  })
})

// ─── T-134: B-23 clearLog cache keys + F-20 burn reset ──────────────────────

describe('orchestra:clearLog evicts claude-usage and session-summary (B-23)', () => {
  it('clearLog handler deletes claude-usage: + dir key', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:clearLog'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("_metricsCache.delete('claude-usage:' + dir)")
  })

  it('clearLog handler deletes session-summary key', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:clearLog'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("_metricsCache.delete('session-summary')")
  })

  it('clearLog handler calls usageTracker.delete(dir)', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:clearLog'")[1]?.split('\n})')[0] || ''
    expect(block).toContain('usageTracker.delete(dir)')
  })
})

describe('open() resets burn tracking on project switch (F-20)', () => {
  it('renderer open() sets _prevBurnTokens = 0', () => {
    const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
    const block = rendererJs.split('async function open(dir)')[1]?.split('\nasync function ')[0] || ''
    expect(block).toContain('_prevBurnTokens = 0')
  })

  it('renderer open() clears _burnHistory array', () => {
    const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
    const block = rendererJs.split('async function open(dir)')[1]?.split('\nasync function ')[0] || ''
    expect(block).toContain('_burnHistory.length = 0')
  })
})
