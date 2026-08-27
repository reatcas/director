import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('system:claude-procs 5s TTL cache (P-46)', () => {
  const block = mainJs.split("'system:claude-procs'")[1]?.split("'system:kill-proc'")[0] || ''

  it('checks metricsGet before running ps aux', () => {
    expect(block).toContain("metricsGet('sys:claude-procs')")
  })

  it('stores result with 5s TTL', () => {
    expect(block).toContain("metricsSet('sys:claude-procs'")
    expect(block).toContain('5_000')
  })
})

describe('orchestra:version-check 30s TTL cache (P-47)', () => {
  const block = mainJs.split("'orchestra:version-check'")[1]?.split("'orchestra:upgrade'")[0] || ''

  it('checks metricsGet before reading version files', () => {
    expect(block).toContain("metricsGet('version-check:'")
  })

  it('stores result with _SLOW_METRICS_TTL', () => {
    expect(block).toContain("metricsSet('version-check:'")
    expect(block).toContain('_SLOW_METRICS_TTL')
  })
})

describe('metrics:snapshot 2s TTL cache (P-48)', () => {
  const block = mainJs.split("'metrics:snapshot'")[1]?.split("'metrics:allocation'")[0] || ''

  it('checks metricsGet before calling computeDelta', () => {
    expect(block).toContain("metricsGet('snapshot:'")
  })

  it('stores computeDelta result in metricsSet', () => {
    expect(block).toContain("metricsSet('snapshot:'")
    expect(block).toContain('computeDelta')
  })
})

describe('mixer:saved:list per-dir cache (I-587)', () => {
  it('declares _savedMixesCache Map', () => {
    expect(mainJs).toContain('const _savedMixesCache = new Map()')
  })

  it('declares _invalidateSavedMixes function', () => {
    expect(mainJs).toContain('function _invalidateSavedMixes(dir)')
  })

  const block = mainJs.split("'mixer:saved:list'")[1]?.split("'mixer:saved:save'")[0] || ''

  it('checks _savedMixesCache before reading disk', () => {
    expect(block).toContain('_savedMixesCache.get(dir)')
  })

  it('stores result in _savedMixesCache', () => {
    expect(block).toContain('_savedMixesCache.set(dir')
  })

  it('invalidates cache on save', () => {
    const saveBlock = mainJs.split("'mixer:saved:save'")[1]?.split("'mixer:saved:delete'")[0] || ''
    expect(saveBlock).toContain('_invalidateSavedMixes(dir)')
  })

  it('invalidates cache on delete', () => {
    const deleteBlock = mainJs.split("'mixer:saved:delete'")[1]?.split("'mixer:saved:export'")[0] || ''
    expect(deleteBlock).toContain('_invalidateSavedMixes(dir)')
  })
})

describe('orchestra:kill evicts session-summary cache (BL-05)', () => {
  const block = mainJs.split("'orchestra:kill'")[1]?.split("'orchestra:hotReload'")[0] || ''

  it('deletes session-summary from _metricsCache', () => {
    expect(block).toContain("_metricsCache.delete('session-summary')")
  })
})

describe('mixer:saved:export focus validation (D-14)', () => {
  const block = mainJs.split("'mixer:saved:export'")[1]?.split("'mixer:history'")[0] || ''

  it('validates focus is an object with numeric values', () => {
    expect(block).toContain("typeof mix.focus !== 'object'")
    expect(block).toContain("typeof v !== 'number'")
  })

  it('validates focus values are in range 0-100', () => {
    expect(block).toContain('v < 0')
    expect(block).toContain('v > 100')
  })

  it('returns null when focus is invalid', () => {
    expect(block).toContain('return null')
  })
})

describe('loadSessionSummary total count (FE-04)', () => {
  it('renders total project count', () => {
    const block = rendererJs.split('function loadSessionSummary')[1]?.split('\nfunction')[0] || rendererJs.split('async function loadSessionSummary')[1]?.split('\nfunction')[0] || ''
    expect(block).toContain('s.total')
    expect(block).toContain('total')
  })
})

describe('sessionSummary dynamic aria-label (A-19)', () => {
  it('sets aria-label on the sessionSummary element', () => {
    expect(rendererJs).toContain("el.setAttribute('aria-label'")
  })

  it('includes active count in aria-label', () => {
    const block = rendererJs.split("el.setAttribute('aria-label'")[1]?.split('\n')[0] || ''
    expect(block).toContain('activos')
  })
})
