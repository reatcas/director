import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT      = path.resolve(import.meta.dirname, '..')
const mainJs    = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── S-73: preload alertsConfig shape guard ───────────────────────────────────

describe('preload alertsConfig validates cfg shape before IPC invoke (S-73)', () => {
  it('rejects non-object cfg', () => {
    expect(preloadJs).toContain("typeof cfg !== 'object'")
  })

  it('rejects array cfg', () => {
    expect(preloadJs).toContain('Array.isArray(cfg)')
  })

  it('validates only allowed keys: stall, alto, usageLimit', () => {
    expect(preloadJs).toContain("'stall', 'alto', 'usageLimit'")
  })

  it('rejects non-boolean values', () => {
    expect(preloadJs).toContain("typeof v !== 'boolean'")
  })

  it('returns null (not false) when validation fails', () => {
    const alertsBlock = preloadJs.split('alertsConfig:')[1]?.split('},')[0] || ''
    expect(alertsBlock).toContain('Promise.resolve(null)')
  })
})

// ─── S-74: preload readIterLog logPath guard ──────────────────────────────────

describe('preload readIterLog validates logPath before IPC invoke (S-74)', () => {
  it('rejects non-string logPath', () => {
    const block = preloadJs.split('readIterLog:')[1]?.split('},')[0] || ''
    expect(block).toContain("typeof l !== 'string'")
  })

  it('rejects empty logPath', () => {
    const block = preloadJs.split('readIterLog:')[1]?.split('},')[0] || ''
    expect(block).toContain('!l.trim()')
  })

  it('returns empty string on invalid logPath', () => {
    const block = preloadJs.split('readIterLog:')[1]?.split('},')[0] || ''
    expect(block).toContain("Promise.resolve('')")
  })
})

// ─── A-35: cmd palette aria-expanded + aria-activedescendant ─────────────────

describe('cmd palette items have id for aria-activedescendant (A-35)', () => {
  it('item id is cmd-item-${i}', () => {
    expect(rendererJs).toContain('id="cmd-item-${i}"')
  })

  it('aria-expanded set on cmdInput after render', () => {
    expect(rendererJs).toContain("setAttribute('aria-expanded'")
  })

  it('aria-activedescendant set to first item after render', () => {
    expect(rendererJs).toContain("'aria-activedescendant', 'cmd-item-0'")
  })

  it('aria-activedescendant updated on ArrowDown/ArrowUp navigation', () => {
    expect(rendererJs).toContain("'aria-activedescendant', 'cmd-item-' + nextIdx")
  })

  it('aria-activedescendant updated on Tab navigation', () => {
    expect(rendererJs).toContain("'aria-activedescendant', 'cmd-item-' + _cpNext")
  })
})

describe('closeCmdPalette resets aria attributes (A-35)', () => {
  it('sets aria-expanded to false on close', () => {
    const closeBlock = rendererJs.split('function closeCmdPalette')[1]?.split('\n}')[0] || ''
    expect(closeBlock).toContain("setAttribute('aria-expanded', 'false')")
  })

  it('removes aria-activedescendant on close', () => {
    const closeBlock = rendererJs.split('function closeCmdPalette')[1]?.split('\n}')[0] || ''
    expect(closeBlock).toContain("removeAttribute('aria-activedescendant')")
  })
})

// ─── BL-14: persistLifecycleEvent returns early for unknown type ──────────────

describe('persistLifecycleEvent skips events with unknown type (BL-14)', () => {
  it('assigns null when type not in _LC_TYPES', () => {
    expect(mainJs).toContain('_LC_TYPES.has(type) ? type : null')
  })

  it('returns early if _evType is null', () => {
    const persistBlock = mainJs.split('function persistLifecycleEvent')[1]?.split('\nfunction')[0] || ''
    expect(persistBlock).toContain('if (!_evType) return')
  })

  it('type=unknown is no longer used as fallback', () => {
    expect(mainJs).not.toContain("? type : 'unknown'")
  })
})

// ─── B-21: metrics:roadmap-freshness uses ROADMAP.md-specific git log ─────────

describe('metrics:roadmap-freshness measures ROADMAP.md-specific commit time (B-21)', () => {
  it('git log uses -- ROADMAP.md path limiter', () => {
    expect(mainJs).toContain("'--', 'ROADMAP.md'")
  })

  it('git log -1 --format=%ct -- ROADMAP.md is the full command', () => {
    const freshnessBlock = mainJs.split("'metrics:roadmap-freshness'")[1]?.split('})')[0] || ''
    expect(freshnessBlock).toContain("'ROADMAP.md'")
  })

  it('whole-repo git log (without path limiter) is not used', () => {
    const freshnessBlock = mainJs.split("'metrics:roadmap-freshness'")[1]?.split('})')[0] || ''
    expect(freshnessBlock).not.toMatch(/'--format=%ct'\]/)
  })
})
