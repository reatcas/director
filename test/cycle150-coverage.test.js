import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('blueprint:generate-brief roadmap write cap (I-424)', () => {
  const block = mainJs.split("'blueprint:generate-brief'")[1]?.split('\nipcMain')[0] || ''

  it('caps roadmap write at 512KB via _rmSer', () => {
    expect(block).toContain('_rmSer')
    expect(block).toContain('512_000')
    expect(block).toContain('_rmSer.slice(0, 512_000)')
  })
})

describe('orchestra:upgrade bak cleanup (I-425)', () => {
  const block = mainJs.split("'orchestra:upgrade'")[1]?.split('\nipcMain')[0] || ''

  it('deletes .bak files for upgraded files', () => {
    expect(block).toContain('.bak')
    expect(block).toContain('unlinkSync')
    expect(block).toContain('upgraded')
  })
})

describe('lifecycle:list type filter parameter (I-426)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split('\nipcMain')[0] || ''

  it('accepts typeFilter parameter with _llType variable', () => {
    expect(block).toContain('_llType')
    expect(block).toContain('typeFilter')
  })

  it('validates typeFilter as alphanumeric/dash string', () => {
    expect(block).toContain("/^[\\w\\-]+$/")
  })

  it('filters events by type when typeFilter provided', () => {
    expect(block).toContain('events.filter(e => e.type === _llType)')
  })
})

describe('aboutModal focus trap (I-427)', () => {
  it('aboutModal has keydown listener for Tab trapping', () => {
    const block = rendererJs.split("aboutModal').addEventListener('keydown'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("'Tab'")
    expect(block).toContain('focusable')
    expect(block).toContain('focus()')
  })
})
