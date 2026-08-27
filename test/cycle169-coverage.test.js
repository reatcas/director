import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('parseLogLine summary double-escape fix (I-508)', () => {
  it('summary line calls addSummaryEntry without manual replace escaping', () => {
    expect(rendererJs).toContain('if (summary.trim()) addSummaryEntry(summary)')
    expect(rendererJs).not.toContain("addSummaryEntry(summary.replace(/</g, '&lt;')")
  })
})

describe('bpReadiness duplicate id fix (I-509)', () => {
  it('span now has id bpCompleteness, not bpReadiness', () => {
    expect(indexHtml).toContain('id="bpCompleteness"')
    expect(indexHtml).not.toContain('id="bpReadiness" class="section-badge')
  })

  it('bpReadiness div has aria-live polite', () => {
    expect(indexHtml).toContain('id="bpReadiness" class="mono" aria-live="polite"')
  })

  it('bpUpdateCompleteness updates both bpReadiness and bpCompleteness', () => {
    const block = rendererJs.split('function bpUpdateCompleteness')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain("$('#bpCompleteness')")
    expect(block).toContain("cBadge.textContent")
  })
})

describe('updateBurnRate negative delta guard (I-510)', () => {
  it('clamps delta to 0 when token estimate decreases', () => {
    const block = rendererJs.split('function updateBurnRate')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('Math.max(0, tokens - _prevBurnTokens)')
  })
})
