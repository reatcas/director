import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT       = path.resolve(import.meta.dirname, '..')
const mainJs     = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── T-270: S-168 startedStr ctrl-char strip ────────────────────────────────

describe('startedStr ctrl-char strip before new Date() (S-168)', () => {
  it('applies ctrl-char strip to startedStr before new Date()', () => {
    const block = mainJs.split("'.claude/RUN_STARTED'")[0].split('\n').slice(-10).join('\n')
      + mainJs.split("'.claude/RUN_STARTED'").slice(1).join("'.claude/RUN_STARTED'")
    expect(mainJs).toContain("readFileSync(startFile, 'utf8').trim().replace(/[\\x00-\\x1F\\x7F]/g, '')")
  })

  it('strip is applied before passing to new Date()', () => {
    const block = mainJs.split('startedStr = fs.readFileSync')[1]?.split('\n')[0] || ''
    expect(block).toContain('.replace(/[\\x00-\\x1F\\x7F]/g,')
  })
})

// ─── T-270: S-169 getClaudeUsage RUN_STARTED strip ─────────────────────────

describe('getClaudeUsage RUN_STARTED ctrl-char strip (S-169)', () => {
  it('applies ctrl-char strip to RUN_STARTED content in getClaudeUsage', () => {
    expect(mainJs).toContain("readFileSync(_rsp, 'utf8').trim().replace(/[\\x00-\\x1F\\x7F]/g, '')")
  })

  it('both RUN_STARTED reads now have ctrl-char strips', () => {
    const count = (mainJs.match(/\.trim\(\)\.replace\(\/\[\\x00-\\x1F\\x7F\]\/g, ''\)/g) || []).length
    expect(count).toBeGreaterThanOrEqual(2)
  })
})

// ─── T-271: P-112 atriles:list for-of ───────────────────────────────────────

describe('atriles:list uses for-of instead of data.filter (P-112)', () => {
  it('uses _ataFiltered for-of loop', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_ataFiltered')
  })

  it('no longer calls data.filter', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).not.toContain('data.filter(')
  })

  it('assigns _atrilesCache = _ataFiltered', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_atrilesCache = _ataFiltered')
  })
})

// ─── T-271: B-66 mixer:saved:delete for-of ──────────────────────────────────

describe('mixer:saved:delete uses _msdFiltered for-of (B-66)', () => {
  it('uses _msdFiltered for-of loop', () => {
    const block = mainJs.split("'mixer:saved:delete'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_msdFiltered')
  })

  it('no longer calls mixes.filter', () => {
    const block = mainJs.split("'mixer:saved:delete'")[1]?.split('\nipcMain')[0] || ''
    expect(block).not.toContain('mixes.filter(')
  })

  it('_msdSer is JSON.stringify(_msdFiltered)', () => {
    const block = mainJs.split("'mixer:saved:delete'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('JSON.stringify(_msdFiltered)')
  })
})

// ─── T-272: F-63 HISTORY_STYLES ?? fallback ─────────────────────────────────

describe('HISTORY_STYLES dictionary lookup uses ?? not || (F-63)', () => {
  it('uses ?? for HISTORY_STYLES fallback', () => {
    expect(rendererJs).toContain("HISTORY_STYLES[ev.type] ?? { icon: '·', color: '#666' }")
  })

  it('does not use || for HISTORY_STYLES fallback', () => {
    expect(rendererJs).not.toContain("HISTORY_STYLES[ev.type] || { icon: '·', color: '#666' }")
  })
})
