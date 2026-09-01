// cycle249-coverage.test.js — C249 quality_tests coverage
// T-160: S-96 mixerSavedSave/Delete/Export typeof p guard source
// T-161: S-97 mixerWrite/configWrite/blueprintSave typeof p guard source
// T-162: S-98 notesWrite dir guard + readIterLog p guard source
// T-163: P-77 sampleProcess uses systemSnapshot().loadAvg1 source + cache integration
// T-164: B-31 _blueprintCache.delete on save + BL-24 _cachedConflicts=null in releaseLock

import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs  = readFileSync(join(root, 'preload.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const schedulerJs = readFileSync(join(root, 'resource-scheduler.js'), 'utf8')
const coordJs    = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')

// ─── T-160: S-96 — mixerSavedSave/Delete/Export typeof p guard ────────────────
describe('T-160: S-96 preload typeof p guard on mixer saved handlers', () => {
  it('mixerSavedSave has typeof p string guard before name/focus checks', () => {
    const body = preloadJs.split('mixerSavedSave')[1]?.split('mixerSavedDelete')[0] || ''
    expect(body).toContain("typeof p !== 'string' || !p")
    expect(body).toContain('Promise.resolve(false)')
    // p guard comes before n/f checks
    const pIdx = body.indexOf("typeof p !== 'string'")
    const nIdx = body.indexOf("typeof n !== 'string'")
    expect(pIdx).toBeLessThan(nIdx)
  })

  it('mixerSavedDelete has typeof p string guard before id check', () => {
    const body = preloadJs.split('mixerSavedDelete')[1]?.split('mixerSavedExport')[0] || ''
    expect(body).toContain("typeof p !== 'string' || !p")
    // p guard before id guard
    const pIdx = body.indexOf("typeof p !== 'string'")
    const idIdx = body.indexOf("typeof id !== 'string'")
    expect(pIdx).toBeLessThan(idIdx)
  })

  it('mixerSavedExport has typeof p string guard before id check', () => {
    const body = preloadJs.split('mixerSavedExport')[1]?.split('mixerHistory')[0] || ''
    expect(body).toContain("typeof p !== 'string' || !p")
    expect(body).toContain('Promise.resolve(null)')
    // p guard before id guard
    const pIdx = body.indexOf("typeof p !== 'string'")
    const idIdx = body.indexOf("typeof id !== 'string'")
    expect(pIdx).toBeLessThan(idIdx)
  })
})

// ─── T-161: S-97 — mixerWrite/configWrite/blueprintSave typeof p guard ─────────
describe('T-161: S-97 preload typeof p guard on write handlers', () => {
  it('mixerWrite has typeof p guard before object guard', () => {
    const body = preloadJs.split('mixerWrite:')[1]?.split('configWrite:')[0] || ''
    expect(body).toContain("typeof p !== 'string' || !p")
    const pIdx = body.indexOf("typeof p !== 'string'")
    const fIdx = body.indexOf('typeof f')
    expect(pIdx).toBeLessThan(fIdx)
  })

  it('configWrite has typeof p guard before object guard', () => {
    const body = preloadJs.split('configWrite:')[1]?.split('analyze:')[0] || ''
    expect(body).toContain("typeof p !== 'string' || !p")
    const pIdx = body.indexOf("typeof p !== 'string'")
    const cIdx = body.indexOf('typeof c')
    expect(pIdx).toBeLessThan(cIdx)
  })

  it('blueprintSave has typeof p guard before data object guard', () => {
    const body = preloadJs.split('blueprintSave:')[1]?.split('blueprintGenerate:')[0] || ''
    expect(body).toContain("typeof p !== 'string' || !p")
    const pIdx = body.indexOf("typeof p !== 'string'")
    const dIdx = body.indexOf('typeof d')
    expect(pIdx).toBeLessThan(dIdx)
  })
})

// ─── T-162: S-98 — notesWrite dir guard + readIterLog p guard ────────────────
describe('T-162: S-98 preload typeof dir/p guard on notes and iterLog', () => {
  it('notesWrite has typeof dir guard before content length check', () => {
    const body = preloadJs.split('notesWrite:')[1]?.split('onLine:')[0] || ''
    expect(body).toContain("typeof dir !== 'string' || !dir")
    expect(body).toContain('Promise.resolve(false)')
    // dir guard before content check
    const dirIdx = body.indexOf("typeof dir !== 'string'")
    const cIdx = body.indexOf("typeof c !== 'string'")
    expect(dirIdx).toBeLessThan(cIdx)
  })

  it('readIterLog has typeof p guard before log path check', () => {
    const body = preloadJs.split('readIterLog:')[1]?.split('mixerSavedList:')[0] || ''
    expect(body).toContain("typeof p !== 'string' || !p")
    expect(body).toContain('Promise.resolve(\'\')')
    // p guard before l check
    const pIdx = body.indexOf("typeof p !== 'string'")
    const lIdx = body.indexOf("typeof l !== 'string'")
    expect(pIdx).toBeLessThan(lIdx)
  })
})

// ─── T-163: P-77 — sampleProcess uses systemSnapshot().loadAvg1 ───────────────
describe('T-163: P-77 sampleProcess uses cached systemSnapshot().loadAvg1', () => {
  it('sampleProcess uses this.systemSnapshot().loadAvg1 not os.loadavg()', () => {
    const body = schedulerJs.split('sampleProcess(')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('this.systemSnapshot().loadAvg1')
    expect(body).not.toContain('os.loadavg()[0]')
  })

  it('systemSnapshot caches result with 1s TTL', () => {
    const body = schedulerJs.split('systemSnapshot(')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('_sysSnapCache')
    expect(body).toContain('1000')
    expect(body).toContain('return this._sysSnapCache')
  })

  it('systemSnapshot() returns loadAvg1 key', () => {
    const { ResourceScheduler } = require(join(root, 'resource-scheduler.js'))
    const rs = new ResourceScheduler()
    const snap = rs.systemSnapshot()
    expect(typeof snap.loadAvg1).toBe('number')
    expect(snap.loadAvg1).toBeGreaterThanOrEqual(0)
  })

  it('sampleProcess loadAvg1 reuses cached snapshot within TTL', () => {
    const body = schedulerJs.split('sampleProcess(')[1]?.split('\n  }')[0] || ''
    // Should call this.systemSnapshot() (not os.loadavg()) so cache is reused
    const callCount = (body.match(/this\.systemSnapshot\(\)/g) || []).length
    expect(callCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── T-164: B-31 + BL-24 — cache invalidation on blueprint save and lock release ─
describe('T-164: B-31 _blueprintCache.delete + BL-24 _cachedConflicts=null', () => {
  it('B-31: blueprint:save handler deletes _blueprintCache entry on write', () => {
    const body = mainJs.split("'blueprint:save'")[1]?.split("'blueprint:generate-brief'")[0] || ''
    expect(body).toContain('_blueprintCache.delete(dir)')
    // cache delete before readiness cache delete
    const bpIdx = body.indexOf('_blueprintCache.delete(dir)')
    const rdIdx = body.indexOf('_readinessCache.delete(dir)')
    expect(bpIdx).toBeLessThan(rdIdx)
  })

  it('B-31: _blueprintCache.delete occurs after writeJSON in blueprint:save', () => {
    const body = mainJs.split("'blueprint:save'")[1]?.split("'blueprint:generate-brief'")[0] || ''
    const writeIdx = body.indexOf('writeJSON(p,')
    const deleteIdx = body.indexOf('_blueprintCache.delete(dir)')
    expect(writeIdx).toBeLessThan(deleteIdx)
  })

  it('BL-24: releaseLock sets _cachedConflicts=null on successful release', () => {
    const body = coordJs.split('releaseLock(')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('this._cachedConflicts = null')
    // conflict cache cleared before logEvent
    const ccIdx = body.indexOf('this._cachedConflicts = null')
    const logIdx = body.indexOf('this._logEvent(')
    expect(ccIdx).toBeLessThan(logIdx)
  })

  it('BL-24: releaseLock integration — detectConflicts() returns fresh result after release', () => {
    const { CoordinationProtocol } = require(join(root, 'coordination-protocol.js'))
    const cp = new CoordinationProtocol()
    cp.register('/a', 1, { avgIntensity: 80, categoryBudgets: { code: { weight: 80, hotPath: true } }, totalWeight: 80 })
    cp.register('/b', 2, { avgIntensity: 40, categoryBudgets: { code: { weight: 80, hotPath: true } }, totalWeight: 80 })
    cp.acquireLock('/a', 'gpu:0')

    // Populate conflict cache
    cp.detectConflicts()
    expect(cp._cachedConflicts).not.toBeNull()

    // Release should clear cache
    cp.releaseLock('/a', 'gpu:0')
    expect(cp._cachedConflicts).toBeNull()

    // Next detectConflicts() recomputes
    const conflicts = cp.detectConflicts()
    expect(Array.isArray(conflicts)).toBe(true)
    expect(cp._cachedConflicts).not.toBeNull()
  })
})
