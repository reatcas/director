import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('_atrilesCache 60s TTL eviction (P-52)', () => {
  it('defines _atrilesCacheTs variable', () => {
    expect(mainJs).toContain('let _atrilesCacheTs = 0')
  })

  it('defines _ATRILES_TTL constant of 60_000', () => {
    expect(mainJs).toContain('const _ATRILES_TTL = 60_000')
  })

  it('atriles:list checks TTL before returning cache', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_atrilesCacheTs')
    expect(block).toContain('_ATRILES_TTL')
  })

  it('atriles:list sets _atrilesCacheTs on cache miss', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_atrilesCacheTs = Date.now()')
  })

  it('atriles:save refreshes _atrilesCacheTs', () => {
    const block = mainJs.split("'atriles:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_atrilesCacheTs = Date.now()')
  })
})

describe('lifecycle:list 2s TTL cache per-dir (P-53)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split("'lifecycle:add'")[0] || ''

  it('builds cache key with dir and limit', () => {
    expect(block).toContain("'lc:' + dir + ':' + _llLimit")
  })

  it('calls metricsGet for cache hit check', () => {
    expect(block).toContain('metricsGet(_lcKey)')
  })

  it('calls metricsSet to store result', () => {
    expect(block).toContain('metricsSet(_lcKey,')
  })
})

describe('orchestra:hotReload version-check cache eviction (I-590)', () => {
  it('deletes version-check cache for each project on hotReload', () => {
    const block = mainJs.split('function hotReloadAllProjects')[1]?.split('\n// ─')[0] || ''
    expect(block).toContain("_metricsCache.delete('version-check:' + p.path)")
  })
})

describe('ai:select evicts session-summary cache (BL-08)', () => {
  const block = mainJs.split("'ai:select'")[1]?.split('\nipcMain')[0] || ''

  it('deletes session-summary from metricsCache after select', () => {
    expect(block).toContain("_metricsCache.delete('session-summary')")
  })
})

describe('sessionSummary worst compliance score display (FE-07)', () => {
  it('reads worstCompliance score from session summary', () => {
    expect(rendererJs).toContain('worstCompliance?.score')
  })

  it('renders compliance ss-item in panel', () => {
    expect(rendererJs).toContain('compliance')
    expect(rendererJs).toContain('worstScore')
  })
})

describe('sessionSummary tabindex keyboard focus (A-21)', () => {
  it('sets tabindex=0 on sessionSummary element', () => {
    expect(rendererJs).toContain("setAttribute('tabindex', '0')")
  })
})

describe('repertoire:remove non-empty string validation (D-15)', () => {
  const block = mainJs.split("'repertoire:remove'")[1]?.split('\nipcMain')[0] || ''

  it('rejects empty string dir', () => {
    expect(block).toContain('dir.length === 0')
  })

  it('combines type check and empty check in single guard', () => {
    expect(block).toMatch(/typeof dir !== 'string' \|\| dir\.length === 0/)
  })
})
