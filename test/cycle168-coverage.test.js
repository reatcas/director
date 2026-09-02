import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('blueprint:save m.description length cap (I-504)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('rejects m.description longer than 2000 chars', () => {
    expect(block).toContain('m.description.length > 2000')
  })
})

describe('blueprint:save m.notes validation (I-505)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('validates m.notes as string ≤2000 chars', () => {
    expect(block).toContain("m.notes !== undefined && (typeof m.notes !== 'string' || m.notes.length > 2000)")
  })
})

describe('orchestra:tail per-line truncation (I-506)', () => {
  const block = mainJs.split("'orchestra:tail'")[1]?.split('\nipcMain')[0] || ''

  it('truncates lines longer than 4096 chars', () => {
    expect(block).toContain('_ls.length > 4096 ? _ls.slice(0, 4096) : _ls')
  })
})

describe('mixerDrawer permanent panel (I-507)', () => {
  it('drawer is a complementary landmark, not a dialog', () => {
    expect(indexHtml).toContain('id="mixerDrawer"')
    expect(indexHtml).toContain('role="complementary"')
  })

  it('drawer has no aria-modal (it is always visible)', () => {
    const drawerBlock = indexHtml.split('id="mixerDrawer"')[1]?.split('</div>')[0] || ''
    expect(drawerBlock).not.toContain('aria-modal')
  })

  it('initMixerDrawer is a noop (panel is always visible)', () => {
    expect(rendererJs).toContain('initMixerDrawer')
    expect(rendererJs).not.toContain("drawer.setAttribute('aria-hidden'")
  })
})
