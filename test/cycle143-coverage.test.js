import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('persistLifecycleEvent label+message cap (I-400)', () => {
  const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\n}')[0] || ''

  it('caps label at 128 chars before push', () => {
    expect(block).toContain('_evLabel')
    expect(block).toContain('128')
    expect(block).toContain('slice(0,')
  })

  it('caps message at 4096 chars before push', () => {
    expect(block).toContain('_evMsg')
    expect(block).toContain('4096')
  })

  it('pushes capped label and message (not raw args)', () => {
    expect(block).toContain('label: _evLabel')
    expect(block).toContain('message: _evMsg')
  })
})

describe('writeJSON 64MB size cap (I-401)', () => {
  const block = mainJs.split('const writeJSON')[1]?.split('\n}')[0] || ''

  it('serializes to _wjSerial before writing', () => {
    expect(block).toContain('_wjSerial')
    expect(block).toContain('JSON.stringify')
  })

  it('enforces 64MB (67_108_864) cap on serialized length', () => {
    expect(block).toContain('67_108_864')
    expect(block).toContain('_wjSerial.length')
  })
})

describe('closeCmdPalette focus restoration (I-399)', () => {
  it('saves previously-focused element before opening palette', () => {
    expect(rendererJs).toContain('_cmdPrevFocus')
    expect(rendererJs).toContain('document.activeElement')
  })

  it('restores focus on close', () => {
    const block = rendererJs.split('function closeCmdPalette')[1]?.split('\n}')[0] || ''
    expect(block).toContain('_cmdPrevFocus.focus()')
    expect(block).toContain('_cmdPrevFocus = null')
  })
})
