import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('orchestra:readIterLog security', () => {
  const block = mainJs.split("'orchestra:readIterLog'")[1]?.split('\nipcMain')[0] || ''

  it('uses isKnownProject guard (not bare !dir)', () => {
    expect(block).toContain('isKnownProject(dir)')
    expect(block).not.toMatch(/if \(!dir\)/)
  })

  it('validates logPath is a string', () => {
    expect(block).toContain("typeof logPath !== 'string'")
  })

  it('validates logPath is non-empty', () => {
    expect(block).toContain('logPath.trim()')
  })

  it('resolves full path before checking boundary', () => {
    expect(block).toContain('path.resolve(dir, logPath)')
    expect(block).toContain('startsWith(dir + path.sep)')
  })

  it('returns empty string on all guard failures', () => {
    const returns = (block.match(/return ''/g) || []).length
    expect(returns).toBeGreaterThanOrEqual(2)
  })
})

describe('mixer:saved:save input validation', () => {
  const block = mainJs.split("'mixer:saved:save'")[1]?.split('\nipcMain')[0] || ''

  it('uses isKnownProject guard', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('rejects non-string name', () => {
    expect(block).toContain("typeof name !== 'string'")
  })

  it('rejects empty name', () => {
    expect(block).toContain('name.length === 0')
  })

  it('enforces max name length of 256', () => {
    expect(block).toContain('name.length > 256')
  })

  it('rejects non-object focus', () => {
    expect(block).toContain("typeof focus !== 'object'")
    expect(block).toContain('Array.isArray(focus)')
  })

  it('trims name before persisting', () => {
    expect(block).toContain('name.trim()')
  })
})

describe('_metricsCache eviction', () => {
  it('defines eviction age constant', () => {
    expect(mainJs).toContain('_METRICS_EVICT_AGE = 30_000')
  })

  it('sets up interval for eviction', () => {
    expect(mainJs).toContain('setInterval(')
    expect(mainJs).toContain('_metricsCache.delete(k)')
  })

  it('unrefs interval to not block process exit', () => {
    expect(mainJs).toContain('.unref()')
  })

  it('evicts entries older than eviction age', () => {
    const evictBlock = mainJs.split('_METRICS_EVICT_AGE')[2] || ''
    expect(mainJs).toContain('v.ts < cutoff')
  })
})

describe('orchestra:install security', () => {
  const block = mainJs.split("'orchestra:install'")[1]?.split('\nipcMain')[0] || ''

  it('uses isKnownProject guard', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('returns null for unknown project', () => {
    expect(block).toContain('return null')
  })

  it('copies harness files after validation', () => {
    expect(block).toContain('copyDir(orchestraSrc(), dir)')
  })

  it('sets run.sh executable', () => {
    expect(block).toContain('run.sh')
    expect(block).toContain('0o755')
  })
})
