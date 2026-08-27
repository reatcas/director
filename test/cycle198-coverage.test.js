import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('system:kill-proc PID bounds (S-33)', () => {
  const block = mainJs.split("'system:kill-proc'")[1]?.split("ipcMain.handle")[0] || ''

  it('rejects pid < 2 (protects PID 1/launchd)', () => {
    expect(block).toContain('pid < 2')
  })

  it('rejects pid > 4_194_304 upper bound', () => {
    expect(block).toContain('4_194_304')
  })

  it('still rejects own process pid', () => {
    expect(block).toContain('pid === process.pid')
  })
})

describe('orchestra:writeConfig _VALID_CATS focus key check (S-34)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split("'mixer:saved:list'")[0] || ''

  it('rejects unknown focus keys via _VALID_CATS', () => {
    expect(block).toContain('_VALID_CATS.has(k)')
    expect(block).toContain('return false')
  })
})

describe('_piStaticCache 30s TTL for projectInfo (P-35)', () => {
  const block = mainJs.split('const _piStaticCache')[1]?.split('function isRunning')[0] || ''

  it('declares _piStaticCache as Map', () => {
    expect(mainJs).toContain('const _piStaticCache = new Map()')
  })

  it('uses 30_000 TTL for static cache', () => {
    expect(block).toContain('30_000')
  })

  it('caches installed, version, hasLogs', () => {
    expect(block).toContain('installed')
    expect(block).toContain('version')
    expect(block).toContain('hasLogs')
    expect(block).toContain('_piStaticCache.set')
  })

  it('evicts _piStaticCache in periodic sweep', () => {
    const sweep = mainJs.split('}, _METRICS_EVICT_AGE).unref()')[0]?.split('setInterval(() => {').pop() || ''
    expect(sweep).toContain('_piStaticCache')
    expect(sweep).toContain('30_000')
  })

  it('deletes _piStaticCache on project removal', () => {
    const remove = mainJs.split("'repertoire:remove'")[1]?.split("'repertoire:open'")[0] || ''
    expect(remove).toContain('_piStaticCache.delete(dir)')
  })
})

describe('mixer:history limit tightened to 100 (I-578)', () => {
  const block = mainJs.split("'mixer:history'")[1]?.split("'mixer:saved:list'")[0] || ''

  it('caps limit at 100', () => {
    expect(block).toContain('Math.min(limit, 100)')
  })
})

describe('readOrchJson only caches on successful file read (D-08)', () => {
  const block = mainJs.split('function readOrchJson')[1]?.split('\nfunction ')[0] || ''

  it('validates parsed result is a non-null object before caching', () => {
    expect(block).toMatch(/_parsed !== null.*typeof _parsed.*object|typeof _parsed.*object.*_parsed !== null/)
  })

  it('only caches when parse yields valid object', () => {
    expect(block).toContain('_orchJsonCache.set')
  })
})
