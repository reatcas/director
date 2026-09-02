import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT        = path.resolve(import.meta.dirname, '..')
const mainJs      = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs  = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const chartJs     = fs.readFileSync(path.join(ROOT, 'mixer-chart.js'), 'utf8')

// ─── T-276: S-172 notes:read ctrl-char strip ────────────────────────────────

describe('notes:read strips ctrl-chars from returned data (S-172)', () => {
  it('applies narrow ctrl-char strip to notes data before returning', () => {
    const block = mainJs.split("'notes:read'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain(".replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('strip is applied before caching and return', () => {
    const block = mainJs.split("'notes:read'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("readFileSync(p, 'utf8').replace(")
  })
})

// ─── T-276: S-173 orchestra:tail ctrl-char strip ────────────────────────────

describe('orchestra:tail strips ctrl-chars per line (S-173)', () => {
  it('strips ctrl-chars from each line in _cappedLines loop', () => {
    const block = mainJs.split("'orchestra:tail'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_ls')
    expect(block).toContain(".replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('length cap applied to stripped line', () => {
    const block = mainJs.split("'orchestra:tail'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_ls.length > 4096')
  })
})

// ─── T-277: P-114 renderSparkline for-of min/max ────────────────────────────

describe('renderSparkline uses for-of accumulator instead of Math.min/max spread (P-114)', () => {
  it('does not use Math.min(...scores) spread', () => {
    const block = rendererJs.split('function renderSparkline')[1]?.split('\nfunction')[0] || ''
    expect(block).not.toContain('Math.min(...scores)')
    expect(block).not.toContain('Math.max(...scores)')
  })

  it('uses for-of loop for min/max tracking', () => {
    const block = rendererJs.split('function renderSparkline')[1]?.split('\nfunction')[0] || ''
    expect(block).toContain('for (const _sv of scores)')
  })

  it('tracks min and max with conditional comparison', () => {
    const block = rendererJs.split('function renderSparkline')[1]?.split('\nfunction')[0] || ''
    expect(block).toContain('if (_sv < min) min = _sv')
    expect(block).toContain('if (_sv > max) max = _sv')
  })
})

// ─── T-277: B-68 mixer-chart _ecFiltered for-of ─────────────────────────────

describe('mixer-chart uses _ecFiltered for-of instead of entries.filter (B-68)', () => {
  it('uses _ecFiltered variable', () => {
    expect(chartJs).toContain('_ecFiltered')
  })

  it('no longer calls entries.filter', () => {
    expect(chartJs).not.toContain('entries.filter(')
  })

  it('assigns playEntries = _ecFiltered', () => {
    expect(chartJs).toContain('playEntries = _ecFiltered')
  })
})

// ─── T-278: F-65 COLORS ?? and xLabels Set ──────────────────────────────────

describe('mixer-chart COLORS lookup uses ?? and xLabels uses Set dedup (F-65)', () => {
  it('COLORS[cat] uses ?? fallback', () => {
    expect(chartJs).toContain("COLORS[cat] ?? '#888'")
  })

  it('COLORS does not use || fallback', () => {
    expect(chartJs).not.toContain("COLORS[cat] || '#888'")
  })

  it('xLabels deduplication uses new Set', () => {
    expect(chartJs).toContain('new Set([0,')
  })

  it('xLabels no longer uses filter-based deduplication', () => {
    expect(chartJs).not.toContain('.filter((v, i, a) => a.indexOf(v) === i)')
  })
})
