import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('allocation write size cap (I-464)', () => {
  const block = mainJs.split('current-allocation.json')[0]?.split('\n').slice(-5).join('\n') + mainJs.split('current-allocation.json')[1]?.split('\n').slice(0, 3).join('\n') || ''

  it('serializes allocation via _allocSer before writing', () => {
    expect(mainJs).toContain('_allocSer')
    expect(mainJs).toContain('JSON.stringify(allocation)')
  })

  it('only writes allocation if fits within 256KB', () => {
    expect(mainJs).toContain('_allocSer.length <= 262_144')
  })
})

describe('metrics:context hist trim write cap (I-465)', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split('\nipcMain')[0] || ''

  it('serializes trimmed hist via _mcTrimSer', () => {
    expect(block).toContain('_mcTrimSer')
    expect(block).toContain('hist.slice(-500)')
  })

  it('only writes trimmed hist if within 1MB', () => {
    expect(block).toContain('_mcTrimSer.length <= 1_048_576')
  })
})

describe('mixer:history valid-object filter (I-466)', () => {
  const block = mainJs.split("'mixer:history'")[1]?.split('\nipcMain')[0] || ''

  it('filters history entries to valid objects', () => {
    expect(block).toContain("typeof h === 'object'")
    expect(block).toContain('hist.filter')
  })
})

describe('model select innerHTML escaped (I-467)', () => {
  it('escapes m.id and m.label in model select option HTML', () => {
    expect(rendererJs).toContain('esc(m.id)')
    expect(rendererJs).toContain('esc(m.label)')
  })
})
