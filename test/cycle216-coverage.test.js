import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

describe('metrics:compliance caches null when file missing (P-56)', () => {
  const block = mainJs.split("'metrics:compliance'")[1]?.split('\nipcMain')[0] || ''

  it('catches statSync error and returns cached null', () => {
    expect(block).toContain('return metricsSet(\'compliance:\' + dir, null, _SLOW_METRICS_TTL)')
  })

  it('uses let st = null before try block', () => {
    expect(block).toContain('let st = null')
  })
})

describe('metrics:roadmap-freshness caches {exists:false} when missing (P-57)', () => {
  const block = mainJs.split("'metrics:roadmap-freshness'")[1]?.split('\nipcMain')[0] || ''

  it('caches the missing result instead of bare return', () => {
    expect(block).toContain("metricsSet('freshness:' + dir, { exists: false }, _SLOW_METRICS_TTL)")
  })
})

describe('snapshotMixer evicts mixer-hist cache after write (P-58)', () => {
  const block = mainJs.split('function snapshotMixer')[1]?.split('\n}')[0] || ''

  it('deletes mixer-hist keys from _metricsCache after write', () => {
    expect(block).toContain("k.startsWith('mixer-hist:' + dir + ':')")
    expect(block).toContain('_metricsCache.delete(k)')
  })
})

describe('snapshotMixer skips write on empty focus (D-18)', () => {
  const block = mainJs.split('function snapshotMixer')[1]?.split('\n}')[0] || ''

  it('returns early when filtered focus is empty', () => {
    expect(block).toContain("Object.keys(_ssFocus).length === 0")
  })
})

describe('orchestra:clearLog evicts lc: cache (I-593)', () => {
  const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''

  it('deletes lc:dir prefixed keys after clearing log', () => {
    expect(block).toContain("k.startsWith('lc:' + dir + ':')")
    expect(block).toContain('_metricsCache.delete(k)')
  })
})

describe('aiState() validates resetAt ISO format (BL-11)', () => {
  const block = mainJs.split('function aiState()')[1]?.split('\nipcMain')[0] || ''

  it('checks resetAt matches ISO date pattern before reset', () => {
    expect(block).toContain("/^\\d{4}-\\d{2}-\\d{2}T/.test(state[id].resetAt)")
  })
})

describe('sessionSummary ss-warn class for low compliance and zero credits (FE-10, A-24)', () => {
  it('defines credWarn class when creditsRemaining is 0', () => {
    expect(rendererJs).toContain('credWarn')
    expect(rendererJs).toContain('creditsRemaining === 0')
  })

  it('defines compWarn class when compliance score < 50', () => {
    expect(rendererJs).toContain('compWarn')
    expect(rendererJs).toContain('compScore < 50')
  })

  it('ss-warn CSS class is defined', () => {
    expect(css).toContain('.ss-warn')
  })
})
