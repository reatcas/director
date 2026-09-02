// cycle287-coverage.test.js — C287 quality coverage
// T-258: S-160 export:session ORCHESTRA_VERSION ctrl-char strip
// T-259: S-161 repertoire:add basename ctrl-char strip
// T-260: P-108 readdirSync for-of; B-62 mixer:history for-of; F-59 cfg?.focus??{} + tagName??''

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-258: S-160 ────────────────────────────────────────────────────────────
describe('T-258: S-160 export:session strips control chars from ORCHESTRA_VERSION', () => {
  it('applies replace(/[\\x00-\\x1F\\x7F]/g) in export:session orchestraVersion field', () => {
    const block = mainJs.split("'export:session'")[1]?.split("'notes:read'")[0] || ''
    expect(block).toContain("read('.claude/ORCHESTRA_VERSION').trim().replace(/[\\x00-\\x1F\\x7F]/g, '').slice(0, 64)")
  })

  it('does not use raw .trim() without strip for orchestraVersion in export:session', () => {
    const block = mainJs.split("'export:session'")[1]?.split("'notes:read'")[0] || ''
    expect(block).not.toContain("read('.claude/ORCHESTRA_VERSION').trim() || 'unknown'")
  })
})

// ─── T-259: S-161 ────────────────────────────────────────────────────────────
describe('T-259: S-161 repertoire:add strips control chars from path.basename', () => {
  it('applies replace(/[\\x00-\\x1F\\x7F]/g) to path.basename(dir) when storing project name', () => {
    const block = mainJs.split("'repertoire:add'")[1]?.split("'repertoire:remove'")[0] || ''
    expect(block).toContain("path.basename(dir).replace(/[\\x00-\\x1F\\x7F]/g, '').slice(0, 256)")
  })

  it('does not store raw path.basename(dir) as project name', () => {
    const block = mainJs.split("'repertoire:add'")[1]?.split("'repertoire:remove'")[0] || ''
    expect(block).not.toContain('name: path.basename(dir),')
  })
})

// ─── T-260: P-108 + B-62 + F-59 ─────────────────────────────────────────────
describe('T-260: P-108 orchestra:analyze uses for-of instead of filter for analysis files', () => {
  it('uses for-of loop to accumulate _anFiles instead of .filter()', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split("'orchestra:readIterLog'")[0] || ''
    expect(block).toContain('for (const f of fs.readdirSync(_clDir))')
    expect(block).not.toContain('readdirSync(_clDir).filter(')
  })
})

describe('T-260: B-62 mixer:history uses for-of instead of .filter()', () => {
  it('uses _mhFiltered with for-of push instead of hist.filter()', () => {
    const block = mainJs.split("'mixer:history'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_mhFiltered')
    expect(block).toContain('for (const h of hist)')
    expect(block).not.toContain('hist.filter(')
  })
})

describe('T-260: F-59 renderer uses cfg?.focus ?? {} and tagName ?? \'\'', () => {
  it('uses cfg?.focus ?? {} instead of (cfg && cfg.focus) || {}', () => {
    expect(rendererJs).toContain('cfg?.focus ?? {}')
    expect(rendererJs).not.toContain('(cfg && cfg.focus) || {}')
  })

  it('uses e.target.tagName ?? \'\' instead of e.target.tagName || \'\'', () => {
    expect(rendererJs).toContain("(e.target.tagName ?? '').toLowerCase()")
    expect(rendererJs).not.toContain("(e.target.tagName || '').toLowerCase()")
  })
})
