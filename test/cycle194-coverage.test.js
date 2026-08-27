import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('orchestra:analyze started cap (S-27)', () => {
  const block = mainJs.split("'orchestra:analyze'")[1]?.split('\n})\n')[0] || ''

  it('caps started string to 64 chars', () => {
    expect(block).toContain('.slice(0, 64)')
    expect(block).toContain('started')
  })
})

describe('mixer:saved:list load-time field validation (S-28)', () => {
  const block = mainJs.split("'mixer:saved:list'")[1]?.split('\n})\n')[0] || ''

  it('validates name field on load', () => {
    expect(block).toContain('m.name.length <= 256')
    expect(block).toContain("typeof m.name === 'string'")
  })

  it('validates id and focus fields on load', () => {
    expect(block).toContain("typeof m.id === 'string'")
    expect(block).toContain("typeof m.focus === 'object'")
  })
})

describe('findLogo step 3 withFileTypes (P-30)', () => {
  const block = mainJs.split('function findLogo')[1]?.split('// 4.')[0] || ''

  it('uses withFileTypes to avoid statSync per entry', () => {
    expect(block).toContain('withFileTypes: true')
    expect(block).toContain('entry.isDirectory()')
    expect(block).toContain('entry.name')
  })
})

describe('metrics:context finite guard for token sums (I-571)', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split('\n})\n')[0] || ''

  it('uses Number.isFinite for totalTokens', () => {
    expect(block).toContain('Number.isFinite(m.totalTokens)')
    expect(block).toContain('Number.isFinite(m.totalTokensSaved)')
  })
})

describe('lifecycle:list unfilteredTotal in response (I-572)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split('\n})\n')[0] || ''

  it('returns unfilteredTotal before type filter', () => {
    expect(block).toContain('_llUnfilteredTotal')
    expect(block).toContain('unfilteredTotal: _llUnfilteredTotal')
  })
})
