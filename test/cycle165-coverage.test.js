import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('3-column layout structure (I-490)', () => {
  it('#leftColumn exists in HTML', () => {
    expect(indexHtml).toContain('id="leftColumn"')
  })

  it('#nodeGraphSection is inside leftColumn', () => {
    const leftIdx = indexHtml.indexOf('id="leftColumn"')
    const ngIdx   = indexHtml.indexOf('id="nodeGraphSection"')
    expect(ngIdx).toBeGreaterThan(leftIdx)
  })

  it('#mixerDrawer is a permanent right column (role=complementary)', () => {
    expect(indexHtml).toContain('id="mixerDrawer"')
    expect(indexHtml).toContain('role="complementary"')
  })

  it('#consoleSection is referenced in renderer updateStageView', () => {
    expect(rendererJs).toContain("$('#consoleSection')")
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
