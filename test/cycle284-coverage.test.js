// cycle284-coverage.test.js — C284 quality coverage
// T-252: S-156 parseComplianceLine drift ctrl-char strip
// T-253: S-157 orchestra:analyze ORCHESTRA_VERSION ctrl-char strip
// T-254: P-106 Array.from→spread cmdPalette; B-60 bp.modules/sessions??[]; F-57 focus[k]??0

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-252: S-156 ────────────────────────────────────────────────────────────
describe('T-252: S-156 parseComplianceLine strips control chars from drift field', () => {
  it('applies replace(/[\\x00-\\x1F\\x7F]/g) to drift before slice(0,128)', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("m[2].trim().replace(/[\\x00-\\x1F\\x7F]/g, '').slice(0, 128)")
  })

  it('ctrl-char strip appears before slice in drift assignment', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\nipcMain')[0] || ''
    const stripIdx = block.indexOf("replace(/[\\x00-\\x1F\\x7F]/g, '')")
    const sliceIdx = block.indexOf('.slice(0, 128)')
    expect(stripIdx).toBeGreaterThan(-1)
    expect(sliceIdx).toBeGreaterThan(stripIdx)
  })
})

// ─── T-253: S-157 ────────────────────────────────────────────────────────────
describe('T-253: S-157 orchestra:analyze strips control chars from ORCHESTRA_VERSION', () => {
  it('applies replace(/[\\x00-\\x1F\\x7F]/g) to ORCHESTRA_VERSION read in analyze', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split("'orchestra:readIterLog'")[0] || ''
    expect(block).toContain("read('.claude/ORCHESTRA_VERSION').trim().replace(/[\\x00-\\x1F\\x7F]/g, '').slice(0, 64)")
  })

  it('does not use raw .trim() without ctrl-char strip for version in analyze', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split("'orchestra:readIterLog'")[0] || ''
    expect(block).not.toContain("read('.claude/ORCHESTRA_VERSION').trim() || 'unknown'")
  })
})

// ─── T-254: P-106 + B-60 + F-57 ─────────────────────────────────────────────
describe('T-254: P-106 cmdPalette Tab uses spread instead of Array.from', () => {
  it('uses [...document.querySelectorAll] instead of Array.from for #cmdResults', () => {
    expect(rendererJs).toContain("[...document.querySelectorAll('#cmdResults .cmd-item')]")
    expect(rendererJs).not.toContain("Array.from(document.querySelectorAll('#cmdResults .cmd-item'))")
  })
})

describe('T-254: B-60 blueprint:generate-brief uses ?? for modules and sessions arrays', () => {
  it('uses bp.modules ?? [] instead of bp.modules || []', () => {
    const block = mainJs.split("'blueprint:generate-brief'")[1]?.split("'blueprint:readiness'")[0] || ''
    expect(block).toContain('bp.modules ?? []')
    expect(block).not.toContain('bp.modules || []')
  })

  it('uses bp.sessions ?? [] instead of bp.sessions || []', () => {
    const block = mainJs.split("'blueprint:generate-brief'")[1]?.split("'blueprint:readiness'")[0] || ''
    expect(block).toContain('bp.sessions ?? []')
    expect(block).not.toContain('bp.sessions || []')
  })
})

describe('T-254: F-57 mixer slider render uses ?? for focus[k] weight', () => {
  it('uses focus[k] ?? 0 instead of focus[k] || 0', () => {
    expect(rendererJs).toContain('focus[k] ?? 0')
    expect(rendererJs).not.toContain('focus[k] || 0')
  })
})
