// cycle262-coverage.test.js — C262 quality_tests coverage
// T-195: S-124 _worstComplianceCache size cap; S-125 _complianceMtimeCache size cap
// T-196: P-90 metrics:allocation for...of loop; B-44 orchestra:fine evictions
// T-197: F-41 loadLifecycleHistory _logEl lazy-init

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-195: S-124 + S-125 compliance cache size caps ─────────────────────────
describe('T-195: S-124 _worstComplianceCache has size cap before .set()', () => {
  it('metrics:compliance caps _worstComplianceCache at 200', () => {
    const body = mainJs.split('ipcMain.handle(\'metrics:compliance\'')[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('_worstComplianceCache.size >= 200')
    expect(body).toContain('_worstComplianceCache.delete(_worstComplianceCache.keys().next().value)')
  })

  it('metrics:session-summary caps _worstComplianceCache at 200', () => {
    const body = mainJs.split('\'metrics:session-summary\'')[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('_worstComplianceCache.size >= 200')
    expect(body).toContain('_worstComplianceCache.delete(_worstComplianceCache.keys().next().value)')
  })
})

describe('T-195: S-125 _complianceMtimeCache has size cap before .set()', () => {
  it('metrics:compliance caps _complianceMtimeCache at 200', () => {
    const body = mainJs.split('ipcMain.handle(\'metrics:compliance\'')[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('_complianceMtimeCache.size >= 200')
    expect(body).toContain('_complianceMtimeCache.delete(_complianceMtimeCache.keys().next().value)')
  })

  it('metrics:session-summary caps _complianceMtimeCache at 200', () => {
    const body = mainJs.split('\'metrics:session-summary\'')[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('_complianceMtimeCache.size >= 200')
    expect(body).toContain('_complianceMtimeCache.delete(_complianceMtimeCache.keys().next().value)')
  })
})

// ─── T-196: P-90 + B-44 ──────────────────────────────────────────────────────
describe('T-196: P-90 metrics:allocation uses for...of instead of filter+fromEntries', () => {
  it('metrics:allocation uses for...of loop for focus filtering', () => {
    const body = mainJs.split('ipcMain.handle(\'metrics:allocation\'')[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('for (const [k, v] of Object.entries(cfg.focus))')
  })

  it('metrics:allocation no longer uses Object.fromEntries+filter chain', () => {
    const body = mainJs.split('ipcMain.handle(\'metrics:allocation\'')[1]?.split('\nipcMain')[0] || ''
    expect(body).not.toContain('Object.fromEntries(Object.entries(cfg.focus).filter')
  })
})

describe('T-196: B-44 orchestra:fine evicts resource/allocation/snapshot caches', () => {
  const body = mainJs.split('ipcMain.handle(\'orchestra:fine\'')[1]?.split('\nipcMain')[0] || ''

  it('fine evicts resource cache', () => {
    expect(body).toContain("_metricsCache.delete('resource:' + dir)")
  })

  it('fine evicts allocation cache', () => {
    expect(body).toContain("_metricsCache.delete('allocation:' + dir)")
  })

  it('fine evicts snapshot cache', () => {
    expect(body).toContain("_metricsCache.delete('snapshot:' + dir)")
  })
})

// ─── T-197: F-41 loadLifecycleHistory _logEl lazy-init ───────────────────────
describe('T-197: F-41 loadLifecycleHistory uses _logEl lazy-init', () => {
  it('loadLifecycleHistory initialises _logEl at function top', () => {
    const body = rendererJs.split('async function loadLifecycleHistory()')[1]?.split('\nasync function ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
  })

  it('loadLifecycleHistory uses _logEl not bare $() for loop entry', () => {
    const body = rendererJs.split('async function loadLifecycleHistory()')[1]?.split('\nasync function ')[0] || ''
    expect(body).toContain('const logEl = _logEl')
  })

  it('loadLifecycleHistory does not do bare $() query inside loop', () => {
    const body = rendererJs.split('async function loadLifecycleHistory()')[1]?.split('\nasync function ')[0] || ''
    expect(body).not.toContain("const logEl = $('#log')")
  })
})
