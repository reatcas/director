import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { CoordinationProtocol } from '../coordination-protocol.js'

const ROOT      = path.resolve(import.meta.dirname, '..')
const mainJs    = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── T-135: S-80 tail guard + S-81 atrilesSave guard ────────────────────────

describe('preload tail lines integer guard (S-80)', () => {
  it('tail validates lines with Number.isInteger and upper bound 1000', () => {
    const block = preloadJs.split("tail:")[1]?.split('\n  ')[0] || ''
    expect(block).toContain('Number.isInteger(lines)')
    expect(block).toContain('1000')
  })

  it('tail falls back to 400 for invalid lines', () => {
    const block = preloadJs.split("tail:")[1]?.split('\n  ')[0] || ''
    expect(block).toContain('400')
  })
})

describe('preload atrilesSave array guard (S-81)', () => {
  it('atrilesSave rejects non-array', () => {
    const block = preloadJs.split('atrilesSave')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('Array.isArray(a)')
    expect(block).toContain('!a ||')
  })

  it('atrilesSave requires input to be an array', () => {
    const block = preloadJs.split('atrilesSave')[1]?.split('\n  },')[0] || ''
    expect(block).toContain('Promise.resolve(false)')
  })
})

// ─── T-136: B-24 _invalidateSavedMixes on remove ────────────────────────────

describe('repertoire:remove evicts savedMixes cache (B-24)', () => {
  it('remove handler calls _invalidateSavedMixes(dir)', () => {
    const block = mainJs.split("ipcMain.handle('repertoire:remove'")[1]?.split('\n})')[0] || ''
    expect(block).toContain('_invalidateSavedMixes(dir)')
  })

  it('_invalidateSavedMixes deletes from _savedMixesCache', () => {
    expect(mainJs).toContain('function _invalidateSavedMixes(dir) { _savedMixesCache.delete(dir) }')
  })
})

// ─── T-137: F-22 burn reset on clearLog ─────────────────────────────────────

describe('clearLogBtn resets burn rate tracking (F-22)', () => {
  it('clearLog handler resets _prevBurnTokens to 0', () => {
    const block = rendererJs.split("$('#clearLogBtn').onclick")[1]?.split('\n}\n')[0] || ''
    expect(block).toContain('_prevBurnTokens = 0')
  })

  it('clearLog handler clears _burnHistory', () => {
    const block = rendererJs.split("$('#clearLogBtn').onclick")[1]?.split('\n}\n')[0] || ''
    expect(block).toContain('_burnHistory.length = 0')
  })
})

// ─── T-138: BL-17 _priorityTier integration ──────────────────────────────────

describe('CoordinationProtocol _priorityTier helper (BL-17)', () => {
  let coord

  beforeEach(() => { coord = new CoordinationProtocol() })

  it('score ≤40 returns high', () => {
    expect(coord._priorityTier(1)).toBe('high')
    expect(coord._priorityTier(40)).toBe('high')
  })

  it('score 41-70 returns medium', () => {
    expect(coord._priorityTier(41)).toBe('medium')
    expect(coord._priorityTier(70)).toBe('medium')
  })

  it('score >70 returns low', () => {
    expect(coord._priorityTier(71)).toBe('low')
    expect(coord._priorityTier(100)).toBe('low')
  })

  it('register stores priorityTier on instance', () => {
    const alloc = { avgIntensity: 80, categoryBudgets: {}, totalWeight: 400, memBudgetMB: 512, tokenBudget: 800000, nice: 5 }
    const inst = coord.register('/test/tier', 1234, alloc)
    expect(inst).toBeTruthy()
    expect(['high', 'medium', 'low']).toContain(inst.priorityTier)
  })

  it('high intensity allocation gets high or medium tier', () => {
    const alloc = { avgIntensity: 90, categoryBudgets: { security: { hotPath: true }, quality_tests: { hotPath: true } }, totalWeight: 600, memBudgetMB: 1024, tokenBudget: 1000000, nice: -5 }
    const inst = coord.register('/test/highintensity', 5678, alloc)
    expect(inst.priorityTier).not.toBe('low')
  })
})
