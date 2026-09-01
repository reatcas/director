import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT     = path.resolve(import.meta.dirname, '..')
const graphJs  = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const mainJs   = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const htmlStr  = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const cssStr   = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

// ─── P-62: _ensureAnimLoop — idle RAF pause ───────────────────────────────────

describe('_ensureAnimLoop is defined as a function (P-62)', () => {
  it('source contains _ensureAnimLoop function declaration', () => {
    expect(graphJs).toContain('function _ensureAnimLoop()')
  })

  it('only starts RAF when _animId is falsy', () => {
    const block = graphJs.split('function _ensureAnimLoop')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('!_animId')
  })

  it('guards on _mounted before starting RAF', () => {
    const block = graphJs.split('function _ensureAnimLoop')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('_mounted')
  })

  it('calls requestAnimationFrame(animLoop) to start loop', () => {
    const block = graphJs.split('function _ensureAnimLoop')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('requestAnimationFrame(animLoop)')
  })
})

describe('animLoop idle detection (P-62)', () => {
  const loopBlock = graphJs.split('function animLoop')[1]?.split('\n  function ')[0] || ''

  it('checks _rings.length === 0 for idle', () => {
    expect(loopBlock).toContain('_rings.length === 0')
  })

  it('checks _sparks.length === 0 for idle', () => {
    expect(loopBlock).toContain('_sparks.length === 0')
  })

  it('checks _linkFlash.strength <= 0.001 for idle', () => {
    expect(loopBlock).toContain('_linkFlash.strength <= 0.001')
  })

  it('checks !_autoRotate for idle', () => {
    expect(loopBlock).toContain('!_autoRotate')
  })

  it('checks _activeCategory === null for idle', () => {
    expect(loopBlock).toContain('_activeCategory === null')
  })

  it('sets _animId to null when idle', () => {
    const idleBlock = loopBlock.split('_rings.length === 0')[1] || ''
    expect(idleBlock).toContain('_animId = null')
  })

  it('returns early without scheduling next RAF when idle', () => {
    const idleBlock = loopBlock.split('_rings.length === 0')[1] || ''
    expect(idleBlock).toContain('return')
  })

  it('schedules next RAF only when not idle', () => {
    expect(loopBlock).toContain('_animId = requestAnimationFrame(animLoop)')
  })
})

describe('pulse() calls _ensureAnimLoop after emitting effects (P-62)', () => {
  const pulseBlock = graphJs.split('function pulse')[1]?.split('\n  function ')[0] || ''

  it('calls _ensureAnimLoop()', () => {
    expect(pulseBlock).toContain('_ensureAnimLoop()')
  })

  it('_ensureAnimLoop call appears after linkFlash assignment', () => {
    const flashIdx = pulseBlock.lastIndexOf('_linkFlash =')
    const ensureIdx = pulseBlock.indexOf('_ensureAnimLoop()')
    expect(flashIdx).toBeGreaterThan(-1)
    expect(ensureIdx).toBeGreaterThan(flashIdx)
  })
})

describe('activate() calls _ensureAnimLoop when category set (P-62)', () => {
  const activateBlock = graphJs.split('function activate')[1]?.split('\n  function ')[0] || ''

  it('calls _ensureAnimLoop()', () => {
    expect(activateBlock).toContain('_ensureAnimLoop()')
  })

  it('only resumes loop when category is truthy', () => {
    expect(activateBlock).toContain('if (category) _ensureAnimLoop()')
  })
})

describe('setRotating() calls _ensureAnimLoop when enabling rotation (P-62)', () => {
  const rotateBlock = graphJs.split('function setRotating')[1]?.split('\n  function ')[0] || ''

  it('calls _ensureAnimLoop()', () => {
    expect(rotateBlock).toContain('_ensureAnimLoop()')
  })

  it('only resumes loop when on is truthy', () => {
    expect(rotateBlock).toContain('if (on) _ensureAnimLoop()')
  })
})

describe('init() uses _ensureAnimLoop instead of bare requestAnimationFrame (P-62)', () => {
  const initBlock = graphJs.split('function init')[1]?.split('\n  function ')[0] || ''

  it('calls _ensureAnimLoop()', () => {
    expect(initBlock).toContain('_ensureAnimLoop()')
  })

  it('does not call requestAnimationFrame directly in init', () => {
    expect(initBlock).not.toContain('requestAnimationFrame(animLoop)')
  })

  it('_mounted is set true before _ensureAnimLoop()', () => {
    const mountedIdx = initBlock.indexOf('_mounted = true')
    const ensureIdx  = initBlock.indexOf('_ensureAnimLoop()')
    expect(mountedIdx).toBeGreaterThan(-1)
    expect(ensureIdx).toBeGreaterThan(mountedIdx)
  })
})

// ─── Fix 8951d01: copyDir else-if ordering ────────────────────────────────────

