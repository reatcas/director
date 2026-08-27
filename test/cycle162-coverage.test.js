import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('metrics:session-summary totalTokens guard (I-480)', () => {
  const block = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''

  it('uses Number.isFinite guard on totalTokensProcessed', () => {
    expect(block).toContain('Number.isFinite(ctx.aggregated.totalTokensProcessed)')
  })

  it('does not use unguarded || 0 on totalTokensProcessed', () => {
    expect(block).not.toContain('totalTokensProcessed || 0')
  })
})

describe('addUsageEntry message escaped (I-479)', () => {
  const block = rendererJs.split('function addUsageEntry')[1]?.split('\nfunction ')[0] || ''

  it('escapes message via esc() before HTML insertion', () => {
    expect(block).toContain('esc(message)')
  })

  it('escapes message in the le-msg span', () => {
    expect(block).toContain('esc(message)')
    expect(block).toContain('le-retry')
  })
})

describe('#bpPhases accessibility (I-481)', () => {
  it('has role=list and aria-label on #bpPhases', () => {
    const block = indexHtml.split('id="bpPhases"')[1]?.split('>')[0] || ''
    expect(block).toContain('role="list"')
    expect(block).toContain('aria-label=')
  })

  it('renders phase pills with role=listitem and tabindex', () => {
    const block = rendererJs.split('function renderBpPhases')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain("'role', 'listitem'")
    expect(block).toContain('tabindex')
  })

  it('phase pills handle Enter/Space key for activation', () => {
    const block = rendererJs.split('function renderBpPhases')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain("e.key === 'Enter'")
    expect(block).toContain('pill.onkeydown')
  })
})
