import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('parseComplianceLine clamp actual/planned to [0, 9999] (S-55)', () => {
  it('clamps actual value with Math.min/Math.max', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(block).toContain('Math.min(Math.max(0, parseInt(pm[2], 10)), 9999)')
  })

  it('clamps planned value with Math.min/Math.max', () => {
    const block = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(block).toContain('Math.min(Math.max(0, parseInt(pm[3], 10)), 9999)')
  })
})

describe('aiState() validates state.selected from disk (S-56)', () => {
  const block = mainJs.split('function aiState()')[1]?.split('\nipcMain')[0] || ''

  it('checks state.selected is a known AI id', () => {
    expect(block).toContain("Object.keys(AI_DEFAULTS).includes(state.selected)")
  })

  it('resets invalid state.selected to null', () => {
    expect(block).toContain('state.selected = null')
  })
})

describe('metrics:claude-usage uses SLOW TTL (P-54)', () => {
  const block = mainJs.split("'metrics:claude-usage'")[1]?.split('\nipcMain')[0] || ''

  it('passes _SLOW_METRICS_TTL to metricsSet', () => {
    expect(block).toContain('_SLOW_METRICS_TTL')
  })
})

describe('lifecycle:add evicts lc: cache entries (I-591)', () => {
  const block = mainJs.split("'lifecycle:add'")[1]?.split('\nipcMain')[0] || ''

  it('deletes lc:dir prefixed keys from _metricsCache', () => {
    expect(block).toContain("k.startsWith('lc:' + dir + ':')")
    expect(block).toContain('_metricsCache.delete(k)')
  })
})

describe('metrics:session-summary clamps creditsRemaining (BL-09)', () => {
  const block = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''

  it('wraps creditsRemaining sum in Math.max(0, ...)', () => {
    expect(block).toContain('Math.max(0,')
    expect(block).toContain('creditsRemaining')
  })
})

describe('sessionSummary role="group" for screen readers (A-22)', () => {
  it('sets role=group on sessionSummary element', () => {
    expect(rendererJs).toContain("setAttribute('role', 'group')")
  })
})

describe('persistLifecycleEvent validates e.type/label/message in pruning (D-16)', () => {
  it('checks typeof e.type is string in pruning filter', () => {
    const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\n}')[0] || ''
    expect(block).toContain("typeof e.type === 'string'")
    expect(block).toContain("typeof e.label === 'string'")
    expect(block).toContain("typeof e.message === 'string'")
  })
})
