// cycle280-coverage.test.js — C280 quality coverage
// T-246: S-152 ORCHESTRA_VERSION ctrl-char strip; S-153 started ISO validation
// T-247: P-104 csv for-of; F-55 conflicts ?? []
// T-248: B-58 credits ?? 0

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-246: S-152 + S-153 ────────────────────────────────────────────────────
describe('T-246: S-152 projectInfo strips control chars from ORCHESTRA_VERSION', () => {
  it('applies replace(/[\\x00-\\x1F\\x7F]/g) to version file content', () => {
    const block = mainJs.split('function projectInfo')[1]?.split('function copyDir')[0] || ''
    expect(block).toContain('.replace(/[\\x00-\\x1F\\x7F]/g, \'\')')
  })

  it('version strip is applied before || 1.x fallback', () => {
    const block = mainJs.split('function projectInfo')[1]?.split('function copyDir')[0] || ''
    const stripIdx = block.indexOf('.replace(/[\\x00-\\x1F\\x7F]/g')
    const fallbackIdx = block.indexOf("|| '1.x'")
    expect(stripIdx).toBeGreaterThan(-1)
    expect(fallbackIdx).toBeGreaterThan(stripIdx)
  })
})

describe('T-246: S-153 orchestra:analyze validates started as ISO before git --since', () => {
  it('validates started with /^\\d{4}-\\d{2}-\\d{2}T/ test', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split("'orchestra:readIterLog'")[0] || ''
    expect(block).toContain('/^\\d{4}-\\d{2}-\\d{2}T/.test(_startedRaw)')
  })

  it('uses _startedRaw as raw read and started as validated value', () => {
    const block = mainJs.split("'orchestra:analyze'")[1]?.split("'orchestra:readIterLog'")[0] || ''
    expect(block).toContain('const _startedRaw = read(')
    expect(block).toContain('const started = /^\\d{4}-\\d{2}-\\d{2}T/.test(_startedRaw) ? _startedRaw : \'\'')
  })
})

// ─── T-247: P-104 + F-55 ─────────────────────────────────────────────────────
describe('T-247: P-104 renderBpModules csv parsing uses for...of instead of .map().filter()', () => {
  it('does not use split(\',\').map(...).filter() chain', () => {
    expect(rendererJs).not.toContain("inp.value.split(',').map(s => s.trim()).filter(Boolean)")
  })

  it('uses _csvParts + _csvResult with for...of', () => {
    expect(rendererJs).toContain('_csvParts')
    expect(rendererJs).toContain('_csvResult')
    expect(rendererJs).toContain('for (const s of _csvParts)')
  })
})

describe('T-247: F-55 updateMetrics uses ?? [] for conflicts instead of || []', () => {
  it('uses data.coordination.conflicts ?? [] instead of || []', () => {
    expect(rendererJs).toContain('data.coordination.conflicts ?? []')
    expect(rendererJs).not.toContain('data.coordination.conflicts || []')
  })
})

// ─── T-248: B-58 ─────────────────────────────────────────────────────────────
describe('T-248: B-58 metrics:session-summary uses ?? for credit accumulation', () => {
  it('uses v.credits ?? 0 instead of v.credits || 0', () => {
    const block = mainJs.split("'metrics:session-summary'")[1]?.split("'orchestra:readIterLog'")[0] || ''
    expect(block).toContain('v.credits ?? 0')
    expect(block).not.toContain('v.credits || 0')
  })
})
