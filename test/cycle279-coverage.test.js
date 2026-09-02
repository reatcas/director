// cycle279-coverage.test.js — C279 quality coverage
// T-243: S-150 cachedProjects name control-char; S-151 parseComplianceLine allowlist
// T-244: P-103 modal focus trap Array.from → spread
// T-245: B-57 cat[k]??0; F-54 loadSettings cfg.compactAt??50 + cfg.keepLogs??50

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-243: S-150 + S-151 ────────────────────────────────────────────────────
describe('T-243: S-150 cachedProjects filter rejects control chars in project name', () => {
  it('has control-char check on p.name in cachedProjects filter', () => {
    const block = mainJs.split('function cachedProjects')[1]?.split('function isKnownProject')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(p.name)')
  })

  it('does not include entries with control-char names', () => {
    const block = mainJs.split('function cachedProjects')[1]?.split('function isKnownProject')[0] || ''
    expect(block).toContain('!p.name || !/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(p.name)')
  })
})

describe('T-243: S-151 parseComplianceLine validates category key with allowlist', () => {
  it('uses /^[\\w\\-]+$/ allowlist check on pm[1] before using as object key', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('const _SLOW_METRICS_TTL')[0] || ''
    expect(block).toContain('/^[\\w\\-]+$/.test(pm[1])')
  })

  it('continues (skips) if pm[1] does not match allowlist', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('const _SLOW_METRICS_TTL')[0] || ''
    expect(block).toContain("if (!/^[\\w\\-]+$/.test(pm[1])) continue")
  })
})

// ─── T-244: P-103 ─────────────────────────────────────────────────────────────
describe('T-244: P-103 modal focus traps use spread instead of Array.from', () => {
  it('does not use Array.from(modal.querySelectorAll) for focusable elements', () => {
    expect(rendererJs).not.toContain("Array.from(modal.querySelectorAll('button,")
  })

  it('uses [...modal.querySelectorAll] spread pattern for focusable elements', () => {
    expect(rendererJs).toContain("[...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])')]")
  })

  it('has 4 occurrences of spread focusable pattern (one per modal)', () => {
    const occurrences = rendererJs.split("[...modal.querySelectorAll('button,").length - 1
    expect(occurrences).toBe(4)
  })
})

// ─── T-245: B-57 + F-54 ──────────────────────────────────────────────────────
describe('T-245: B-57 orchestra:analyze uses ?? for cat[k] counter', () => {
  it('uses cat[k] ?? 0 instead of cat[k] || 0', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split("'orchestra:readIterLog'")[0] || ''
    expect(block).toContain('cat[k] ?? 0')
    expect(block).not.toContain('cat[k] || 0')
  })
})

describe('T-245: F-54 loadSettings uses ?? for compactAt and keepLogs', () => {
  it('uses cfg.compactAt ?? 50 instead of cfg.compactAt || 50', () => {
    const block = rendererJs.split('async function loadSettings')[1]?.split('\n}')[0] || ''
    expect(block).toContain('cfg.compactAt ?? 50')
    expect(block).not.toContain('cfg.compactAt || 50')
  })

  it('uses cfg.keepLogs ?? 50 instead of cfg.keepLogs || 50', () => {
    const block = rendererJs.split('async function loadSettings')[1]?.split('\n}')[0] || ''
    expect(block).toContain('cfg.keepLogs ?? 50')
    expect(block).not.toContain('cfg.keepLogs || 50')
  })
})
