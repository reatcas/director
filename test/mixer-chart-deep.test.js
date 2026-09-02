import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const chartJs = fs.readFileSync(path.join(ROOT, 'mixer-chart.js'), 'utf8')

// ─── COLORS palette completeness ───────────────────────────────────────────
describe('mixer-chart — COLORS palette', () => {
  const colorBlock = chartJs.split('const COLORS')[1]?.split('}')[0] || ''
  const allCats = [
    'product', 'backend', 'frontend', 'security', 'quality_tests',
    'performance', 'business_logic', 'devops_infra', 'ux_accessibility',
    'data_db', 'i18n', 'refactoring', 'architecture', 'documentation',
    'api_integrations', 'error_handling',
  ]

  for (const cat of allCats) {
    it(`has color for ${cat}`, () => {
      expect(colorBlock).toContain(`${cat}:`)
    })
  }

  it('all colors are hex format', () => {
    const hexes = colorBlock.match(/#[0-9a-fA-F]{6}/g) || []
    expect(hexes.length).toBe(16)
  })

  it('has fallback color for unknown categories', () => {
    expect(chartJs).toContain("COLORS[cat] ?? '#888'")
  })
})

// ─── Chart dimensions and layout constants ─────────────────────────────────
describe('mixer-chart — layout constants', () => {
  it('defines chart dimensions W and H', () => {
    expect(chartJs).toContain('W = 280')
    expect(chartJs).toContain('H = 120')
  })

  it('defines padding constants', () => {
    expect(chartJs).toContain('PAD = 24')
    expect(chartJs).toContain('RIGHT = 8')
    expect(chartJs).toContain('TOP = 6')
    expect(chartJs).toContain('BOT = 18')
  })
})

// ─── SVG rendering ─────────────────────────────────────────────────────────
describe('mixer-chart — SVG rendering', () => {
  it('sets viewBox on SVG element', () => {
    expect(chartJs).toContain("svg.setAttribute('viewBox'")
  })

  it('renders polyline for each category', () => {
    expect(chartJs).toContain('<polyline')
    expect(chartJs).toContain('fill="none"')
    expect(chartJs).toContain('stroke="${color}"')
  })

  it('uses 1.5 stroke width', () => {
    expect(chartJs).toContain('stroke-width="1.5"')
  })

  it('uses 0.85 opacity for lines', () => {
    expect(chartJs).toContain('opacity="0.85"')
  })

  it('renders y-axis grid at 0, 25, 50, 75, 100', () => {
    expect(chartJs).toContain('[0, 25, 50, 75, 100]')
  })

  it('renders grid lines with CSS var color', () => {
    expect(chartJs).toContain('var(--line')
  })

  it('renders y-axis tick labels', () => {
    expect(chartJs).toContain('text-anchor="end"')
    expect(chartJs).toContain('font-size="7"')
  })

  it('renders x-axis time labels', () => {
    expect(chartJs).toContain('text-anchor="middle"')
    expect(chartJs).toContain('getHours()')
    expect(chartJs).toContain('getMinutes()')
    expect(chartJs).toContain('padStart(2,')
  })

  it('shows 3 x-axis labels (start, middle, end)', () => {
    expect(chartJs).toContain('Math.floor(nEntries / 2)')
    expect(chartJs).toContain('nEntries - 1')
  })

  it('deduplicates x-axis labels', () => {
    expect(chartJs).toContain('new Set([0,')
  })
})

// ─── Scale functions ───────────────────────────────────────────────────────
describe('mixer-chart — scale functions', () => {
  it('defines xScale mapping index to pixel', () => {
    expect(chartJs).toContain('const xScale')
    expect(chartJs).toContain('playEntries.length - 1')
  })

  it('defines yScale mapping value (0-100) to pixel', () => {
    expect(chartJs).toContain('const yScale')
    expect(chartJs).toContain('1 - v / 100')
  })

  it('uses toFixed(1) for coordinate precision', () => {
    const toFixedCount = (chartJs.match(/toFixed\(1\)/g) || []).length
    expect(toFixedCount).toBeGreaterThanOrEqual(4)
  })
})

// ─── Legend generation ─────────────────────────────────────────────────────
describe('mixer-chart — legend', () => {
  it('renders legend items with mh-leg class', () => {
    expect(chartJs).toContain('class="mh-leg"')
  })

  it('shows category name with underscore replaced by space', () => {
    expect(chartJs).toContain("cat.replace('_', ' ')")
  })

  it('shows percentage value', () => {
    expect(chartJs).toContain('${esc(String(lastVal))}%')
  })

  it('only shows categories with lastVal > 0', () => {
    expect(chartJs).toContain('if (lastVal > 0)')
  })

  it('writes legend to #mixerHistoryLegend', () => {
    expect(chartJs).toContain("'#mixerHistoryLegend'")
  })
})

// ─── Category detection ───────────────────────────────────────────────────
describe('mixer-chart — category discovery', () => {
  it('collects categories from all entries', () => {
    expect(chartJs).toContain('const cats = new Set()')
  })

  it('only includes categories with value > 0', () => {
    expect(chartJs).toContain('e.focus[k] > 0')
  })

  it('reads focus object from each entry', () => {
    expect(chartJs).toContain('Object.keys(e.focus)')
  })
})

// ─── Panel visibility ─────────────────────────────────────────────────────
describe('mixer-chart — panel visibility', () => {
  it('hides panel when fewer than 2 entries', () => {
    expect(chartJs).toContain("panel.style.display = 'none'")
  })

  it('shows panel when enough entries', () => {
    expect(chartJs).toContain("panel.style.display = ''")
  })

  it('queries #mixerHistoryPanel', () => {
    expect(chartJs).toContain("'#mixerHistoryPanel'")
  })

  it('queries #mixerHistorySvg', () => {
    expect(chartJs).toContain("'#mixerHistorySvg'")
  })
})

// ─── Toggle behavior ──────────────────────────────────────────────────────
describe('mixer-chart — toggle', () => {
  it('toggles body display between none and visible', () => {
    expect(chartJs).toContain("body.style.display !== 'none'")
    expect(chartJs).toContain("open ? 'none' : ''")
  })

  it('changes toggle text with arrow direction', () => {
    expect(chartJs).toContain("'▸'")
    expect(chartJs).toContain("'▾'")
    expect(chartJs).toContain('HISTORIAL DE PESOS')
  })
})

// ─── Async loading ────────────────────────────────────────────────────────
describe('mixer-chart — async loading', () => {
  it('checks dir is truthy before loading', () => {
    expect(chartJs).toContain('if (!dir')
  })

  it('checks window.director.mixerHistory is a function', () => {
    expect(chartJs).toContain("typeof window.director?.mixerHistory !== 'function'")
  })

  it('requests 50 entries', () => {
    expect(chartJs).toContain('mixerHistory(dir, 50)')
  })

  it('validates response is array', () => {
    expect(chartJs).toContain('Array.isArray(entries)')
  })

  it('wraps in try-catch', () => {
    expect(chartJs).toContain('try {')
    expect(chartJs).toContain('} catch')
  })

  it('tracks last loaded directory', () => {
    expect(chartJs).toContain('_lastDir = dir')
  })
})

// ─── Metrics listener ─────────────────────────────────────────────────────
describe('mixer-chart — metrics listener', () => {
  it('listens for onMetrics events', () => {
    expect(chartJs).toContain('window.director.onMetrics')
  })

  it('loads on new directory', () => {
    expect(chartJs).toContain('data.dir !== _lastDir')
  })

  it('reloads when stale', () => {
    expect(chartJs).toContain('Date.now() - _lastLoad > REFRESH_MS')
  })

  it('checks onMetrics exists before attaching', () => {
    expect(chartJs).toContain('window.director?.onMetrics')
  })
})

// ─── DOMContentLoaded initialization ──────────────────────────────────────
describe('mixer-chart — initialization', () => {
  it('waits for DOMContentLoaded', () => {
    expect(chartJs).toContain("document.addEventListener('DOMContentLoaded'")
  })

  it('calls initMixerChart on load', () => {
    expect(chartJs).toContain('initMixerChart()')
  })

  it('defines renderChart function', () => {
    expect(chartJs).toContain('function renderChart(entries)')
  })

  it('defines loadMixerHistory async function', () => {
    expect(chartJs).toContain('async function loadMixerHistory(dir)')
  })

  it('defines initMixerChart function', () => {
    expect(chartJs).toContain('function initMixerChart()')
  })
})

// ─── Copyright and license ────────────────────────────────────────────────
describe('mixer-chart — file metadata', () => {
  it('has copyright header', () => {
    expect(chartJs.startsWith('// Copyright')).toBe(true)
  })

  it('has AGPL-3.0 license', () => {
    expect(chartJs).toContain('AGPL-3.0')
  })

  it('references F-17 feature', () => {
    expect(chartJs).toContain('F-17')
  })
})
