// cycle261-coverage.test.js — C261 quality_tests coverage
// T-192: S-122 setInterval GC for _notesCache/_blueprintCache/_analyzeCache
// T-193: S-123 savedMixesCache size cap; P-89 getMetrics last-element access
// T-194: B-43 creditsRemaining for...of; F-40 addSleepEntry+addSummaryEntry _logEl

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs       = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs   = readFileSync(join(root, 'renderer.js'), 'utf8')
const schedulerJs  = readFileSync(join(root, 'resource-scheduler.js'), 'utf8')

// Extract the metrics GC setInterval block (the one with _METRICS_EVICT_AGE)
const gcBlock = mainJs.split('_METRICS_EVICT_AGE).unref()')[0]?.split('setInterval(() => {').pop() || ''

// ─── T-192: S-122 setInterval GC additions ────────────────────────────────────
describe('T-192: S-122 _notesCache evicted in setInterval GC loop', () => {
  it('GC loop evicts expired _notesCache entries', () => {
    expect(gcBlock).toContain('_notesCache')
    expect(gcBlock).toContain('_NOTES_TTL')
  })

  it('_notesCache eviction uses TTL comparison', () => {
    const idx = gcBlock.indexOf('_notesCache')
    const snippet = gcBlock.slice(idx, idx + 60)
    expect(snippet).toContain('_NOTES_TTL')
  })
})

describe('T-192: S-122 _blueprintCache evicted in setInterval GC loop', () => {
  it('GC loop evicts expired _blueprintCache entries', () => {
    expect(gcBlock).toContain('_blueprintCache')
    expect(gcBlock).toContain('_BLUEPRINT_TTL')
  })
})

describe('T-192: S-122 _analyzeCache evicted in setInterval GC loop', () => {
  it('GC loop evicts expired _analyzeCache entries', () => {
    expect(gcBlock).toContain('_analyzeCache')
    expect(gcBlock).toContain('_ANALYZE_TTL')
  })
})

// ─── T-193: S-123 + P-89 ─────────────────────────────────────────────────────
describe('T-193: S-123 _savedMixesCache has size cap before .set()', () => {
  it('savedMixesCache has size cap guard', () => {
    const body = mainJs.split('_savedMixesCache.set(dir, _slResult)')[0] || ''
    expect(body).toContain('_savedMixesCache.size >= 100')
  })

  it('savedMixesCache cap uses insertion-order eviction', () => {
    const body = mainJs.split('_savedMixesCache.set(dir, _slResult)')[0] || ''
    expect(body).toContain('_savedMixesCache.delete(_savedMixesCache.keys().next().value)')
  })
})

describe('T-193: P-89 getMetrics uses direct last-element access', () => {
  it('getMetrics uses _gmSamples[_gmSamples.length - 1]', () => {
    const body = schedulerJs.split('getMetrics(dir) {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('_gmSamples[_gmSamples.length - 1]')
  })

  it('getMetrics no longer uses .slice(-1)[0]', () => {
    const body = schedulerJs.split('getMetrics(dir) {')[1]?.split('\n  }')[0] || ''
    expect(body).not.toContain('.slice(-1)[0]')
  })

  it('getMetrics caches samples in local var', () => {
    const body = schedulerJs.split('getMetrics(dir) {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('const _gmSamples = this.samples.get(dir)')
  })
})

// ─── T-194: B-43 + F-40 ──────────────────────────────────────────────────────
describe('T-194: B-43 creditsRemaining uses for...of instead of filter+reduce', () => {
  it('session-summary uses for...of for creditsRemaining', () => {
    const body = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('for (const v of Object.values(aiCredits))')
  })

  it('session-summary no longer uses filter+reduce chain', () => {
    const body = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''
    expect(body).not.toContain('.filter(v => typeof v === \'object\' && v !== null && \'credits\' in v).reduce')
  })
})

describe('T-194: F-40 addSleepEntry uses _logEl lazy-init', () => {
  it('addSleepEntry uses _logEl lazy-init', () => {
    const body = rendererJs.split('function addSleepEntry(seconds, backoff) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
  })

  it('addSleepEntry does not do bare $() query for log', () => {
    const body = rendererJs.split('function addSleepEntry(seconds, backoff) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).not.toContain("const logEl = $('#log')")
  })
})

describe('T-194: F-40 addSummaryEntry uses _logEl lazy-init', () => {
  it('addSummaryEntry uses _logEl lazy-init', () => {
    const body = rendererJs.split('function addSummaryEntry(text) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
  })

  it('addSummaryEntry does not do bare $() query for log', () => {
    const body = rendererJs.split('function addSummaryEntry(text) {')[1]?.split('\nfunction ')[0] || ''
    expect(body).not.toContain("const logEl = $('#log')")
  })
})
