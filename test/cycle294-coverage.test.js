import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT        = path.resolve(import.meta.dirname, '..')
const mainJs      = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs  = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const contextJs   = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')

// ─── T-273: S-170 export:session lifecycle for-of + strip ───────────────────

describe('export:session lifecycle uses _expLcFiltered for-of with ctrl-char strip (S-170)', () => {
  const block = mainJs.split("'mixer:saved:export'")[0].split("'repertoire:readFile'")[1] || mainJs

  it('uses _expLcFiltered variable in export:session lifecycle IIFE', () => {
    expect(mainJs).toContain('_expLcFiltered')
  })

  it('no longer calls d.filter in lifecycle IIFE', () => {
    const lcBlock = mainJs.split("lifecycle: (() =>")[1]?.split("})()\)")[0] || ''
    expect(lcBlock).not.toContain('d.filter(')
  })

  it('strips ctrl-chars from e.label in lifecycle export', () => {
    expect(mainJs).toContain("label: e.label.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('strips ctrl-chars from e.message in lifecycle export', () => {
    expect(mainJs).toContain("message: e.message.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })
})

// ─── T-273: S-171 export:session mixerHistory for-of + strip ────────────────

describe('export:session mixerHistory uses _expMhFiltered for-of with ctrl-char strip (S-171)', () => {
  it('uses _expMhFiltered variable in export:session mixerHistory IIFE', () => {
    expect(mainJs).toContain('_expMhFiltered')
  })

  it('no longer calls d.filter in mixerHistory IIFE', () => {
    const mhBlock = mainJs.split('mixerHistory: (() =>')[1]?.split('})()\)')[0] || ''
    expect(mhBlock).not.toContain('d.filter(')
  })

  it('strips ctrl-chars from e.event in mixerHistory export', () => {
    expect(mainJs).toContain("event: e.event.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })
})

// ─── T-274: P-113 context-protocol.js single for-of ─────────────────────────

describe('_estimateTokens uses single for-of without filter(Boolean) (P-113)', () => {
  it('no longer calls filter(Boolean) in _estimateTokens', () => {
    const block = contextJs.split('_estimateTokens(')[1]?.split('\n  }')[0] || ''
    expect(block).not.toContain('.filter(Boolean)')
  })

  it('uses for-of directly over text.split', () => {
    const block = contextJs.split('_estimateTokens(')[1]?.split('\n  }')[0] || ''
    expect(block).toContain("for (const word of text.split(")
  })

  it('skips empty words with continue guard', () => {
    const block = contextJs.split('_estimateTokens(')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('if (!word) continue')
  })
})

// ─── T-274: B-67 _azCommits for-of in orchestra:analyze ─────────────────────

describe('orchestra:analyze uses _azCommits for-of instead of commits.filter (B-67)', () => {
  it('uses _azCommits variable', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_azCommits')
  })

  it('no longer calls filter(Boolean) for commits', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).not.toContain('commits.filter(Boolean)')
  })

  it('iterates _azCommits in the cat-building loop', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('for (const c of _azCommits)')
  })
})

// ─── T-275: F-64 STATES ?? ACTIONS ?? dict lookups ──────────────────────────

describe('STATES and ACTIONS dictionary lookups use ?? not || (F-64)', () => {
  it('STATES[orchestraState] uses ?? fallback', () => {
    expect(rendererJs).toContain('STATES[orchestraState] ?? STATES.idle')
  })

  it('ACTIONS[type] uses ?? fallback', () => {
    expect(rendererJs).toContain('ACTIONS[type] ?? ACTIONS.started')
  })

  it('STATES does not use || fallback anymore', () => {
    expect(rendererJs).not.toContain('STATES[orchestraState] || STATES.idle')
  })

  it('ACTIONS does not use || fallback anymore', () => {
    expect(rendererJs).not.toContain('ACTIONS[type] || ACTIONS.started')
  })
})
