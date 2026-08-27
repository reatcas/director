import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('repertoire:remove write size cap (I-460)', () => {
  const block = mainJs.split("'repertoire:remove'")[1]?.split('\nipcMain')[0] || ''

  it('serializes filtered projects via _rrSer before writing', () => {
    expect(block).toContain('_rrSer')
    expect(block).toContain('JSON.stringify')
  })

  it('only writes if filtered list fits within 512KB', () => {
    expect(block).toContain('_rrSer.length <= 512_000')
  })
})

describe('orchestra:clearLog ctx-metrics trim write cap (I-461)', () => {
  const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''

  it('serializes trimmed history via _ctxTrimSer', () => {
    expect(block).toContain('_ctxTrimSer')
    expect(block).toContain('hist.slice(-500)')
  })

  it('only writes trimmed history if within 1MB', () => {
    expect(block).toContain('_ctxTrimSer.length <= 1_048_576')
  })
})

describe('mixer:read focus sanitization (I-462)', () => {
  const block = mainJs.split("'mixer:read'")[1]?.split('\nipcMain')[0] || ''

  it('filters focus keys via _VALID_CATS', () => {
    expect(block).toContain('_VALID_CATS.has(k)')
    expect(block).toContain('_mrFocus')
  })

  it('guards focus values with Number.isFinite', () => {
    expect(block).toContain('Number.isFinite(cfg.focus[k])')
  })
})

describe('cmdPalette Tab focus trap (I-463)', () => {
  const block = rendererJs.split("$('#cmdInput').addEventListener('keydown'")[1]?.split('\n})\n')[0] || ''

  it('handles Tab key in cmdInput keydown', () => {
    expect(block).toContain("e.key === 'Tab'")
  })

  it('cycles active item forward and backward with Shift+Tab', () => {
    expect(block).toContain('e.shiftKey')
    expect(block).toContain('_cpItems')
  })
})
