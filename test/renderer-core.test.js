import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

describe('renderer.js core utilities', () => {
  it('defines $ selector helper', () => {
    expect(rendererJs).toContain("const $ = s => document.querySelector(s)")
  })

  it('defines esc() XSS sanitizer', () => {
    expect(rendererJs).toContain('function esc(str)')
    expect(rendererJs).toContain('&amp;')
    expect(rendererJs).toContain('&lt;')
    expect(rendererJs).toContain('&gt;')
    expect(rendererJs).toContain('&quot;')
  })
})

describe('transport controls', () => {
  it('has play button handler', () => {
    expect(rendererJs).toContain("$('#playBtn')")
  })

  it('has stop (fine) button handler', () => {
    expect(rendererJs).toContain("$('#fineBtn')")
  })

  it('has kill button handler', () => {
    expect(rendererJs).toContain("$('#killBtn')")
  })

  it('buttons have aria-labels in HTML', () => {
    expect(html).toContain('aria-label')
  })
})

describe('mixer equalizer', () => {
  it('defines rebalanceMixer function', () => {
    expect(rendererJs).toContain('rebalanceMixer')
  })

  it('implements debounced save', () => {
    expect(rendererJs).toContain('debouncedMixerSave')
  })

  it('calls mixerWrite IPC', () => {
    expect(rendererJs).toContain('mixerWrite')
  })

  it('renders slider for each category', () => {
    expect(rendererJs).toContain('input type="range"')
  })
})

describe('log viewer', () => {
  it('appends log entries to #log element', () => {
    expect(rendererJs).toContain("$('#log')")
  })

  it('defines log entry functions', () => {
    expect(rendererJs).toContain('function addCycleEntry')
    expect(rendererJs).toContain('function addErrorEntry')
    expect(rendererJs).toContain('function addActionEntry')
  })

  it('supports log filtering', () => {
    expect(rendererJs).toContain('logFilter')
  })

  it('has group body for multi-line entries', () => {
    expect(rendererJs).toContain('le-group-body')
  })
})

describe('project list', () => {
  it('renders project items in list', () => {
    expect(rendererJs).toContain("$('#projects')")
    expect(rendererJs).toContain("createElement('li')")
  })

  it('tracks current project', () => {
    expect(rendererJs).toMatch(/let current\b/)
  })

  it('supports drag and drop for adding projects', () => {
    expect(rendererJs).toContain('dragover')
    expect(rendererJs).toContain('drop')
  })
})

describe('theme support', () => {
  it('toggles light/dark theme', () => {
    expect(rendererJs).toContain("classList.add('light')")
    expect(rendererJs).toContain("classList.remove('light')")
  })

  it('CSS has light theme variables', () => {
    expect(css).toContain('html.light')
  })

  it('CSS has dark theme as default', () => {
    expect(css).toContain(':root')
    expect(css).toContain('--bg:')
  })
})

describe('aurora effects', () => {
  it('references aurora gradient in renderer', () => {
    expect(rendererJs).toContain('aurora')
  })

  it('CSS defines aurora animation', () => {
    expect(css).toContain('aurora')
  })
})
