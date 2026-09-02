import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT    = path.resolve(import.meta.dirname, '..')
const graphJs = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const cssStr  = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

// ─── B-17: sections guard in init() ──────────────────────────────────────────

describe('init() guards against undefined sections (B-17)', () => {
  const initBlock = graphJs.split('function init')[1]?.split('\n  function ')[0] || ''

  it('uses sections ?? [] fallback when assigning _sections', () => {
    expect(initBlock).toContain('_sections  = sections ?? []')
  })

  it('_sectionMap is built from _sections (not raw sections param)', () => {
    expect(initBlock).toContain('for (const s of _sections)')
  })

  it('does not reference raw sections param directly in Map constructor', () => {
    const mapLine = initBlock.split('_sectionMap = new Map(')[1]?.split(')')[0] || ''
    expect(mapLine).not.toBe('sections.map')
  })
})

describe('destroy() resets _sections to empty array (B-17)', () => {
  const destroyBlock = graphJs.split('function destroy')[1]?.split('\n  }')[0] || ''

  it('sets _sections = [] in destroy()', () => {
    expect(destroyBlock).toContain('_sections = []')
  })

  it('_sections reset appears alongside _sectionMap.clear()', () => {
    const sectionsIdx  = destroyBlock.indexOf('_sections = []')
    const sectionMapIdx = destroyBlock.indexOf('_sectionMap.clear()')
    expect(sectionsIdx).toBeGreaterThan(-1)
    expect(sectionMapIdx).toBeGreaterThan(-1)
  })

  it('_sections reset and _sectionMap.clear() are on the same line', () => {
    const line = destroyBlock.split('\n').find(l => l.includes('_sections = []')) || ''
    expect(line).toContain('_sectionMap.clear()')
  })
})

describe('_sectionMap lifecycle: init populates, destroy clears (B-17)', () => {
  it('_sectionMap is declared as empty Map at module level', () => {
    const stateBlock = graphJs.split('// ── State')[1]?.split('// ──')[0] || ''
    expect(stateBlock).toContain('_sectionMap = new Map()')
  })

  it('init() builds _sectionMap via for-of', () => {
    const initBlock = graphJs.split('function init')[1]?.split('\n  function ')[0] || ''
    expect(initBlock).toContain('_sectionMap.set(s[0], s)')
  })

  it('destroy() clears _sectionMap', () => {
    const destroyBlock = graphJs.split('function destroy')[1]?.split('\n  }')[0] || ''
    expect(destroyBlock).toContain('_sectionMap.clear()')
  })
})

// ─── FE-09: light theme ng-label overrides ────────────────────────────────────

describe('body.light .ng-label override (FE-09)', () => {
  it('styles.css defines body.light .ng-label', () => {
    expect(cssStr).toContain('body.light .ng-label')
  })

  it('light theme ng-label uses dark teal color (readable on light bg)', () => {
    const rule = cssStr.split('body.light .ng-label')[1]?.split('}')[0] || ''
    expect(rule).toContain('color:')
    expect(rule).not.toContain('rgba(0,255,238')
  })

  it('light .ng-label rule appears after the dark .ng-label rule', () => {
    const darkIdx  = cssStr.indexOf('.ng-label {')
    const lightIdx = cssStr.indexOf('body.light .ng-label')
    expect(darkIdx).toBeGreaterThan(-1)
    expect(lightIdx).toBeGreaterThan(darkIdx)
  })
})

describe('body.light .ng-active-label override (FE-09)', () => {
  it('styles.css defines body.light .ng-active-label', () => {
    expect(cssStr).toContain('body.light .ng-active-label')
  })

  it('light theme ng-active-label uses readable color (not cyan)', () => {
    const rule = cssStr.split('body.light .ng-active-label')[1]?.split('}')[0] || ''
    expect(rule).toContain('color:')
    expect(rule).not.toContain('rgba(0,255,238')
  })

  it('light .ng-active-label rule appears after dark .ng-active-label rule', () => {
    const darkIdx  = cssStr.indexOf('.ng-active-label {')
    const lightIdx = cssStr.indexOf('body.light .ng-active-label')
    expect(darkIdx).toBeGreaterThan(-1)
    expect(lightIdx).toBeGreaterThan(darkIdx)
  })

  it('light theme ng-label and ng-active-label rules are adjacent', () => {
    const ngIdx     = cssStr.indexOf('body.light .ng-label')
    const activeIdx = cssStr.indexOf('body.light .ng-active-label')
    expect(Math.abs(ngIdx - activeIdx)).toBeLessThan(100)
  })
})

describe('body.light #nodeGraphSection is defined before ng-label overrides (FE-09)', () => {
  it('light nodeGraphSection rule exists', () => {
    expect(cssStr).toContain('body.light #nodeGraphSection')
  })

  it('light nodeGraphSection appears before light ng-label override', () => {
    const ngSecIdx = cssStr.indexOf('body.light #nodeGraphSection')
    const ngLblIdx = cssStr.indexOf('body.light .ng-label')
    expect(ngSecIdx).toBeGreaterThan(-1)
    expect(ngLblIdx).toBeGreaterThan(ngSecIdx)
  })
})
