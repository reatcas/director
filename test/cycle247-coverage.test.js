import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT      = path.resolve(import.meta.dirname, '..')
const mainJs    = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── T-156: S-94 mixerSavedList/mixerHistory p guard ─────────────────────────

describe('preload mixerSavedList string guard (S-94)', () => {
  it('mixerSavedList validates p as non-empty string', () => {
    const block = preloadJs.split('mixerSavedList:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload mixerHistory string guard (S-94)', () => {
  it('mixerHistory validates p as non-empty string', () => {
    const block = preloadJs.split('mixerHistory:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

// ─── T-157: S-95 lifecycleList/lifecycleAdd p guard ──────────────────────────

describe('preload lifecycleList string guard for p (S-95)', () => {
  it('lifecycleList validates p as non-empty string', () => {
    const block = preloadJs.split('lifecycleList:')[1]?.split('\n  },')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload lifecycleAdd string guard for p (S-95)', () => {
  it('lifecycleAdd validates p as non-empty string before other params', () => {
    const block = preloadJs.split('lifecycleAdd:')[1]?.split('\n  },')[0] || ''
    const pGuardIdx   = block.indexOf("typeof p !== 'string'")
    const tGuardIdx   = block.indexOf("typeof t !== 'string'")
    expect(pGuardIdx).toBeGreaterThan(-1)
    expect(tGuardIdx).toBeGreaterThan(-1)
    expect(pGuardIdx).toBeLessThan(tGuardIdx)
  })
})

// ─── T-158: B-29 clearLog compliance+freshness cache eviction ────────────────

describe('orchestra:clearLog evicts compliance+freshness cache (B-29)', () => {
  it('clearLog deletes compliance cache key', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:clearLog'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("_metricsCache.delete('compliance:")
  })

  it('clearLog deletes freshness cache key', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:clearLog'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("_metricsCache.delete('freshness:")
  })
})

// ─── T-159: F-28 _aiSelectEl cached ref ──────────────────────────────────────

describe('renderer _aiSelectEl module-level cached ref (F-28)', () => {
  it('module declares _aiSelectEl', () => {
    expect(rendererJs).toContain('_aiSelectEl')
  })

  it('updateAiControl lazy-initializes _aiSelectEl', () => {
    const block = rendererJs.split('function updateAiControl')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('_aiSelectEl')
    expect(block).toContain("$('#aiSelect')")
  })

  it('updateAiUsageDisplay uses _aiSelectEl', () => {
    const block = rendererJs.split('function updateAiUsageDisplay')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('_aiSelectEl')
  })
})
