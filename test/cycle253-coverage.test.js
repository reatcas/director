// cycle253-coverage.test.js — C253 quality_tests coverage
// T-173: S-103 lifecycleAdd type whitelist source + known types set
// T-174: S-104 atrilesSave element name guard + S-105 aiSelect provider whitelist source
// T-175: P-80 getSampleHistory fast-path source + F-31 _pbadgeEl lazy-init in paint()+clearProject()
// T-176: BL-26 _lastPersistEvCount skip-write source + B-34 _analyzeCache.delete in orchestra:clearLog

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs   = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs  = readFileSync(join(root, 'renderer.js'), 'utf8')
const schedulerJs = readFileSync(join(root, 'resource-scheduler.js'), 'utf8')
const mainJs      = readFileSync(join(root, 'main.js'), 'utf8')
const coordJs     = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')

// ─── T-173: S-103 — lifecycleAdd type whitelist ───────────────────────────────
describe('T-173: S-103 lifecycleAdd type whitelist', () => {
  it('lifecycleAdd source contains new Set whitelist', () => {
    const body = preloadJs.split('lifecycleAdd:')[1]?.split('// Telemetry')[0] || ''
    expect(body).toContain('new Set(')
    expect(body).toContain('.has(t)')
  })

  it('lifecycleAdd whitelist includes usage_limit and cycle_close', () => {
    const body = preloadJs.split('lifecycleAdd:')[1]?.split('// Telemetry')[0] || ''
    expect(body).toContain("'usage_limit'")
    expect(body).toContain("'cycle_close'")
  })

  it('lifecycleAdd whitelist includes core event types', () => {
    const body = preloadJs.split('lifecycleAdd:')[1]?.split('// Telemetry')[0] || ''
    expect(body).toContain("'play'")
    expect(body).toContain("'commit'")
    expect(body).toContain("'error'")
    expect(body).toContain("'feature'")
  })

  it('lifecycleAdd returns false for unknown type via whitelist guard', () => {
    const body = preloadJs.split('lifecycleAdd:')[1]?.split('// Telemetry')[0] || ''
    const setIdx = body.indexOf('new Set(')
    const hasIdx = body.indexOf('.has(t)', setIdx)
    const resolveIdx = body.indexOf('Promise.resolve(false)', hasIdx)
    expect(setIdx).toBeGreaterThan(-1)
    expect(hasIdx).toBeGreaterThan(setIdx)
    expect(resolveIdx).toBeGreaterThan(hasIdx)
  })
})

// ─── T-174: S-104 + S-105 — atrilesSave name guard + aiSelect whitelist ──────
describe('T-174: S-104 atrilesSave element name guard', () => {
  it('atrilesSave has typeof el.name !== string check', () => {
    const body = preloadJs.split('atrilesSave:')[1]?.split('// Alert')[0] || ''
    expect(body).toContain("typeof el.name !== 'string'")
  })

  it('atrilesSave rejects empty names (length === 0)', () => {
    const body = preloadJs.split('atrilesSave:')[1]?.split('// Alert')[0] || ''
    expect(body).toContain('el.name.length === 0')
  })

  it('atrilesSave caps name length at 256', () => {
    const body = preloadJs.split('atrilesSave:')[1]?.split('// Alert')[0] || ''
    expect(body).toContain('el.name.length > 256')
  })
})

describe('T-174: S-105 aiSelect provider whitelist', () => {
  it('aiSelect source contains new Set with known providers', () => {
    const body = preloadJs.split('aiSelect:')[1]?.split('aiLogin:')[0] || ''
    expect(body).toContain("new Set(['claude', 'agy', 'codex', 'aider'])")
    expect(body).toContain('.has(id)')
  })

  it('aiSelect whitelist returns Unknown AI error on rejection', () => {
    const body = preloadJs.split('aiSelect:')[1]?.split('aiLogin:')[0] || ''
    const setIdx = body.indexOf("new Set(['claude'")
    const errorIdx = body.indexOf("'Unknown AI'", setIdx)
    expect(setIdx).toBeGreaterThan(-1)
    expect(errorIdx).toBeGreaterThan(setIdx)
  })
})

