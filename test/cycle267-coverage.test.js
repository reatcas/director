// cycle267-coverage.test.js — C267 quality_tests coverage
// T-210: S-134 readIterLog p.length cap; S-135 atrilesSave el.path validation
// T-211: P-95 context-protocol prevMap+currTitles for...of; B-49 lifecycle:list for...of
// T-212: F-46 normalizeMixerValues sections for...of (no .map/.forEach)

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs      = readFileSync(join(root, 'preload.js'), 'utf8')
const mainJs         = readFileSync(join(root, 'main.js'), 'utf8')
const contextJs      = readFileSync(join(root, 'context-protocol.js'), 'utf8')
const rendererJs     = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-210: S-134 + S-135 ────────────────────────────────────────────────────
describe('T-210: S-134 readIterLog p has length cap', () => {
  it('readIterLog rejects p longer than 4096 chars', () => {
    const body = preloadJs.split('readIterLog: (p, l)')[1]?.split('},')[0] || ''
    expect(body).toContain('p.length > 4096')
  })
})

describe('T-210: S-135 atrilesSave validates el.path in preload', () => {
  it('atrilesSave checks el.path type and length', () => {
    const body = preloadJs.split('atrilesSave:')[1]?.split('},')[0] || ''
    expect(body).toContain("typeof el.path !== 'string'")
    expect(body).toContain('el.path.length > 4096')
  })
})

// ─── T-211: P-95 + B-49 ──────────────────────────────────────────────────────
describe('T-211: P-95 context-protocol uses for...of for prevMap and currTitles', () => {
  it('computeDelta builds prevMap via for...of', () => {
    expect(contextJs).toContain('for (const s of prevSections) prevMap.set(s.title, s)')
  })

  it('computeDelta builds currTitles via for...of', () => {
    expect(contextJs).toContain('for (const s of sections) currTitles.add(s.title)')
  })

  it('computeDelta no longer uses .map() to construct prevMap', () => {
    expect(contextJs).not.toContain('new Map(prevSections.map')
  })

  it('computeDelta no longer uses .map() to construct currTitles', () => {
    expect(contextJs).not.toContain('new Set(sections.map')
  })
})

describe('T-211: B-49 lifecycle:list uses for...of for message truncation', () => {
  it('lifecycle:list uses for...of push to build _llEvents', () => {
    const body = mainJs.split("'lifecycle:list'")[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('for (const e of _llSlice)')
    expect(body).toContain('_llEvents.push(')
  })

  it('lifecycle:list no longer chains slice+map for _llEvents', () => {
    const body = mainJs.split("'lifecycle:list'")[1]?.split('\nipcMain')[0] || ''
    expect(body).not.toContain('.slice(-_llLimit).map(')
  })
})

// ─── T-212: F-46 normalizeMixerValues for...of ───────────────────────────────
describe('T-212: F-46 normalizeMixerValues uses for...of on sections', () => {
  it('normalizeMixerValues iterates sections with for...of', () => {
    const body = rendererJs.split('function normalizeMixerValues(focus, sections) {')[1]?.split('\n}')[0] || ''
    expect(body).toContain('for (const [k] of sections)')
  })

  it('normalizeMixerValues no longer uses sections.map()', () => {
    const body = rendererJs.split('function normalizeMixerValues(focus, sections) {')[1]?.split('\n}')[0] || ''
    expect(body).not.toContain('sections.map(')
  })

  it('normalizeMixerValues no longer uses forEach', () => {
    const body = rendererJs.split('function normalizeMixerValues(focus, sections) {')[1]?.split('\n}')[0] || ''
    expect(body).not.toContain('.forEach(')
  })
})
