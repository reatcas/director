import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('blueprint:save sessions per-item validation (S-01)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})')[0] || ''

  it('rejects sessions items that are not plain objects', () => {
    expect(block).toContain('data.sessions.some(s => !s || typeof s !== \'object\' || Array.isArray(s)')
  })

  it('rejects sessions items with started string longer than 64 chars', () => {
    expect(block).toContain('s.started !== undefined')
    expect(block).toContain('s.started.length > 64')
  })
})

describe('mixer:saved:list Array.isArray guard (S-02)', () => {
  const block = mainJs.split("'mixer:saved:list'")[1]?.split('\n})')[0] || ''

  it('guards userMixes with Array.isArray before use', () => {
    expect(block).toContain('if (!Array.isArray(userMixes)) userMixes = []')
  })

  it('filters out non-object items from userMixes', () => {
    expect(block).toContain('userMixes.filter(m => m && typeof m === \'object\' && !Array.isArray(m))')
  })
})

describe('snapshotMixer Array.isArray guard (I-527)', () => {
  const block = mainJs.split('function snapshotMixer')[1]?.split('\n}')[0] || ''

  it('guards hist with Array.isArray before filter call', () => {
    expect(block).toContain('if (!Array.isArray(hist)) hist = []')
  })
})

describe('importMixesBtn Array.isArray guard (I-528)', () => {
  it('stores raw mixes in _rawMixes before Array.isArray check', () => {
    expect(rendererJs).toContain('_rawMixes')
  })

  it('guards mixes with Array.isArray before for..of', () => {
    expect(rendererJs).toContain('const mixes = Array.isArray(_rawMixes) ? _rawMixes : []')
  })
})
