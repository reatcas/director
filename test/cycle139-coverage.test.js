import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('aiState() ai-credits.json size guard (I-380)', () => {
  const block = mainJs.split('function aiState()')[1]?.split('\nfunction ')[0] || ''

  it('uses _asPath variable with statSync guard', () => {
    expect(block).toContain('_asPath')
    expect(block).toContain('512_000')
  })

  it('defaults state to empty object on guard fail', () => {
    expect(block).toContain('let state = {}')
  })
})

describe('atriles:save full control char range (I-381)', () => {
  const block = mainJs.split("'atriles:save'")[1]?.split('\nipcMain')[0] || ''

  it('rejects full control char range in name', () => {
    expect(block).toContain('\\x00-\\x08')
    expect(block).toContain('\\x7F')
    expect(block).toContain('a.name')
  })

  it('rejects full control char range in path', () => {
    expect(block).toContain('a.path')
  })
})

describe('copyDir settings.json size guard (I-382)', () => {
  const block = mainJs.split('function copyDir')[1]?.split('\nfunction ')[0] || ''

  it('guards settings.json reads with statSync', () => {
    expect(block).toContain('statSync')
    expect(block).toContain('512_000')
    expect(block).toContain("'settings.json'")
  })
})

describe('inspector panels role=region (I-383)', () => {
  it('allocInspector has role=region and aria-label', () => {
    expect(html).toMatch(/id="allocInspector"[^>]*role="region"/)
    expect(html).toMatch(/id="allocInspector"[^>]*aria-label/)
  })

  it('compressionPanel has role=region and aria-label', () => {
    expect(html).toMatch(/id="compressionPanel"[^>]*role="region"/)
    expect(html).toMatch(/id="compressionPanel"[^>]*aria-label/)
  })

  it('mixerHistoryPanel has role=region and aria-label', () => {
    expect(html).toMatch(/id="mixerHistoryPanel"[^>]*role="region"/)
    expect(html).toMatch(/id="mixerHistoryPanel"[^>]*aria-label/)
  })
})
