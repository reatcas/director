import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT       = path.resolve(import.meta.dirname, '..')
const graphJs    = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── S-68: try/catch on querySelector in activateMixerStand ──────────────────

describe('ngActiveLabel slider querySelector is wrapped in try/catch (S-68)', () => {
  const block = rendererJs.split('function activateMixerStand')[1]?.split('\nfunction ')[0] || ''

  it('slider query is inside a try block', () => {
    expect(block).toContain('try {')
    const tryBlock = block.split('try {')[1]?.split('} catch')[0] || ''
    expect(tryBlock).toContain('_ngSlider')
  })

  it('has empty catch block for silenced SyntaxError', () => {
    expect(block).toContain('} catch {}')
  })

  it('slider query appears inside the try, not outside', () => {
    const tryIdx    = block.indexOf('try {')
    const catchIdx  = block.indexOf('} catch {}')
    const sliderIdx = block.indexOf('_ngSlider')
    expect(sliderIdx).toBeGreaterThan(tryIdx)
    expect(sliderIdx).toBeLessThan(catchIdx)
  })
})

describe('strip querySelector is wrapped in try/catch (S-68)', () => {
  const block = rendererJs.split('function activateMixerStand')[1]?.split('\nfunction ')[0] || ''

  it('strip query uses try/catch pattern', () => {
    expect(block).toContain('try { strip = document.querySelector')
  })

  it('strip is declared with let before try block', () => {
    expect(block).toContain('let strip = null')
  })

  it('strip is initialized to null before try', () => {
    const letIdx = block.indexOf('let strip = null')
    const tryIdx = block.indexOf('try { strip = document.querySelector')
    expect(letIdx).toBeGreaterThan(-1)
    expect(tryIdx).toBeGreaterThan(letIdx)
  })

  it('strip guard check follows the try block', () => {
    const tryIdx   = block.indexOf('try { strip = document.querySelector')
    const guardIdx = block.indexOf('if (!strip || strip.classList.contains')
    expect(tryIdx).toBeGreaterThan(-1)
    expect(guardIdx).toBeGreaterThan(tryIdx)
  })
})

// ─── B-19: _lastRefresh reset in destroy() ───────────────────────────────────

describe('destroy() resets _lastRefresh to 0 (B-19)', () => {
  const destroyBlock = graphJs.split('function destroy')[1]?.split('\n  }')[0] || ''

  it('destroy() sets _lastRefresh = 0', () => {
    expect(destroyBlock).toContain('_lastRefresh = 0')
  })

  it('_lastRefresh reset appears after _mounted = false', () => {
    const mountedIdx  = destroyBlock.indexOf('_mounted = false')
    const refreshIdx  = destroyBlock.indexOf('_lastRefresh = 0')
    expect(mountedIdx).toBeGreaterThan(-1)
    expect(refreshIdx).toBeGreaterThan(mountedIdx)
  })
})

describe('_lastRefresh is declared at module state level (B-19)', () => {
  it('_lastRefresh initialized to 0 in state block', () => {
    expect(graphJs).toContain('_lastRefresh = 0')
  })

  it('throttledRefresh uses _lastRefresh for 80ms threshold', () => {
    const throttleBlock = graphJs.split('function throttledRefresh')[1]?.split('\n  }')[0] || ''
    expect(throttleBlock).toContain('_lastRefresh')
    expect(throttleBlock).toContain('< 80')
  })

  it('destroy resets _lastRefresh alongside other state cleanup', () => {
    const destroyBlock = graphJs.split('function destroy')[1]?.split('\n  }')[0] || ''
    expect(destroyBlock).toContain('_lastRefresh = 0')
    expect(destroyBlock).toContain('_sections = []')
    expect(destroyBlock).toContain('_sectionMap.clear()')
  })
})

// ─── Retrospective: emitRing/emitSparks caps (C225) ─────────────────────────

describe('emitRing and emitSparks each handle pulseLayer.remove (D-01 retrocheck)', () => {
  it('emitRing calls _pulseLayer.remove on eviction', () => {
    const ringBlock = graphJs.split('function emitRing')[1]?.split('\n  function ')[0] || ''
    expect(ringBlock).toContain('_pulseLayer.remove(old.sp)')
  })

  it('emitSparks calls _pulseLayer.remove on eviction', () => {
    const sparksBlock = graphJs.split('function emitSparks')[1]?.split('\n  function ')[0] || ''
    expect(sparksBlock).toContain('_pulseLayer.remove(old.sp)')
  })

  it('both emitRing and emitSparks call old.mat.dispose()', () => {
    const ringBlock   = graphJs.split('function emitRing')[1]?.split('\n  function ')[0] || ''
    const sparksBlock = graphJs.split('function emitSparks')[1]?.split('\n  function ')[0] || ''
    expect(ringBlock).toContain('old.mat.dispose()')
    expect(sparksBlock).toContain('old.mat.dispose()')
  })
})
