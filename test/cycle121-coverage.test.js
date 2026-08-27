import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('will-navigate block for main window (I-257)', () => {
  it('registers will-navigate on win.webContents', () => {
    expect(mainJs).toContain("win.webContents.on('will-navigate'")
  })

  it('blocks non-file:// URLs in will-navigate handler', () => {
    const block = mainJs.split("win.webContents.on('will-navigate'")[1]?.split('}')[0] || ''
    expect(block).toContain("file://")
    expect(block).toContain('preventDefault')
  })

  it('denies new window opens via setWindowOpenHandler', () => {
    expect(mainJs).toContain("win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))")
  })
})

describe('global web-contents-created handler (I-258)', () => {
  it('registers app.on web-contents-created', () => {
    expect(mainJs).toContain("app.on('web-contents-created'")
  })

  it('global handler blocks non-file:// navigation', () => {
    const block = mainJs.split("app.on('web-contents-created'")[1]?.split('}')[0] || ''
    expect(block).toContain("file://")
    expect(block).toContain('preventDefault')
  })

  it('global handler denies window opens', () => {
    const block = mainJs.split("app.on('web-contents-created'")[1]?.split('\n\n')[0] || ''
    expect(block).toContain("action: 'deny'")
  })
})

describe('claude-usage cache eviction on play (I-259)', () => {
  it('orchestra:play evicts claude-usage cache entry', () => {
    const block = mainJs.split("'orchestra:play'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("_metricsCache.delete('claude-usage:'")
  })
})

describe('claude-usage cache eviction on fine (I-260)', () => {
  it('orchestra:fine evicts claude-usage cache entry', () => {
    const block = mainJs.split("'orchestra:fine'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("_metricsCache.delete('claude-usage:'")
  })
})

describe('notes:read size guard (I-261)', () => {
  it('notes:read checks file stat before reading', () => {
    const block = mainJs.split("'notes:read'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('statSync')
    expect(block).toMatch(/(?:512_000|102_400)/)
  })

  it('notes:read returns empty string when file too large', () => {
    const block = mainJs.split("'notes:read'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("return ''")
  })
})

describe('aside and main landmark aria-labels (I-262)', () => {
  it('aside rack has aria-label', () => {
    expect(html).toMatch(/id="rack"[^>]*aria-label/)
  })

  it('aside rack aria-label is in Spanish', () => {
    expect(html).toMatch(/id="rack"[^>]*aria-label="[^"]*[Pp]anel[^"]*"/)
  })

  it('main stage has aria-label', () => {
    expect(html).toMatch(/id="stage"[^>]*aria-label/)
  })
})

describe('dropzone region accessibility (I-263)', () => {
  it('dropzone has role=region', () => {
    expect(html).toMatch(/id="dropzone"[^>]*role="region"/)
  })

  it('dropzone has aria-label', () => {
    expect(html).toMatch(/id="dropzone"[^>]*aria-label/)
  })

  it('dropzone aria-label is in Spanish', () => {
    expect(html).toMatch(/id="dropzone"[^>]*aria-label="[^"]*[Zz]ona[^"]*"/)
  })
})

describe('mixer:saved:save cap at 100 (I-264)', () => {
  it('rejects save when 100 mixes already stored', () => {
    const block = mainJs.split("'mixer:saved:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('mixes.length >= 100')
    expect(block).toContain('return false')
  })
})
