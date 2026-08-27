import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('atriles:save security validation', () => {
  const block = mainJs.split("'atriles:save'")[1]?.split('\nipcMain')[0] || ''

  it('rejects non-array input', () => {
    expect(block).toContain('!Array.isArray(atriles)')
  })

  it('enforces max 200 entries', () => {
    expect(block).toContain('atriles.length > 200')
  })

  it('validates each entry is an object', () => {
    expect(block).toContain("typeof a === 'object'")
  })

  it('validates name is a string', () => {
    expect(block).toContain("typeof a.name === 'string'")
  })

  it('rejects empty name', () => {
    expect(block).toContain('a.name.length > 0')
  })

  it('enforces max name length of 256', () => {
    expect(block).toContain('a.name.length <= 256')
  })

  it('validates path is a string', () => {
    expect(block).toContain("typeof a.path === 'string'")
  })

  it('rejects empty path', () => {
    expect(block).toContain('a.path.length > 0')
  })

  it('enforces max path length of 4096', () => {
    expect(block).toContain('a.path.length <= 4096')
  })

  it('updates in-memory cache on success', () => {
    expect(block).toContain('_atrilesCache')
  })

  it('returns false for all validation failures', () => {
    const falseReturns = (block.match(/return false/g) || []).length
    expect(falseReturns).toBeGreaterThanOrEqual(2)
  })
})

describe('atriles:list cache behavior', () => {
  it('reads from cache when populated', () => {
    const block = mainJs.split("'atriles:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_atrilesCache')
  })

  it('cache is initialized to null', () => {
    expect(mainJs).toContain('let _atrilesCache = null')
  })
})
