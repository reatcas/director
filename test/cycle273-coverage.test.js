// cycle273-coverage.test.js — C273 quality coverage
// T-228: S-142 lifecycleAdd label control-char; S-143 lifecycleAdd message control-char
// T-229: P-99 activateMixerStand for-of nested; F-50 saveMixer forEach → for-of
// T-230: B-53 tail _cappedLines for-of in main

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs  = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')

// ─── T-228: S-142 + S-143 ────────────────────────────────────────────────────
describe('T-228: S-142 lifecycleAdd rejects control chars in label l', () => {
  it('has control-char regex check on l before invoke', () => {
    const block = preloadJs.split('lifecycleAdd:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(l)')
  })

  it('returns false before ipcRenderer when l has control chars', () => {
    const block = preloadJs.split('lifecycleAdd:')[1]?.split('return ipcRenderer')[0] || ''
    const checks = block.split('return Promise.resolve(false)').length - 1
    expect(checks).toBeGreaterThanOrEqual(1)
  })
})

describe('T-228: S-143 lifecycleAdd rejects control chars in message m', () => {
  it('has control-char regex check on m before invoke', () => {
    const block = preloadJs.split('lifecycleAdd:')[1]?.split('return ipcRenderer')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(m)')
  })
})

// ─── T-229: P-99 + F-50 ──────────────────────────────────────────────────────
describe('T-229: P-99 activateMixerStand uses for...of for stand-active + spark cleanup', () => {
  it('uses for...of over stand-active elements instead of forEach', () => {
    const block = rendererJs.split('function activateMixerStand')[1]?.split('\n}')[0] || ''
    expect(block).toContain('for (const el of document.querySelectorAll(')
    expect(block).not.toContain('.forEach(el =>')
  })

  it('uses for...of over stand-spark elements instead of nested forEach', () => {
    const block = rendererJs.split('function activateMixerStand')[1]?.split('\n}')[0] || ''
    expect(block).toContain('for (const s of el.querySelectorAll(')
    expect(block).not.toContain('.forEach(s =>')
  })
})

describe('T-229: F-50 saveMixer onclick uses for...of over range inputs', () => {
  it('uses for...of instead of querySelectorAll forEach on range inputs', () => {
    expect(rendererJs).toContain('for (const i of document.querySelectorAll(\'#mixerStrips input[type="range"]\'))')
    expect(rendererJs).not.toContain('document.querySelectorAll(\'#mixerStrips input[type="range"]\').forEach')
  })
})

// ─── T-230: B-53 ─────────────────────────────────────────────────────────────
describe('T-230: B-53 orchestra:tail uses for...of _cappedLines accumulation', () => {
  it('uses _cappedLines with for...of instead of .map(l => ...)', () => {
    expect(mainJs).toContain('_cappedLines')
    expect(mainJs).toContain('for (const l of _rawLines) _cappedLines.push(')
  })

  it('does not use .map(l => l.length > 4096', () => {
    expect(mainJs).not.toContain('.map(l => l.length > 4096')
  })
})
