import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('blueprint:readiness cache', () => {
  it('defines _readinessCache as Map', () => {
    expect(mainJs).toContain('const _readinessCache = new Map()')
  })

  it('checks TTL of 5000ms before returning cached value', () => {
    const block = mainJs.split("'blueprint:readiness'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('5_000')
    expect(block).toContain('_readinessCache.get(dir)')
  })

  it('stores result with timestamp', () => {
    const block = mainJs.split("'blueprint:readiness'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_readinessCache.set(dir,')
    expect(block).toContain('ts: now')
  })

  it('returns cached val when within TTL', () => {
    const block = mainJs.split("'blueprint:readiness'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('cached.val')
    expect(block).toContain('cached.ts')
  })

  it('blueprint:save invalidates readiness cache', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_readinessCache.delete(dir)')
  })
})

describe('metrics IPC cache', () => {
  it('defines _metricsCache as Map', () => {
    expect(mainJs).toContain('const _metricsCache = new Map()')
  })

  it('defines TTL constant of 2000ms', () => {
    expect(mainJs).toContain('_METRICS_TTL = 2_000')
  })

  it('metricsGet returns null on miss', () => {
    const fn = mainJs.split('function metricsGet')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('_metricsCache.get(key)')
    expect(fn).toContain('null')
  })

  it('metricsSet stores value with timestamp', () => {
    const fn = mainJs.split('function metricsSet')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('ts: Date.now()')
    expect(fn).toContain('_metricsCache.set(key,')
  })

  it('metrics:resource uses cache key with dir', () => {
    const block = mainJs.split("'metrics:resource'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("'resource:' + dir")
    expect(block).toContain('metricsGet(')
    expect(block).toContain('metricsSet(')
  })

  it('metrics:context uses cache key with dir', () => {
    const block = mainJs.split("'metrics:context'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("'context:' + dir")
    expect(block).toContain('metricsGet(')
    expect(block).toContain('metricsSet(')
  })
})

describe('orchestra:clearLog analysis pruning', () => {
  it('reads .claude directory for analysis-*.txt files', () => {
    const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("'analysis-'")
    expect(block).toContain(".endsWith('.txt')")
    expect(block).toContain('readdirSync')
  })

  it('keeps only 5 most recent analysis files', () => {
    const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('files.length > 5')
    expect(block).toContain('files.length - 5')
  })

  it('sorts files before pruning oldest', () => {
    const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('files.sort()')
    expect(block).toContain('unlinkSync')
  })

  it('wraps pruning in try-catch', () => {
    const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''
    const tryCount = (block.match(/\btry\b/g) || []).length
    expect(tryCount).toBeGreaterThanOrEqual(2)
  })
})

describe('snapshotMixer history cap', () => {
  it('caps mixer-history.json at 100 entries', () => {
    const fn = mainJs.split('function snapshotMixer')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('hist.length > 100')
    expect(fn).toContain('hist.length - 100')
  })

  it('splices from front to remove oldest entries', () => {
    const fn = mainJs.split('function snapshotMixer')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('splice(0,')
  })
})

describe('blueprint:save data validation', () => {
  it('rejects null data', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('!data')
  })

  it('rejects non-object data', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("typeof data !== 'object'")
  })

  it('rejects arrays', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('Array.isArray(data)')
  })

  it('enforces 512KB size limit', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('512_000')
    expect(block).toContain('serialized.length >')
  })

  it('round-trips through JSON.parse to strip non-serializable values', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('JSON.parse(serialized)')
  })
})
