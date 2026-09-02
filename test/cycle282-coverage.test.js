// cycle282-coverage.test.js — C282 quality coverage
// T-249: S-154 system:claude-procs project ctrl-char; S-155 cmd ctrl-char
// T-250: P-105 getClaudeUsage for-of files; B-59 dailyBudget ??
// T-251: F-56 session summary s.active ?? 0 + s.idle ?? 0

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-249: S-154 + S-155 ────────────────────────────────────────────────────
describe('T-249: S-154 system:claude-procs strips control chars from project field', () => {
  it('applies replace(/[\\x00-\\x1F\\x7F]/g) to cwdMatch project value', () => {
    const block = mainJs.split("'system:claude-procs'")[1]?.split("'system:kill-proc'")[0] || ''
    expect(block).toContain("cwdMatch[1].replace(/[\\x00-\\x1F\\x7F]/g, '')")
  })
})

describe('T-249: S-155 system:claude-procs strips control chars from cmd field', () => {
  it('applies replace(/[\\x00-\\x1F\\x7F]/g) to cmd before slice(0,120)', () => {
    const block = mainJs.split("'system:claude-procs'")[1]?.split("'system:kill-proc'")[0] || ''
    expect(block).toContain("cmd.replace(/[\\x00-\\x1F\\x7F]/g, '').slice(0, 120)")
  })

  it('does not use raw cmd.slice(0,120) without sanitization', () => {
    const block = mainJs.split("'system:claude-procs'")[1]?.split("'system:kill-proc'")[0] || ''
    expect(block).not.toContain('cmd: cmd.slice(0, 120)')
  })
})

// ─── T-250: P-105 + B-59 ─────────────────────────────────────────────────────
describe('T-250: P-105 getClaudeUsage uses for...of instead of .filter() for log files', () => {
  it('uses for...of with push instead of .filter() on readdirSync', () => {
    const block = mainJs.split('function getClaudeUsage')[1]?.split('function projectInfo')[0] || ''
    expect(block).toContain('for (const e of fs.readdirSync(logDir')
    expect(block).not.toContain('readdirSync(logDir, { withFileTypes: true }).filter(')
  })
})

describe('T-250: B-59 getClaudeUsage uses ?? for dailyBudget fallback', () => {
  it('uses cached.dailyBudget ?? 1_000_000 instead of || 1_000_000', () => {
    const block = mainJs.split('function getClaudeUsage')[1]?.split('function projectInfo')[0] || ''
    expect(block).toContain('cached.dailyBudget ?? 1_000_000')
    expect(block).not.toContain('cached.dailyBudget || 1_000_000')
  })
})

// ─── T-251: F-56 ─────────────────────────────────────────────────────────────
describe('T-251: F-56 updateSessionSummary uses ?? 0 for s.active and s.idle', () => {
  it('uses s.active ?? 0 instead of s.active || 0', () => {
    expect(rendererJs).toContain('s.active ?? 0')
    expect(rendererJs).not.toContain('s.active || 0')
  })

  it('uses s.idle ?? 0 instead of s.idle || 0', () => {
    expect(rendererJs).toContain('s.idle ?? 0')
    expect(rendererJs).not.toContain('s.idle || 0')
  })
})
