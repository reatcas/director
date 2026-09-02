// cycle306-coverage.test.js — C306 quality coverage
// T-297: S-186 mixer:saved:list name strip; S-187 mixer:history ts strip
// T-298: P-121 [0,1] spark loop; B-75 Object.entries mixer:read
// T-299: F-72 Array.from spark emit in mixer-graph

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const graphJs    = readFileSync(join(root, 'mixer-graph.js'), 'utf8')

// ─── T-297: S-186 + S-187 ────────────────────────────────────────────────────
describe('T-297: S-186 mixer:saved:list strips ctrl-chars from m.name in _umFiltered', () => {
  it('pushes spread mix with stripped name into _umFiltered', () => {
    const block = mainJs.split("'mixer:saved:list'")[1]?.split("'mixer:saved:save'")[0] || ''
    expect(block).toContain('name: m.name.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\')')
  })

  it('no longer pushes raw m into _umFiltered', () => {
    const block = mainJs.split("'mixer:saved:list'")[1]?.split("'mixer:saved:save'")[0] || ''
    expect(block).not.toContain('_umFiltered.push(m)')
  })
})

describe('T-297: S-187 mixer:history strips ctrl-chars from h.ts and h.event in _mhFiltered', () => {
  it('strips h.ts with narrow ctrl-char replace', () => {
    const block = mainJs.split("'mixer:history'")[1]?.split("'metrics:session-summary'")[0] || ''
    expect(block).toContain('ts: h.ts.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\')')
  })

  it('still strips h.event alongside h.ts', () => {
    const block = mainJs.split("'mixer:history'")[1]?.split("'metrics:session-summary'")[0] || ''
    expect(block).toContain('event: h.event.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\')')
  })
})

// ─── T-298: P-121 + B-75 ─────────────────────────────────────────────────────
describe('T-298: P-121 standSparkInterval uses for(const _ of [0,1]) instead of for(let i=0;i<2;i++)', () => {
  it('uses for-of [0, 1] literal for spark emit', () => {
    expect(rendererJs).toContain('for (const _ of [0, 1])')
  })

  it('no longer uses for(let i=0;i<2;i++) in spark interval', () => {
    expect(rendererJs).not.toContain('for (let i = 0; i < 2; i++)')
  })
})

describe('T-298: B-75 mixer:read uses Object.entries to eliminate double-indexing cfg.focus[k]', () => {
  it('uses for(const [k, v] of Object.entries(cfg.focus))', () => {
    const block = mainJs.split("'mixer:read'")[1]?.split("const _VALID_CATS")[0] || ''
    expect(block).toContain('for (const [k, v] of Object.entries(cfg.focus))')
  })

  it('uses v directly instead of cfg.focus[k]', () => {
    const block = mainJs.split("'mixer:read'")[1]?.split("const _VALID_CATS")[0] || ''
    expect(block).toContain('Number.isFinite(v)) _mrFocus[k] = v')
  })

  it('no longer uses Object.keys(cfg.focus) in mixer:read', () => {
    const block = mainJs.split("'mixer:read'")[1]?.split("const _VALID_CATS")[0] || ''
    expect(block).not.toContain('Object.keys(cfg.focus)')
  })
})

// ─── T-299: F-72 ─────────────────────────────────────────────────────────────
describe('T-299: F-72 mixer-graph spark emit uses Array.from({length: count}) instead of for(let i=0;i<count;i++)', () => {
  it('uses Array.from({length: count}) for spark emit loop', () => {
    expect(graphJs).toContain('for (const _ of Array.from({length: count}))')
  })

  it('no longer uses for(let i=0;i<count;i++) for spark emit', () => {
    expect(graphJs).not.toContain('for (let i = 0; i < count; i++)')
  })
})
