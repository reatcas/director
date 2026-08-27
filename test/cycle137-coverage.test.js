import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('mixer:write focus key whitelist (I-364)', () => {
  const block = mainJs.split("'mixer:write'")[1]?.split('\nipcMain')[0] || ''

  it('defines _VALID_CATS set', () => {
    expect(mainJs).toContain('_VALID_CATS')
    expect(mainJs).toContain("'product'")
    expect(mainJs).toContain("'ux_accessibility'")
  })

  it('rejects unknown focus keys', () => {
    expect(block).toContain('_VALID_CATS.has(k)')
  })
})

describe('mixer:saved:save focus key whitelist + name control char (I-365)', () => {
  const block = mainJs.split("'mixer:saved:save'")[1]?.split('\nipcMain')[0] || ''

  it('rejects unknown focus keys', () => {
    expect(block).toContain('_VALID_CATS.has(k)')
  })

  it('rejects control chars in name', () => {
    expect(block).toContain('\\x00-\\x08')
    expect(block).toContain('\\x7F')
  })
})

describe('orchestra:writeConfig agent+model validation (I-366)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('validates agent against AI_DEFAULTS', () => {
    expect(block).toContain('AI_DEFAULTS')
    expect(block).toContain("cfg.agent !== undefined")
  })

  it('validates model is string with max length', () => {
    expect(block).toContain("cfg.model !== undefined")
    expect(block).toContain('256')
  })

  it('validates focus keys against _VALID_CATS', () => {
    expect(block).toContain('_VALID_CATS.has(k)')
  })
})

describe('lifecycle:add full control char check (I-367)', () => {
  const block = mainJs.split("'lifecycle:add'")[1]?.split('\nipcMain')[0] || ''

  it('rejects full control char range in label and message', () => {
    expect(block).toContain('\\x00-\\x08')
    expect(block).toContain('\\x0E-\\x1F')
    expect(block).toContain('\\x7F')
  })
})

describe('auto-switch cfgPath size guard (I-368)', () => {
  it('guards cfgPath with statSync before readJSON in auto-switch', () => {
    const block = mainJs.split('nextAvailableAi')[1] || ''
    expect(block).toContain('cfgPath')
    expect(block).toContain('512_000')
  })
})

describe('compressionToggle + mixerHistoryToggle aria-expanded (I-369)', () => {
  it('compressionToggle has aria-expanded', () => {
    expect(html).toMatch(/id="compressionToggle"[^>]*aria-expanded="false"/)
  })

  it('mixerHistoryToggle has aria-expanded', () => {
    expect(html).toMatch(/id="mixerHistoryToggle"[^>]*aria-expanded="false"/)
  })
})

describe('shortcutsModal accessibility improvements (I-370)', () => {
  it('shortcutsModal has aria-labelledby', () => {
    expect(html).toMatch(/id="shortcutsModal"[^>]*aria-labelledby="shortcutsTitle"/)
  })

  it('shortcutsTitle id exists on heading', () => {
    expect(html).toContain('id="shortcutsTitle"')
  })

  it('shortcuts list has role and aria-label', () => {
    expect(html).toContain('aria-label="Lista de atajos de teclado"')
  })
})
