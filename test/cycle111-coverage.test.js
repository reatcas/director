import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('aiState cache (I-176)', () => {
  it('defines _aiStateCache variable', () => {
    expect(mainJs).toContain('let _aiStateCache = null')
  })

  it('defines _aiStateCacheTs variable', () => {
    expect(mainJs).toContain('let _aiStateCacheTs = 0')
  })

  it('defines _AI_STATE_TTL constant', () => {
    expect(mainJs).toContain('const _AI_STATE_TTL = 5_000')
  })

  it('invalidateAiStateCache resets both cache and timestamp', () => {
    const fn = mainJs.split('function invalidateAiStateCache')[1]?.split('\n')[0] || ''
    expect(fn).toContain('_aiStateCache = null')
    expect(fn).toContain('_aiStateCacheTs = 0')
  })

  it('aiState() returns cache hit when within TTL', () => {
    const block = mainJs.split('function aiState()')[1]?.split('\n').slice(0, 8).join('\n') || ''
    expect(block).toContain('_aiStateCache')
    expect(block).toContain('_AI_STATE_TTL')
    expect(block).toContain('return _aiStateCache')
  })

  it('aiState() stores result in cache on miss', () => {
    const block = mainJs.split('function aiState()')[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_aiStateCache = state')
    expect(block).toContain('_aiStateCacheTs = now')
  })
})

describe('aiState invalidation coverage (I-179)', () => {
  it('invalidates cache after ai:select writes state', () => {
    const block = mainJs.split("'ai:select'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('invalidateAiStateCache()')
  })

  it('invalidates cache after orchestra:play writes state', () => {
    const block = mainJs.split("'orchestra:play'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('invalidateAiStateCache()')
  })

  it('invalidates cache when aiState itself detects dirty state', () => {
    const aiBlock = mainJs.split('function aiState()')[1]?.split('\n').slice(0, 30).join('\n') || ''
    expect(aiBlock).toContain('invalidateAiStateCache()')
  })

  it('invalidateAiStateCache is defined before use', () => {
    const defIdx = mainJs.indexOf('function invalidateAiStateCache')
    const aiStateIdx = mainJs.indexOf('function aiState()')
    expect(defIdx).toBeLessThan(aiStateIdx)
  })
})

describe('_lifecycleDirReady cleanup in repertoire:remove (I-178)', () => {
  const block = mainJs.split("'repertoire:remove'")[1]?.split('\nipcMain')[0] || ''

  it('computes lcLogDir path', () => {
    expect(block).toContain('lcLogDir')
  })

  it('deletes from _lifecycleDirReady Set', () => {
    expect(block).toContain('_lifecycleDirReady.delete(lcLogDir)')
  })

  it('_lifecycleDirReady is a Set', () => {
    expect(mainJs).toContain('const _lifecycleDirReady = new Set()')
  })

  it('lcLogDir uses .claude/logs path segment', () => {
    expect(block).toContain("'.claude'")
    expect(block).toContain("'logs'")
  })
})

describe('atriles:save entry validation (I-177)', () => {
  const block = mainJs.split("'atriles:save'")[1]?.split('\nipcMain')[0] || ''

  it('validates name length >0 and <=256', () => {
    expect(block).toContain('a.name.length > 0')
    expect(block).toContain('a.name.length <= 256')
  })

  it('validates path length >0 and <=4096', () => {
    expect(block).toContain('a.path.length > 0')
    expect(block).toContain('a.path.length <= 4096')
  })

  it('enforces max 200 entries', () => {
    expect(block).toContain('atriles.length > 200')
  })

  it('validates all entries in array (loop check)', () => {
    expect(block).toContain('every(')
  })
})
