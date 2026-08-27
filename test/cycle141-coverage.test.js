import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('metrics:roadmap-freshness statSync race fix (I-392)', () => {
  const block = mainJs.split("'metrics:roadmap-freshness'")[1]?.split('\nipcMain')[0] || ''

  it('wraps statSync in try/catch', () => {
    expect(block).toContain('try { mtime = fs.statSync')
    expect(block).toContain('} catch {')
  })

  it('returns exists:false on statSync error (single statSync replaces existsSync+statSync)', () => {
    const catchBlock = block.split('} catch {')[1]?.split('\n')[0] || ''
    expect(catchBlock).toContain('exists: false')
  })
})

describe('switchTab aria-selected sync (I-393)', () => {
  const block = rendererJs.split('function switchTab')[1]?.split('\nfunction ')[0] || ''

  it('sets aria-selected=false on all tabs when switching', () => {
    expect(block).toContain("setAttribute('aria-selected', 'false')")
  })

  it('sets aria-selected=true on active tab', () => {
    expect(block).toContain("setAttribute('aria-selected', 'true')")
  })
})

describe('notesArea aria-label (I-393)', () => {
  it('notesArea textarea has aria-label', () => {
    expect(html).toMatch(/id="notesArea"[^>]*aria-label/)
  })
})

describe('mixer:saved:save whitespace-only name rejection (I-394)', () => {
  const block = mainJs.split("'mixer:saved:save'")[1]?.split('\nipcMain')[0] || ''

  it('rejects names that trim to empty string', () => {
    expect(block).toContain('name.trim().length === 0')
  })

  it('still enforces length bounds', () => {
    expect(block).toContain('name.length === 0')
    expect(block).toContain('name.length > 256')
  })
})
