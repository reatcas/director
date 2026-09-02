// cycle274-coverage.test.js — C274 quality coverage
// T-231: S-144 atrilesSave name control-char; S-145 notesWrite null-byte
// T-232: P-100 updateMixerGraph for-of; F-51 renderBpModules for-of
// T-233: B-54 allowedDirs for-of in main

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs  = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')

// ─── T-231: S-144 + S-145 ────────────────────────────────────────────────────
describe('T-231: S-144 atrilesSave rejects control chars in el.name', () => {
  it('has control-char regex check on el.name', () => {
    const block = preloadJs.split('atrilesSave:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('/[\\x00-\\x1F\\x7F]/.test(el.name)')
  })

  it('rejects name with control chars before ipcRenderer', () => {
    const block = preloadJs.split('atrilesSave:')[1]?.split('return ipcRenderer')[0] || ''
    const checks = block.split('return Promise.resolve(false)').length - 1
    expect(checks).toBeGreaterThanOrEqual(1)
  })
})

describe('T-231: S-145 notesWrite rejects null-byte in content c', () => {
  it('has null-byte regex check on c before invoke', () => {
    const block = preloadJs.split('notesWrite:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('/\\x00/.test(c)')
  })

  it('returns false before ipcRenderer when c has null byte', () => {
    const block = preloadJs.split('notesWrite:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('return Promise.resolve(false)')
  })
})

// ─── T-232: P-100 + F-51 ─────────────────────────────────────────────────────
describe('T-232: P-100 updateMixerGraph uses for...of over .strip-h elements', () => {
  it('uses for...of instead of forEach on .strip-h', () => {
    const block = rendererJs.split('function updateMixerGraph')[1]?.split('\n}')[0] || ''
    expect(block).toContain('for (const s of document.querySelectorAll(')
    expect(block).not.toContain('.forEach(s =>')
  })
})

describe('T-232: F-51 renderBpModules uses for...of for input binding and delete binding', () => {
  it('uses for...of instead of forEach for bp-mod-name inputs', () => {
    expect(rendererJs).toContain('for (const inp of list.querySelectorAll(')
    expect(rendererJs).not.toContain('.bp-mod-name, .bp-mod-desc, .bp-mod-features, .bp-mod-deps\').forEach')
  })

  it('uses for...of instead of forEach for bp-mod-del buttons', () => {
    expect(rendererJs).toContain('for (const btn of list.querySelectorAll(\'.bp-mod-del\'))')
    expect(rendererJs).not.toContain('list.querySelectorAll(\'.bp-mod-del\').forEach')
  })
})

// ─── T-233: B-54 ─────────────────────────────────────────────────────────────
describe('T-233: B-54 allowedDirs uses for...of instead of .map().filter()', () => {
  it('uses _allowedDirs with for...of instead of .map(p => p.path).filter(Boolean)', () => {
    expect(mainJs).toContain('_allowedDirs')
    expect(mainJs).toContain('for (const p of cachedProjects()) {')
  })

  it('does not use .map(p => p.path).filter(Boolean) for allowedDirs', () => {
    expect(mainJs).not.toContain('.map(p => p.path).filter(Boolean)')
  })
})
