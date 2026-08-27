import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('Content-Security-Policy header (I-224)', () => {
  it('has CSP meta tag', () => {
    expect(html).toContain('Content-Security-Policy')
  })

  it('CSP restricts default-src to self', () => {
    expect(html).toContain("default-src 'self'")
  })

  it('CSP restricts object-src to none', () => {
    expect(html).toContain("object-src 'none'")
  })

  it('has viewport meta tag', () => {
    expect(html).toContain('name="viewport"')
  })
})

describe('export:session output size limit (I-226)', () => {
  const block = mainJs.split("'export:session'")[1]?.split('\nipcMain')[0] || ''

  it('serializes snapshot before showing dialog', () => {
    expect(block).toContain('serialized')
    expect(block).toContain('JSON.stringify(snapshot')
  })

  it('enforces 10MB output size cap', () => {
    expect(block).toContain('10_485_760')
  })

  it('returns error for oversized export', () => {
    const capLine = block.split('10_485_760')[1]?.split('\n')[0] || ''
    expect(capLine).toContain('return')
    expect(capLine).toContain('ok: false')
  })
})

describe('repertoire:readFile isFile check (I-228)', () => {
  const block = mainJs.split("'repertoire:readFile'")[1]?.split('\nipcMain')[0] || ''

  it('calls statSync to check file type', () => {
    expect(block).toContain('statSync(p)')
  })

  it('rejects directories with isFile() check', () => {
    expect(block).toContain('stat.isFile()')
  })

  it('enforces 2MB size limit', () => {
    expect(block).toContain('2_097_152')
  })
})

describe('metrics strip missing aria-labels (I-230)', () => {
  it('compliance cell has aria-label', () => {
    expect(html).toContain('id="mmComplianceVal"')
    expect(html).toMatch(/aria-label="[^"]*cumplimiento[^"]*"/)
  })

  it('roadmap cell has aria-label', () => {
    expect(html).toContain('id="mmRoadmapVal"')
    expect(html).toMatch(/aria-label="[^"]*[Rr]oadmap[^"]*"/)
  })

  it('burn rate cell has aria-label', () => {
    expect(html).toContain('id="mmBurnVal"')
    expect(html).toMatch(/aria-label="[^"]*([Bb]urn|Tasa|consumo)[^"]*"/)
  })

  it('AI usage cell has aria-label', () => {
    expect(html).toContain('id="mmAiUsageVal"')
    expect(html).toMatch(/mm-cell-usage"[^>]*aria-label|aria-label[^>]*mm-cell-usage/)
  })
})

describe('orchestra:clearLog context-metrics cap (I-231)', () => {
  const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''

  it('caps context-metrics telemetry file', () => {
    expect(block).toContain('context-metrics.json')
  })

  it('slices to last 500 entries', () => {
    expect(block).toContain('slice(-500)')
  })

  it('writes pruned telemetry back', () => {
    expect(block).toContain('writeJSON(ctxFile')
  })
})
