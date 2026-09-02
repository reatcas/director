import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('allocation write size cap (I-464)', () => {
  it('serializes allocation via _allocSer before writing', () => {
    expect(mainJs).toContain('_allocSer')
    expect(mainJs).toContain('JSON.stringify(allocation)')
  })

  it('only writes allocation if fits within 256KB', () => {
    expect(mainJs).toContain('_allocSer.length <= 262_144')
  })
})

describe('metrics:context hist trim (I-465)', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split('\nipcMain')[0] || ''

  it('caps hist to 500 entries', () => {
    expect(block).toMatch(/hist\.slice\(-500\)|hist\.length > 500/)
  })

  it('trims hist without write-on-read (P-40) or with write guard', () => {
    const hasTrimSer = block.includes('_mcTrimSer')
    const hasNoWrite = !block.includes('writeJSON(file')
    expect(hasTrimSer || hasNoWrite).toBe(true)
  })
})

describe('mixer:history valid-object filter (I-466)', () => {
  const block = mainJs.split("'mixer:history'")[1]?.split('\nipcMain')[0] || ''

  it('filters history entries to valid objects', () => {
    expect(block).toContain("typeof h === 'object'")
    expect(block).toContain('_mhFiltered')
  })
})

describe('model select innerHTML escaped (I-467)', () => {
  it('escapes m.id and m.label in model select option HTML', () => {
    expect(rendererJs).toContain('esc(m.id)')
    expect(rendererJs).toContain('esc(m.label)')
  })
})
