import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('orchestra:writeConfig validation', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('uses isKnownProject guard', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('rejects non-object cfg', () => {
    expect(block).toContain("typeof cfg !== 'object'")
    expect(block).toContain('Array.isArray(cfg)')
  })

  it('enforces 64KB size limit', () => {
    expect(block).toContain('65_536')
    expect(block).toContain('serialized.length >')
  })

  it('validates focus weight values are numbers 0-100', () => {
    expect(block).toContain('cfg.focus')
    expect(block).toContain('w >= 0 && w <= 100')
    expect(block).toContain("typeof w === 'number'")
  })

  it('round-trips through JSON.parse to strip non-serializable values', () => {
    expect(block).toContain('JSON.parse(serialized)')
  })

  it('returns false for all validation failures', () => {
    const falseCount = (block.match(/return false/g) || []).length
    expect(falseCount).toBeGreaterThanOrEqual(3)
  })
})

describe('ai:select validation', () => {
  const block = mainJs.split("'ai:select'")[1]?.split('\nipcMain')[0] || ''

  it('validates id is a string', () => {
    expect(block).toContain("typeof id !== 'string'")
  })

  it('validates id against AI_DEFAULTS allowlist', () => {
    expect(block).toContain('AI_DEFAULTS')
    expect(block).toContain('includes(id)')
  })

  it('returns error object for unknown id', () => {
    expect(block).toContain("{ ok: false, error: 'Unknown AI' }")
  })

  it('persists selected agent via writeJSON', () => {
    expect(block).toContain('writeJSON(')
    expect(block).toContain("{ ok: true }")
  })
})

describe('AI_DEFAULTS allowlist consistency', () => {
  it('AI_DEFAULTS defines known agents', () => {
    expect(mainJs).toContain('const AI_DEFAULTS = {')
    expect(mainJs).toContain("claude:")
    expect(mainJs).toContain("aider:")
  })

  it('orchestra:play and ai:select both use AI_DEFAULTS for validation', () => {
    const playBlock = mainJs.split("'orchestra:play'")[1]?.split('\nipcMain')[0] || ''
    const selectBlock = mainJs.split("'ai:select'")[1]?.split('\nipcMain')[0] || ''
    expect(playBlock).toContain('AI_DEFAULTS')
    expect(selectBlock).toContain('AI_DEFAULTS')
  })
})
