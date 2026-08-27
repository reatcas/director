import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')

describe('repertoire:remove type guard (I-428)', () => {
  const block = mainJs.split("'repertoire:remove'")[1]?.split('\nipcMain')[0] || ''

  it('rejects non-string dir with early return false', () => {
    expect(block).toContain("typeof dir !== 'string'")
    expect(block).toContain('return false')
  })
})

describe('orchestra:readIterLog control char check (I-429)', () => {
  const block = mainJs.split("'orchestra:readIterLog'")[1]?.split('\nipcMain')[0] || ''

  it('uses control char regex instead of NUL-only check', () => {
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(logPath)')
  })
})

describe('preload lifecycleList typeFilter forwarding (I-430)', () => {
  it('passes typeFilter as third argument to lifecycle:list', () => {
    expect(preloadJs).toContain("(p, limit, typeFilter)  => ipcRenderer.invoke('lifecycle:list', p, limit, typeFilter)")
  })
})

describe('loadLifecycleHistory data-ev-type attribute (I-431)', () => {
  it('sets dataset.evType on history entry elements', () => {
    const block = rendererJs.split('async function loadLifecycleHistory')[1]?.split('\n// ─')[0] || ''
    expect(block).toContain('dataset.evType')
    expect(block).toContain('ev.type')
  })
})
