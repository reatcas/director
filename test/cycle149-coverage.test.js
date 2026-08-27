import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('atrilModal focus trap (I-421)', () => {
  it('adds keydown listener for Tab trapping on atrilModal', () => {
    const block = rendererJs.split("atrilModal').addEventListener('keydown'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("'Tab'")
    expect(block).toContain('focusable')
  })

  it('closes atrilModal on Escape key', () => {
    const block = rendererJs.split("atrilModal').addEventListener('keydown'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("'Escape'")
    expect(block).toContain('modal.hidden = true')
  })
})

describe('blueprint:save completeness + sessions validation (I-422)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('validates completeness as 0-100 finite number', () => {
    expect(block).toContain('data.completeness')
    expect(block).toContain('Number.isFinite(data.completeness)')
    expect(block).toContain('data.completeness < 0')
    expect(block).toContain('data.completeness > 100')
  })

  it('validates sessions as array capped at 500', () => {
    expect(block).toContain('data.sessions')
    expect(block).toContain('Array.isArray(data.sessions)')
    expect(block).toContain('500')
  })
})

describe('atriles:save duplicate path rejection (I-423)', () => {
  const block = mainJs.split("'atriles:save'")[1]?.split('\n})')[0] || ''

  it('uses _asPaths to detect duplicates', () => {
    expect(block).toContain('_asPaths')
    expect(block).toContain('atriles.map(a => a.path)')
  })

  it('rejects atriles with duplicate paths via Set size check', () => {
    expect(block).toContain('new Set(_asPaths).size !== _asPaths.length')
  })
})
