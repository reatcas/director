import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('shortcutsModal focus trap (I-410)', () => {
  it('adds keydown listener for Tab trapping on shortcutsModal', () => {
    expect(rendererJs).toContain("'#shortcutsModal'")
    expect(rendererJs).toContain("addEventListener('keydown'")
  })

  it('handles Tab key to cycle focus within modal', () => {
    const block = rendererJs.split("shortcutsModal').addEventListener('keydown'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("'Tab'")
    expect(block).toContain('focusable')
    expect(block).toContain('focus()')
  })

  it('closes modal on Escape key', () => {
    const block = rendererJs.split("shortcutsModal').addEventListener('keydown'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("'Escape'")
    expect(block).toContain('modal.hidden = true')
  })
})

describe('_alertCooldown size cap (I-411)', () => {
  const block = mainJs.split('function sendAlert')[1]?.split('\n}')[0] || ''

  it('caps _alertCooldown at 100 entries', () => {
    expect(block).toContain('_alertCooldown.size >= 100')
  })

  it('evicts oldest entry before inserting new', () => {
    expect(block).toContain('_alertCooldown.keys().next().value')
    expect(block).toContain('_alertCooldown.delete(oldest)')
  })
})

describe('blueprint:save answers object/array rejection (I-412)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('uses _bsAnswerVals for answers validation', () => {
    expect(block).toContain('_bsAnswerVals')
    expect(block).toContain('Object.values(data.answers)')
  })

  it('rejects answers containing objects or arrays', () => {
    expect(block).toMatch(/typeof v [!=]== ['"]object['"]|typeof v !== ['"]string['"]/)
    expect(block).toContain('v !== null')
  })
})
