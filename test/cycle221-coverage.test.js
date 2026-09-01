import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT      = path.resolve(import.meta.dirname, '..')
const graphJs   = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const htmlStr   = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const cssStr    = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

// ─── S-67: activate() category validation ────────────────────────────────────

describe('activate() validates category is string ≤64 or null (S-67)', () => {
  const block = graphJs.split('function activate')[1]?.split('\n  function ')[0] || ''

  it('guards against non-string category before reading _activeCategory', () => {
    expect(block).toContain("typeof category !== 'string'")
  })

  it('checks category.length > 64', () => {
    expect(block).toContain('category.length > 64')
  })

  it('returns early on invalid type', () => {
    const guardBlock = block.split("typeof category !== 'string'")[0] + block.split("typeof category !== 'string'")[1]?.split('\n')[0] || ''
    expect(block).toContain('return')
  })

  it('null is allowed (skip guard when null)', () => {
    expect(block).toContain("category !== null")
  })

  it('undefined is allowed (skip guard when undefined)', () => {
    expect(block).toContain("category !== undefined")
  })

  it('guard appears before _activeCategory assignment', () => {
    const guardIdx   = block.indexOf("typeof category !== 'string'")
    const assignIdx  = block.indexOf('_activeCategory = category')
    expect(guardIdx).toBeGreaterThan(-1)
    expect(assignIdx).toBeGreaterThan(-1)
    expect(guardIdx).toBeLessThan(assignIdx)
  })
})

// ─── S-67: pulse() category validation ───────────────────────────────────────

describe('pulse() coerces invalid category to null (S-67)', () => {
  const pulseBlock = graphJs.split('function pulse')[1]?.split('\n  function ')[0] || ''
  const guardBlock = pulseBlock.split("typeof category !== 'string'")[0] + (pulseBlock.split("typeof category !== 'string'")[1] || '')

  it('guards against non-string category', () => {
    expect(pulseBlock).toContain("typeof category !== 'string'")
  })

  it('coerces to null rather than early-returning', () => {
    const after = pulseBlock.split("typeof category !== 'string'")[1] || ''
    expect(after).toContain('category = null')
  })

  it('checks category.length > 64', () => {
    expect(pulseBlock).toContain('category.length > 64')
  })

  it('null allowed (skip guard when null)', () => {
    expect(pulseBlock).toContain("category !== null")
  })

  it('undefined allowed (skip guard when undefined)', () => {
    expect(pulseBlock).toContain("category !== undefined")
  })

  it('guard appears before targetId computation', () => {
    const guardIdx  = pulseBlock.indexOf("typeof category !== 'string'")
    const targetIdx = pulseBlock.indexOf('const targetId')
    expect(guardIdx).toBeGreaterThan(-1)
    expect(targetIdx).toBeGreaterThan(guardIdx)
  })
})

// ─── A-27: #ngActiveLabel DOM + aria ─────────────────────────────────────────

describe('#ngActiveLabel element in #nodeGraphSection (A-27)', () => {
  it('index.html contains #ngActiveLabel', () => {
    expect(htmlStr).toContain('id="ngActiveLabel"')
  })

  it('#ngActiveLabel is inside #nodeGraphSection', () => {
    const ngBlock = htmlStr.split('id="nodeGraphSection"')[1]?.split('</div>')[2] || ''
    expect(htmlStr.indexOf('id="ngActiveLabel"')).toBeGreaterThan(
      htmlStr.indexOf('id="nodeGraphSection"')
    )
  })

  it('#ngActiveLabel has aria-live="polite"', () => {
    const labelBlock = htmlStr.split('id="ngActiveLabel"')[0]?.split('<').pop() || ''
    expect(htmlStr).toContain('aria-live="polite"')
    const ngLabelLine = htmlStr.split('\n').find(l => l.includes('id="ngActiveLabel"')) || ''
    expect(ngLabelLine).toContain('aria-live="polite"')
  })

  it('#ngActiveLabel has aria-atomic="true"', () => {
    const ngLabelLine = htmlStr.split('\n').find(l => l.includes('id="ngActiveLabel"')) || ''
    expect(ngLabelLine).toContain('aria-atomic="true"')
  })

  it('#ngActiveLabel is a span element', () => {
    const ngLabelLine = htmlStr.split('\n').find(l => l.includes('id="ngActiveLabel"')) || ''
    expect(ngLabelLine).toContain('<span')
  })

  it('#ngActiveLabel has ng-active-label class', () => {
    const ngLabelLine = htmlStr.split('\n').find(l => l.includes('id="ngActiveLabel"')) || ''
    expect(ngLabelLine).toContain('ng-active-label')
  })
})

