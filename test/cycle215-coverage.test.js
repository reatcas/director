import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('getClaudeUsage iter log filename regex (S-59)', () => {
  it('uses regex to filter iter log filenames', () => {
    expect(mainJs).toContain('/^iter-[\\w\\-.]+\\.log$/.test(e.name)')
  })
})

describe('blueprint:generate-brief strips control chars (S-60)', () => {
  it('_bpInline removes control chars before stripping newlines', () => {
    const block = mainJs.split("'blueprint:generate-brief'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_bpInline')
    expect(block).toContain('\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F')
  })
})

describe('orchestra:writeConfig evicts snapshot cache (I-592)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('deletes snapshot: cache when focus changes', () => {
    expect(block).toContain("_metricsCache.delete('snapshot:' + dir)")
  })
})

describe('metricsGet uses nullish coalescing for TTL (BL-10)', () => {
  it('uses ?? instead of || for TTL lookup', () => {
    expect(mainJs).toContain('c.ttl ?? _METRICS_TTL')
    expect(mainJs).not.toContain('c.ttl || _METRICS_TTL')
  })
})

describe('loadSessionSummary shows — empty state (FE-09)', () => {
  it('renders sin datos when session summary is null', () => {
    expect(rendererJs).toContain('sin datos')
  })

  it('uses innerHTML for empty state with sin datos fallback', () => {
    const block = rendererJs.split('async function loadSessionSummary')[1]?.split('\n}\n')[0] || ''
    expect(block).not.toContain("el.textContent = ''")
    expect(block).toContain('sin datos')
  })
})

describe('cycle111 aiState TTL test uses ipcMain anchor (T-99)', () => {
  it('aiState TTL check no longer uses slice(0,8)', () => {
    const testFile = fs.readFileSync(path.join(ROOT, 'test/cycle111-coverage.test.js'), 'utf8')
    const block = testFile.split("returns cache hit when within TTL")[1]?.split('})')[0] || ''
    expect(block).not.toContain("slice(0, 8)")
    expect(block).toContain("split('\\nipcMain')[0]")
  })
})

describe('cycle158 removes unused dead block variable (T-100)', () => {
  it('cycle158 no longer defines unused block variable', () => {
    const testFile = fs.readFileSync(path.join(ROOT, 'test/cycle158-coverage.test.js'), 'utf8')
    expect(testFile).not.toContain("split('\\n').slice(-5)")
  })
})
