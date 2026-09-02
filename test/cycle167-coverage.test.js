import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('parseComplianceLine drift length cap (I-496)', () => {
  it('slices drift to 128 chars', () => {
    expect(mainJs).toContain(".slice(0, 128)")
  })
})

describe('orchestra:writeConfig model control char guard (I-497)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('rejects model with control characters', () => {
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(cfg.model)')
  })
})

describe('orchestra:writeConfig _allowedKeys expansion (I-498)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('allows mode, maxIterations, caveman, compactAt in allowed keys', () => {
    expect(block).toContain("'mode'")
    expect(block).toContain("'maxIterations'")
    expect(block).toContain("'caveman'")
    expect(block).toContain("'compactAt'")
  })

  it('validates caveman as boolean', () => {
    expect(block).toContain("typeof cfg.caveman !== 'boolean'")
  })
})

describe('mixer tab panels aria-labelledby (I-499)', () => {
  it('tab buttons have id attributes', () => {
    expect(indexHtml).toContain('id="tab-mixTab"')
    expect(indexHtml).toContain('id="tab-bpTab"')
    expect(indexHtml).toContain('id="tab-notesTab"')
  })

  it('tab panels reference their tab via aria-labelledby', () => {
    expect(indexHtml).toContain('aria-labelledby="tab-mixTab"')
    expect(indexHtml).toContain('aria-labelledby="tab-bpTab"')
    expect(indexHtml).toContain('aria-labelledby="tab-notesTab"')
  })
})
