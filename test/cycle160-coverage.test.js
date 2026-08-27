import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('ai:select aiState write cap (I-471)', () => {
  const block = mainJs.split("'ai:select'")[1]?.split('\nipcMain')[0] || ''

  it('serializes aiState via _aiSSer before writing', () => {
    expect(block).toContain('_aiSSer')
    expect(block).toContain('JSON.stringify(state)')
  })

  it('only writes aiState if within 256KB', () => {
    expect(block).toContain('_aiSSer.length <= 262_144')
  })
})

describe('orchestra:play aiState write cap (I-471)', () => {
  const block = mainJs.split("'orchestra:play'")[1]?.split('\nipcMain')[0] || ''

  it('serializes play aiState via _aisPlaySer before writing', () => {
    expect(block).toContain('_aisPlaySer')
    expect(block).toContain('_aisPlaySer.length <= 262_144')
  })
})

describe('mixer:write + agent-switch write caps (I-472)', () => {
  const mwBlock = mainJs.split("'mixer:write'")[1]?.split('\nipcMain')[0] || ''

  it('mixer:write caps cfg write via _mwSer at 512KB', () => {
    expect(mwBlock).toContain('_mwSer')
    expect(mwBlock).toContain('_mwSer.length <= 512_000')
  })

  it('agent-switch caps orchestration cfg write via _asCfgSer at 512KB', () => {
    expect(mainJs).toContain('_asCfgSer')
    expect(mainJs).toContain('_asCfgSer.length <= 512_000')
  })
})

describe('lifecycle:list event ts + label filter (I-473)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split('\nipcMain')[0] || ''

  it('requires e.ts to be a string in event filter', () => {
    expect(block).toContain("typeof e.ts === 'string'")
  })

  it('requires e.label to be a string in event filter', () => {
    expect(block).toContain("typeof e.label === 'string'")
  })
})

describe('#cmdInput combobox accessibility (I-474)', () => {
  it('has aria-autocomplete=list on #cmdInput', () => {
    expect(indexHtml).toContain('aria-autocomplete="list"')
  })

  it('has aria-controls=cmdResults on #cmdInput', () => {
    const block = indexHtml.split('id="cmdInput"')[1]?.split('>')[0] || ''
    expect(block).toContain('aria-controls="cmdResults"')
  })
})
