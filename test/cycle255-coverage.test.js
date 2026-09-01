// cycle255-coverage.test.js — C255 quality_tests coverage
// T-180: S-106 readFile s-param guard + S-107 versionCheck/upgrade path cap source
// T-181: P-82 _computeRetention empty-snapshot exit + B-36 repertoire:remove cache eviction source
// T-182: F-33 addNormalLine _logEl source + _logEl lazy-init count check

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs  = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const contextJs  = readFileSync(join(root, 'context-protocol.js'), 'utf8')

// ─── T-180: S-106 readFile s-param guard ────────────────────────────────────
describe('T-180: S-106 readFile s-param length cap', () => {
  it('readFile body guards s param when defined', () => {
    const body = preloadJs.split('readFile:')[1]?.split('install:')[0] || ''
    expect(body).toContain('s !== undefined')
    expect(body).toContain('s.length > 512')
  })

  it('readFile s-guard returns empty string on oversized snippet', () => {
    const body = preloadJs.split('readFile:')[1]?.split('install:')[0] || ''
    const guardIdx  = body.indexOf('s !== undefined')
    const resolveIdx = body.indexOf("Promise.resolve('')", guardIdx)
    expect(guardIdx).toBeGreaterThan(-1)
    expect(resolveIdx).toBeGreaterThan(guardIdx)
  })
})

// ─── T-180: S-107 orchestraVersionCheck+Upgrade path length cap ──────────────
describe('T-180: S-107 orchestraVersionCheck and orchestraUpgrade path cap', () => {
  it('orchestraVersionCheck has p.length > 4096 guard', () => {
    const body = preloadJs.split('orchestraVersionCheck:')[1]?.split('orchestraUpgrade:')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('orchestraUpgrade has p.length > 4096 guard', () => {
    const body = preloadJs.split('orchestraUpgrade:')[1]?.split('// Blueprint')[0] || ''
    expect(body).toContain('p.length > 4096')
  })

  it('path cap guard appears in same condition as typeof guard', () => {
    const body = preloadJs.split('orchestraVersionCheck:')[1]?.split('orchestraUpgrade:')[0] || ''
    const idx = body.indexOf("typeof p !== 'string'")
    const capIdx = body.indexOf('p.length > 4096', idx)
    expect(idx).toBeGreaterThan(-1)
    expect(capIdx).toBeGreaterThan(idx)
    // Both in same guard expression (same line / same condition)
    const segment = body.slice(idx, capIdx + 20)
    expect(segment).toContain('||')
  })
})

// ─── T-181: P-82 _computeRetention empty snapshot + B-36 remove eviction ─────
describe('T-181: P-82 _computeRetention empty snapshot early exit', () => {
  it('_computeRetention source contains empty snapshot guard', () => {
    const body = contextJs.split('_computeRetention(focusWeights, snapshot) {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('Object.keys(snapshot).length === 0')
    // Returns early with empty result
    const guardIdx  = body.indexOf('Object.keys(snapshot).length === 0')
    const returnIdx = body.indexOf('return', guardIdx)
    expect(returnIdx).toBeGreaterThan(guardIdx)
    expect(returnIdx - guardIdx).toBeLessThan(80)
  })

  it('empty snapshot guard appears after totalWeight=0 guard', () => {
    const body = contextJs.split('_computeRetention(focusWeights, snapshot) {')[1]?.split('\n  }')[0] || ''
    const twIdx   = body.indexOf('totalWeight === 0')
    const snapIdx = body.indexOf('Object.keys(snapshot).length === 0')
    expect(twIdx).toBeGreaterThan(-1)
    expect(snapIdx).toBeGreaterThan(twIdx)
  })

  it('_computeRetention returns empty result on empty snapshot', () => {
    const { ContextProtocol } = require(join(root, 'context-protocol.js'))
    const cp = new ContextProtocol()
    const result = cp._computeRetention({ product: 50, security: 50 }, {})
    expect(result).toEqual({ actions: [], tokensSaved: 0, summary: {} })
  })
})

describe('T-181: B-36 repertoire:remove evicts analyze/notes/blueprint caches', () => {
  it('repertoire:remove handler evicts _analyzeCache', () => {
    const body = mainJs.split("'repertoire:remove'")[1]?.split("ipcMain.handle('repertoire:open'")[0] || ''
    expect(body).toContain('_analyzeCache.delete(dir)')
  })

  it('repertoire:remove handler evicts _notesCache', () => {
    const body = mainJs.split("'repertoire:remove'")[1]?.split("ipcMain.handle('repertoire:open'")[0] || ''
    expect(body).toContain('_notesCache.delete(dir)')
  })

  it('repertoire:remove handler evicts _blueprintCache', () => {
    const body = mainJs.split("'repertoire:remove'")[1]?.split("ipcMain.handle('repertoire:open'")[0] || ''
    expect(body).toContain('_blueprintCache.delete(dir)')
  })
})

// ─── T-182: F-33 addNormalLine _logEl ────────────────────────────────────────
describe('T-182: F-33 addNormalLine() uses _logEl cached ref', () => {
  it('addNormalLine uses _logEl lazy-init instead of bare $() query', () => {
    const body = rendererJs.split('function addNormalLine(text) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
    expect(body).not.toContain("const logEl = $('#log')")
  })

  it('addNormalLine uses logEl alias pointing to _logEl', () => {
    const body = rendererJs.split('function addNormalLine(text) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('const logEl = _logEl')
  })

  it('_logEl lazy-init appears in at least 3 functions (scrollLog + trimLog + addNormalLine)', () => {
    const count = (rendererJs.match(/if \(!_logEl\) _logEl = /g) || []).length
    expect(count).toBeGreaterThanOrEqual(3)
  })
})
