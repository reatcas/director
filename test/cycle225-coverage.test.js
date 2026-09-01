import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT    = path.resolve(import.meta.dirname, '..')
const graphJs = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const htmlStr = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

// ─── A-30: #nodeGraphSection aria update ─────────────────────────────────────

describe('#nodeGraphSection role="img" for visual-only 3D canvas (A-30)', () => {
  const ngLine = htmlStr.split('\n').find(l => l.includes('id="nodeGraphSection"')) || ''

  it('uses role="img" instead of role="application"', () => {
    expect(ngLine).toContain('role="img"')
    expect(ngLine).not.toContain('role="application"')
  })

  it('retains tabindex="0" for keyboard focus', () => {
    expect(ngLine).toContain('tabindex="0"')
  })

  it('aria-label describes the graph purpose', () => {
    expect(ngLine).toContain('aria-label=')
    expect(ngLine).toContain('Grafo')
  })

  it('aria-label mentions 3D visualization', () => {
    expect(ngLine).toContain('3D')
  })

  it('aria-description guides users to mixer panel', () => {
    expect(ngLine).toContain('aria-description=')
    expect(ngLine).toContain('panel')
  })

  it('no longer has aria-roledescription (redundant with role="img")', () => {
    expect(ngLine).not.toContain('aria-roledescription')
  })
})

// ─── D-01: _rings cap at _MAX_RINGS ──────────────────────────────────────────

describe('_MAX_RINGS constant defined (D-01)', () => {
  it('defines _MAX_RINGS = 20', () => {
    expect(graphJs).toContain('const _MAX_RINGS = 20')
  })

  it('_MAX_RINGS appears before emitRing function', () => {
    const maxIdx  = graphJs.indexOf('const _MAX_RINGS = 20')
    const emitIdx = graphJs.indexOf('function emitRing')
    expect(maxIdx).toBeGreaterThan(-1)
    expect(emitIdx).toBeGreaterThan(maxIdx)
  })
})

describe('emitRing() caps _rings at _MAX_RINGS (D-01)', () => {
  const ringBlock = graphJs.split('function emitRing')[1]?.split('\n  function ')[0] || ''

  it('checks _rings.length >= _MAX_RINGS before pushing', () => {
    expect(ringBlock).toContain('_rings.length >= _MAX_RINGS')
  })

  it('evicts oldest ring with shift() when at cap', () => {
    expect(ringBlock).toContain('_rings.shift()')
  })

  it('removes evicted sprite from _pulseLayer', () => {
    const evictBlock = ringBlock.split('_rings.shift()')[1]?.split(';')[0] || ''
    expect(ringBlock).toContain('_pulseLayer.remove(old.sp)')
  })

  it('disposes evicted material to prevent WebGL memory leak', () => {
    expect(ringBlock).toContain('old.mat.dispose()')
  })

  it('cap check appears before adding new ring', () => {
    const capIdx  = ringBlock.indexOf('_rings.length >= _MAX_RINGS')
    const pushIdx = ringBlock.indexOf('_rings.push(')
    expect(capIdx).toBeGreaterThan(-1)
    expect(pushIdx).toBeGreaterThan(capIdx)
  })
})

// ─── D-01: _sparks cap at _MAX_SPARKS ────────────────────────────────────────

describe('_MAX_SPARKS constant defined (D-01)', () => {
  it('defines _MAX_SPARKS = 50', () => {
    expect(graphJs).toContain('const _MAX_SPARKS = 50')
  })

  it('_MAX_SPARKS appears near _MAX_RINGS', () => {
    const ringsIdx  = graphJs.indexOf('const _MAX_RINGS')
    const sparksIdx = graphJs.indexOf('const _MAX_SPARKS')
    expect(sparksIdx).toBeGreaterThan(-1)
    expect(Math.abs(ringsIdx - sparksIdx)).toBeLessThan(60)
  })
})

describe('emitSparks() caps _sparks at _MAX_SPARKS (D-01)', () => {
  const sparksBlock = graphJs.split('function emitSparks')[1]?.split('\n  function ')[0] || ''

  it('checks _sparks.length >= _MAX_SPARKS before adding spark', () => {
    expect(sparksBlock).toContain('_sparks.length >= _MAX_SPARKS')
  })

  it('evicts oldest spark with shift() when at cap', () => {
    expect(sparksBlock).toContain('_sparks.shift()')
  })

  it('removes evicted spark sprite from _pulseLayer', () => {
    expect(sparksBlock).toContain('_pulseLayer.remove(old.sp)')
  })

  it('disposes evicted spark material', () => {
    expect(sparksBlock).toContain('old.mat.dispose()')
  })

  it('cap check is inside the per-spark for loop', () => {
    const loopIdx = sparksBlock.indexOf('for (let i = 0')
    const capIdx  = sparksBlock.indexOf('_sparks.length >= _MAX_SPARKS')
    expect(loopIdx).toBeGreaterThan(-1)
    expect(capIdx).toBeGreaterThan(loopIdx)
  })
})

describe('ring and spark caps are independent constants (D-01)', () => {
  it('_MAX_RINGS and _MAX_SPARKS have different values', () => {
    expect(graphJs).toContain('const _MAX_RINGS = 20')
    expect(graphJs).toContain('const _MAX_SPARKS = 50')
  })

  it('emitRing uses _MAX_RINGS not _MAX_SPARKS', () => {
    const ringBlock = graphJs.split('function emitRing')[1]?.split('\n  function ')[0] || ''
    expect(ringBlock).toContain('_MAX_RINGS')
    expect(ringBlock).not.toContain('_MAX_SPARKS')
  })

  it('emitSparks uses _MAX_SPARKS not _MAX_RINGS', () => {
    const sparksBlock = graphJs.split('function emitSparks')[1]?.split('\n  function ')[0] || ''
    expect(sparksBlock).toContain('_MAX_SPARKS')
    expect(sparksBlock).not.toContain('_MAX_RINGS')
  })
})
