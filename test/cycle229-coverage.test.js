import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT       = path.resolve(import.meta.dirname, '..')
const graphJs    = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── A-32: strip range input focus/blur fires activateMixerStand ─────────────

describe('mixer strip range inputs activate graph node on focus (A-32)', () => {
  const stripBlock = rendererJs.split("inp.addEventListener('change'")[1]?.split('// Update aurora')[0] || ''

  it('focus listener calls activateMixerStand with category key', () => {
    expect(stripBlock).toContain("inp.addEventListener('focus', () => activateMixerStand(k))")
  })

  it('blur listener calls activateMixerStand(null)', () => {
    expect(stripBlock).toContain('activateMixerStand(null)')
  })

  it('blur guard checks no other strip input is focused', () => {
    expect(stripBlock).toContain("document.querySelector('#mixerStrips input:focus')")
  })

  it('blur handler only deactivates when no sibling input has focus', () => {
    const blurBlock = stripBlock.split("addEventListener('blur'")[1]?.split('})')[0] || ''
    expect(blurBlock).toContain('!document.querySelector')
    expect(blurBlock).toContain('activateMixerStand(null)')
  })

  it('focus listener appears after change listener in strip setup', () => {
    const changeIdx = rendererJs.indexOf("inp.addEventListener('change'")
    const focusIdx  = rendererJs.indexOf("inp.addEventListener('focus'")
    expect(changeIdx).toBeGreaterThan(-1)
    expect(focusIdx).toBeGreaterThan(changeIdx)
  })

  it('blur listener appears after focus listener', () => {
    const focusIdx = rendererJs.indexOf("inp.addEventListener('focus'")
    const blurIdx  = rendererJs.indexOf("inp.addEventListener('blur'")
    expect(focusIdx).toBeGreaterThan(-1)
    expect(blurIdx).toBeGreaterThan(focusIdx)
  })
})

// ─── BL-11: destroy() resets _autoRotate, _camAngle, _linkFlash ──────────────

describe('destroy() resets rotation and camera state (BL-11)', () => {
  const destroyBlock = graphJs.split('function destroy')[1]?.split('\n  }')[0] || ''

  it('destroy() resets _autoRotate to false', () => {
    expect(destroyBlock).toContain('_autoRotate = false')
  })

  it('destroy() resets _camAngle to 0', () => {
    expect(destroyBlock).toContain('_camAngle = 0')
  })

  it('destroy() resets _linkFlash to initial value', () => {
    expect(destroyBlock).toContain('_linkFlash = { cat: null, strength: 0 }')
  })

  it('rotation resets appear after _sections cleanup', () => {
    const sectionsIdx  = destroyBlock.indexOf('_sections = []')
    const autoRotIdx   = destroyBlock.indexOf('_autoRotate = false')
    expect(sectionsIdx).toBeGreaterThan(-1)
    expect(autoRotIdx).toBeGreaterThan(sectionsIdx)
  })

  it('_lastRefresh reset is still present alongside BL-11 resets', () => {
    expect(destroyBlock).toContain('_lastRefresh = 0')
  })
})

describe('destroy() prior state resets still complete after BL-11 (consistency)', () => {
  const destroyBlock = graphJs.split('function destroy')[1]?.split('\n  }')[0] || ''

  it('destroy() still cancels animId', () => {
    expect(destroyBlock).toContain('cancelAnimationFrame(_animId)')
  })

  it('destroy() still clears _rings and _sparks', () => {
    expect(destroyBlock).toContain('_rings = []')
    expect(destroyBlock).toContain('_sparks = []')
  })

  it('destroy() still clears glowCache', () => {
    expect(destroyBlock).toContain('glowCache.clear()')
  })

  it('destroy() still resets _mounted to false', () => {
    expect(destroyBlock).toContain('_mounted = false')
  })
})
