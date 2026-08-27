import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('parseComplianceLine invariants', () => {
  it('defines parseComplianceLine function', () => {
    expect(mainJs).toContain('function parseComplianceLine')
  })

  it('extracts DRIFT field', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(block).toContain('DRIFT:')
    expect(block).toContain('drift')
  })

  it('extracts TESTS field (I-56)', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(block).toContain('TESTS:')
    expect(block).toContain('tests')
  })

  it('defaults tests to unknown when missing', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(block).toContain("'unknown'")
  })

  it('computes score as ratio of actual to planned', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(block).toContain('totalActual / totalPlanned')
    expect(block).toContain('Math.round')
  })

  it('caps actual at planned per category', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(block).toContain('Math.min(actual, planned)')
  })

  it('returns null for non-matching lines', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(block).toContain('return null')
  })

  it('returns structured object with all fields', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(block).toContain('categories')
    expect(block).toContain('drift')
    expect(block).toContain('tests')
    expect(block).toContain('score')
    expect(block).toContain('totalPlanned')
    expect(block).toContain('totalActual')
  })
})

describe('compliance metrics IPC handler', () => {
  it('reads ORCHESTRA_REPORT.md for compliance data', () => {
    const block = mainJs.split("'metrics:compliance'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('ORCHESTRA_REPORT.md')
  })

  it('filters lines containing COMPLIANCE', () => {
    const block = mainJs.split("'metrics:compliance'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain("l.includes('COMPLIANCE')")
  })

  it('returns last 10 compliance lines', () => {
    const block = mainJs.split("'metrics:compliance'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('.slice(-10)')
  })

  it('computes average score', () => {
    const block = mainJs.split("'metrics:compliance'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('avgScore')
    expect(block).toContain('Math.round')
  })

  it('validates dir via isKnownProject', () => {
    const block = mainJs.split("'metrics:compliance'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('isKnownProject(dir)')
  })
})
