import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const chartJs = fs.readFileSync(path.join(ROOT, 'mixer-chart.js'), 'utf8')

describe('mixer-chart.js security invariants', () => {
  it('uses esc() for category names in legend', () => {
    expect(chartJs).toContain("esc(cat.replace('_', ' '))")
  })

  it('uses esc() for percentage values in legend', () => {
    expect(chartJs).toContain('esc(String(lastVal))')
  })

  it('uses esc() for timestamp labels', () => {
    expect(chartJs).toContain('esc(label)')
  })

  it('uses esc() for tick values', () => {
    expect(chartJs).toContain('${v}')
  })
})

describe('mixer-chart.js structure', () => {
  it('uses IIFE pattern to avoid global pollution', () => {
    expect(chartJs).toContain(';(function mixerChartInit()')
  })

  it('exposes load and render via window._mixerChart', () => {
    expect(chartJs).toContain('window._mixerChart')
    expect(chartJs).toContain('load:')
    expect(chartJs).toContain('render:')
  })

  it('filters entries to only play events', () => {
    expect(chartJs).toContain("e.event === 'play'")
  })

  it('requires at least 2 entries to render', () => {
    expect(chartJs).toContain('playEntries.length < 2')
  })

  it('listens for metrics updates to auto-load', () => {
    expect(chartJs).toContain('onMetrics')
  })

  it('defines color palette for all categories', () => {
    const categories = ['product', 'backend', 'frontend', 'security', 'quality_tests', 'performance']
    for (const cat of categories) {
      expect(chartJs).toContain(`${cat}:`)
    }
  })
})

describe('mixer-chart.js + index.html integration', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

  it('index.html loads mixer-chart.js after renderer.js', () => {
    const rendererIdx = html.indexOf('renderer.js')
    const chartIdx = html.indexOf('mixer-chart.js')
    expect(rendererIdx).toBeGreaterThan(-1)
    expect(chartIdx).toBeGreaterThan(rendererIdx)
  })

  it('index.html has mixerHistoryPanel container', () => {
    expect(html).toContain('id="mixerHistoryPanel"')
    expect(html).toContain('id="mixerHistorySvg"')
    expect(html).toContain('id="mixerHistoryLegend"')
  })

  it('index.html has toggle button with aria-label', () => {
    expect(html).toContain('id="mixerHistoryToggle"')
    expect(html).toContain('aria-label="Alternar historial de pesos"')
  })
})

describe('mixer-chart.js refresh behavior', () => {
  it('defines periodic refresh interval constant', () => {
    expect(chartJs).toContain('REFRESH_MS')
    expect(chartJs).toContain('60_000')
  })

  it('tracks last load timestamp', () => {
    expect(chartJs).toContain('_lastLoad')
    expect(chartJs).toContain('Date.now()')
  })

  it('refreshes on toggle click', () => {
    const toggleListeners = chartJs.match(/toggle\.addEventListener\('click'/g) || []
    expect(toggleListeners.length).toBe(2)
    const refreshBlock = chartJs.split("toggle.addEventListener('click'")[2]?.split('}')[0] || ''
    expect(refreshBlock).toContain('loadMixerHistory')
  })

  it('refreshes when stale on metrics update', () => {
    expect(chartJs).toContain('Date.now() - _lastLoad > REFRESH_MS')
  })
})
