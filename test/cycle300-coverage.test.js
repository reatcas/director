// cycle300-coverage.test.js — C300 quality coverage
// T-285: S-178 orchestraReport per-line ctrl-char strip; S-179 ROADMAP/PENDING strip
// T-286: P-117 initials for-of; B-71 PLAN/log for-of strip
// T-287: F-68 ?? batch in mixer-chart + mixer-graph

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs       = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs   = readFileSync(join(root, 'renderer.js'), 'utf8')
const chartJs      = readFileSync(join(root, 'mixer-chart.js'), 'utf8')
const mixerGraphJs = readFileSync(join(root, 'mixer-graph.js'), 'utf8')

// ─── T-285: S-178 + S-179 ────────────────────────────────────────────────────
describe('T-285: S-178 orchestra:analyze ORCHESTRA_REPORT uses _orParts for-of with ctrl-char strip', () => {
  it('uses _orParts variable', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_orParts')
  })

  it('strips ctrl-chars from each ORCHESTRA_REPORT line', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_orParts.push(l.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\'))')
  })

  it('no longer calls .slice(-150).join without strip', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).not.toContain('.slice(-150).join(')
  })
})

describe('T-285: S-179 orchestra:analyze ROADMAP/PENDING reads have ctrl-char strip', () => {
  it('ROADMAP.md read applies narrow ctrl-char strip', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("read('ROADMAP.md').replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('PENDING.md read applies narrow ctrl-char strip', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("read('PENDING.md').replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })
})

// ─── T-286: P-117 + B-71 ─────────────────────────────────────────────────────
describe('T-286: P-117 initials function uses for-of instead of .map', () => {
  it('uses _iParts variable', () => {
    expect(rendererJs).toContain('_iParts')
  })

  it('no longer uses .map(w => w[0])', () => {
    expect(rendererJs).not.toContain('.map(w => w[0])')
  })

  it('uses for-of over split words', () => {
    expect(rendererJs).toContain('for (const w of n.replace(')
  })
})

describe('T-286: B-71 orchestra:analyze PLAN/log reads use for-of with ctrl-char strip', () => {
  it('uses _plParts for PLAN.md lines', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_plParts')
  })

  it('uses _lgParts for orchestra.log lines', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_lgParts')
  })

  it('PLAN.md strips ctrl-chars per line', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_plParts.push(l.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\'))')
  })
})

// ─── T-287: F-68 ─────────────────────────────────────────────────────────────
describe('T-287: F-68 mixer-chart focus lookup uses ?? instead of ||', () => {
  it('e.focus[cat] uses ?? 0 not || 0 in polyline points', () => {
    expect(chartJs).toContain('e.focus[cat] ?? 0')
    expect(chartJs).not.toContain('e.focus[cat] || 0')
  })

  it('lastVal lookup uses ?? 0 not || 0', () => {
    expect(chartJs).toContain('.focus[cat] ?? 0')
  })
})

describe('T-287: F-68 mixer-graph category fallback uses ?? HUB_ID', () => {
  it('category fallback uses ?? HUB_ID not || HUB_ID', () => {
    expect(mixerGraphJs).toContain('category ?? HUB_ID')
    expect(mixerGraphJs).not.toContain('category || HUB_ID')
  })

  it('_activeCategory fallback uses ?? HUB_ID not || HUB_ID', () => {
    expect(mixerGraphJs).toContain('_activeCategory ?? HUB_ID')
    expect(mixerGraphJs).not.toContain('_activeCategory || HUB_ID')
  })
})
