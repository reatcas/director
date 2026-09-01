import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('orchestra:clearLog lifecycle entry validation (S-47)', () => {
  const block = mainJs.split("'orchestra:clearLog'")[1]?.split("'orchestra:tail'")[0] || ''

  it('validates event type is a string before writing back', () => {
    expect(block).toContain("typeof e.type === 'string'")
  })

  it('validates event label is a string before writing back', () => {
    expect(block).toContain("typeof e.label === 'string'")
  })

  it('validates event message is a string before writing back', () => {
    expect(block).toContain("typeof e.message === 'string'")
  })
})

describe('snapshotMixer full entry validation (S-48)', () => {
  const block = mainJs.split('function snapshotMixer')[1]?.split('\nfunction')[0] || ''

  it('validates h.event is a string', () => {
    expect(block).toContain("typeof h.event === 'string'")
  })

  it('validates h.focus is an object', () => {
    expect(block).toContain("typeof h.focus === 'object'")
  })

  it('validates focus values are finite numbers in range', () => {
    expect(block).toContain('Number.isFinite(v)')
    expect(block).toContain('v >= 0')
    expect(block).toContain('v <= 100')
  })
})

describe('persistLifecycleEvent type allowlist guard (I-586)', () => {
  const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\nipcMain')[0] || ''

  it('uses _LC_TYPES.has to validate type', () => {
    expect(block).toContain('_LC_TYPES.has(type)')
  })

  it('returns null for invalid types instead of persisting as unknown (BL-14)', () => {
    expect(block).toContain('? type : null')
  })
})

describe('orchestra:fine evicts session-summary cache (BL-04)', () => {
  const block = mainJs.split("'orchestra:fine'")[1]?.split("'orchestra:kill'")[0] || ''

  it('deletes session-summary from _metricsCache', () => {
    expect(block).toContain("_metricsCache.delete('session-summary')")
  })
})

describe('sessionSummary ss-item aria-labels (A-18)', () => {
  it('active item has aria-label with orquestas activas', () => {
    const block = rendererJs.split('async function loadSessionSummary')[1]?.split('\nfunction')[0] || ''
    expect(block).toContain('orquestas activas')
  })

  it('idle item has aria-label with orquestas inactivas', () => {
    const block = rendererJs.split('async function loadSessionSummary')[1]?.split('\nfunction')[0] || ''
    expect(block).toContain('orquestas inactivas')
  })

  it('token item has aria-label with tokens totales', () => {
    expect(rendererJs).toContain('tokens totales')
  })
})
