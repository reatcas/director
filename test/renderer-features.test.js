import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('F-09: Knowledge tab', () => {
  it('loads PENDING.md content', () => {
    expect(rendererJs).toContain('PENDING.md')
  })

  it('loads CYCLE_LEARNINGS.md content', () => {
    expect(rendererJs).toContain('CYCLE_LEARNINGS.md')
  })
})

describe('F-10: Commit category breakdown', () => {
  it('defines category color mapping', () => {
    expect(rendererJs).toContain('COMMIT_TYPE_COLORS')
  })

  it('renders stacked bar chart', () => {
    expect(rendererJs).toContain('commitBreakdown')
  })
})

describe('F-11: Compliance sparkline', () => {
  it('uses renderSparkline for compliance', () => {
    expect(rendererJs).toContain('renderSparkline')
    expect(rendererJs).toContain('complianceMetrics')
  })
})

describe('F-12: Blueprint readiness', () => {
  it('loads blueprint readiness data', () => {
    expect(rendererJs).toContain('blueprintReadiness')
  })
})

describe('F-13: Resource allocation inspector', () => {
  it('defines updateAllocInspector function', () => {
    expect(rendererJs).toContain('function updateAllocInspector')
  })

  it('shows nice, memory, and token values', () => {
    const block = rendererJs.split('function updateAllocInspector')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('allocation.nice')
    expect(block).toContain('allocation.memBudgetMB')
    expect(block).toContain('allocation.tokenBudget')
  })

  it('renders category budgets sorted by weight', () => {
    const block = rendererJs.split('function updateAllocInspector')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('categoryBudgets')
    expect(block).toContain('.sort(')
  })
})

describe('F-14: Lifecycle timeline', () => {
  it('loads lifecycle events', () => {
    expect(rendererJs).toContain('lifecycleList')
  })

  it('renders timeline events', () => {
    expect(rendererJs).toContain('le-history')
  })
})

describe('F-15: System process gauge', () => {
  it('calls systemProcs for process data', () => {
    expect(rendererJs).toContain('systemProcs')
  })

  it('displays CPU and memory metrics', () => {
    expect(rendererJs).toContain("p.cpu")
    expect(rendererJs).toContain("p.mem")
  })
})

describe('F-16: ROADMAP staleness indicator', () => {
  it('calls roadmapFreshness', () => {
    expect(rendererJs).toContain('roadmapFreshness')
  })
})

describe('F-19: Token burn rate sparkline', () => {
  it('defines updateBurnRate function', () => {
    expect(rendererJs).toContain('function updateBurnRate')
  })

  it('tracks burn history', () => {
    expect(rendererJs).toContain('_burnHistory')
  })
})

describe('F-20: Stall anomaly badge', () => {
  it('defines stall tracking', () => {
    expect(rendererJs).toContain('_stallTracker')
  })

  it('detects stalls over 20 minutes', () => {
    expect(rendererJs).toContain('stallMin')
  })
})

describe('F-21: Context compression panel', () => {
  it('defines updateCompressionPanel function', () => {
    expect(rendererJs).toContain('function updateCompressionPanel')
  })

  it('shows token savings and compression ratio', () => {
    const block = rendererJs.split('function updateCompressionPanel')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('totalTokensSaved')
    expect(block).toContain('cumulativeCompression')
  })
})
