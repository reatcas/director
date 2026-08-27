import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('project list ArrowUp/ArrowDown navigation (I-448)', () => {
  const block = rendererJs.split('async function refresh')[1]?.split('\n// ─')[0] || ''

  it('adds keydown listener for arrow keys on project list ul', () => {
    expect(block).toContain('ul.onkeydown')
    expect(block).toContain("'ArrowUp'")
    expect(block).toContain("'ArrowDown'")
  })

  it('moves focus to next/prev item on arrow key', () => {
    expect(block).toContain('items[next].focus()')
  })
})

describe('mixer tablist ArrowLeft/ArrowRight navigation (I-449)', () => {
  it('adds keydown listener to .mixer-tabs for arrow keys', () => {
    expect(rendererJs).toContain("'ArrowLeft'")
    expect(rendererJs).toContain("'ArrowRight'")
    expect(rendererJs).toContain('mixer-tabs')
  })
})

describe('#mixerStrips role=group aria-label (I-450)', () => {
  it('has role=group on mixerStrips', () => {
    expect(indexHtml).toContain('id="mixerStrips"')
    expect(indexHtml).toContain('role="group"')
  })

  it('has aria-label on mixerStrips', () => {
    expect(indexHtml).toContain('aria-label="Categorías de mezcla"')
  })
})

describe('normalizeMixerValues NaN guard (I-451)', () => {
  const block = rendererJs.split('function normalizeMixerValues')[1]?.split('\nfunction ')[0] || ''

  it('uses Number.isFinite to guard NaN values', () => {
    expect(block).toContain('Number.isFinite(focus[k])')
  })
})

describe('cachedProjects data validation (I-452)', () => {
  const block = mainJs.split('function cachedProjects')[1]?.split('\nfunction ')[0] || ''

  it('filters projects to objects with string path', () => {
    expect(block).toContain("typeof p.path === 'string'")
    expect(block).toContain('_rpData.filter')
  })
})

describe('atriles:list and lifecycle:list data validation (I-454+I-455)', () => {
  it('atriles:list filters to valid objects with name/path strings', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("typeof a.name === 'string'")
    expect(block).toContain("typeof a.path === 'string'")
  })

  it('lifecycle:list filters events to valid objects with string type', () => {
    const block = mainJs.split("'lifecycle:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("typeof e.type === 'string'")
    expect(block).toContain('events.filter')
  })
})
