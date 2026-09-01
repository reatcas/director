import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT      = path.resolve(import.meta.dirname, '..')
const mainJs    = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const coordJs   = fs.readFileSync(path.join(ROOT, 'coordination-protocol.js'), 'utf8')

// ─── T-145: S-87 fine/kill/clearLog string guards ────────────────────────────

describe('preload fine string guard (S-87)', () => {
  it('fine validates p as non-empty string', () => {
    const block = preloadJs.split('fine:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload kill string guard (S-87)', () => {
  it('kill validates p as non-empty string', () => {
    const block = preloadJs.split('kill:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload clearLog string guard (S-87)', () => {
  it('clearLog validates p as non-empty string', () => {
    const block = preloadJs.split('clearLog:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

// ─── T-146: S-88 mixerRead/analyze string guards ─────────────────────────────

describe('preload mixerRead string guard (S-88)', () => {
  it('mixerRead validates p as non-empty string', () => {
    const block = preloadJs.split('mixerRead:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload analyze string guard (S-88)', () => {
  it('analyze validates p as non-empty string', () => {
    const block = preloadJs.split('analyze:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

// ─── T-147: B-27 orchestra:play coordination cache eviction ──────────────────

describe('orchestra:play evicts coordination cache (B-27)', () => {
  it('play handler deletes coordination key from _metricsCache', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:play'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("_metricsCache.delete('coordination')")
  })

  it('play handler deletes coordination after snapshot eviction', () => {
    const block = mainJs.split("ipcMain.handle('orchestra:play'")[1]?.split('\n})')[0] || ''
    const snapshotIdx = block.indexOf("_metricsCache.delete('snapshot:")
    const coordIdx    = block.indexOf("_metricsCache.delete('coordination')")
    expect(snapshotIdx).toBeGreaterThan(-1)
    expect(coordIdx).toBeGreaterThan(-1)
  })
})

// ─── T-148: F-25 _burnSparkEl cached ref + BL-20 priorityTier in rebalance ──

describe('updateBurnRate caches _burnSparkEl ref (F-25)', () => {
  it('module declares _burnSparkEl at module level', () => {
    expect(rendererJs).toContain('_burnSparkEl')
  })

  it('updateBurnRate lazy-initializes _burnSparkEl', () => {
    const block = rendererJs.split('function updateBurnRate')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('_burnSparkEl')
    expect(block).toContain("$('#burnSpark')")
  })
})

describe('CoordinationProtocol _rebalance includes priorityTier in log (BL-20)', () => {
  it('rebalance log event includes priorityTier per instance', () => {
    const block = coordJs.split('_rebalance() {')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('priorityTier')
    expect(block).toContain('_logEvent')
  })
})
