import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('metricsSet validates TTL is positive finite (S-61)', () => {
  it('guards TTL with Number.isFinite and positive check', () => {
    expect(mainJs).toContain('Number.isFinite(ttl) && ttl > 0')
  })

  it('falls back to _METRICS_TTL for invalid TTL', () => {
    const block = mainJs.split('function metricsSet')[1]?.split('\n')[0] || ''
    expect(block).toContain('_METRICS_TTL')
  })
})

describe('snapshotMixer strips control chars from event name (S-62)', () => {
  const block = mainJs.split('function snapshotMixer')[1]?.split('\n}')[0] || ''

  it('replaces control chars in _ssEvent', () => {
    expect(block).toContain('replace(/[\\x00-\\x1F\\x7F]/g')
  })
})

describe('mixer:write evicts mixer-hist cache (P-59)', () => {
  const block = mainJs.split("'mixer:write'")[1]?.split('\nipcMain')[0] || ''

  it('deletes mixer-hist keys for dir', () => {
    expect(block).toContain("k.startsWith('mixer-hist:' + dir + ':')")
  })
})

describe('orchestra:hotReload evicts lc: caches for all projects (I-594)', () => {
  const block = mainJs.split('function hotReloadAllProjects')[1]?.split('\n// ─')[0] || ''

  it('deletes lc:p.path keys during hot reload', () => {
    expect(block).toContain("k.startsWith('lc:' + p.path + ':')")
  })
})

describe('aiState() dirty: invalidateAiStateCache called unconditionally (BL-12)', () => {
  const block = mainJs.split('function aiState()')[1]?.split('\nipcMain')[0] || ''

  it('invalidateAiStateCache is called outside the size check', () => {
    const dirty = block.split('if (dirty)')[1]?.split('return state')[0] || ''
    expect(dirty).toContain('invalidateAiStateCache()')
  })
})
