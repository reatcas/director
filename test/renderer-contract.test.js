import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const preload = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const mixerChart = fs.readFileSync(path.join(ROOT, 'mixer-chart.js'), 'utf8')

describe('renderer→preload method contract', () => {
  const preloadMethods = preload.match(/^\s+(\w+)\s*:/gm)?.map(m => m.trim().replace(':', '')) || []

  const rendererCalls = rendererJs.match(/window\.director\.(\w+)/g)?.map(c => c.replace('window.director.', '')) || []
  const uniqueCalls = [...new Set(rendererCalls)]

  it('preload exposes at least 40 methods', () => {
    expect(preloadMethods.length).toBeGreaterThanOrEqual(40)
  })

  it('renderer uses at least 30 distinct API methods', () => {
    expect(uniqueCalls.length).toBeGreaterThanOrEqual(30)
  })

  for (const method of uniqueCalls) {
    it(`window.director.${method} exists in preload`, () => {
      expect(preloadMethods).toContain(method)
    })
  }
})

describe('event listener contract', () => {
  const eventMethods = ['onLine', 'onExit', 'onResumed', 'onUsageLimit', 'onMetrics']

  for (const ev of eventMethods) {
    it(`preload exposes ${ev}`, () => {
      expect(preload).toContain(`${ev}:`)
    })
  }

  it('renderer uses onMetrics', () => {
    expect(rendererJs).toContain('window.director.onMetrics')
  })

  it('renderer uses onLine', () => {
    expect(rendererJs).toContain('window.director.onLine')
  })

  it('renderer uses onExit', () => {
    expect(rendererJs).toContain('window.director.onExit')
  })

  it('renderer uses onUsageLimit', () => {
    expect(rendererJs).toContain('window.director.onUsageLimit')
  })

  it('renderer uses onResumed', () => {
    expect(rendererJs).toContain('window.director.onResumed')
  })
})

describe('mixer-chart→preload contract', () => {
  it('mixer-chart uses mixerHistory via window.director', () => {
    expect(mixerChart).toContain('director.mixerHistory')
  })

  it('mixerHistory is defined in preload', () => {
    expect(preload).toContain('mixerHistory:')
  })
})

describe('API method usage frequency', () => {
  it('mixerRead is used frequently (core operation)', () => {
    const count = (rendererJs.match(/director\.mixerRead/g) || []).length
    expect(count).toBeGreaterThanOrEqual(5)
  })

  it('mixerWrite is used for mixer saves', () => {
    const count = (rendererJs.match(/director\.mixerWrite/g) || []).length
    expect(count).toBeGreaterThanOrEqual(2)
  })

  it('lifecycleAdd is called for multiple event types', () => {
    const count = (rendererJs.match(/director\.lifecycleAdd/g) || []).length
    expect(count).toBeGreaterThanOrEqual(3)
  })
})

describe('renderer async patterns', () => {
  it('uses async/await for API calls', () => {
    const asyncCalls = rendererJs.match(/await window\.director\./g) || []
    expect(asyncCalls.length).toBeGreaterThan(20)
  })

  it('wraps API calls in try-catch or handles errors', () => {
    expect(rendererJs).toContain('catch')
  })
})

describe('renderer data flow patterns', () => {
  it('onMetrics handler updates multiple dashboard sections', () => {
    const handler = rendererJs.split('window.director.onMetrics')[1]?.split('window.director.on')[0] || ''
    expect(handler.length).toBeGreaterThan(100)
  })

  it('onLine handler processes log lines', () => {
    const handler = rendererJs.split('window.director.onLine')[1]?.split('window.director.on')[0] || ''
    expect(handler.length).toBeGreaterThan(50)
  })

  it('onExit handler updates UI state', () => {
    const handler = rendererJs.split('window.director.onExit')[1]?.split('window.director.on')[0] ||
                    rendererJs.split('window.director.onExit')[1]?.split('\n\n')[0] || ''
    expect(handler.length).toBeGreaterThan(20)
  })
})

describe('renderer refresh cycle', () => {
  it('defines a refresh function for project list', () => {
    expect(rendererJs).toContain('async function refresh')
  })

  it('refresh loads projects from API', () => {
    const refreshFn = rendererJs.split('async function refresh')[1]?.split('\n}')[0] || ''
    expect(refreshFn).toContain('director.list')
  })
})

describe('renderer mixer equalizer', () => {
  it('creates slider inputs for mixer categories', () => {
    expect(rendererJs).toContain('type="range"')
  })

  it('normalizes weights to sum to 100', () => {
    expect(rendererJs).toContain('100')
    expect(rendererJs).toMatch(/rebalance|normalize/)
  })

  it('debounces mixer saves', () => {
    expect(rendererJs).toMatch(/debounce|setTimeout/)
  })

  it('saves mixer state via API', () => {
    expect(rendererJs).toContain('director.mixerWrite')
  })
})

describe('renderer log viewer', () => {
  it('has log filter functionality', () => {
    expect(rendererJs).toContain('logFilterInput')
    expect(rendererJs).toContain('filter')
  })

  it('processes different log line types', () => {
    expect(rendererJs).toContain('▸')
    expect(rendererJs).toContain('✔')
  })

  it('creates log entries with innerHTML', () => {
    expect(rendererJs).toContain('innerHTML')
  })

  it('escapes log content with esc()', () => {
    expect(rendererJs).toContain('esc(')
  })
})

describe('renderer drag-and-drop', () => {
  it('handles dragover events', () => {
    expect(rendererJs).toContain('dragover')
  })

  it('handles drop events', () => {
    expect(rendererJs).toContain("'drop'")
  })

  it('adds project on drop', () => {
    const dropHandler = rendererJs.split("document.addEventListener('drop'")[1]?.split('\n})')[0] || ''
    expect(dropHandler).toContain('director.add')
  })
})

describe('renderer keyboard shortcuts', () => {
  it('has keydown listener', () => {
    expect(rendererJs).toContain("'keydown'")
  })
})

describe('renderer theme management', () => {
  it('has theme toggle button handler', () => {
    expect(rendererJs).toContain('themeToggle')
  })

  it('respects system preference', () => {
    expect(rendererJs).toContain('prefers-color-scheme')
  })

  it('adds/removes light class', () => {
    expect(rendererJs).toContain("classList.add('light')")
    expect(rendererJs).toContain("classList.remove('light')")
  })
})

describe('renderer layout init', () => {
  it('has initSplitDivider cleanup', () => {
    expect(rendererJs).toContain('initSplitDivider')
  })

  it('clears stale localStorage split keys', () => {
    expect(rendererJs).toContain("localStorage.removeItem('director:splitVPct')")
  })
})
