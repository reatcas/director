import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('parseComplianceLine category key length cap (I-511)', () => {
  it('slices category key to 64 chars', () => {
    expect(mainJs).toContain("categories[pm[1].slice(0, 64)]")
  })
})

describe('export:session compliance array cap (I-512)', () => {
  const block = mainJs.split("'export:session'")[1]?.split('\n})')[0] || ''

  it('caps compliance lines at 50', () => {
    expect(block).toContain(".slice(-50)")
  })
})

describe('orchestra:writeConfig validator fixes (I-513)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it("accepts 'perpetual' as a valid mode", () => {
    expect(block).toContain("'perpetual'")
  })

  it('validates keepLogs as integer ≤500, not boolean', () => {
    expect(block).toContain('!Number.isInteger(cfg.keepLogs)')
    expect(block).not.toContain("typeof cfg.keepLogs !== 'boolean'")
  })

  it('allows maxIterations of 0 (unlimited)', () => {
    expect(block).toContain('cfg.maxIterations < 0')
    expect(block).not.toContain('cfg.maxIterations < 1')
  })
})

describe('showToast aria role (I-514)', () => {
  const block = rendererJs.split('function showToast')[1]?.split('\n}')[0] || ''

  it('toast element has role=status and aria-live=polite', () => {
    expect(block).toContain("'role', 'status'")
    expect(block).toContain("'aria-live', 'polite'")
  })
})
