// cycle257-coverage.test.js — C257 quality_tests coverage
// T-183: S-110 add/remove/openDir path cap + S-111 mixerWrite/configWrite/blueprintLoad cap
// T-184: S-112 notesRead/notesWrite/metricsContext/metricsSnapshot cap + P-84 addCycleEntry _logEl
// T-185: B-38 kill _analyzeCache + F-35 addActionEntry _logEl + BL-28 for loop + A-46 aria attrs

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs  = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const coordJs    = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')
const indexHtml  = readFileSync(join(root, 'index.html'), 'utf8')

// ─── T-183: S-110 add/remove/openDir + S-111 mixerWrite/configWrite/blueprintLoad ──
describe('T-183: S-110 add/remove/openDir path length caps', () => {
  it('add handler has p.length > 4096 guard', () => {
    const body = preloadJs.split('add:')[1]?.split('remove:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('remove handler has p.length > 4096 guard', () => {
    const body = preloadJs.split('remove:')[1]?.split('openDir:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('openDir handler has p.length > 4096 guard', () => {
    const body = preloadJs.split('openDir:')[1]?.split('readFile:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })
})

describe('T-183: S-111 mixerWrite/configWrite/blueprintLoad path length caps', () => {
  it('mixerWrite has p.length > 4096 guard', () => {
    const body = preloadJs.split('mixerWrite:')[1]?.split('configWrite:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('configWrite has p.length > 4096 guard', () => {
    const body = preloadJs.split('configWrite:')[1]?.split('analyze:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('blueprintLoad has p.length > 4096 guard', () => {
    const body = preloadJs.split('blueprintLoad:')[1]?.split('blueprintSave:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })
})

// ─── T-184: S-112 notesRead/notesWrite/metricsContext/metricsSnapshot + P-84 ─
describe('T-184: S-112 notesRead/notesWrite/metricsContext/metricsSnapshot path caps', () => {
  it('notesRead has dir.length > 4096 guard', () => {
    const body = preloadJs.split('notesRead:')[1]?.split('notesWrite:')[0] || ''
    expect(body).toContain('dir.length > 4096')
  })

  it('notesWrite has dir.length > 4096 guard', () => {
    const body = preloadJs.split('notesWrite:')[1]?.split('// Events')[0] || ''
    expect(body).toContain('dir.length > 4096')
  })

  it('metricsContext has p.length > 4096 guard', () => {
    const body = preloadJs.split('metricsContext:')[1]?.split('metricsCoordination:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('metricsSnapshot has p.length > 4096 guard', () => {
    const body = preloadJs.split('metricsSnapshot:')[1]?.split('metricsAllocation:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })
})

describe('T-184: P-84 addCycleEntry uses _logEl cached ref', () => {
  it('addCycleEntry uses _logEl lazy-init', () => {
    const body = rendererJs.split('function addCycleEntry(text) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
  })

  it('addCycleEntry does not do bare $() query for log', () => {
    const body = rendererJs.split('function addCycleEntry(text) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).not.toContain("const logEl = $('#log')")
  })
})

// ─── T-185: B-38 + F-35 + BL-28 + A-46 ──────────────────────────────────────
describe('T-185: B-38 orchestra:kill evicts _analyzeCache', () => {
  it('orchestra:kill handler evicts _analyzeCache', () => {
    const body = mainJs.split("'orchestra:kill'")[1]?.split("ipcMain.handle('orchestra:fine")[0] || ''
    expect(body).toContain('_analyzeCache.delete(dir)')
  })

  it('_analyzeCache.delete appears after _metricsCache evictions in kill', () => {
    const body = mainJs.split("'orchestra:kill'")[1]?.split("ipcMain.handle('orchestra:fine")[0] || ''
    const metricsIdx = body.indexOf("_metricsCache.delete('claude-usage:'")
    const analyzeIdx = body.indexOf('_analyzeCache.delete(dir)')
    expect(metricsIdx).toBeGreaterThan(-1)
    expect(analyzeIdx).toBeGreaterThan(metricsIdx)
  })
})

describe('T-185: F-35 addActionEntry uses _logEl cached ref', () => {
  it('addActionEntry uses _logEl lazy-init', () => {
    const body = rendererJs.split('function addActionEntry(type, label, message) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
  })

  it('addActionEntry uses const logEl = _logEl alias', () => {
    const body = rendererJs.split('function addActionEntry(type, label, message) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('const logEl = _logEl')
  })
})

describe('T-185: BL-28 _rebalance for loop replaces forEach', () => {
  it('_rebalance uses for loop instead of forEach', () => {
    const body = coordJs.split('_rebalance() {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('for (const [idx, [, info]] of entries.entries())')
    expect(body).not.toContain('entries.forEach(')
  })

  it('_rebalance for loop accesses entries[idx] destructure', () => {
    const body = coordJs.split('_rebalance() {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('entries.entries()')
  })
})

describe('T-185: A-46 #upgradeVer + #bpCompleteness aria-live', () => {
  it('#upgradeVer has aria-live="polite"', () => {
    const attrs = indexHtml.split('id="upgradeVer"')[1]?.split('>')[0] || ''
    expect(attrs).toContain('aria-live="polite"')
  })

  it('#upgradeVer has aria-label', () => {
    const attrs = indexHtml.split('id="upgradeVer"')[1]?.split('>')[0] || ''
    expect(attrs).toContain('aria-label=')
  })

  it('#bpCompleteness has aria-live="polite"', () => {
    const attrs = indexHtml.split('id="bpCompleteness"')[1]?.split('>')[0] || ''
    expect(attrs).toContain('aria-live="polite"')
  })

  it('#bpCompleteness has aria-label', () => {
    const attrs = indexHtml.split('id="bpCompleteness"')[1]?.split('>')[0] || ''
    expect(attrs).toContain('aria-label=')
  })
})
