import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('updateTransportButtons aria-disabled sync (I-432)', () => {
  const block = rendererJs.split('function updateTransportButtons')[1]?.split('\n// ─')[0] || ''

  it('sets aria-disabled true on disabled buttons', () => {
    expect(block).toContain("setAttribute('aria-disabled', 'true')")
  })

  it('sets aria-disabled false on enabled buttons', () => {
    expect(block).toContain("setAttribute('aria-disabled', 'false')")
  })
})

describe('tab click handler uses switchTab (I-433)', () => {
  it('mixer-tab click listener delegates to switchTab', () => {
    expect(rendererJs).toContain("t.addEventListener('click', () => switchTab(t.dataset.mtab))")
  })
})

describe('refresh project list aria-current (I-434)', () => {
  const block = rendererJs.split('async function refresh')[1]?.split('\n// ─')[0] || ''

  it('sets aria-current true on selected project listitem', () => {
    expect(block).toContain("setAttribute('aria-current', 'true')")
    expect(block).toContain('current === p.path')
  })
})

describe('persistLifecycleEvent type cap and write size cap (I-435+I-438)', () => {
  const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\nfunction ')[0] || ''

  it('caps type via _evType with validation', () => {
    expect(block).toContain('_evType')
    expect(block).toMatch(/type\.slice\(0, 64\)|_LC_TYPES\.has\(type\)/)
  })

  it('guards lifecycle write via _lcSer at 2MB', () => {
    expect(block).toContain('_lcSer')
    expect(block).toContain('2_097_152')
    expect(block).toContain('_lcSer.length <= 2_097_152')
  })
})

describe('snapshotMixer event cap and write size cap (I-436+I-437)', () => {
  const block = mainJs.split('function snapshotMixer')[1]?.split('\nipcMain')[0] || ''

  it('caps event via _ssEvent at 64 chars', () => {
    expect(block).toContain('_ssEvent')
    expect(block).toMatch(/event\.replace|event\.slice/)
    expect(block).toContain('.slice(0, 64)')
  })

  it('guards mixer-history write via _mhSer at 512KB', () => {
    expect(block).toContain('_mhSer')
    expect(block).toContain('512_000')
    expect(block).toContain('_mhSer.length <= 512_000')
  })
})

describe('startup lifecycle pruning write size cap (I-439)', () => {
  it('uses _prSer size cap before writing pruned events', () => {
    expect(mainJs).toContain('_prSer')
    expect(mainJs).toContain('_prSer.length <= 2_097_152')
  })
})
