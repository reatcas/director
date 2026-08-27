import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('repertoire:readFile blocked file extensions + names (S-35)', () => {
  const block = mainJs.split('const _BLOCKED_FILE_EXT')[1]?.split('\nipcMain')[0] || ''

  it('blocks .db extension', () => {
    expect(block).toContain("'.db'")
  })

  it('blocks .sqlite extension', () => {
    expect(block).toContain("'.sqlite'")
  })

  it('blocks .sqlite3 extension', () => {
    expect(block).toContain("'.sqlite3'")
  })

  it('blocks .db3 extension', () => {
    expect(block).toContain("'.db3'")
  })

  it('blocks .npmrc filename', () => {
    expect(block).toContain("'.npmrc'")
  })

  it('blocks .yarnrc filename', () => {
    expect(block).toContain("'.yarnrc'")
  })

  it('blocks .netrc filename', () => {
    expect(block).toContain("'.netrc'")
  })
})

describe('lifecycle:list typeFilter length cap (S-36)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split("'lifecycle:add'")[0] || ''

  it('caps typeFilter length at 64 chars', () => {
    expect(block).toContain('typeFilter.length <= 64')
  })

  it('still validates typeFilter with regex', () => {
    expect(block).toContain('/^[\\w\\-]+$/')
    expect(block).toContain('_llType')
  })
})

describe('_piStaticCache invalidation on install and play (I-579)', () => {
  it('deletes _piStaticCache on orchestra:install', () => {
    const block = mainJs.split("'orchestra:install'")[1]?.split("ipcMain.handle('ai:credits'")[0] || ''
    expect(block).toContain('_piStaticCache.delete(dir)')
  })

  it('deletes _piStaticCache on orchestra:play', () => {
    const block = mainJs.split("'orchestra:play'")[1]?.split("'orchestra:fine'")[0] || ''
    expect(block).toContain('_piStaticCache.delete(dir)')
  })
})

describe('shortcutsModal prev-focus save and restore (I-580)', () => {
  it('declares _scmPrevFocus variable', () => {
    expect(rendererJs).toContain('let _scmPrevFocus = null')
  })

  it('saves document.activeElement before opening modal', () => {
    const block = rendererJs.split("e.key === '?'")[1]?.split("e.key === ' '")[0] || ''
    expect(block).toContain('_scmPrevFocus = document.activeElement')
  })

  it('restores focus on Escape close', () => {
    const block = rendererJs.split('let _scmPrevFocus')[1]?.split('if (e.key === \'Tab\')')[0] || ''
    expect(block).toContain('_scmPrevFocus.focus()')
    expect(block).toContain('_scmPrevFocus = null')
  })
})
