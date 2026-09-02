// cycle288-coverage.test.js — C288 quality coverage
// T-261: S-162 export:session compliance ctrl-char strip; S-163 runStarted ctrl-char strip
// T-262: P-109 clearLog readdirSync for-of
// T-263: B-63 mixer:saved:list for-of (_umFiltered/_vdFiltered); F-60 LC_ICONS ?? '·'

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-261: S-162 + S-163 ────────────────────────────────────────────────────
describe('T-261: S-162 export:session compliance lines ctrl-char strip', () => {
  it('maps compliance lines through replace(/[\\x00-\\x1F\\x7F]/g) and slice(0, 512)', () => {
    const block = mainJs.split("'export:session'")[1]?.split("'notes:read'")[0] || ''
    expect(block).toContain(".map(l => l.replace(/[\\x00-\\x1F\\x7F]/g, '').slice(0, 512))")
  })

  it('does not return raw split lines without strip', () => {
    const block = mainJs.split("'export:session'")[1]?.split("'notes:read'")[0] || ''
    expect(block).not.toMatch(/filter\(l => l\.includes\('COMPLIANCE'\)\)\.slice\(-50\)/)
  })
})

describe('T-261: S-163 export:session runStarted ctrl-char strip', () => {
  it('strips ctrl-chars from runStarted before returning', () => {
    const block = mainJs.split("'export:session'")[1]?.split("'notes:read'")[0] || ''
    expect(block).toContain("read('.claude/RUN_STARTED').trim().replace(/[\\x00-\\x1F\\x7F]/g, '').slice(0, 64) || null")
  })

  it('does not use raw trim() without strip for runStarted', () => {
    const block = mainJs.split("'export:session'")[1]?.split("'notes:read'")[0] || ''
    expect(block).not.toContain("read('.claude/RUN_STARTED').trim() || null")
  })
})

// ─── T-262: P-109 ────────────────────────────────────────────────────────────
describe('T-262: P-109 clearLog prune uses for-of instead of .filter()', () => {
  it('accumulates iterLogs with for-of push in clearLog', () => {
    const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('const iterLogs = []')
    expect(block).toContain('for (const f of fs.readdirSync(logDir))')
    expect(block).not.toContain('readdirSync(logDir).filter(')
  })
})

// ─── T-263: B-63 + F-60 ──────────────────────────────────────────────────────
describe('T-263: B-63 mixer:saved:list uses for-of (_umFiltered/_vdFiltered)', () => {
  it('uses _umFiltered with for-of push for userMixes validation', () => {
    const block = mainJs.split("'mixer:saved:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_umFiltered')
    expect(block).toContain('for (const m of userMixes)')
    expect(block).not.toMatch(/userMixes\s*=\s*userMixes\.filter\(/)
  })

  it('uses _vdFiltered with for-of push for validDefaults', () => {
    const block = mainJs.split("'mixer:saved:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_vdFiltered')
    expect(block).toContain('for (const p of _defaultMixesCache)')
    expect(block).not.toContain('_defaultMixesCache.filter(')
  })
})

describe('T-263: F-60 renderer LC_ICONS uses ?? instead of ||', () => {
  it("uses LC_ICONS[ev.type] ?? '·' instead of ||", () => {
    expect(rendererJs).toContain("LC_ICONS[ev.type] ?? '·'")
    expect(rendererJs).not.toContain("LC_ICONS[ev.type] || '·'")
  })
})
