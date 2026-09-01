// cycle263-coverage.test.js — C263 quality_tests coverage
// T-198: S-126 _notesCache size cap; S-127 _blueprintCache size cap
// T-199: P-91 metrics:compliance scores for...of sum; B-45 _analyzeCache size cap
// T-200: F-42 open() _logEl lazy-init

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-198: S-126 + S-127 cache size caps ─────────────────────────────────────
describe('T-198: S-126 _notesCache has size cap before .set()', () => {
  it('notes:read caps _notesCache at 100 before set', () => {
    const body = mainJs.split("'notes:read'")[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('_notesCache.size >= 100')
    expect(body).toContain('_notesCache.delete(_notesCache.keys().next().value)')
  })
})

describe('T-198: S-127 _blueprintCache has size cap before .set()', () => {
  it('blueprint:load caps _blueprintCache at 100 before set', () => {
    const body = mainJs.split("'blueprint:load'")[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('_blueprintCache.size >= 100')
    expect(body).toContain('_blueprintCache.delete(_blueprintCache.keys().next().value)')
  })
})

// ─── T-199: P-91 + B-45 ──────────────────────────────────────────────────────
describe('T-199: P-91 metrics:compliance uses for...of sum instead of reduce', () => {
  it('compliance uses for...of to accumulate score sum', () => {
    const body = mainJs.split("'metrics:compliance'")[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('for (const s of scores) _rawSum += s')
  })

  it('compliance no longer uses scores.reduce', () => {
    const body = mainJs.split("'metrics:compliance'")[1]?.split('\nipcMain')[0] || ''
    expect(body).not.toContain('scores.reduce')
  })
})

describe('T-199: B-45 _analyzeCache has size cap before .set()', () => {
  it('orchestra:analyze caps _analyzeCache at 100 before set', () => {
    const body = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('_analyzeCache.size >= 100')
    expect(body).toContain('_analyzeCache.delete(_analyzeCache.keys().next().value)')
  })
})

// ─── T-200: F-42 open() _logEl lazy-init ─────────────────────────────────────
describe('T-200: F-42 open() uses _logEl lazy-init instead of bare $()', () => {
  it('open() initialises _logEl before clearing log', () => {
    const body = rendererJs.split('async function open(dir) {')[1]?.split('\nasync function ')[0] || ''
    expect(body).toContain("if (!_logEl) _logEl = $('#log')")
  })

  it('open() uses _logEl to clear innerHTML', () => {
    const body = rendererJs.split('async function open(dir) {')[1]?.split('\nasync function ')[0] || ''
    expect(body).toContain('if (_logEl) _logEl.innerHTML = \'\'')
  })

  it('open() does not do bare $() query for log', () => {
    const body = rendererJs.split('async function open(dir) {')[1]?.split('\nasync function ')[0] || ''
    expect(body).not.toContain("const logEl = $('#log')")
  })
})
