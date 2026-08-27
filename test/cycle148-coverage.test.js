import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const coordJs = fs.readFileSync(path.join(ROOT, 'coordination-protocol.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('coordination-protocol.js write size cap (I-417)', () => {
  it('serializes to _coSer before writing', () => {
    expect(coordJs).toContain('_coSer')
    expect(coordJs).toContain('JSON.stringify(hist)')
  })

  it('caps coordination-metrics write at 1MB', () => {
    expect(coordJs).toContain('_coSer.length <= 1_048_576')
  })
})

describe('blueprint:save module field validation (I-418)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('caps module count at 100', () => {
    expect(block).toContain('data.modules.length > 100')
  })

  it('validates module.features as array of strings with length caps', () => {
    expect(block).toContain('m.features')
    expect(block).toContain('Array.isArray(m.features)')
    expect(block).toContain('50')
  })

  it('validates module.dependencies as array of strings', () => {
    expect(block).toContain('m.dependencies')
    expect(block).toContain('Array.isArray(m.dependencies)')
  })
})

describe('preload tail forwards lines param (I-419)', () => {
  it('tail passes lines to IPC invoke', () => {
    expect(preloadJs).toMatch(/tail.*lines.*orchestra:tail.*lines/)
  })
})

describe('settingsModal focus trap (I-420)', () => {
  it('settingsModal has keydown listener for Tab trapping', () => {
    const block = rendererJs.split("settingsModal').addEventListener('keydown'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("'Tab'")
    expect(block).toContain('focusable')
    expect(block).toContain('focus()')
  })
})
