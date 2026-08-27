import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('buildStrips label escaping (I-486)', () => {
  it('strip-h-label uses esc(label) in innerHTML', () => {
    const block = rendererJs.split('strip-h-label')[1]?.split('\n')[0] || ''
    expect(block).toContain('esc(label)')
  })
})

describe('atriles:save id and icon validation (I-487)', () => {
  const block = mainJs.split("'atriles:save'")[1]?.split('\nipcMain')[0] || ''

  it('validates id field with alphanumeric+dash regex when present', () => {
    expect(block).toContain('/^[\\w\\-]+$/.test(a.id)')
  })

  it('validates icon field as string ≤64 when present', () => {
    expect(block).toContain('a.icon.length <= 64')
  })
})

describe('orchestra:analyze report cap in resolve (I-488)', () => {
  const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''

  it('caps report at 4MB in resolve using _reportCapped', () => {
    expect(block).toContain('_reportCapped')
    expect(block).toContain('resolve({ report: _reportCapped')
  })
})

describe('mix-card buttons aria-label (I-489)', () => {
  it('load button has Spanish aria-label', () => {
    expect(rendererJs).toContain('aria-label="Cargar mezcla"')
  })

  it('delete button has Spanish aria-label', () => {
    expect(rendererJs).toContain('aria-label="Eliminar mezcla"')
  })
})
