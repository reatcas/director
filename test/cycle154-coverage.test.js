import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('atriles:save description validation and write cap (I-444)', () => {
  const block = mainJs.split("'atriles:save'")[1]?.split('\nipcMain')[0] || ''

  it('validates description as string with max 1024 chars', () => {
    expect(block).toContain('a.description')
    expect(block).toContain('1024')
  })

  it('rejects control chars in description', () => {
    expect(block).toContain('a.description')
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(a.description)')
  })

  it('caps write size via _asSer at 512KB', () => {
    expect(block).toContain('_asSer')
    expect(block).toContain('512_000')
    expect(block).toContain('_asSer.length > 512_000')
  })
})

describe('mixer:saved:delete write cap (I-445)', () => {
  const block = mainJs.split("'mixer:saved:delete'")[1]?.split('\nipcMain')[0] || ''

  it('uses _msdSer size cap before writing', () => {
    expect(block).toContain('_msdSer')
    expect(block).toContain('_msdSer.length <= 512_000')
  })
})

describe('metrics:context history object filter (I-446)', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split('\nipcMain')[0] || ''

  it('filters history to only valid objects', () => {
    expect(block).toMatch(/hist\.filter\(h => h && typeof h === 'object'/)
  })
})

describe('lifecycleList explicit limit in renderer (I-447)', () => {
  it('loadLifecycleHistory passes limit 80', () => {
    expect(rendererJs).toContain('lifecycleList(current, 80)')
  })

  it('loadLifecycleTimeline passes limit 50', () => {
    expect(rendererJs).toContain('lifecycleList(current, 50)')
  })
})
