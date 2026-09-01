import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT       = path.resolve(import.meta.dirname, '..')
const graphJs    = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── A-33: strip-h-icon aria-hidden="true" ───────────────────────────────────

describe('strip-h-icon div is aria-hidden for screen readers (A-33)', () => {
  it('strip-h-icon div has aria-hidden="true"', () => {
    expect(rendererJs).toContain('<div class="strip-h-icon" aria-hidden="true">')
  })

  it('aria-hidden is on the icon container, not the label', () => {
    const iconIdx  = rendererJs.indexOf('<div class="strip-h-icon" aria-hidden="true">')
    const labelIdx = rendererJs.indexOf('<div class="strip-h-label">')
    expect(iconIdx).toBeGreaterThan(-1)
    expect(labelIdx).toBeGreaterThan(-1)
    expect(rendererJs).toContain('<div class="strip-h-label">')
    expect(rendererJs).not.toContain('<div class="strip-h-label" aria-hidden')
  })

  it('strip-h-icon without aria-hidden is no longer present', () => {
    expect(rendererJs).not.toContain('<div class="strip-h-icon">${svg}</div>')
  })

  it('strip-h-label still carries the escaped category label', () => {
    expect(rendererJs).toContain('${esc(label)}')
  })
})

describe('strip range input aria-label still present after A-33 (consistency)', () => {
  it('range input keeps aria-label with category label', () => {
    expect(rendererJs).toContain('aria-label="${esc(label)} peso"')
  })

  it('range input keeps aria-valuetext', () => {
    expect(rendererJs).toContain('aria-valuetext="${v}%"')
  })
})

// ─── BL-12: destroy() resets _focus = {} ─────────────────────────────────────

describe('destroy() resets _focus to empty object (BL-12)', () => {
  const destroyBlock = graphJs.split('function destroy')[1]?.split('\n  }')[0] || ''

  it('destroy() sets _focus = {}', () => {
    expect(destroyBlock).toContain('_focus = {}')
  })

  it('_focus reset follows _sectionMap and _nodeMap clears', () => {
    const sectionIdx = destroyBlock.indexOf('_sectionMap.clear()')
    const focusIdx   = destroyBlock.indexOf('_focus = {}')
    expect(sectionIdx).toBeGreaterThan(-1)
    expect(focusIdx).toBeGreaterThan(sectionIdx)
  })
})

describe('destroy() now resets all mutable state (BL-12 completeness)', () => {
  const destroyBlock = graphJs.split('function destroy')[1]?.split('\n  }')[0] || ''

  it('_mounted reset to false', () => { expect(destroyBlock).toContain('_mounted = false') })
  it('_activeCategory reset to null', () => { expect(destroyBlock).toContain('_activeCategory = null') })
  it('_autoRotate reset to false', () => { expect(destroyBlock).toContain('_autoRotate = false') })
  it('_camAngle reset to 0', () => { expect(destroyBlock).toContain('_camAngle = 0') })
  it('_linkFlash reset to initial', () => { expect(destroyBlock).toContain('_linkFlash = { cat: null, strength: 0 }') })
  it('_lastRefresh reset to 0', () => { expect(destroyBlock).toContain('_lastRefresh = 0') })
  it('_sections cleared', () => { expect(destroyBlock).toContain('_sections = []') })
  it('_sectionMap cleared', () => { expect(destroyBlock).toContain('_sectionMap.clear()') })
  it('_nodeMap cleared', () => { expect(destroyBlock).toContain('_nodeMap.clear()') })
  it('_rings cleared', () => { expect(destroyBlock).toContain('_rings = []') })
  it('_sparks cleared', () => { expect(destroyBlock).toContain('_sparks = []') })
})
