import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT    = path.resolve(import.meta.dirname, '..')
const graphJs = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const cssStr  = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

// ─── B-16: _sectionMap — O(1) section lookup ─────────────────────────────────

describe('_sectionMap state variable declared (B-16)', () => {
  it('declares _sectionMap as a new Map()', () => {
    expect(graphJs).toContain('_sectionMap = new Map()')
  })

  it('_sectionMap is declared in state block alongside _sections', () => {
    const stateBlock = graphJs.split('// ── State')[1]?.split('// ──')[0] || ''
    expect(stateBlock).toContain('_sectionMap')
    expect(stateBlock).toContain('_sections')
  })
})

describe('_sectionMap populated in init() (B-16)', () => {
  const initBlock = graphJs.split('function init')[1]?.split('\n  function ')[0] || ''

  it('init() iterates _sections with for-of to populate sectionMap', () => {
    expect(initBlock).toContain('for (const s of _sections)')
  })

  it('maps s[0] (key) to full section entry via Map.set', () => {
    expect(initBlock).toContain('_sectionMap.set(s[0], s)')
  })

  it('assignment target is _sectionMap', () => {
    expect(initBlock).toContain('_sectionMap = new Map')
  })

  it('populated after _sections is set', () => {
    const sectionsIdx = initBlock.indexOf('_sections  = sections')
    const mapIdx      = initBlock.indexOf('_sectionMap = new Map')
    expect(sectionsIdx).toBeGreaterThan(-1)
    expect(mapIdx).toBeGreaterThan(sectionsIdx)
  })
})

describe('_sectionMap cleared in destroy() (B-16)', () => {
  const destroyBlock = graphJs.split('function destroy')[1]?.split('\n  }')[0] || ''

  it('calls _sectionMap.clear()', () => {
    expect(destroyBlock).toContain('_sectionMap.clear()')
  })
})

describe('linkColorFn uses _sectionMap.get() not _sections.find() (B-16)', () => {
  const linkColorBlock = graphJs.split('function linkColorFn')[1]?.split('\n  function ')[0] || ''

  it('uses _sectionMap.get(tgt)', () => {
    expect(linkColorBlock).toContain('_sectionMap.get(tgt)')
  })

  it('does not use _sections.find() in linkColorFn', () => {
    expect(linkColorBlock).not.toContain('_sections.find')
  })
})

describe('pulse() uses _sectionMap.get() not _sections.find() (B-16)', () => {
  const pulseBlock = graphJs.split('function pulse')[1]?.split('\n  function ')[0] || ''

  it('uses _sectionMap.get(targetId)', () => {
    expect(pulseBlock).toContain('_sectionMap.get(targetId)')
  })

  it('does not use _sections.find() in pulse()', () => {
    expect(pulseBlock).not.toContain('_sections.find')
  })
})

describe('update() uses _sectionMap.get() not _sections.find() (B-16)', () => {
  const updateBlock = graphJs.split('function update')[1]?.split('\n  function ')[0] || ''

  it('uses _sectionMap.get(node.id)', () => {
    expect(updateBlock).toContain('_sectionMap.get(node.id)')
  })

  it('does not use _sections.find() in update()', () => {
    expect(updateBlock).not.toContain('_sections.find')
  })
})

describe('init() linkDirectionalParticleColor uses _sectionMap.get() (B-16)', () => {
  const initBlock = graphJs.split('function init')[1]?.split('\n  function ')[0] || ''

  it('linkDirectionalParticleColor uses _sectionMap.get(tgt)', () => {
    expect(initBlock).toContain('_sectionMap.get(tgt)')
  })

  it('init block has no _sections.find() calls', () => {
    expect(initBlock).not.toContain('_sections.find')
  })
})

describe('no remaining _sections.find() in mixer-graph.js (B-16)', () => {
  it('mixer-graph.js contains no _sections.find() calls', () => {
    expect(graphJs).not.toContain('_sections.find(')
  })
})

// ─── FE-08: .ng-active-label:empty fade ──────────────────────────────────────

describe('.ng-active-label has explicit opacity (FE-08)', () => {
  const block = cssStr.split('.ng-active-label {')[1]?.split('}')[0] || ''

  it('.ng-active-label sets opacity: 1', () => {
    expect(block).toContain('opacity: 1')
  })

  it('.ng-active-label has transition for smooth change', () => {
    expect(block).toContain('transition:')
  })
})

describe('.ng-active-label:empty CSS rule (FE-08)', () => {
  it('.ng-active-label:empty is defined in styles.css', () => {
    expect(cssStr).toContain('.ng-active-label:empty')
  })

  it('.ng-active-label:empty sets opacity: 0', () => {
    const emptyBlock = cssStr.split('.ng-active-label:empty')[1]?.split('}')[0] || ''
    expect(emptyBlock).toContain('opacity: 0')
  })

  it(':empty rule appears after the base .ng-active-label rule', () => {
    const baseIdx  = cssStr.indexOf('.ng-active-label {')
    const emptyIdx = cssStr.indexOf('.ng-active-label:empty')
    expect(baseIdx).toBeGreaterThan(-1)
    expect(emptyIdx).toBeGreaterThan(baseIdx)
  })
})
