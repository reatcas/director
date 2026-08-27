import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('orchestraSrc memoization', () => {
  it('defines _orchestraSrc cache variable', () => {
    expect(mainJs).toContain('let _orchestraSrc = null')
  })

  it('memoizes result on first call', () => {
    expect(mainJs).toContain('_orchestraSrc || (_orchestraSrc = path.join(')
  })

  it('returns path under resources/orchestra', () => {
    expect(mainJs).toContain("'resources', 'orchestra'")
  })
})

describe('atriles:list cache', () => {
  it('defines _atrilesCache variable', () => {
    expect(mainJs).toContain('let _atrilesCache = null')
  })

  it('returns cached value on subsequent calls', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_atrilesCache ||')
    expect(block).toContain('_atrilesCache =')
  })

  it('atriles:save updates cache on write', () => {
    const block = mainJs.split("'atriles:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_atrilesCache = atriles')
  })
})

describe('orchestra:writeConfig full validation', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('rejects null cfg', () => {
    expect(block).toContain('!cfg')
  })

  it('rejects non-object cfg', () => {
    expect(block).toContain("typeof cfg !== 'object'")
  })

  it('rejects array cfg', () => {
    expect(block).toContain('Array.isArray(cfg)')
  })

  it('enforces 64KB size limit', () => {
    expect(block).toContain('65_536')
  })

  it('validates focus weight range 0-100', () => {
    expect(block).toContain('w >= 0 && w <= 100')
  })

  it('round-trips through JSON.parse', () => {
    expect(block).toContain('JSON.parse(serialized)')
  })
})

describe('repertoire:remove cache eviction', () => {
  const block = mainJs.split("'repertoire:remove'")[1]?.split('\nipcMain')[0] || ''

  it('invalidates projects cache', () => {
    expect(block).toContain('invalidateProjectsCache()')
  })

  it('evicts metrics cache entries for removed dir', () => {
    expect(block).toContain('_metricsCache')
    expect(block).toContain('_metricsCache.delete(key)')
  })

  it('evicts readiness cache for removed dir', () => {
    expect(block).toContain('_readinessCache.delete(dir)')
  })
})

describe('mixer tabs aria attributes', () => {
  it('tab container has role=tablist', () => {
    expect(html).toContain('role="tablist"')
  })

  it('tab container has aria-label', () => {
    expect(html).toContain('aria-label="Paneles del mezclador"')
  })

  it('tab buttons have role=tab', () => {
    const tabRoles = (html.match(/role="tab"/g) || []).length
    expect(tabRoles).toBeGreaterThanOrEqual(4)
  })

  it('active tab has aria-selected=true', () => {
    expect(html).toContain('aria-selected="true"')
  })

  it('inactive tabs have aria-selected=false', () => {
    const falseCount = (html.match(/aria-selected="false"/g) || []).length
    expect(falseCount).toBeGreaterThanOrEqual(3)
  })

  it('tab buttons have aria-controls matching panel id', () => {
    expect(html).toContain('aria-controls="mixTab"')
    expect(html).toContain('aria-controls="bpTab"')
    expect(html).toContain('aria-controls="notesTab"')
  })
})