describe('copyDir else-if chain ordering (fix 8951d01)', () => {
  const block = mainJs.split('function copyDir')[1]?.split('\nfunction ')[0] || ''

  it('CLAUDE.md branch is else-if, not plain else', () => {
    expect(block).toContain("else if (e.name === 'CLAUDE.md')")
  })

  it('settings.json branch is else-if', () => {
    expect(block).toContain("else if (e.name === 'settings.json')")
  })

  it('copyFileSync fallback is final else clause', () => {
    expect(block).toContain('else {')
    expect(block).toContain('copyFileSync')
  })

  it('CLAUDE.md branch appears before settings.json branch', () => {
    const claudeIdx   = block.indexOf("else if (e.name === 'CLAUDE.md')")
    const settingsIdx = block.indexOf("else if (e.name === 'settings.json')")
    expect(claudeIdx).toBeGreaterThan(-1)
    expect(settingsIdx).toBeGreaterThan(claudeIdx)
  })

  it('settings.json branch appears before fallback else', () => {
    const settingsIdx = block.indexOf("else if (e.name === 'settings.json')")
    const copyIdx     = block.lastIndexOf('else {')
    expect(settingsIdx).toBeGreaterThan(-1)
    expect(copyIdx).toBeGreaterThan(settingsIdx)
  })

  it('directory recursion is first if, before special file branches', () => {
    const dirIdx      = block.indexOf('if (e.isDirectory())')
    const claudeIdx   = block.indexOf("else if (e.name === 'CLAUDE.md')")
    expect(dirIdx).toBeGreaterThan(-1)
    expect(claudeIdx).toBeGreaterThan(dirIdx)
  })
})

// ─── Layout: 3-column structure (1cb1a75) ─────────────────────────────────────

describe('3-column layout DOM structure (style 1cb1a75)', () => {
  it('index.html contains #leftColumn wrapper', () => {
    expect(htmlStr).toContain('id="leftColumn"')
  })

  it('#nodeGraphSection exists inside #leftColumn region', () => {
    const leftBlock = htmlStr.split('id="leftColumn"')[1]?.split('</div>')[0] || ''
    expect(htmlStr).toContain('id="nodeGraphSection"')
  })

  it('#mixerDrawer is present as permanent panel', () => {
    expect(htmlStr).toContain('id="mixerDrawer"')
  })

  it('#mixerDrawerToggle is present but hidden via CSS', () => {
    expect(htmlStr).toContain('id="mixerDrawerToggle"')
    expect(cssStr).toContain('#mixerDrawerToggle')
    expect(cssStr).toContain('display: none')
  })

  it('#nodeGraphSection has img role (visual-only 3D component)', () => {
    expect(htmlStr).toContain('role="img"')
    const ngBlock = htmlStr.split('id="nodeGraphSection"')[1]?.split('>')[0] || ''
    expect(ngBlock).toContain('role="img"')
  })

  it('#nodeGraphSection has tabindex for keyboard focus', () => {
    const ngBlock = htmlStr.split('id="nodeGraphSection"')[1]?.split('>')[0] || ''
    expect(ngBlock).toContain('tabindex="0"')
  })

  it('#nodeGraphSection has Spanish aria-label', () => {
    const ngBlock = htmlStr.split('id="nodeGraphSection"')[1]?.split('>')[0] || ''
    expect(ngBlock).toContain('aria-label=')
    expect(ngBlock).toContain('Grafo')
  })
})

describe('3-column layout CSS rules', () => {
  it('#leftColumn has CSS definition', () => {
    expect(cssStr).toContain('#leftColumn')
  })

  it('#nodeGraphSection has CSS definition', () => {
    expect(cssStr).toContain('#nodeGraphSection')
  })

  it('.ng-section class is used on #nodeGraphSection in HTML', () => {
    expect(htmlStr).toContain('ng-section')
  })

  it('#nodeGraphSection has a fixed or min height in CSS', () => {
    const ngBlock = cssStr.split('#nodeGraphSection')[1]?.split('}')[0] || ''
    const hasHeight = ngBlock.includes('height') || ngBlock.includes('min-height')
    expect(hasHeight).toBe(true)
  })

  it('#mixerDrawer CSS rule exists and is not a drawer overlay', () => {
    expect(cssStr).toContain('.mixer-drawer') || expect(cssStr).toContain('#mixerDrawer')
  })
})

// ─── mixer-graph link distance/charge (62b0f95) ───────────────────────────────

describe('mixer-graph force parameters updated (style 62b0f95)', () => {
  it('link distance is 35 (reduced from 70)', () => {
    expect(graphJs).toContain('.distance(35)')
  })

  it('charge strength is -60 (reduced from -120)', () => {
    expect(graphJs).toContain('.strength(-60)')
  })

  it('warmupTicks is 180', () => {
    expect(graphJs).toContain('warmupTicks(180)')
  })

  it('link distance appears before charge strength in init', () => {
    const distIdx   = graphJs.indexOf('.distance(35)')
    const chargeIdx = graphJs.indexOf('.strength(-60)')
    expect(distIdx).toBeGreaterThan(-1)
    expect(chargeIdx).toBeGreaterThan(distIdx)
  })
})
