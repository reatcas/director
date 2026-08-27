import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('atriles:list size guard (I-340)', () => {
  const block = mainJs.split("'atriles:list'")[1]?.split('\nipcMain')[0] || ''

  it('guards custom-atriles.json at 512KB', () => {
    expect(block).toContain('512_000')
    expect(block).toContain('let data = []')
  })

  it('uses statSync pattern', () => {
    expect(block).toContain('fs.statSync(p).size <= 512_000')
  })
})

describe('blueprint:save modules validation (I-341)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('validates modules array items have string name', () => {
    expect(block).toContain("typeof m.name !== 'string'")
  })

  it('caps module name length at 256', () => {
    expect(block).toContain('m.name.length > 256')
  })

  it('validates modules array type', () => {
    expect(block).toContain('data.modules')
    expect(block).toContain('Array.isArray(data.modules)')
  })
})

describe('remaining inputs aria-labels (I-342)', () => {
  it('stgCaveman has Spanish aria-label', () => {
    expect(html).toMatch(/id="stgCaveman"[^>]*aria-label="[^"]*Alternar[^"]*"/)
  })

  it('cmdInput has Spanish aria-label', () => {
    expect(html).toMatch(/id="cmdInput"[^>]*aria-label="[^"]*Paleta[^"]*"/)
  })

  it('mixImportInput has Spanish aria-label', () => {
    expect(html).toMatch(/id="mixImportInput"[^>]*aria-label="[^"]*JSON[^"]*"/)
  })

  it('mixNameInput has Spanish aria-label', () => {
    expect(html).toMatch(/id="mixNameInput"[^>]*aria-label="[^"]*mezclas[^"]*"/)
  })

  it('bpInput has Spanish aria-label', () => {
    expect(html).toMatch(/id="bpInput"[^>]*aria-label="[^"]*Blueprint[^"]*"/)
  })
})

describe('bpMessages live region (I-343)', () => {
  it('bpMessages has role=log', () => {
    expect(html).toMatch(/id="bpMessages"[^>]*role="log"/)
  })

  it('bpMessages has aria-live=polite', () => {
    expect(html).toMatch(/id="bpMessages"[^>]*aria-live="polite"/)
  })

  it('bpMessages has aria-label', () => {
    expect(html).toMatch(/id="bpMessages"[^>]*aria-label/)
  })
})
