import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('blueprint:save m.description length cap (I-504)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('rejects m.description longer than 2000 chars', () => {
    expect(block).toContain('m.description.length > 2000')
  })
})

describe('blueprint:save m.notes validation (I-505)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('validates m.notes as string ≤2000 chars', () => {
    expect(block).toContain("m.notes !== undefined && (typeof m.notes !== 'string' || m.notes.length > 2000)")
  })
})

describe('orchestra:tail per-line truncation (I-506)', () => {
  const block = mainJs.split("'orchestra:tail'")[1]?.split('\nipcMain')[0] || ''

  it('truncates lines longer than 4096 chars', () => {
    expect(block).toContain('l.length > 4096 ? l.slice(0, 4096) : l')
  })
})

describe('mixerDrawer aria-expanded + aria-modal (I-507)', () => {
  it('toggle button has aria-expanded and aria-controls', () => {
    expect(indexHtml).toContain('aria-expanded="false" aria-controls="mixerDrawer"')
  })

  it('drawer has role=dialog and aria-modal', () => {
    expect(indexHtml).toContain('role="dialog" aria-modal="true"')
  })

  it('openDrawer sets aria-hidden false and aria-expanded true', () => {
    expect(rendererJs).toContain("drawer.setAttribute('aria-hidden', 'false')")
    expect(rendererJs).toContain("toggleBtn.setAttribute('aria-expanded', 'true')")
  })
})
