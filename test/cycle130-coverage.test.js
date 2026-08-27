import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('mixer:saved:list size guard (I-327)', () => {
  const block = mainJs.split("'mixer:saved:list'")[1]?.split('\nipcMain')[0] || ''

  it('guards saved-mixes.json at 512KB before listing', () => {
    expect(block).toContain('512_000')
    expect(block).toContain('let userMixes = []')
  })

  it('uses statSync pattern', () => {
    expect(block).toContain('fs.statSync(p).size <= 512_000')
  })
})

describe('mixer:saved:save focus validation (I-328)', () => {
  const block = mainJs.split("'mixer:saved:save'")[1]?.split('\nipcMain')[0] || ''

  it('rejects focus values outside 0-100', () => {
    expect(block).toContain('v < 0 || v > 100')
  })

  it('validates focus value types', () => {
    expect(block).toContain("typeof v !== 'number'")
  })

  it('guards saved-mixes.json at 512KB before saving', () => {
    expect(block).toContain('512_000')
    expect(block).toContain('let mixes = []')
  })
})

describe('mixer:saved:delete size guard (I-329)', () => {
  const block = mainJs.split("'mixer:saved:delete'")[1]?.split('\nipcMain')[0] || ''

  it('guards saved-mixes.json at 512KB before deleting', () => {
    expect(block).toContain('512_000')
    expect(block).toContain('let mixes = []')
  })
})

describe('settings inputs aria-labels (I-330)', () => {
  it('stgCompactAt has aria-label', () => {
    expect(html).toMatch(/id="stgCompactAt"[^>]*aria-label/)
  })

  it('stgMaxHallStreak has aria-label', () => {
    expect(html).toMatch(/id="stgMaxHallStreak"[^>]*aria-label/)
  })

  it('stgRunMode has aria-label', () => {
    expect(html).toMatch(/id="stgRunMode"[^>]*aria-label/)
  })

  it('stgMaxIter has aria-label', () => {
    expect(html).toMatch(/id="stgMaxIter"[^>]*aria-label/)
  })

  it('stgDefaultAi has aria-label', () => {
    expect(html).toMatch(/id="stgDefaultAi"[^>]*aria-label/)
  })

  it('stgAutoSwitch has aria-label', () => {
    expect(html).toMatch(/id="stgAutoSwitch"[^>]*aria-label/)
  })

  it('stgKeepLogs has aria-label', () => {
    expect(html).toMatch(/id="stgKeepLogs"[^>]*aria-label/)
  })

  it('stgAutoScroll has aria-label', () => {
    expect(html).toMatch(/id="stgAutoScroll"[^>]*aria-label/)
  })

  it('stgAlertStall has aria-label', () => {
    expect(html).toMatch(/id="stgAlertStall"[^>]*aria-label/)
  })

  it('stgAlertAlto has aria-label', () => {
    expect(html).toMatch(/id="stgAlertAlto"[^>]*aria-label/)
  })

  it('stgAlertUsage has aria-label', () => {
    expect(html).toMatch(/id="stgAlertUsage"[^>]*aria-label/)
  })
})

describe('atril modal + allocToggle aria-labels (I-331)', () => {
  it('atrilName has Spanish aria-label', () => {
    expect(html).toMatch(/id="atrilName"[^>]*aria-label="[^"]*stand[^"]*"/)
  })

  it('atrilDesc has Spanish aria-label', () => {
    expect(html).toMatch(/id="atrilDesc"[^>]*aria-label="[^"]*stand[^"]*"/)
  })

  it('atrilSaveBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="atrilSaveBtn"[^>]*aria-label="[^"]*Guardar[^"]*"/)
  })

  it('allocToggle has Spanish aria-label', () => {
    expect(html).toMatch(/id="allocToggle"[^>]*aria-label="[^"]*Alternar[^"]*"/)
  })
})
