import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('repertoire:add write size cap (I-456)', () => {
  const block = mainJs.split("'repertoire:add'")[1]?.split('\nipcMain')[0] || ''

  it('serializes projects via _rapSer before writing', () => {
    expect(block).toContain('_rapSer')
    expect(block).toContain('JSON.stringify(projects)')
  })

  it('rejects write if exceeds 512KB', () => {
    expect(block).toContain('_rapSer.length <= 512_000')
  })
})

describe('copyDir settings.json merge size cap (I-457)', () => {
  const block = mainJs.split('function copyDir')[1]?.split('\nfunction ')[0] || ''

  it('serializes merged settings via _cdMergeSer', () => {
    expect(block).toContain('_cdMergeSer')
    expect(block).toContain('JSON.stringify(a)')
  })

  it('only writes if merged settings fit within 512KB', () => {
    expect(block).toContain('_cdMergeSer.length <= 512_000')
  })
})

describe('mixer:saved:list result cap (I-458)', () => {
  const block = mainJs.split("'mixer:saved:list'")[1]?.split('\nipcMain')[0] || ''

  it('caps merged mixes at 200 items', () => {
    expect(block).toContain('merged.slice(0, 200)')
  })
})

describe('renderCmdResults uses cached projects (I-459)', () => {
  const block = rendererJs.split('async function renderCmdResults')[1]?.split('\nfunction ')[0] || ''

  it('uses module-level projects instead of fetching from IPC every call', () => {
    expect(block).toContain('projList')
    expect(block).toContain('Array.isArray(projects)')
    expect(block).toContain('projects.length')
  })
})
