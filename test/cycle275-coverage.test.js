// cycle275-coverage.test.js — C275 quality coverage
// T-234: BL-39 persistTelemetry splice→slice; BL-40 getActiveDirectories for-of; BL-41 headers ?? []
// T-235: A-54 loadKnowledge _knBtns for-of; A-55 switchTab for-of; A-56 cmdPalette tab indexed for
// T-236: DD-07 newlines split().length-1; DD-08 titleCount ?? 0

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const coordJs    = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')
const schedJs    = readFileSync(join(root, 'resource-scheduler.js'), 'utf8')
const ctxJs      = readFileSync(join(root, 'context-protocol.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-234: BL-39 + BL-40 + BL-41 ───────────────────────────────────────────
describe('T-234: BL-39 persistTelemetry uses slice instead of splice for trim', () => {
  it('uses hist = hist.slice(-300) instead of splice', () => {
    const block = coordJs.split('persistTelemetry')[1]?.split('cleanup(')[0] || ''
    expect(block).toContain('hist = hist.slice(-300)')
    expect(block).not.toContain('hist.splice(0, hist.length - 300)')
  })
})

describe('T-234: BL-40 getActiveDirectories uses for...of instead of Array.from', () => {
  it('builds _ad with for...of over allocations.keys()', () => {
    const block = schedJs.split('getActiveDirectories')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('_ad')
    expect(block).toContain('for (const k of this.allocations.keys())')
    expect(block).not.toContain('Array.from(this.allocations.keys())')
  })
})

describe('T-234: BL-41 _estimateTokens uses nullish coalescing for headers', () => {
  it('uses ?? [] instead of || [] for headers match', () => {
    const block = ctxJs.split('_estimateTokens')[1]?.split('_splitSections')[0] || ''
    expect(block).toContain('?? []')
    expect(block).not.toContain("|| []).length")
  })
})

// ─── T-235: A-54 + A-55 + A-56 ───────────────────────────────────────────────
describe('T-235: A-54 loadKnowledge uses for...of for _knBtns aria state', () => {
  it('uses for...of instead of forEach for warn class + aria-pressed removal', () => {
    const block = rendererJs.split('function loadKnowledge')[1]?.split('\n}')[0] || ''
    expect(block).toContain('for (const b of _knBtns)')
    expect(block).not.toContain('_knBtns.forEach')
  })
})

describe('T-235: A-55 switchTab uses for...of for aria-selected + aria-hidden', () => {
  it('uses for...of over .mixer-tab elements instead of forEach in switchTab', () => {
    expect(rendererJs).toContain("for (const x of document.querySelectorAll('.mixer-tab'))")
    const block = rendererJs.split('function switchTab')[1]?.split('\n}')[0] || ''
    expect(block).not.toContain('.forEach(')
  })

  it('uses for...of over .mixer-tab-pane elements instead of forEach', () => {
    expect(rendererJs).toContain("for (const x of document.querySelectorAll('.mixer-tab-pane'))")
    expect(rendererJs).not.toContain("document.querySelectorAll('.mixer-tab-pane').forEach")
  })
})

describe('T-235: A-56 cmd palette Tab uses indexed for loop for aria-selected', () => {
  it('uses indexed for loop with _cpi instead of _cpItems.forEach', () => {
    expect(rendererJs).toContain('for (const [_cpi, el] of _cpItems.entries())')
    expect(rendererJs).not.toContain('_cpItems.forEach((el, i) =>')
  })
})

// ─── T-236: DD-07 + DD-08 ────────────────────────────────────────────────────
describe('T-236: DD-07 _estimateTokens uses split for newline count', () => {
  it('uses text.split newline count instead of match array', () => {
    const block = ctxJs.split('_estimateTokens')[1]?.split('_splitSections')[0] || ''
    expect(block).toContain("text.split('\\n').length - 1")
    expect(block).not.toContain("text.match(/\\n/g) || []")
  })
})

describe('T-236: DD-08 _splitSections uses nullish coalescing for titleCount', () => {
  it('uses ?? 0 instead of || 0 for titleCount lookup', () => {
    const block = ctxJs.split('_splitSections')[1]?.split('computeDelta')[0] || ''
    expect(block).toContain('titleCount.get(rawTitle) ?? 0')
    expect(block).not.toContain('titleCount.get(rawTitle) || 0')
  })
})
