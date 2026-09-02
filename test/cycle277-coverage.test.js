// cycle277-coverage.test.js — C277 quality coverage
// T-240: S-148 atrilesSave color control-char; S-149 atrilesList description/icon/color filter
// T-241: P-102 themeGroup for-of; F-53 settingsModal for-of
// T-242: B-56 repertoire:list for-of accumulation

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-240: S-148 + S-149 ────────────────────────────────────────────────────
describe('T-240: S-148 atrilesSave rejects control chars in color', () => {
  it('has explicit color control-char check in atriles:save handler', () => {
    const block = mainJs.split("'atriles:save'")[1]?.split("'atriles:list'")[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(a.color)')
  })

  it('color check uses control-char regex in atriles:save explicit guard', () => {
    const block = mainJs.split("'atriles:save'")[1]?.split("'atriles:list'")[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(a.color)')
  })
})

describe('T-240: S-149 atrilesList filter rejects control chars in description/icon/color', () => {
  it('atriles:list filter checks description for control chars', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split("'atriles:save'")[0] || ''
    expect(block).toContain('.test(a.description)')
  })

  it('atriles:list filter checks icon for control chars', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split("'atriles:save'")[0] || ''
    expect(block).toContain('.test(a.icon)')
  })

  it('atriles:list filter checks color for control chars', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split("'atriles:save'")[0] || ''
    expect(block).toContain('.test(a.color)')
  })
})

// ─── T-241: P-102 + F-53 ─────────────────────────────────────────────────────
describe('T-241: P-102 applyTheme and themeGroup use for...of instead of forEach', () => {
  it('does not use .forEach for #themeGroup .stg-btn classList toggle', () => {
    expect(rendererJs).not.toContain("querySelectorAll('#themeGroup .stg-btn').forEach")
  })

  it('uses for...of for #themeGroup .stg-btn classList toggle', () => {
    expect(rendererJs).toContain("for (const b of document.querySelectorAll('#themeGroup .stg-btn')) b.classList.toggle")
  })

  it('uses for...of for #themeGroup .stg-btn onclick binding', () => {
    expect(rendererJs).toContain("for (const b of document.querySelectorAll('#themeGroup .stg-btn')) b.onclick")
  })
})

describe('T-241: F-53 settingsModal auto-save uses for...of instead of forEach', () => {
  it('uses for...of for settingsModal input+select change listener', () => {
    expect(rendererJs).toContain("for (const el of document.querySelectorAll('#settingsModal input, #settingsModal select')) el.addEventListener('change', saveSettings)")
  })

  it('does not use .forEach for settingsModal inputs', () => {
    expect(rendererJs).not.toContain("querySelectorAll('#settingsModal input, #settingsModal select').forEach")
  })
})

// ─── T-242: B-56 ─────────────────────────────────────────────────────────────
describe('T-242: B-56 repertoire:list uses for...of instead of .map()', () => {
  it('uses _rlProjs with for...of instead of .map()', () => {
    const block = mainJs.split("'repertoire:list'")[1]?.split("'repertoire:add'")[0] || ''
    expect(block).toContain('_rlProjs')
    expect(block).toContain('for (const p of cachedProjects())')
  })

  it('does not use .map() for cachedProjects in repertoire:list', () => {
    const block = mainJs.split("'repertoire:list'")[1]?.split("'repertoire:add'")[0] || ''
    expect(block).not.toContain('cachedProjects().map(')
  })
})
