import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('blueprint:generate-brief newline sanitization (S-41)', () => {
  const block = mainJs.split("'blueprint:generate-brief'")[1]?.split("'blueprint:readiness'")[0] || ''

  it('defines _bpInline sanitizer', () => {
    expect(block).toContain('_bpInline')
    expect(block).toContain("replace(/[\\r\\n]+/g, ' ')")
  })

  it('sanitizes projectName with _bpInline', () => {
    expect(block).toContain('_bpInline(a.projectName)')
  })

  it('sanitizes stack and projectType with _bpInline', () => {
    expect(block).toContain('_bpInline(a.stack)')
    expect(block).toContain('_bpInline(a.projectType)')
  })
})

describe('metrics:context ts field validation (S-42)', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split("'metrics:coordination'")[0] || ''

  it('validates ts is string or undefined in context-metrics filter', () => {
    expect(block).toMatch(/h\.ts === undefined \|\| typeof h\.ts === 'string'/)
  })

  it('filter still checks h is a non-null object', () => {
    expect(block).toContain("h && typeof h === 'object'")
  })
})

describe('lifecycle timeline time element (A-16)', () => {
  it('uses time element with datetime attribute for timestamps', () => {
    const block = rendererJs.split('lifecycleTimeline')[1]?.split('function bpStartSession')[0] || ''
    expect(block).toContain('<time class="lc-ts"')
    expect(block).toContain('datetime=')
  })

  it('datetime attribute uses raw ISO timestamp from event', () => {
    const block = rendererJs.split('lifecycleTimeline')[1]?.split('function bpStartSession')[0] || ''
    expect(block).toContain('datetime="${esc(ev.ts)}"')
  })
})

describe('_readinessCache periodic eviction (D-11)', () => {
  const sweepBlock = mainJs.split('_METRICS_EVICT_AGE).unref()')[0]?.split('setInterval(')[mainJs.split('setInterval(').length - 2] || ''

  it('evicts _readinessCache entries in periodic sweep', () => {
    expect(mainJs).toContain('_readinessCache.delete(k)')
  })

  it('_readinessCache eviction is in the same setInterval as other caches', () => {
    const block = mainJs.split('_isRunningCache.delete(k)')[1]?.split('.unref()')[0] || ''
    expect(block).toContain('_readinessCache.delete(k)')
  })
})
