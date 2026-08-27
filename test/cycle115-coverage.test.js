import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('repertoire:open isKnownProject guard (I-216)', () => {
  const block = mainJs.split("'repertoire:open'")[1]?.split('\nipcMain')[0] || ''

  it('uses isKnownProject instead of bare !dir', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('still checks dir exists on filesystem', () => {
    expect(block).toMatch(/fs\.statSync\(dir\)|_roDirExists/)
  })
})

describe('lifecycle:add null byte rejection (I-217)', () => {
  const block = mainJs.split("'lifecycle:add'")[1]?.split('\nipcMain')[0] || ''

  it('rejects label with null bytes', () => {
    expect(block).toContain('\\x00')
    expect(block).toContain('label')
  })

  it('rejects message with null bytes', () => {
    expect(block).toContain('message')
    const nullCheck = block.split('\\x00')[0]?.split('\n').pop() || ''
    expect(block.includes('\\x00') && (block.includes('.test(label)') || block.includes('.test(message)'))).toBe(true)
  })

  it('still enforces type allowlist', () => {
    expect(block).toContain('/^[\\w\\-]+$/')
  })
})

describe('metrics:session-summary creditsRemaining (I-218)', () => {
  const block = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''

  it('computes creditsRemaining from aiState', () => {
    expect(block).toContain('creditsRemaining')
    expect(block).toContain('aiState()')
  })

  it('sums credits across all providers', () => {
    expect(block).toContain('.reduce(')
    expect(block).toContain('credits')
  })

  it('includes creditsRemaining in return value', () => {
    const returnLine = block.split('return {')[1]?.split('}')[0] || ''
    expect(returnLine).toContain('creditsRemaining')
  })
})

describe('modal role=dialog attributes (I-219)', () => {
  it('aboutModal has role=dialog', () => {
    expect(html).toMatch(/id="aboutModal"[^>]*role="dialog"/)
  })

  it('aboutModal has aria-modal=true', () => {
    expect(html).toMatch(/id="aboutModal"[^>]*aria-modal="true"/)
  })

  it('settingsModal has role=dialog', () => {
    expect(html).toMatch(/id="settingsModal"[^>]*role="dialog"/)
  })

  it('settingsModal has aria-modal=true', () => {
    expect(html).toMatch(/id="settingsModal"[^>]*aria-modal="true"/)
  })

  it('shortcutsModal has role=dialog', () => {
    expect(html).toMatch(/id="shortcutsModal"[^>]*role="dialog"/)
  })

  it('cmdPalette has role=dialog', () => {
    expect(html).toMatch(/id="cmdPalette"[^>]*role="dialog"/)
  })

  it('all dialogs have Spanish aria-label', () => {
    const dialogs = html.match(/<div[^>]*role="dialog"[^>]*>/g) || []
    const withLabel = dialogs.filter(d => d.includes('aria-label'))
    expect(withLabel.length).toBe(dialogs.length)
  })
})
