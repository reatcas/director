import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('metrics:context non-negative token accumulation (S-51)', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split("'metrics:coordination'")[0] || ''

  it('guards totalTokens >= 0 in accumulation', () => {
    expect(block).toContain('m.totalTokens >= 0')
  })

  it('guards totalTokensSaved >= 0 in accumulation', () => {
    expect(block).toContain('m.totalTokensSaved >= 0')
  })
})

describe('metrics:context consistent _mcHist usage (S-52)', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split("'metrics:coordination'")[0] || ''

  it('uses _mcHist for last entry (not raw hist)', () => {
    expect(block).toContain('_mcHist[_mcHist.length - 1]')
  })

  it('uses _mcHist for accumulation loop', () => {
    expect(block).toContain('for (const m of _mcHist)')
  })

  it('uses _mcHist.length for cycles and avgSaved', () => {
    expect(block).toMatch(/cycles.*_mcHist\.length|_mcHist\.length.*cycles/)
  })
})

describe('orchestra:kill invalidates resource cache (P-50)', () => {
  const block = mainJs.split("'orchestra:kill'")[1]?.split("'orchestra:hotReload'")[0] || ''

  it('deletes resource cache for dir on kill', () => {
    expect(block).toContain("_metricsCache.delete('resource:' + dir)")
  })
})

describe('refresh() calls loadSessionSummary (FE-05)', () => {
  const block = rendererJs.split('async function refresh()')[1]?.split('\nasync function')[0] || ''

  it('calls loadSessionSummary in refresh', () => {
    expect(block).toContain('loadSessionSummary()')
  })
})

describe('lifecycleCount aria-label with context (A-20)', () => {
  it('sets aria-label on countEl with event count context', () => {
    expect(rendererJs).toContain('eventos en ciclo de vida')
  })

  it('updates aria-label when count is 0', () => {
    const zeroBlock = rendererJs.split("countEl.textContent = '0'")[1]?.split('\n')[0] || ''
    expect(zeroBlock).toContain('aria-label')
  })

  it('updates aria-label with dynamic count', () => {
    expect(rendererJs).toContain('`${_unfTotal} eventos en ciclo de vida`')
  })
})
