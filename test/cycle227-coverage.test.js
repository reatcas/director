import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT       = path.resolve(import.meta.dirname, '..')
const graphJs    = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── A-31: ngActiveLabel text color = category color ─────────────────────────

describe('activateMixerStand() sets #ngActiveLabel color to category color (A-31)', () => {
  const block = rendererJs.split('function activateMixerStand')[1]?.split('\nfunction ')[0] || ''

  it('sets _ngLbl.style.color from _ngSec[2]', () => {
    expect(block).toContain('_ngLbl.style.color = _ngSec ? _ngSec[2]')
  })

  it('resets style.color to empty string when no section', () => {
    expect(block).toContain(": ''")
    const colorLine = block.split('_ngLbl.style.color')[1]?.split('\n')[0] || ''
    expect(colorLine).toContain("''")
  })

  it('color assignment follows textContent assignment', () => {
    const textIdx  = block.indexOf('_ngLbl.textContent = _ngTxt')
    const colorIdx = block.indexOf('_ngLbl.style.color')
    expect(textIdx).toBeGreaterThan(-1)
    expect(colorIdx).toBeGreaterThan(textIdx)
  })

  it('color uses _ngSec[2] — the color field from SECTIONS tuple', () => {
    expect(block).toContain('_ngSec[2]')
  })
})

// ─── BL-10: activate() early return when category unchanged ──────────────────

describe('activate() returns early when category === prev (BL-10)', () => {
  const activateBlock = graphJs.split('function activate')[1]?.split('\n  function ')[0] || ''

  it('compares category to prev before modifying state', () => {
    expect(activateBlock).toContain('if (category === prev) return')
  })

  it('early return appears after prev is captured', () => {
    const prevIdx   = activateBlock.indexOf('const prev = _activeCategory')
    const returnIdx = activateBlock.indexOf('if (category === prev) return')
    expect(prevIdx).toBeGreaterThan(-1)
    expect(returnIdx).toBeGreaterThan(prevIdx)
  })

  it('_activeCategory assignment is after early return', () => {
    const returnIdx = activateBlock.indexOf('if (category === prev) return')
    const assignIdx = activateBlock.indexOf('_activeCategory = category')
    expect(returnIdx).toBeGreaterThan(-1)
    expect(assignIdx).toBeGreaterThan(returnIdx)
  })

  it('_activeGlow reset is after early return', () => {
    const returnIdx = activateBlock.indexOf('if (category === prev) return')
    const glowIdx   = activateBlock.indexOf('_activeGlow = null')
    expect(returnIdx).toBeGreaterThan(-1)
    expect(glowIdx).toBeGreaterThan(returnIdx)
  })

  it('early return is before syncLinks call', () => {
    const returnIdx = activateBlock.indexOf('if (category === prev) return')
    const syncIdx   = activateBlock.indexOf('syncLinks()')
    expect(returnIdx).toBeGreaterThan(-1)
    expect(syncIdx).toBeGreaterThan(returnIdx)
  })
})

describe('activate() still updates state when category changes (BL-10)', () => {
  const activateBlock = graphJs.split('function activate')[1]?.split('\n  function ')[0] || ''

  it('assigns _activeCategory after early-return guard', () => {
    expect(activateBlock).toContain('_activeCategory = category')
  })

  it('calls syncLinks when category changed', () => {
    expect(activateBlock).toContain('if (graph) syncLinks()')
  })

  it('calls _ensureAnimLoop when new category is truthy', () => {
    expect(activateBlock).toContain('if (category) _ensureAnimLoop()')
  })
})

// ─── Consistency: S-68 try/catch preserved after A-31 changes ────────────────

describe('S-68 try/catch still present after A-31 refactor', () => {
  const block = rendererJs.split('function activateMixerStand')[1]?.split('\nfunction ')[0] || ''

  it('slider querySelector still wrapped in try/catch', () => {
    expect(block).toContain('try {')
    expect(block).toContain('} catch {}')
  })

  it('_ngLbl.style.color is outside the try block (no exception risk)', () => {
    const catchIdx = block.indexOf('} catch {}')
    const colorIdx = block.indexOf('_ngLbl.style.color')
    expect(catchIdx).toBeGreaterThan(-1)
    expect(colorIdx).toBeGreaterThan(catchIdx)
  })
})
