import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { CoordinationProtocol } from '../coordination-protocol.js'
import { ContextProtocol } from '../context-protocol.js'

const ROOT      = path.resolve(import.meta.dirname, '..')
const mainJs    = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

// ─── T-139: S-82/S-83/S-84 guards ────────────────────────────────────────────

describe('preload play agent string guard (S-82)', () => {
  it('play validates agent with typeof string check', () => {
    const block = preloadJs.split("play:")[1]?.split('\n  },')[0] || ''
    expect(block).toContain("typeof a !== 'string'")
    expect(block).toContain('64')
  })

  it('play returns error object for invalid agent', () => {
    const block = preloadJs.split("play:")[1]?.split('\n  },')[0] || ''
    expect(block).toContain('Promise.resolve(')
    expect(block).toContain('invalid agent')
  })
})

describe('preload mixerWrite focus object guard (S-83)', () => {
  it('mixerWrite rejects null and array', () => {
    const block = preloadJs.split('mixerWrite')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('Array.isArray(f)')
    expect(block).toContain('!f ||')
  })
})

describe('preload aiSelect string guard (S-84)', () => {
  it('aiSelect validates id as string with length bound', () => {
    const block = preloadJs.split('aiSelect')[1]?.split('\n  },')[0] || ''
    expect(block).toContain("typeof id !== 'string'")
    expect(block).toContain('64')
  })
})

// ─── T-140: P-71 _cpTelDirReady + B-25 play eviction ────────────────────────

describe('ContextProtocol _cpTelDirReady Set (P-71)', () => {
  it('constructor declares _cpTelDirReady Set', () => {
    const ctxJs = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')
    expect(ctxJs).toContain('_cpTelDirReady')
    expect(ctxJs).toContain('new Set()')
  })

  it('_persist uses _cpTelDirReady to skip redundant mkdirSync', () => {
    const ctxJs = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')
    const block = ctxJs.split('_persist(dir, metrics) {')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('_cpTelDirReady.has(dir)')
    expect(block).toContain('_cpTelDirReady.add(dir)')
  })

  it('cleanup removes dir from _cpTelDirReady', () => {
    const ctxJs = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')
    const block = ctxJs.split('cleanup(dir)')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('_cpTelDirReady.delete(dir)')
  })
})

describe('orchestra:play evicts allocation/resource/snapshot caches (B-25)', () => {
  it('play handler deletes allocation: + dir cache', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:play'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("_metricsCache.delete('allocation:' + dir)")
  })

  it('play handler deletes resource: + dir cache', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:play'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("_metricsCache.delete('resource:' + dir)")
  })

  it('play handler deletes snapshot: + dir cache', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:play'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("_metricsCache.delete('snapshot:' + dir)")
  })
})

// ─── T-141: BL-19 conflictSeveritySummary + A-38 aria-hidden ─────────────────

describe('CoordinationProtocol getStatus conflictSeveritySummary (BL-19)', () => {
  let coord

  beforeEach(() => { coord = new CoordinationProtocol() })

  it('getStatus returns conflictSeveritySummary with high/medium/low fields', () => {
    const status = coord.getStatus()
    expect(status).toHaveProperty('conflictSeveritySummary')
    expect(status.conflictSeveritySummary).toHaveProperty('high')
    expect(status.conflictSeveritySummary).toHaveProperty('medium')
    expect(status.conflictSeveritySummary).toHaveProperty('low')
  })

  it('getStatus includes priorityTier in instances', () => {
    const alloc = { avgIntensity: 70, categoryBudgets: {}, totalWeight: 350, memBudgetMB: 512, tokenBudget: 760000, nice: 3 }
    coord.register('/test/bl19', 999, alloc)
    const status = coord.getStatus()
    expect(status.instances['/test/bl19']).toHaveProperty('priorityTier')
  })

  it('summary has zero counts when no conflicts', () => {
    const status = coord.getStatus()
    expect(status.conflictSeveritySummary.high).toBe(0)
    expect(status.conflictSeveritySummary.medium).toBe(0)
    expect(status.conflictSeveritySummary.low).toBe(0)
  })
})

describe('A-38 particleCanvasWrap aria-hidden', () => {
  it('particleCanvasWrap has aria-hidden=true', () => {
    expect(indexHtml).toContain('id="particleCanvasWrap" aria-hidden="true"')
  })
})
