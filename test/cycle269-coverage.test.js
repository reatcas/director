// cycle269-coverage.test.js — C269 quality coverage
// T-216: BL-33+BL-34+BL-35 coordination-protocol for...of + rebalanceCount
// T-217: A-48+A-49+A-50 smartMixToggle/procsCount/lifecycleCount/atrilModal aria
// T-218: DD-03+DD-04 repertoire:remove cache cleanup

import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const coordJs   = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const indexHtml  = readFileSync(join(root, 'index.html'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')

// ─── T-216: BL-33 + BL-34 + BL-35 ───────────────────────────────────────────
describe('T-216: BL-33 getStatus() uses for...of into plain object', () => {
  it('uses _gsInstObj accumulation pattern', () => {
    expect(coordJs).toContain('const _gsInstObj = {}')
    expect(coordJs).toContain('for (const [d, i] of this.instances) _gsInstObj[d]')
  })

  it('no longer uses Array.from(this.instances).map', () => {
    expect(coordJs).not.toContain('Array.from(this.instances).map')
  })

  it('exposes rebalanceCount in getStatus return', () => {
    expect(coordJs).toContain('rebalanceCount:   this._rebalanceCount')
  })
})

describe('T-216: BL-34 _rebalance() uses for...of _prList', () => {
  it('builds _prList via for...of', () => {
    expect(coordJs).toContain('const _prList = []')
    expect(coordJs).toContain('for (const [d, i] of entries) _prList.push(')
  })

  it('no longer uses entries.map for priorities', () => {
    const rebalanceBody = coordJs.split('_rebalance()')[1]?.split('\n  }')[0] || ''
    expect(rebalanceBody).not.toContain('entries.map(')
  })
})

describe('T-216: BL-35 _rebalanceCount field', () => {
  it('initialises _rebalanceCount to 0 in constructor', () => {
    expect(coordJs).toContain('this._rebalanceCount = 0')
  })

  it('increments _rebalanceCount in _rebalance()', () => {
    expect(coordJs).toContain('this._rebalanceCount++')
  })
})

// ─── T-217: A-48 + A-49 + A-50 ───────────────────────────────────────────────
describe('T-217: A-48 #smartMixToggle role=switch + aria + keyboard', () => {
  it('has role=switch on #smartMixToggle', () => {
    expect(indexHtml).toContain('id="smartMixToggle"')
    const block = indexHtml.split('id="smartMixToggle"')[1]?.split('>')[0] || ''
    expect(block).toContain('role="switch"')
    expect(block).toContain('aria-checked="false"')
    expect(block).toContain('tabindex="0"')
  })

  it('updateSmartMixIndicator sets aria-checked', () => {
    expect(rendererJs).toContain("toggle.setAttribute('aria-checked', String(active))")
  })

  it('smartMixToggle has keydown handler for Space/Enter', () => {
    expect(rendererJs).toContain("$('#smartMixToggle').addEventListener('keydown'")
    const block = rendererJs.split("$('#smartMixToggle').addEventListener('keydown'")[1]?.split('\n  })')[0] || ''
    expect(block).toContain("e.key === ' '")
    expect(block).toContain("e.key === 'Enter'")
  })
})

describe('T-217: A-49 #procsCount + #lifecycleCount aria-live', () => {
  it('#procsCount has aria-live=polite and aria-label', () => {
    const block = indexHtml.split('id="procsCount"')[1]?.split('>')[0] || ''
    expect(block).toContain('aria-live="polite"')
    expect(block).toContain('aria-label=')
  })

  it('#lifecycleCount has aria-live=polite and aria-label', () => {
    const block = indexHtml.split('id="lifecycleCount"')[1]?.split('>')[0] || ''
    expect(block).toContain('aria-live="polite"')
    expect(block).toContain('aria-label=')
  })
})

describe('T-217: A-50 atrilModal saves/restores prior focus', () => {
  it('declares _atrilPrevFocus module-level variable', () => {
    expect(rendererJs).toContain('let _atrilPrevFocus = null')
  })

  it('openAtrilModal saves activeElement', () => {
    const block = rendererJs.split('function openAtrilModal()')[1]?.split('\n}')[0] || ''
    expect(block).toContain('_atrilPrevFocus = document.activeElement')
  })

  it('closeAtrilModal onclick restores focus', () => {
    expect(rendererJs).toContain("$('#closeAtrilModal').onclick = () => { $('#atrilModal').hidden = true; if (_atrilPrevFocus")
  })
})

// ─── T-218: DD-03 + DD-04 ────────────────────────────────────────────────────
describe('T-218: DD-03 repertoire:remove catches lc: and mixer-hist: cache keys', () => {
  it('cleanup includes startsWith lc: prefix check', () => {
    const block = mainJs.split("'repertoire:remove'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("key.startsWith('lc:' + dir + ':')")
  })

  it('cleanup includes startsWith mixer-hist: prefix check', () => {
    const block = mainJs.split("'repertoire:remove'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("key.startsWith('mixer-hist:' + dir + ':')")
  })

  it('still retains endsWith check for other cache keys', () => {
    const block = mainJs.split("'repertoire:remove'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("key.endsWith(':' + dir)")
  })
})

describe('T-218: DD-04 repertoire:remove evicts _gitCommitMtimes entry', () => {
  it('calls _gitCommitMtimes.delete(dir) on remove', () => {
    const block = mainJs.split("'repertoire:remove'")[1]?.split('\n})')[0] || ''
    expect(block).toContain('_gitCommitMtimes.delete(dir)')
  })
})
