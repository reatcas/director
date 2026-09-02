// cycle309-coverage.test.js — C309 quality coverage
// T-303: S-190 mixer:saved:list default mix name strip; S-191 mixer:saved:export name strip
// T-304: P-123 mixer-graph.js _rings/_sparks filter-collect loops
// T-305: B-77 blueprint:readiness Object.values filter; F-74 renderBpPhases .filter()

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs       = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs   = readFileSync(join(root, 'renderer.js'), 'utf8')
const mixerGraphJs = readFileSync(join(root, 'mixer-graph.js'), 'utf8')

// ─── T-303: S-190 + S-191 ────────────────────────────────────────────────────
describe('T-303: S-190 mixer:saved:list strips default mix names', () => {
  it('_vdFiltered.push strips p.name with ctrl-char replace', () => {
    const block = mainJs.split("'mixer:saved:list'")[1]?.split("'mixer:saved:save'")[0] || ''
    expect(block).toContain("name: p.name.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('spread with stripped name inside _vdFiltered.push', () => {
    const block = mainJs.split("'mixer:saved:list'")[1]?.split("'mixer:saved:save'")[0] || ''
    expect(block).toContain('_vdFiltered.push({ ...p, name: p.name.replace(')
  })
})

describe('T-303: S-191 mixer:saved:export strips mix name before JSON.stringify', () => {
  it('creates _exMix with stripped name before serializing', () => {
    const block = mainJs.split("'mixer:saved:export'")[1]?.split("'mixer:history'")[0] || ''
    expect(block).toContain('_exMix')
    expect(block).toContain("mix.name.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('returns JSON.stringify(_exMix) not JSON.stringify(mix)', () => {
    const block = mainJs.split("'mixer:saved:export'")[1]?.split("'mixer:history'")[0] || ''
    expect(block).toContain('JSON.stringify(_exMix, null, 2)')
    expect(block).not.toContain('JSON.stringify(mix, null, 2)')
  })
})

// ─── T-304: P-123 ────────────────────────────────────────────────────────────
describe('T-304: P-123 _rings uses filter-collect not backward-splice', () => {
  it('uses const _nextRings = [] forward collect', () => {
    expect(mixerGraphJs).toContain('const _nextRings = []')
  })

  it('assigns _rings = _nextRings after loop', () => {
    expect(mixerGraphJs).toContain('_rings = _nextRings')
  })

  it('no longer uses splice on _rings', () => {
    expect(mixerGraphJs).not.toContain('_rings.splice(')
  })
})

describe('T-304: P-123 _sparks uses filter-collect not backward-splice', () => {
  it('uses const _nextSparks = [] forward collect', () => {
    expect(mixerGraphJs).toContain('const _nextSparks = []')
  })

  it('assigns _sparks = _nextSparks after loop', () => {
    expect(mixerGraphJs).toContain('_sparks = _nextSparks')
  })

  it('no longer uses splice on _sparks', () => {
    expect(mixerGraphJs).not.toContain('_sparks.splice(')
  })
})

// ─── T-305: B-77 + F-74 ──────────────────────────────────────────────────────
describe('T-305: B-77 blueprint:readiness answeredFields uses Object.values filter', () => {
  it('uses Object.values(a).filter in answeredFields', () => {
    const block = mainJs.split("'blueprint:readiness'")[1]?.split("'blueprint:generate-brief'")[0] || ''
    expect(block).toContain('Object.values(a).filter(')
  })

  it('no longer uses Object.keys and manual counter IIFE', () => {
    const block = mainJs.split("'blueprint:readiness'")[1]?.split("'blueprint:generate-brief'")[0] || ''
    expect(block).not.toContain('Object.keys(a)')
    expect(block).not.toContain('_answeredCount')
  })
})

describe('T-305: F-74 renderBpPhases uses BP_QUESTIONS.filter', () => {
  it('filters questions with BP_QUESTIONS.filter', () => {
    const block = rendererJs.split('function renderBpPhases')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('BP_QUESTIONS.filter(q => q.phase === phase.id)')
  })

  it('uses optional-chain for answers check in answered count', () => {
    const block = rendererJs.split('function renderBpPhases')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('bpState.answers[q.key]?.trim()')
  })

  it('no longer uses push-loop _bpQPhase', () => {
    const block = rendererJs.split('function renderBpPhases')[1]?.split('\nfunction ')[0] || ''
    expect(block).not.toContain('_bpQPhase')
    expect(block).not.toContain('_bpQAnswered')
  })
})
