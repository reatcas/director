import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('notes:write byte-length guard (S-39)', () => {
  const block = mainJs.split("'notes:write'")[1]?.split("'notes:read'")[0] || mainJs.split("'notes:write'")[1]?.split('\nipcMain')[0] || ''

  it('guards byte length before writing', () => {
    expect(block).toContain("Buffer.byteLength(content, 'utf8') > 102_400")
  })

  it('wraps fs ops in try/catch returning false', () => {
    expect(block).toContain('try {')
    expect(block).toContain('} catch { return false }')
  })

  it('still checks char count before byte count', () => {
    const charIdx = block.indexOf('content.length > 50000')
    const byteIdx = block.indexOf("Buffer.byteLength")
    expect(charIdx).toBeGreaterThanOrEqual(0)
    expect(byteIdx).toBeGreaterThan(charIdx)
  })
})

describe('export:session mixerHistory rigor (S-40)', () => {
  const block = mainJs.split("'export:session'")[1]?.split("'export:upload'")[0] || mainJs.split("'export:session'")[1]?.split('\nipcMain')[0] || ''

  it('validates ts field in mixerHistory filter', () => {
    expect(block).toContain("typeof e.ts === 'string'")
  })

  it('validates event field in mixerHistory filter', () => {
    expect(block).toContain("typeof e.event === 'string'")
  })

  it('validates focus field in mixerHistory filter', () => {
    expect(block).toContain("e.focus && typeof e.focus === 'object'")
  })

  it('mixerConfig has non-array object guard', () => {
    expect(block).toContain('!Array.isArray(d)')
  })
})

describe('metrics:context no write-on-read (P-40)', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split("'metrics:coordination'")[0] || ''

  it('does not call writeJSON in metrics:context', () => {
    expect(block).not.toContain('writeJSON(file')
  })

  it('caps hist to 500 without writing back', () => {
    expect(block).toContain('hist.length > 500 ? hist.slice(-500) : hist')
  })
})

describe('notes char counter frontend (FE-01)', () => {
  it('notesCharCount element exists in HTML', () => {
    expect(html).toContain('id="notesCharCount"')
  })

  it('notesCharCount has aria-live for screen reader', () => {
    expect(html).toMatch(/id="notesCharCount"[^>]*aria-live/)
  })

  it('renderer updates count on input', () => {
    expect(rendererJs).toContain('_notesUpdateCount')
    expect(rendererJs).toContain('area.value.length')
  })

  it('renderer shows error state on save failure', () => {
    expect(rendererJs).toContain('ok === false')
    expect(rendererJs).toContain('Error al guardar')
  })
})
