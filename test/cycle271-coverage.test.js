// cycle271-coverage.test.js — C271 quality coverage
// T-222: S-140 readFile subpath control-char; S-141 readIterLog logPath control-char
// T-223: P-98 sortedFocus for...of in main; B-52 clearLog iterLogs for...of
// T-224: F-49 updateSmartAuroraColors strips for...of

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs  = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')

// ─── T-222: S-140 + S-141 ────────────────────────────────────────────────────
describe('T-222: S-140 readFile rejects control chars in subpath s', () => {
  it('has control-char regex check on s before invoke', () => {
    const block = preloadJs.split('readFile:')[1]?.split('return ipcRenderer.invoke')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(s)')
  })

  it('returns empty string before ipcRenderer when s has control chars', () => {
    const block = preloadJs.split('readFile:')[1]?.split('return ipcRenderer.invoke')[0] || ''
    expect(block).toContain("return Promise.resolve('')")
  })
})

describe('T-222: S-141 readIterLog rejects control chars in logPath l', () => {
  it('has control-char regex check on l before invoke', () => {
    const block = preloadJs.split('readIterLog:')[1]?.split('return ipcRenderer.invoke')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(l)')
  })

  it('returns empty string before ipcRenderer when l has control chars', () => {
    const block = preloadJs.split('readIterLog:')[1]?.split('return ipcRenderer.invoke')[0] || ''
    expect(block).toContain("return Promise.resolve('')")
  })
})

// ─── T-223: P-98 + B-52 ──────────────────────────────────────────────────────
describe('T-223: P-98 sortedFocus uses for...of in orchestra:play analyze handler', () => {
  it('uses for...of instead of sortedFocus.forEach', () => {
    expect(mainJs).toContain('for (const [key, weight] of sortedFocus)')
    expect(mainJs).not.toContain('sortedFocus.forEach')
  })
})

describe('T-223: B-52 clearLog iterLogs prune uses for...of', () => {
  it('uses for...of instead of iterLogs.slice(...).forEach', () => {
    expect(mainJs).toContain('for (const f of iterLogs.slice(')
    expect(mainJs).not.toContain('iterLogs.slice(0, iterLogs.length - 200).forEach')
  })
})

// ─── T-224: F-49 ─────────────────────────────────────────────────────────────
describe('T-224: F-49 updateSmartAuroraColors uses for...of over strips', () => {
  it('uses for...of instead of strips.forEach in aurora updater', () => {
    expect(rendererJs).toContain('for (const s of strips)')
    const block = rendererJs.split('function updateSmartAuroraColors')[1]?.split('\n}')[0] || ''
    expect(block).not.toContain('strips.forEach')
  })
})
