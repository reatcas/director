import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('session-summary handler structure', () => {
  const block = mainJs.split("'metrics:session-summary'")[1]?.split('\n// ───')[0] || ''

  it('iterates all projects from store', () => {
    expect(block).toContain('for (const p of projects)')
    expect(block).toContain('readJSON(store()')
  })

  it('skips projects without path', () => {
    expect(block).toContain('if (!p.path) continue')
  })

  it('uses isRunning for status detection', () => {
    expect(block).toContain('isRunning(p.path)')
  })

  it('aggregates tokens from context protocol', () => {
    expect(block).toContain('contextProto.getMetrics')
    expect(block).toContain('totalTokensProcessed')
    expect(block).toContain('totalTokens +=')
  })

  it('reads compliance from ORCHESTRA_REPORT.md', () => {
    expect(block).toContain('ORCHESTRA_REPORT.md')
    expect(block).toContain('COMPLIANCE')
  })

  it('tracks worst compliance score', () => {
    expect(block).toContain('worstCompliance')
    expect(block).toContain('last.score < worstCompliance.score')
  })

  it('includes project name in worst compliance', () => {
    expect(block).toContain('name: p.name')
  })

  it('wraps each project in try/catch for resilience', () => {
    const catches = (block.match(/catch\s*\{/g) || []).length
    expect(catches).toBeGreaterThanOrEqual(2)
  })

  it('returns total project count', () => {
    expect(block).toContain('total: projects.length')
  })
})

describe('mixer:history handler structure', () => {
  const block = mainJs.split("'mixer:history'")[1]?.split('\n// ───')[0] || ''

  it('reads from mixer-history.json', () => {
    expect(block).toContain('mixer-history.json')
  })

  it('uses readJSON for safe parsing', () => {
    expect(block).toContain('readJSON(')
  })

  it('validates limit as positive number', () => {
    expect(block).toContain("typeof limit === 'number'")
    expect(block).toContain('limit > 0')
  })

  it('returns empty array for missing dir', () => {
    expect(block).toContain('if (!dir) return []')
  })

  it('uses slice for limiting results', () => {
    expect(block).toContain('.slice(-n)')
  })
})
