// cycle270-coverage.test.js — C270 quality coverage
// T-219: S-138 atrilesSave description/icon/color validation in preload
// T-220: S-139 mixerSavedSave name control-char; P-97 rebalanceMixer for...of
// T-221: B-51 clearLog forEach→for; F-48 renderSavedMixes for-of

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs  = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')

// ─── T-219: S-138 atrilesSave description/icon/color ─────────────────────────
describe('T-219: S-138 atrilesSave validates description, icon, color in preload', () => {
  it('validates el.description is string ≤1024 when present', () => {
    const block = preloadJs.split('atrilesSave:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('el.description !== undefined')
    expect(block).toContain('el.description.length > 1024')
  })

  it('validates el.icon is string ≤64 when present', () => {
    const block = preloadJs.split('atrilesSave:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('el.icon !== undefined')
    expect(block).toContain('el.icon.length > 64')
  })

  it('validates el.color is string ≤64 when present', () => {
    const block = preloadJs.split('atrilesSave:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('el.color !== undefined')
    expect(block).toContain('el.color.length > 64')
  })
})

// ─── T-220: S-139 + P-97 ─────────────────────────────────────────────────────
describe('T-220: S-139 mixerSavedSave rejects control chars in name', () => {
  it('has control-char regex test on name n', () => {
    const block = preloadJs.split('mixerSavedSave:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('/[\\x00-\\x1F\\x7F]/.test(n)')
  })

  it('returns false before ipcRenderer when name has control chars', () => {
    const block = preloadJs.split('mixerSavedSave:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('return Promise.resolve(false)')
  })
})

describe('T-220: P-97 rebalanceMixer uses for...of strips and indexed for loop for others', () => {
  it('uses for...of instead of strips.forEach', () => {
    expect(rendererJs).toContain('for (const s of strips)')
    const stripsForeach = rendererJs.split('rebalanceMixer')[1]?.split('\n}')[0] || ''
    expect(stripsForeach).not.toContain('strips.forEach')
  })

  it('uses indexed for loop for others (no others.forEach)', () => {
    expect(rendererJs).toContain('for (const [_ri, o] of others.entries())')
    const block = rendererJs.split('rebalanceMixer')[1]?.split('\n}')[0] || ''
    expect(block).not.toContain('others.forEach')
  })
})

// ─── T-221: B-51 + F-48 ──────────────────────────────────────────────────────
describe('T-221: B-51 clearLog uses for...of for analysis file prune', () => {
  it('uses for...of instead of forEach for analysis file deletion', () => {
    const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\n  }')[0] || ''
    expect(block).toContain('for (const f of files.slice(')
    expect(block).not.toContain('forEach(f =>')
  })
})

describe('T-221: F-48 renderSavedMixes uses for...of over mixes', () => {
  it('uses for...of instead of mixes.forEach', () => {
    expect(rendererJs).toContain('for (const m of mixes)')
    expect(rendererJs).not.toContain('mixes.forEach')
  })
})
