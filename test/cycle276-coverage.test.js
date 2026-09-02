// cycle276-coverage.test.js — C276 quality coverage
// T-237: S-146 atrilesSave description control-char; S-147 icon+color control-char
// T-238: P-101 mixer-tab spread + manual indexOf; B-55 _knownPathsSet for-of
// T-239: F-52 renderCmdResults indexed for loop

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs  = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')

// ─── T-237: S-146 + S-147 ────────────────────────────────────────────────────
describe('T-237: S-146 atrilesSave rejects control chars in el.description', () => {
  it('has control-char check on el.description', () => {
    const block = preloadJs.split('atrilesSave:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('/[\\x00-\\x1F\\x7F]/.test(el.description)')
  })
})

describe('T-237: S-147 atrilesSave rejects control chars in el.icon and el.color', () => {
  it('has control-char check on el.icon', () => {
    const block = preloadJs.split('atrilesSave:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('/[\\x00-\\x1F\\x7F]/.test(el.icon)')
  })

  it('has control-char check on el.color', () => {
    const block = preloadJs.split('atrilesSave:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('/[\\x00-\\x1F\\x7F]/.test(el.color)')
  })
})

// ─── T-238: P-101 + B-55 ─────────────────────────────────────────────────────
describe('T-238: P-101 mixer-tab keyboard nav uses spread instead of Array.from', () => {
  it('uses spread [...querySelectorAll] instead of Array.from', () => {
    expect(rendererJs).toContain('[...document.querySelectorAll(\'.mixer-tab\')]')
    expect(rendererJs).not.toContain("Array.from(document.querySelectorAll('.mixer-tab'))")
  })

  it('uses manual for loop for indexOf instead of .indexOf()', () => {
    const block = rendererJs.split("mixer-tab')]")[1]?.split('e.preventDefault')[0] || ''
    expect(block).toContain('for (let _ti = 0; _ti < tabs.length; _ti++)')
    expect(block).not.toContain('tabs.indexOf(')
  })
})

describe('T-238: B-55 _knownPathsSet uses for...of instead of .map()', () => {
  it('uses for...of Set.add instead of new Set(map)', () => {
    expect(mainJs).toContain('for (const p of _rpData) _kps.add(p.path)')
    expect(mainJs).not.toContain('new Set(_rpData.map(p => p.path))')
  })
})

// ─── T-239: F-52 ─────────────────────────────────────────────────────────────
describe('T-239: F-52 renderCmdResults uses indexed for loop instead of forEach', () => {
  it('uses _cmdItemEls with indexed for loop', () => {
    expect(rendererJs).toContain('_cmdItemEls')
    expect(rendererJs).toContain('for (let _ci = 0; _ci < _cmdItemEls.length; _ci++)')
  })

  it('does not use res.querySelectorAll .cmd-item forEach', () => {
    expect(rendererJs).not.toContain("res.querySelectorAll('.cmd-item').forEach")
  })
})
