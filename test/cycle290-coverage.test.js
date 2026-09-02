// cycle290-coverage.test.js — C290 quality coverage
// T-264: S-164 orchestra:analyze RUN_STARTED ctrl-char strip; S-165 readIterLog ctrl-char strip per line
// T-265: P-110 clearLog analysis readdirSync for-of; B-64 repertoire:remove for-of
// T-266: F-61 log viewer two-filter → for-of (_rlLines/_rlMeaningful)

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-264: S-164 + S-165 ────────────────────────────────────────────────────
describe('T-264: S-164 orchestra:analyze RUN_STARTED ctrl-char strip', () => {
  it('strips ctrl-chars from _startedRaw before ISO validation', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split("'orchestra:readIterLog'")[0] || ''
    expect(block).toContain("read('.claude/RUN_STARTED').trim().replace(/[\\x00-\\x1F\\x7F]/g, '').slice(0, 64)")
  })

  it('does not use raw trim().slice() without strip for _startedRaw', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split("'orchestra:readIterLog'")[0] || ''
    expect(block).not.toContain("read('.claude/RUN_STARTED').trim().slice(0, 64)")
  })
})

describe('T-264: S-165 orchestra:readIterLog strips ctrl-chars per line', () => {
  it('applies narrow ctrl-char strip to each line in readIterLog', () => {
    const block = mainJs.split("'orchestra:readIterLog'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_rilLines')
    expect(block).toContain('replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g')
    expect(block).not.toContain(".filter(l => l.trim())")
  })
})

// ─── T-265: P-110 + B-64 ─────────────────────────────────────────────────────
describe('T-265: P-110 clearLog analysis files uses for-of', () => {
  it('accumulates analysis files with for-of push (_caFiles)', () => {
    const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_caFiles')
    expect(block).toContain("for (const f of fs.readdirSync(claudeDir))")
    expect(block).not.toContain("readdirSync(claudeDir).filter(")
  })
})

describe('T-265: B-64 repertoire:remove uses for-of (_rrRemaining)', () => {
  it('accumulates surviving projects with for-of push (_rrRemaining)', () => {
    const block = mainJs.split("'repertoire:remove'")[1]?.split("'repertoire:openDir'")[0] || ''
    expect(block).toContain('_rrRemaining')
    expect(block).toContain('for (const p of _rrProjects)')
    expect(block).not.toContain('_rrProjects.filter(')
  })
})

// ─── T-266: F-61 ─────────────────────────────────────────────────────────────
describe('T-266: F-61 renderer log viewer uses for-of (_rlLines/_rlMeaningful)', () => {
  it('uses _rlLines with for-of instead of .filter(l => l.trim())', () => {
    expect(rendererJs).toContain('_rlLines')
    expect(rendererJs).toContain('_rlMeaningful')
  })

  it('does not use the two-step .filter() chain for log lines', () => {
    expect(rendererJs).not.toContain("content.trim().split('\\n').filter(l => l.trim())")
  })
})
