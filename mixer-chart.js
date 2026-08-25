// Copyright (c) 2026 René Antonio Casaña Amaya. All rights reserved.
// Licensed under the AGPL-3.0 License. See LICENSE in repository root.
// F-17: Mixer weight history chart — SVG line chart of category weight drift

;(function mixerChartInit() {
  const COLORS = {
    product: '#ff6b35', backend: '#4ecdc4', frontend: '#45b7d1',
    security: '#f7dc6f', quality_tests: '#82e0aa', performance: '#c39bd3',
    business_logic: '#f1948a', devops_infra: '#85c1e9', ux_accessibility: '#f0b27a',
    data_db: '#aed6f1', i18n: '#d7bde2', refactoring: '#a3e4d7',
    architecture: '#fadbd8', documentation: '#d5dbdb', api_integrations: '#abebc6',
    error_handling: '#f9e79f'
  }

  const W = 280, H = 120, PAD = 24, RIGHT = 8, TOP = 6, BOT = 18

  function renderChart(entries) {
    const panel = document.querySelector('#mixerHistoryPanel')
    const svg = document.querySelector('#mixerHistorySvg')
    if (!panel || !svg) return

    const playEntries = entries.filter(e => e.event === 'play' && e.focus)
    if (playEntries.length < 2) {
      panel.style.display = 'none'
      return
    }

    panel.style.display = ''
    const cats = new Set()
    for (const e of playEntries) {
      for (const k of Object.keys(e.focus)) {
        if (e.focus[k] > 0) cats.add(k)
      }
    }

    const xScale = (i) => PAD + (i / (playEntries.length - 1)) * (W - PAD - RIGHT)
    const yScale = (v) => TOP + (1 - v / 100) * (H - TOP - BOT)

    const lines = []
    const legend = []
    for (const cat of cats) {
      const color = COLORS[cat] || '#888'
      const points = playEntries.map((e, i) => `${xScale(i).toFixed(1)},${yScale(e.focus[cat] || 0).toFixed(1)}`)
      lines.push(`<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.85"/>`)
      const lastVal = playEntries[playEntries.length - 1].focus[cat] || 0
      if (lastVal > 0) {
        legend.push(`<span class="mh-leg" style="color:${color}">${esc(cat.replace('_', ' '))} ${esc(String(lastVal))}%</span>`)
      }
    }

    const yTicks = [0, 25, 50, 75, 100]
    const grid = yTicks.map(v => {
      const y = yScale(v).toFixed(1)
      return `<line x1="${PAD}" y1="${y}" x2="${W - RIGHT}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/><text x="${PAD - 4}" y="${y}" text-anchor="end" fill="var(--dim)" font-size="7" dy="2.5">${v}</text>`
    }).join('')

    const nEntries = playEntries.length
    const xLabels = [0, Math.floor(nEntries / 2), nEntries - 1].filter((v, i, a) => a.indexOf(v) === i)
    const xAxis = xLabels.map(i => {
      const d = new Date(playEntries[i].ts)
      const label = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      return `<text x="${xScale(i).toFixed(1)}" y="${H - 2}" text-anchor="middle" fill="var(--dim)" font-size="7">${esc(label)}</text>`
    }).join('')

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    svg.innerHTML = grid + xAxis + lines.join('')

    const legEl = document.querySelector('#mixerHistoryLegend')
    if (legEl) legEl.innerHTML = legend.join('')
  }

  function initMixerChart() {
    const toggle = document.querySelector('#mixerHistoryToggle')
    const body = document.querySelector('#mixerHistoryBody')
    if (toggle && body) {
      toggle.addEventListener('click', () => {
        const open = body.style.display !== 'none'
        body.style.display = open ? 'none' : ''
        toggle.textContent = (open ? '▸' : '▾') + ' HISTORIAL DE PESOS'
      })
    }
  }

  let _lastDir = null
  let _lastLoad = 0
  const REFRESH_MS = 60_000

  async function loadMixerHistory(dir) {
    if (!dir || typeof window.director?.mixerHistory !== 'function') return
    _lastDir = dir
    _lastLoad = Date.now()
    try {
      const entries = await window.director.mixerHistory(dir, 50)
      if (Array.isArray(entries)) renderChart(entries)
    } catch {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMixerChart()

    const toggle = document.querySelector('#mixerHistoryToggle')
    if (toggle) {
      toggle.addEventListener('click', () => {
        if (_lastDir) loadMixerHistory(_lastDir)
      })
    }

    if (window.director?.onMetrics) {
      window.director.onMetrics((data) => {
        if (data.dir && data.dir !== _lastDir) {
          loadMixerHistory(data.dir)
        } else if (data.dir && Date.now() - _lastLoad > REFRESH_MS) {
          loadMixerHistory(data.dir)
        }
      })
    }
  })

  window._mixerChart = { load: loadMixerHistory, render: renderChart }
})()
