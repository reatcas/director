import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('mixer:saved:export alphanumeric ID guard (I-440)', () => {
  const block = mainJs.split("'mixer:saved:export'")[1]?.split('\nipcMain')[0] || ''

  it('validates id with alphanumeric regex', () => {
    expect(block).toContain('/^[0-9a-z]+$/.test(id)')
    expect(block).toContain('return null')
  })
})

describe('mixer:saved:save write size cap (I-441)', () => {
  const block = mainJs.split("'mixer:saved:save'")[1]?.split('\nipcMain')[0] || ''

  it('serializes mixes via _msSer before write', () => {
    expect(block).toContain('_msSer')
    expect(block).toContain('JSON.stringify(mixes)')
  })

  it('rejects mixes exceeding 512KB', () => {
    expect(block).toContain('_msSer.length > 512_000')
  })
})

describe('mixer:history integer limit check (I-442)', () => {
  const block = mainJs.split("'mixer:history'")[1]?.split('\nipcMain')[0] || ''

  it('uses Number.isInteger for limit validation', () => {
    expect(block).toContain('Number.isInteger(limit)')
  })
})

describe('switchTab aria-hidden on tabpanels (I-443)', () => {
  const block = rendererJs.split('function switchTab')[1]?.split('\n}')[0] || ''

  it('sets aria-hidden true on inactive tabpanels', () => {
    expect(block).toContain("setAttribute('aria-hidden', 'true')")
  })

  it('sets aria-hidden false on active tabpanel', () => {
    expect(block).toContain("setAttribute('aria-hidden', 'false')")
  })
})
