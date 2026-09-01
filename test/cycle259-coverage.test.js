// cycle259-coverage.test.js — C259 quality_tests coverage
// T-189: S-117 readIterLog l.length > 512 guard
// T-190: S-118 aiLogin + aiAuthStatus provider whitelist
// T-191: P-87 analyzeFiles for-of, B-41 merged lifecycle filter, F-38 addClaudeMessageEntry+addConclusionEntry _logEl

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs  = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const ctxJs      = readFileSync(join(root, 'context-protocol.js'), 'utf8')

// ─── T-189: S-117 readIterLog l.length > 512 ─────────────────────────────────
describe('T-189: S-117 readIterLog l.length > 512 guard', () => {
  it('readIterLog has l.length > 512 cap', () => {
    const body = preloadJs.split('readIterLog:')[1]?.split('// Saved mixes')[0] || ''
    expect(body).toContain('l.length > 512')
  })

  it('l.length > 512 guard appears in same condition as !l.trim()', () => {
    const body = preloadJs.split('readIterLog:')[1]?.split('// Saved mixes')[0] || ''
    const trimIdx = body.indexOf('!l.trim()')
    const lenIdx  = body.indexOf('l.length > 512')
    expect(trimIdx).toBeGreaterThan(-1)
    expect(lenIdx).toBeGreaterThan(-1)
    // Both on same guard line (within 80 chars of each other)
    expect(Math.abs(trimIdx - lenIdx)).toBeLessThan(80)
  })
})

// ─── T-190: S-118 aiLogin + aiAuthStatus whitelist ────────────────────────────
describe('T-190: S-118 aiLogin provider whitelist', () => {
  it('aiLogin has provider whitelist', () => {
    const body = preloadJs.split('aiLogin:')[1]?.split('aiAuthStatus:')[0] || ''
    expect(body).toContain("new Set(['claude', 'agy', 'codex', 'aider'])")
  })

  it('aiLogin whitelist returns Unknown provider on mismatch', () => {
    const body = preloadJs.split('aiLogin:')[1]?.split('aiAuthStatus:')[0] || ''
    expect(body).toContain("'Unknown provider'")
  })
})

describe('T-190: S-118 aiAuthStatus provider whitelist', () => {
  it('aiAuthStatus has provider whitelist', () => {
    const body = preloadJs.split('aiAuthStatus:')[1]?.split('fine:')[0] || ''
    expect(body).toContain("new Set(['claude', 'agy', 'codex', 'aider'])")
  })

  it('aiAuthStatus whitelist returns loggedIn:false on mismatch', () => {
    const body = preloadJs.split('aiAuthStatus:')[1]?.split('fine:')[0] || ''
    expect(body).toContain('loggedIn: false')
  })
})

// ─── T-191: P-87 + B-41 + F-38 ───────────────────────────────────────────────
describe('T-191: P-87 computeDelta uses for...of for fileTokens', () => {
  it('computeDelta accumulates fileTokens with for...of instead of reduce', () => {
    expect(ctxJs).toContain('for (const sec of sections) fileTokens +=')
  })

  it('computeDelta no longer uses reduce for fileTokens accumulation', () => {
    expect(ctxJs).not.toContain('sections.reduce((s, sec) => s + sec.tokens')
  })
})

describe('T-191: B-41 lifecycle:list merges before+type filter into one pass', () => {
  it('lifecycle:list uses single conditional filter for before+type', () => {
    const body = mainJs.split("'lifecycle:list'")[1]?.split("'lifecycle:add'")[0] || ''
    expect(body).toContain('(!_llBefore || e.ts < _llBefore) && (!_llType || e.type === _llType)')
  })

  it('lifecycle:list does not have two separate filter passes', () => {
    const body = mainJs.split("'lifecycle:list'")[1]?.split("'lifecycle:add'")[0] || ''
    const firstFilter  = body.indexOf("events.filter(e => e.ts < _llBefore)")
    const secondFilter = body.indexOf("events.filter(e => e.type === _llType)")
    expect(firstFilter).toBe(-1)
    expect(secondFilter).toBe(-1)
  })
})

describe('T-191: F-38 addClaudeMessageEntry uses _logEl lazy-init', () => {
  it('addClaudeMessageEntry uses _logEl lazy-init', () => {
    const body = rendererJs.split('function addClaudeMessageEntry(text) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
  })

  it('addClaudeMessageEntry does not do bare $() query for log', () => {
    const body = rendererJs.split('function addClaudeMessageEntry(text) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).not.toContain("const logEl = $('#log')")
  })
})

describe('T-191: F-38 addConclusionEntry uses _logEl lazy-init', () => {
  it('addConclusionEntry uses _logEl lazy-init', () => {
    const body = rendererJs.split('function addConclusionEntry(text, issues) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
  })

  it('addConclusionEntry does not do bare $() query for log', () => {
    const body = rendererJs.split('function addConclusionEntry(text, issues) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).not.toContain("const logEl = $('#log')")
  })
})
