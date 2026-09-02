// cycle272-coverage.test.js — C272 quality coverage
// T-225: BL-36 detectConflicts _dcEntries for-of; BL-37 _rebalance _rbEntries for-of; BL-38 getStatus _locksObj for-of
// T-226: A-51 rawLogContent tabindex+aria-label; A-52 mixerSaved role+aria-live; A-53 saveMixer _msSaved announcement
// T-227: DD-05 analyze _anFiles for-of; DD-06 _sortedJson for-of _sjArr

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const coordJs    = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')
const indexHtml  = readFileSync(join(root, 'index.html'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')

// ─── T-225: BL-36 + BL-37 + BL-38 ───────────────────────────────────────────
describe('T-225: BL-36 detectConflicts uses for...of _dcEntries', () => {
  it('builds _dcEntries with for...of instead of Array.from in detectConflicts', () => {
    const block = coordJs.split('  detectConflicts() {')[1]?.split('  _rebalance()')[0] || ''
    expect(block).toContain('_dcEntries')
    expect(block).toContain('for (const [d, i] of this.instances) _dcEntries.push')
  })

  it('does not use Array.from in detectConflicts', () => {
    const block = coordJs.split('  detectConflicts() {')[1]?.split('  _rebalance()')[0] || ''
    expect(block).not.toContain('Array.from(this.instances')
  })
})

describe('T-225: BL-37 _rebalance uses for...of _rbEntries', () => {
  it('builds _rbEntries with for...of instead of Array.from in _rebalance', () => {
    const block = coordJs.split('  _rebalance() {')[1]?.split('  invalidateConflictCache')[0] || ''
    expect(block).toContain('_rbEntries')
    expect(block).toContain('for (const [d, i] of this.instances) _rbEntries.push')
  })

  it('does not use Array.from in _rebalance', () => {
    const block = coordJs.split('  _rebalance() {')[1]?.split('  invalidateConflictCache')[0] || ''
    expect(block).not.toContain('Array.from(this.instances')
  })
})

describe('T-225: BL-38 getStatus builds _locksObj with for...of', () => {
  it('uses for...of _locksObj instead of Object.fromEntries(this.locks)', () => {
    const block = coordJs.split('getStatus()')[1]?.split('getInstanceCount')[0] || ''
    expect(block).toContain('_locksObj')
    expect(block).toContain('for (const [r, l] of this.locks) _locksObj[r] = l')
  })

  it('does not use Object.fromEntries(this.locks) directly', () => {
    const block = coordJs.split('getStatus()')[1]?.split('getInstanceCount')[0] || ''
    expect(block).not.toContain('Object.fromEntries(this.locks)')
  })
})

// ─── T-226: A-51 + A-52 + A-53 ───────────────────────────────────────────────
describe('T-226: A-51 rawLogContent has tabindex and aria-label', () => {
  it('rawLogContent pre has tabindex="0"', () => {
    expect(indexHtml).toContain('id="rawLogContent"')
    const block = indexHtml.split('id="rawLogContent"')[0]?.split('<pre').slice(-1)[0] || ''
    const full = '<pre' + block + (indexHtml.split('id="rawLogContent"')[1]?.split('>')[0] || '')
    expect(indexHtml).toContain('id="rawLogContent" tabindex="0"')
  })

  it('rawLogContent pre has aria-label', () => {
    expect(indexHtml).toContain('id="rawLogContent" tabindex="0" aria-label=')
  })
})

describe('T-226: A-52 mixerSaved has role=status and aria-live=polite', () => {
  it('mixerSaved span has role="status"', () => {
    const block = indexHtml.split('id="mixerSaved"')[0]?.split('<span').slice(-1)[0] || ''
    expect(indexHtml).toContain('role="status"')
    const mixerSavedLine = indexHtml.split('\n').find(l => l.includes('id="mixerSaved"')) || ''
    expect(mixerSavedLine).toContain('role="status"')
    expect(mixerSavedLine).toContain('aria-live="polite"')
  })
})

describe('T-226: A-53 saveMixer onclick activates mixerSaved live region', () => {
  it('sets textContent to ✓ Mezcla guardada on save', () => {
    expect(rendererJs).toContain('_msSaved.textContent = \'✓ Mezcla guardada\'')
  })

  it('removes hidden attribute to show live region', () => {
    expect(rendererJs).toContain('_msSaved.removeAttribute(\'hidden\')')
  })

  it('restores hidden after timeout', () => {
    expect(rendererJs).toContain('_msSaved.setAttribute(\'hidden\', \'\')')
  })
})

// ─── T-227: DD-05 + DD-06 ────────────────────────────────────────────────────
describe('T-227: DD-05 analyze _anFiles prune uses for...of', () => {
  it('uses for...of instead of _anFiles.slice(...).forEach', () => {
    expect(mainJs).toContain('for (const f of _anFiles.slice(')
    expect(mainJs).not.toContain('_anFiles.slice(0, _anFiles.length - 10).forEach')
  })
})

describe('T-227: DD-06 _sortedJson uses for...of _sjArr accumulation', () => {
  it('builds _sjArr with for...of instead of .map(k => [k, o[k]])', () => {
    expect(mainJs).toContain('_sjArr')
    expect(mainJs).toContain('for (const k of Object.keys(o).sort()) _sjArr.push')
  })

  it('does not use .map(k => [k, o[k]]) in _sortedJson', () => {
    const block = mainJs.split('_sortedJson')[1]?.split('\n')[0] || ''
    expect(block).not.toContain('.map(k => [k, o[k]])')
  })
})
