import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('repertoire:readFile subpath control-char + length guard (S-13)', () => {
  const block = mainJs.split("'repertoire:readFile'")[1]?.split('\n})\n')[0] || ''

  it('rejects subpath with control characters', () => {
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(subpath)')
  })

  it('rejects subpath longer than 4096 chars', () => {
    expect(block).toContain('subpath.length > 4096')
  })
})

describe('blueprint:save sessions ended field guard (S-14)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''

  it('rejects non-string ended field', () => {
    expect(block).toContain("s.ended !== undefined")
    expect(block).toContain("typeof s.ended !== 'string'")
  })

  it('rejects ended longer than 64 chars', () => {
    expect(block).toContain('s.ended.length > 64')
  })

  it('rejects ended with control characters', () => {
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(s.ended)')
  })
})

describe('exit handler usageSig no existsSync (P-19)', () => {
  it('does not use existsSync for usageSig in exit handler', () => {
    const block = mainJs.split('function snapshotMixer')[0]
    const exitIdx = block.lastIndexOf('USAGE_LIMIT_SIGNAL')
    const exitBlock = block.slice(exitIdx, exitIdx + 500)
    expect(exitBlock).not.toContain('existsSync(usageSig)')
    expect(exitBlock).toContain('_useSigExists')
  })
})

describe('snapshotMixer sorted-key dedup (I-553)', () => {
  it('uses sorted JSON for key-order-independent dedup comparison', () => {
    const block = mainJs.split('function snapshotMixer')[1]?.split('\n}\n')[0] || ''
    expect(block).toContain('_sortedJson')
    expect(block).toContain('Object.entries(o).sort(')
  })
})

describe('loadProcs proc-row accessibility (A-08)', () => {
  it('sets role=list on procsList container', () => {
    expect(rendererJs).toContain("list.setAttribute('role', 'list')")
  })

  it('sets role=listitem on each proc-row', () => {
    expect(rendererJs).toContain("row.setAttribute('role', 'listitem')")
  })
})
