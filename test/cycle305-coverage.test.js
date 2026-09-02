// cycle305-coverage.test.js — C305 quality coverage
// T-294: S-184 lifecycle:list _llEvents ctrl-char strip; S-185 generate-brief additionalNotes/features/deps _bpInline
// T-295: P-120 particles Array.from; B-74 match ?.[1] ?? null
// T-296: F-71 renderCommitBreakdown _barParts/_legendParts for-of

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-294: S-184 + S-185 ────────────────────────────────────────────────────
describe('T-294: S-184 lifecycle:list _llEvents strips ctrl-chars from label and message', () => {
  it('defines _llLabel with narrow ctrl-char strip', () => {
    const block = mainJs.split("'lifecycle:list'")[1]?.split('\nconst _LC_TYPES')[0] || ''
    expect(block).toContain('_llLabel = e.label.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\')')
  })

  it('defines _llMsgRaw with narrow ctrl-char strip', () => {
    const block = mainJs.split("'lifecycle:list'")[1]?.split('\nconst _LC_TYPES')[0] || ''
    expect(block).toContain('_llMsgRaw = e.message.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\')')
  })

  it('pushes stripped label and message into _llEvents', () => {
    const block = mainJs.split("'lifecycle:list'")[1]?.split('\nconst _LC_TYPES')[0] || ''
    expect(block).toContain('label: _llLabel, message: _llMsg')
  })

  it('no longer pushes raw e directly into _llEvents', () => {
    const block = mainJs.split("'lifecycle:list'")[1]?.split('\nconst _LC_TYPES')[0] || ''
    expect(block).not.toContain('_llEvents.push(e)')
  })
})

describe('T-294: S-185 blueprint:generate-brief wraps additionalNotes/features/deps through _bpInline', () => {
  it('additionalNotes applies narrow ctrl-char strip', () => {
    const block = mainJs.split('blueprint:generate-brief')[1]?.split('blueprint:readiness')[0] || ''
    expect(block).toContain('additionalNotes.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\')')
  })

  it('mod.features uses _bpInline(f)', () => {
    const block = mainJs.split('blueprint:generate-brief')[1]?.split('blueprint:readiness')[0] || ''
    expect(block).toContain('_bpInline(f)')
  })

  it('no longer pushes raw f for features', () => {
    const block = mainJs.split('blueprint:generate-brief')[1]?.split('blueprint:readiness')[0] || ''
    expect(block).not.toContain('lines.push(`- ${f}`)')
  })

  it('mod.dependencies uses _depParts for-of with _bpInline(d)', () => {
    const block = mainJs.split('blueprint:generate-brief')[1]?.split('blueprint:readiness')[0] || ''
    expect(block).toContain('_depParts')
    expect(block).toContain('for (const d of mod.dependencies)')
    expect(block).toContain('_bpInline(d)')
  })

  it('no longer uses mod.dependencies.join directly', () => {
    const block = mainJs.split('blueprint:generate-brief')[1]?.split('blueprint:readiness')[0] || ''
    expect(block).not.toContain('mod.dependencies.join(')
  })
})

// ─── T-295: P-120 + B-74 ─────────────────────────────────────────────────────
describe('T-295: P-120 aurora particles uses Array.from instead of push-loop', () => {
  it('uses Array.from({length: N}) for particle init', () => {
    expect(rendererJs).toContain('Array.from({length: N}, () => ({')
  })

  it('no longer uses for(let _pi=0) push-loop for particles', () => {
    expect(rendererJs).not.toContain('for (let _pi = 0; _pi < N; _pi++)')
  })
})

describe('T-295: B-74 auth status email uses ?.[1] ?? null', () => {
  it('uses optional chain ?.[1] on match result', () => {
    expect(mainJs).toContain('out.match(/"email":\\s*"([^"]+)"/)' + '?.' + '[1] ?? null')
  })

  it('no longer uses (match || [])[1] pattern', () => {
    const block = mainJs.split('orchestra:auth-status')[1]?.split('\nipcMain')[0] || ''
    expect(block).not.toContain('|| [])[1]')
  })
})

// ─── T-296: F-71 ─────────────────────────────────────────────────────────────
describe('T-296: F-71 renderCommitBreakdown uses _barParts and _legendParts for-of', () => {
  it('uses _barParts variable', () => {
    expect(rendererJs).toContain('_barParts')
  })

  it('uses _legendParts variable', () => {
    expect(rendererJs).toContain('_legendParts')
  })

  it('uses for-of sorted for _barParts', () => {
    const block = rendererJs.split('function renderCommitBreakdown')[1]?.split('\nasync function runAnalysis')[0] || ''
    expect(block).toContain('for (const [type, count] of sorted)')
  })

  it('no longer uses html += concatenation in renderCommitBreakdown', () => {
    const block = rendererJs.split('function renderCommitBreakdown')[1]?.split('\nasync function runAnalysis')[0] || ''
    expect(block).not.toContain('html +=')
  })

  it('joins _barParts and _legendParts into innerHTML', () => {
    const block = rendererJs.split('function renderCommitBreakdown')[1]?.split('\nasync function runAnalysis')[0] || ''
    expect(block).toContain('_barParts.join(\'\')')
    expect(block).toContain('_legendParts.join(\'\')')
  })
})
