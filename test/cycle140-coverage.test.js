import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('NaN bypass fix in focus validation (I-388)', () => {
  it('mixer:write rejects NaN via Number.isFinite check', () => {
    const block = mainJs.split("'mixer:write'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('Number.isFinite')
  })

  it('mixer:saved:save rejects NaN via Number.isFinite check', () => {
    const block = mainJs.split("'mixer:saved:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('Number.isFinite')
  })
})

describe('orchestra:writeConfig nice + claudeUsageBudget validation (I-389)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('validates nice as integer in [-20, 19]', () => {
    expect(block).toContain('cfg.nice')
    expect(block).toContain('Number.isInteger')
    expect(block).toContain('-20')
    expect(block).toContain('19')
  })

  it('validates claudeUsageBudget as finite non-negative number', () => {
    expect(block).toContain('cfg.claudeUsageBudget')
    expect(block).toContain('Number.isFinite')
    expect(block).toContain('>= 0')
  })
})

describe('orchestra:readIterLog NUL byte check (I-390)', () => {
  const block = mainJs.split("'orchestra:readIterLog'")[1]?.split('\nipcMain')[0] || ''

  it('rejects logPath containing control chars', () => {
    expect(block).toContain('logPath')
    expect(block).toContain("return ''")
  })
})

describe('cmdResults listbox option semantics (I-391)', () => {
  it('cmd-item divs get role=option', () => {
    expect(rendererJs).toContain('role="option"')
  })

  it('cmd-item divs get aria-selected', () => {
    expect(rendererJs).toContain('aria-selected=')
  })
})