// ─── T-175: P-80 getSampleHistory + F-31 _pbadgeEl ──────────────────────────
describe('T-175: P-80 getSampleHistory fast-path', () => {
  it('getSampleHistory avoids slice when limit >= history.length', () => {
    const body = schedulerJs.split('getSampleHistory(dir, limit) {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('limit < history.length')
  })

  it('getSampleHistory returns full array reference when limit not provided', () => {
    const { ResourceScheduler } = require(join(root, 'resource-scheduler.js'))
    const rs = new ResourceScheduler()
    const dir = '/fake/dir'
    const data = [1, 2, 3]
    rs.samples.set(dir, data)
    const result = rs.getSampleHistory(dir)
    expect(result).toBe(data)
  })

  it('getSampleHistory returns same reference when limit equals length', () => {
    const { ResourceScheduler } = require(join(root, 'resource-scheduler.js'))
    const rs = new ResourceScheduler()
    const dir = '/fake/dir2'
    const data = [10, 20, 30]
    rs.samples.set(dir, data)
    const result = rs.getSampleHistory(dir, 3)
    expect(result).toBe(data)
  })

  it('getSampleHistory slices when limit < history.length', () => {
    const { ResourceScheduler } = require(join(root, 'resource-scheduler.js'))
    const rs = new ResourceScheduler()
    const dir = '/fake/dir3'
    rs.samples.set(dir, [1, 2, 3, 4, 5])
    const result = rs.getSampleHistory(dir, 2)
    expect(result).toEqual([4, 5])
    expect(result.length).toBe(2)
  })
})

describe('T-175: F-31 _pbadgeEl lazy-init in paint() and clearProject', () => {
  it('renderer.js declares _pbadgeEl as module-level null', () => {
    expect(rendererJs).toContain('let _pbadgeEl = null')
  })

  it('paint() uses _pbadgeEl lazy-init pattern', () => {
    const body = rendererJs.split('function paint() {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("if (!_pbadgeEl) _pbadgeEl = $('#pbadge')")
  })

  it('_pbadgeEl lazy-init appears in multiple functions (paint + clearProject)', () => {
    const count = (rendererJs.match(/if \(!_pbadgeEl\) _pbadgeEl = /g) || []).length
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

// ─── T-176: BL-26 _lastPersistEvCount + B-34 _analyzeCache.delete ────────────
describe('T-176: BL-26 _lastPersistEvCount skip-write guard', () => {
  it('persistTelemetry checks events.length === _lastPersistEvCount for early exit', () => {
    const body = coordJs.split('persistTelemetry(dir) {')[1]?.split('  cleanup(dir) {')[0] || ''
    expect(body).toContain('this.events.length === this._lastPersistEvCount')
  })

  it('persistTelemetry updates _lastPersistEvCount after successful write', () => {
    const body = coordJs.split('persistTelemetry(dir) {')[1]?.split('  cleanup(dir) {')[0] || ''
    expect(body).toContain('this._lastPersistEvCount = this.events.length')
  })

  it('CoordinationProtocol constructor initializes _lastPersistEvCount to 0', () => {
    const { CoordinationProtocol } = require(join(root, 'coordination-protocol.js'))
    const cp = new CoordinationProtocol()
    expect(cp._lastPersistEvCount).toBe(0)
  })

  it('persistTelemetry skips write when event count unchanged', () => {
    const { CoordinationProtocol } = require(join(root, 'coordination-protocol.js'))
    const cp = new CoordinationProtocol()
    cp.events.push({ type: 'test' })
    cp._lastPersistEvCount = 1  // pretend we just persisted
    // Should return early without throwing (no dir exists)
    expect(() => cp.persistTelemetry('/nonexistent')).not.toThrow()
  })
})

describe('T-176: B-34 _analyzeCache.delete in orchestra:clearLog', () => {
  it('orchestra:clearLog handler deletes _analyzeCache entry', () => {
    const body = mainJs.split("'orchestra:clearLog'")[1]?.split("ipcMain.handle('")[0] || ''
    expect(body).toContain('_analyzeCache.delete(dir)')
  })

  it('_analyzeCache.delete appears before log file truncation in clearLog', () => {
    const body = mainJs.split("'orchestra:clearLog'")[1]?.split("ipcMain.handle('")[0] || ''
    const cacheIdx = body.indexOf('_analyzeCache.delete(dir)')
    const logIdx   = body.indexOf('orchestra-stdout.log')
    expect(cacheIdx).toBeGreaterThan(-1)
    expect(logIdx).toBeGreaterThan(-1)
    expect(cacheIdx).toBeLessThan(logIdx)
  })
})
