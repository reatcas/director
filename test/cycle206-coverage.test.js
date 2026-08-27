import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('mixer:history focus value validation (S-45)', () => {
  const block = mainJs.split("'mixer:history'")[1]?.split('\nipcMain')[0] || ''

  it('validates focus values are numbers', () => {
    expect(block).toContain("typeof v === 'number'")
    expect(block).toContain('Number.isFinite(v)')
  })

  it('validates focus values are in range 0-100', () => {
    expect(block).toContain('v >= 0')
    expect(block).toContain('v <= 100')
  })

  it('uses Object.values on focus entries', () => {
    expect(block).toContain('Object.values(h.focus)')
  })
})

describe('repertoire:add projects cap at 100 (S-46)', () => {
  const block = mainJs.split("'repertoire:add'")[1]?.split("'repertoire:remove'")[0] || ''

  it('checks projects.length >= 100 before push', () => {
    expect(block).toContain('projects.length >= 100')
  })

  it('returns dir without adding when at cap', () => {
    const capBlock = block.split('projects.length >= 100')[1]?.split('\n')[0] || ''
    expect(capBlock).toContain('return dir')
  })
})

describe('metrics:allocation slow TTL (P-45)', () => {
  const block = mainJs.split("'metrics:allocation'")[1]?.split('\nipcMain')[0] || ''

  it('uses _SLOW_METRICS_TTL for allocation cache', () => {
    expect(block).toContain('_SLOW_METRICS_TTL')
    expect(block).toContain("'allocation:'")
  })
})

describe('orchestra:analyze analysis file pruning (D-13)', () => {
  const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''

  it('reads analysis files from .claude dir', () => {
    expect(block).toContain('readdirSync')
    expect(block).toMatch(/analysis-\S+\.txt/)
  })

  it('sorts and caps to 10 most recent', () => {
    expect(block).toContain('.sort()')
    expect(block).toContain('_anFiles.length > 10')
  })

  it('unlinks old files beyond cap', () => {
    expect(block).toContain('unlinkSync')
  })
})

describe('session-summary renderer panel (FE-03)', () => {
  it('loadSessionSummary function exists in renderer', () => {
    expect(rendererJs).toContain('async function loadSessionSummary()')
  })

  it('calls window.director.sessionSummary', () => {
    expect(rendererJs).toContain('window.director.sessionSummary()')
  })

  it('renders active count with ss-live class', () => {
    expect(rendererJs).toContain('ss-live')
    expect(rendererJs).toContain('activos')
  })

  it('renders token count with tok label', () => {
    expect(rendererJs).toContain('tok')
    expect(rendererJs).toContain('totalTokens')
  })

  it('sessionSummary div exists in HTML', () => {
    expect(html).toContain('id="sessionSummary"')
  })

  it('sessionSummary has role=status', () => {
    expect(html).toMatch(/id="sessionSummary"[^>]*role="status"/)
  })

  it('sessionSummary has aria-live', () => {
    expect(html).toMatch(/id="sessionSummary"[^>]*aria-live/)
  })

  it('loadSessionSummary called on boot and interval', () => {
    expect(rendererJs).toContain('loadSessionSummary()')
    expect(rendererJs).toContain('setInterval(loadSessionSummary')
  })
})
