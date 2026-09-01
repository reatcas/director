// cycle264-coverage.test.js — C264 quality_tests coverage
// T-201: S-128 _logoCache+_piStaticCache size caps; S-129 _orchJsonCache+_readinessCache size caps
// T-202: P-92 snapshotMixer for...of focus filter; B-46 metrics:resource focus filtering
// T-203: F-43 clearLogBtn+removeBtn _logEl lazy-init

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-201: S-128 + S-129 cache size caps ─────────────────────────────────────
describe('T-201: S-128 _logoCache has size cap before .set()', () => {
  it('cachedFindLogo caps _logoCache at 100', () => {
    const body = mainJs.split('function cachedFindLogo(dir) {')[1]?.split('\n}')[0] || ''
    expect(body).toContain('_logoCache.size >= 100')
    expect(body).toContain('_logoCache.delete(_logoCache.keys().next().value)')
  })
})

describe('T-201: S-128 _piStaticCache has size cap before .set()', () => {
  it('projectInfo caps _piStaticCache at 100', () => {
    const body = mainJs.split('function projectInfo(dir) {')[1]?.split('\n}')[0] || ''
    expect(body).toContain('_piStaticCache.size >= 100')
    expect(body).toContain('_piStaticCache.delete(_piStaticCache.keys().next().value)')
  })
})

describe('T-201: S-129 _orchJsonCache has size cap before .set()', () => {
  it('readOrchJson caps _orchJsonCache at 200', () => {
    const body = mainJs.split('function readOrchJson(')[1]?.split('\n}')[0] || ''
    expect(body).toContain('_orchJsonCache.size >= 200')
    expect(body).toContain('_orchJsonCache.delete(_orchJsonCache.keys().next().value)')
  })
})

describe('T-201: S-129 _readinessCache has size cap before .set()', () => {
  it('blueprint:readiness caps _readinessCache at 100', () => {
    const body = mainJs.split("'blueprint:readiness'")[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('_readinessCache.size >= 100')
    expect(body).toContain('_readinessCache.delete(_readinessCache.keys().next().value)')
  })
})

// ─── T-202: P-92 + B-46 ──────────────────────────────────────────────────────
describe('T-202: P-92 snapshotMixer uses for...of for focus filtering', () => {
  it('snapshotMixer uses for...of loop with _ssFocus', () => {
    const body = mainJs.split('function snapshotMixer(')[1]?.split('\n}')[0] || ''
    expect(body).toContain('for (const [k, v] of Object.entries(cfg.focus))')
    expect(body).toContain('_ssFocus[k] = v')
  })

  it('snapshotMixer no longer uses Object.fromEntries+filter chain', () => {
    const body = mainJs.split('function snapshotMixer(')[1]?.split('\n}')[0] || ''
    expect(body).not.toContain('Object.fromEntries(Object.entries(cfg.focus).filter')
  })
})

describe('T-202: B-46 metrics:resource applies focus filtering before computeAllocation', () => {
  it('metrics:resource uses _mrFocus filtered for...of loop', () => {
    const body = mainJs.split("'metrics:resource'")[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('const _mrFocus = {}')
    expect(body).toContain('for (const [k, v] of Object.entries(cfg.focus))')
    expect(body).toContain('_mrFocus[k] = v')
  })

  it('metrics:resource passes _mrFocus not raw cfg.focus to computeAllocation', () => {
    const body = mainJs.split("'metrics:resource'")[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('scheduler.computeAllocation(dir, _mrFocus)')
  })
})

// ─── T-203: F-43 _logEl lazy-init in event handlers ──────────────────────────
describe('T-203: F-43 clearLogBtn+removeBtn handlers use _logEl lazy-init', () => {
  it('renderer has _logEl lazy-init+innerHTML clear in module-level handlers (×2)', () => {
    const matches = rendererJs.match(/if \(!_logEl\) _logEl = \$\('#log'\); if \(_logEl\) _logEl\.innerHTML = ''/g) || []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  it('clearLogBtn area no longer uses bare $() log check', () => {
    const body = rendererJs.split('clearLog(current)')[0]?.split('clearLogBtn').pop() || ''
    expect(body).not.toContain("if ($('#log')) $('#log').innerHTML")
  })

  it('removeBtn area no longer uses bare $() log check', () => {
    const body = rendererJs.split("'#openFolderBtn'")[0]?.split("'#removeBtn'").pop() || ''
    expect(body).not.toContain("if ($('#log')) $('#log').innerHTML")
  })
})
