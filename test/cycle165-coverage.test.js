import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('split divider keyboard accessibility (I-490)', () => {
  it('#splitDividerV has tabindex="0"', () => {
    const block = indexHtml.split('splitDividerV')[1]?.split('>')[0] || ''
    expect(block).toContain('tabindex="0"')
  })

  it('#splitDividerV has aria-valuenow, aria-valuemin, aria-valuemax', () => {
    const block = indexHtml.split('splitDividerV')[1]?.split('>')[0] || ''
    expect(block).toContain('aria-valuenow=')
    expect(block).toContain('aria-valuemin="15"')
    expect(block).toContain('aria-valuemax="80"')
  })

  it('initSplitDivider sets aria-valuenow via setAttribute', () => {
    const block = rendererJs.split('initSplitDivider')[1]?.split('})()')[ 0] || ''
    expect(block).toContain("setAttribute('aria-valuenow'")
  })

  it('initSplitDivider handles ArrowLeft and ArrowRight keys', () => {
    const block = rendererJs.split('initSplitDivider')[1]?.split('})()')[ 0] || ''
    expect(block).toContain("e.key === 'ArrowLeft'")
    expect(block).toContain("e.key === 'ArrowRight'")
  })
})

describe('rebalanceMixer rounding overshoot fix (I-491)', () => {
  const block = rendererJs.split('function rebalanceMixer')[1]?.split('\nfunction ')[0] || ''

  it('caps intermediate share to remaining - assigned (proportional branch)', () => {
    expect(block).toContain('Math.min(Math.round((o.cur / othersTotal) * remaining), remaining - assigned)')
  })

  it('caps intermediate share to remaining - assigned (equal branch)', () => {
    expect(block).toContain('Math.min(Math.round(remaining / others.length), remaining - assigned)')
  })
})
