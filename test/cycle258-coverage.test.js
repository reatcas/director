// cycle258-coverage.test.js — C258 quality_tests coverage
// T-186: S-113 install/mixerHistory/lifecycleList/mixerSavedList path cap source
// T-187: S-114 metricsAllocation/claudeUsage/compliance/freshness + P-85 addInterpretingEntry _logEl
// T-188: B-39 kill allocation+versionCheck cache eviction + F-36 addFeatureEntry _logEl

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs  = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')

// ─── T-186: S-113 install/mixerHistory/lifecycleList/mixerSavedList ──────────
describe('T-186: S-113 install path length cap', () => {
  it('install handler has p.length > 4096 guard', () => {
    const body = preloadJs.split('install:')[1]?.split('play:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })
})

describe('T-186: S-113 mixerHistory path length cap', () => {
  it('mixerHistory handler has p.length > 4096 guard', () => {
    const body = preloadJs.split('mixerHistory:')[1]?.split('sessionSummary:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })
})

describe('T-186: S-113 lifecycleList path length cap', () => {
  it('lifecycleList handler has p.length > 4096 guard', () => {
    const body = preloadJs.split('lifecycleList:')[1]?.split('lifecycleAdd:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('lifecycleList early return on oversized path', () => {
    const body = preloadJs.split('lifecycleList:')[1]?.split('lifecycleAdd:')[0] || ''
    const guardIdx = body.indexOf('p.length > 4096')
    const resolveIdx = body.indexOf('Promise.resolve(', guardIdx)
    expect(guardIdx).toBeGreaterThan(-1)
    expect(resolveIdx).toBeGreaterThan(guardIdx)
  })
})

describe('T-186: S-113 mixerSavedList path length cap', () => {
  it('mixerSavedList handler has p.length > 4096 guard', () => {
    const body = preloadJs.split('mixerSavedList:')[1]?.split('mixerSavedSave:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })
})

// ─── T-187: S-114 metrics path caps + P-85 addInterpretingEntry _logEl ────────
describe('T-187: S-114 metricsAllocation/claudeUsage/compliance/freshness path caps', () => {
  it('metricsAllocation has p.length > 4096 guard', () => {
    const body = preloadJs.split('metricsAllocation:')[1]?.split('claudeUsage:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('claudeUsage has p.length > 4096 guard', () => {
    const body = preloadJs.split('claudeUsage:')[1]?.split('// System')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('complianceMetrics has p.length > 4096 guard', () => {
    const body = preloadJs.split('complianceMetrics:')[1]?.split('roadmapFreshness:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('roadmapFreshness has p.length > 4096 guard', () => {
    const body = preloadJs.split('roadmapFreshness:')[1]?.split('// Orchestra')[0] || ''
    expect(body).toContain('p.length > 4096')
  })
})

describe('T-187: P-85 addInterpretingEntry uses _logEl cached ref', () => {
  it('addInterpretingEntry uses _logEl lazy-init', () => {
    const body = rendererJs.split('function addInterpretingEntry() {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
  })

  it('addInterpretingEntry does not do bare $() query for log', () => {
    const body = rendererJs.split('function addInterpretingEntry() {')[1]?.split('\nfunction ')[0] || ''
    expect(body).not.toContain("const logEl = $('#log')")
  })
})

// ─── T-188: B-39 kill cache + F-36 addFeatureEntry _logEl ────────────────────
describe('T-188: B-39 orchestra:kill evicts allocation and version-check caches', () => {
  it('orchestra:kill evicts allocation cache', () => {
    const body = mainJs.split("'orchestra:kill'")[1]?.split("ipcMain.handle('orchestra:fine")[0] || ''
    expect(body).toContain("_metricsCache.delete('allocation:' + dir)")
  })

  it('orchestra:kill evicts version-check cache', () => {
    const body = mainJs.split("'orchestra:kill'")[1]?.split("ipcMain.handle('orchestra:fine")[0] || ''
    expect(body).toContain("_metricsCache.delete('version-check:' + dir)")
  })

  it('allocation+version-check evictions appear after coordination eviction in kill', () => {
    const body = mainJs.split("'orchestra:kill'")[1]?.split("ipcMain.handle('orchestra:fine")[0] || ''
    const coordIdx = body.indexOf("_metricsCache.delete('coordination')")
    const allocIdx = body.indexOf("_metricsCache.delete('allocation:'")
    expect(coordIdx).toBeGreaterThan(-1)
    expect(allocIdx).toBeGreaterThan(coordIdx)
  })
})

describe('T-188: F-36 addFeatureEntry uses _logEl cached ref', () => {
  it('addFeatureEntry uses _logEl lazy-init', () => {
    const body = rendererJs.split('function addFeatureEntry(text) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
  })

  it('addFeatureEntry does not do bare $() query for log', () => {
    const body = rendererJs.split('function addFeatureEntry(text) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).not.toContain("const logEl = $('#log')")
  })
})
