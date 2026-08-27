import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const schedulerJs = fs.readFileSync(path.join(ROOT, 'resource-scheduler.js'), 'utf8')
const contextJs = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('resource-scheduler.js write size cap (I-413)', () => {
  it('serializes to _rsSer before writing', () => {
    expect(schedulerJs).toContain('_rsSer')
    expect(schedulerJs).toContain('JSON.stringify(hist)')
  })

  it('caps resource-metrics write at 1MB', () => {
    expect(schedulerJs).toContain('_rsSer.length <= 1_048_576')
  })
})

describe('context-protocol.js write size cap (I-414)', () => {
  it('serializes to _cpSer before writing', () => {
    expect(contextJs).toContain('_cpSer')
    expect(contextJs).toContain('JSON.stringify(hist)')
  })

  it('caps context-metrics write at 1MB', () => {
    expect(contextJs).toContain('_cpSer.length <= 1_048_576')
  })
})

describe('orchestra:tail lines parameter (I-415)', () => {
  const block = mainJs.split("'orchestra:tail'")[1]?.split('\n})')[0] || ''

  it('accepts lines parameter with _tailLines variable', () => {
    expect(block).toContain('_tailLines')
    expect(block).toContain('lines')
  })

  it('validates lines: integer, >0, <=1000, default 400', () => {
    expect(block).toContain('Number.isInteger(lines)')
    expect(block).toContain('1000')
    expect(block).toContain('400')
  })
})

describe('cmd-item running aria-label (I-416)', () => {
  it('cmd-item includes aria-label with running state', () => {
    expect(rendererJs).toContain('aria-label=')
    expect(rendererJs).toContain('en ejecución')
  })
})