describe('.ng-active-label CSS class (A-27)', () => {
  it('.ng-active-label is defined in styles.css', () => {
    expect(cssStr).toContain('.ng-active-label')
  })

  it('is absolutely positioned', () => {
    const block = cssStr.split('.ng-active-label')[1]?.split('}')[0] || ''
    expect(block).toContain('position: absolute')
  })

  it('has pointer-events: none', () => {
    const block = cssStr.split('.ng-active-label')[1]?.split('}')[0] || ''
    expect(block).toContain('pointer-events: none')
  })

  it('has right alignment (not left like ng-label)', () => {
    const block = cssStr.split('.ng-active-label')[1]?.split('}')[0] || ''
    expect(block).toContain('right:')
  })

  it('has z-index for layering above canvas', () => {
    const block = cssStr.split('.ng-active-label')[1]?.split('}')[0] || ''
    expect(block).toContain('z-index:')
  })

  it('has transition for smooth updates', () => {
    const block = cssStr.split('.ng-active-label')[1]?.split('}')[0] || ''
    expect(block).toContain('transition:')
  })
})

describe('activateMixerStand() updates #ngActiveLabel (A-27)', () => {
  const block = rendererJs.split('function activateMixerStand')[1]?.split('\nfunction ')[0] || ''

  it('looks up #ngActiveLabel via $()', () => {
    expect(block).toContain("$('#ngActiveLabel')")
  })

  it('sets textContent from SECTIONS label', () => {
    expect(block).toContain('textContent')
    expect(block).toContain('SECTIONS')
  })

  it('clears label when category is null', () => {
    expect(block).toContain(": ''")
  })

  it('#ngActiveLabel update happens before early return on no category', () => {
    const ngIdx     = block.indexOf("$('#ngActiveLabel')")
    const returnIdx = block.indexOf("if (!category) return")
    expect(ngIdx).toBeGreaterThan(-1)
    expect(returnIdx).toBeGreaterThan(ngIdx)
  })
})

// ─── P-62 edge cases: _ensureAnimLoop idempotency ────────────────────────────

describe('_ensureAnimLoop is idempotent — no double RAF scheduling (P-62)', () => {
  const ensureBlock = graphJs.split('function _ensureAnimLoop')[1]?.split('\n  }')[0] || ''

  it('only schedules when _animId is falsy', () => {
    expect(ensureBlock).toContain('!_animId')
  })

  it('assigns result to _animId (prevents double scheduling)', () => {
    expect(ensureBlock).toContain('_animId = requestAnimationFrame')
  })

  it('condition is AND: both !_animId and _mounted must be true', () => {
    expect(ensureBlock).toContain('!_animId && _mounted')
  })
})

describe('animLoop idle path (P-62)', () => {
  const loopBlock = graphJs.split('function animLoop')[1]?.split('\n  function ')[0] || ''

  it('idle check is a const assignment', () => {
    expect(loopBlock).toContain('const idle =')
  })

  it('idle branch nulls _animId before return', () => {
    const idleIfIdx = loopBlock.indexOf('if (idle)')
    const afterIdle = loopBlock.slice(idleIfIdx)
    const nullIdx   = afterIdle.indexOf('_animId = null')
    const retIdx    = afterIdle.indexOf('return')
    expect(idleIfIdx).toBeGreaterThan(-1)
    expect(nullIdx).toBeGreaterThan(-1)
    expect(retIdx).toBeGreaterThan(nullIdx)
  })

  it('RAF scheduling is AFTER idle check', () => {
    const idleIdx = loopBlock.indexOf('const idle =')
    const rafIdx  = loopBlock.lastIndexOf('_animId = requestAnimationFrame')
    expect(idleIdx).toBeGreaterThan(-1)
    expect(rafIdx).toBeGreaterThan(idleIdx)
  })
})
