import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('notes:write security validation (I-180/I-181)', () => {
  const block = mainJs.split("'notes:write'")[1]?.split('\nipcMain')[0] || ''

  it('validates isKnownProject(dir)', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('validates content is a string', () => {
    expect(block).toContain("typeof content !== 'string'")
  })

  it('enforces max content length of 50000', () => {
    expect(block).toContain('content.length > 50000')
  })

  it('rejects content with null bytes and control characters', () => {
    expect(block).toContain('\\x00')
  })

  it('control char regex covers range 0x00-0x08', () => {
    expect(block).toContain('\\x00-\\x08')
  })

  it('control char regex covers range 0x0E-0x1F', () => {
    expect(block).toContain('\\x0E-\\x1F')
  })

  it('returns false for all validation failures', () => {
    const falseReturns = (block.match(/return false/g) || []).length
    expect(falseReturns).toBeGreaterThanOrEqual(3)
  })

  it('returns true on success', () => {
    expect(block).toContain('return true')
  })

  it('uses atomic write (tmp + rename)', () => {
    expect(block).toContain('.tmp')
    expect(block).toContain('renameSync')
  })

  it('persists lifecycle event after write', () => {
    expect(block).toContain('persistLifecycleEvent')
  })
})
