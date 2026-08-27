import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('cachedProjects repertoire.json size guard (I-372)', () => {
  const block = mainJs.split('function cachedProjects')[1]?.split('\nfunction ')[0] || ''

  it('uses _rpPath variable for statSync guard', () => {
    expect(block).toContain('_rpPath')
    expect(block).toContain('512_000')
  })

  it('returns cached value on second call pattern', () => {
    expect(block).toContain('_projectsCache')
  })
})

describe('repertoire:add size guard (I-372)', () => {
  const block = mainJs.split("'repertoire:add'")[1]?.split('\nipcMain')[0] || ''

  it('guards repertoire.json before readJSON in add handler', () => {
    expect(block).toContain('statSync')
    expect(block).toContain('512_000')
  })
})

describe('repertoire:remove size guard (I-372)', () => {
  const block = mainJs.split("'repertoire:remove'")[1]?.split('\nipcMain')[0] || ''

  it('uses _rrProjects guard before readJSON in remove handler', () => {
    expect(block).toContain('_rrProjects')
    expect(block).toContain('512_000')
  })
})

describe('aria-expanded toggling in renderer (I-373)', () => {
  it('allocToggle sets aria-expanded on click', () => {
    const block = rendererJs.split('allocToggle')[1]?.split('\n})')[0] || ''
    expect(block).toContain('aria-expanded')
  })

  it('compressionToggle sets aria-expanded on click', () => {
    const block = rendererJs.split('compressionToggle')[1]?.split('\n})')[0] || ''
    expect(block).toContain('aria-expanded')
  })

  it('mixerHistoryToggle handler exists and sets aria-expanded', () => {
    expect(rendererJs).toContain('mixerHistoryToggle')
    const block = rendererJs.split('mixerHistoryToggle')[1]?.split('\n})')[0] || ''
    expect(block).toContain('aria-expanded')
    expect(block).toContain('mixerHistoryBody')
  })
})

describe('mixer:saved:delete ID format validation (I-374)', () => {
  const block = mainJs.split("'mixer:saved:delete'")[1]?.split('\nipcMain')[0] || ''

  it('rejects non-base36 characters in id', () => {
    expect(block).toContain('[0-9a-z]')
  })

  it('still enforces length bounds', () => {
    expect(block).toContain('id.length === 0')
    expect(block).toContain('id.length > 64')
  })
})
