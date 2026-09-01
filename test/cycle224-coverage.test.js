import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT       = path.resolve(import.meta.dirname, '..')
const graphJs    = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── A-29: weight% in #ngActiveLabel ─────────────────────────────────────────

describe('activateMixerStand() shows weight% in #ngActiveLabel (A-29)', () => {
  const block = rendererJs.split('function activateMixerStand')[1]?.split('\nfunction ')[0] || ''

  it('queries slider by data-k attribute', () => {
    expect(block).toContain('data-k=')
    expect(block).toContain('_ngSlider')
  })

  it('reads slider.value for weight', () => {
    expect(block).toContain('_ngSlider.value')
  })

  it('appends weight% to label text', () => {
    expect(block).toContain("_ngTxt += ' ' + _ngSlider.value + '%'")
  })

  it('only adds weight when slider is found', () => {
    const sliderBlock = block.split('_ngSlider')[1] || ''
    expect(block).toContain('if (_ngSlider)')
  })

  it('falls back to name-only when slider absent', () => {
    expect(block).toContain('let _ngTxt = _ngSec ?')
  })

  it('_ngTxt is the final textContent value', () => {
    expect(block).toContain('_ngLbl.textContent = _ngTxt')
  })

  it('weight only added when category and section found', () => {
    const sectionGuard = block.split('_ngSec && category')[0] || ''
    expect(block).toContain('if (_ngSec && category)')
  })
})

// ─── BL-09: cross-link weight gate in buildData() ────────────────────────────

describe('buildData() only adds cross-link when both nodes have weight>0 (BL-09)', () => {
  const buildBlock = graphJs.split('function buildData')[1]?.split('\n  function ')[0] || ''

  it('contains weight check before pushing cross-link', () => {
    expect(buildBlock).toContain('_focus[a] ?? 0')
    expect(buildBlock).toContain('_focus[b] ?? 0')
  })

  it('checks both a and b have weight > 0', () => {
    expect(buildBlock).toContain('> 0 && (_focus[b] ?? 0) > 0')
  })

  it('weight check gates the cross-link push', () => {
    const afterPair = buildBlock.split('_recentPair.length === 2')[1] || ''
    const focusIdx = afterPair.indexOf('_focus[a]')
    const pushIdx  = afterPair.indexOf('links.push')
    expect(focusIdx).toBeGreaterThan(-1)
    expect(pushIdx).toBeGreaterThan(focusIdx)
  })

  it('cross-link id format preserved', () => {
    expect(buildBlock).toContain('`x→${a}→${b}`')
  })
})

// ─── BL-09: cross-link weight gate in syncLinks() ────────────────────────────

describe('syncLinks() only adds cross-link when both nodes have weight>0 (BL-09)', () => {
  const syncBlock = graphJs.split('function syncLinks')[1]?.split('\n  function ')[0] || ''

  it('contains weight check before pushing cross-link', () => {
    expect(syncBlock).toContain('_focus[a] ?? 0')
    expect(syncBlock).toContain('_focus[b] ?? 0')
  })

  it('checks both a and b have weight > 0', () => {
    expect(syncBlock).toContain('> 0 && (_focus[b] ?? 0) > 0')
  })

  it('weight check gates the cross-link push', () => {
    const afterPair = syncBlock.split('_recentPair.length === 2')[1] || ''
    const focusIdx = afterPair.indexOf('_focus[a]')
    const pushIdx  = afterPair.indexOf('_gData.links.push')
    expect(focusIdx).toBeGreaterThan(-1)
    expect(pushIdx).toBeGreaterThan(focusIdx)
  })

  it('cross-link id format preserved in syncLinks', () => {
    expect(syncBlock).toContain('`x→${a}→${b}`')
  })
})

describe('cross-link weight gate is consistent between buildData and syncLinks (BL-09)', () => {
  const buildBlock = graphJs.split('function buildData')[1]?.split('\n  function ')[0] || ''
  const syncBlock  = graphJs.split('function syncLinks')[1]?.split('\n  function ')[0] || ''

  it('both use the same weight check expression', () => {
    expect(buildBlock).toContain('(_focus[a] ?? 0) > 0 && (_focus[b] ?? 0) > 0')
    expect(syncBlock).toContain('(_focus[a] ?? 0) > 0 && (_focus[b] ?? 0) > 0')
  })
})
