import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('ai:credits handler', () => {
  it('returns aiState', () => {
    expect(mainJs).toContain("'ai:credits'")
    expect(mainJs).toContain('aiState()')
  })
})

describe('ai:select handler', () => {
  const block = mainJs.split("'ai:select'")[1]?.split('\nipcMain')[0] || ''

  it('validates AI exists in state', () => {
    expect(block).toContain('if (!state[id])')
  })

  it('returns error for unknown AI', () => {
    expect(block).toContain("error: 'Unknown AI'")
  })

  it('persists selection via writeJSON', () => {
    expect(block).toContain('writeJSON(aiStateFile()')
  })

  it('sets selected field', () => {
    expect(block).toContain('state.selected = id')
  })
})

describe('ai:auth-status handler', () => {
  const block = mainJs.split("'ai:auth-status'")[1]?.split('\nipcMain')[0] || ''

  it('checks claude auth status', () => {
    expect(block).toContain("'claude'")
    expect(block).toContain("'auth', 'status'")
  })

  it('uses runCmd helper for auth check', () => {
    expect(block).toContain('runCmd')
  })
})

describe('ai:login handler', () => {
  const block = mainJs.split("'ai:login'")[1]?.split('\nipcMain')[0] || ''

  it('handles claude login via execFile', () => {
    expect(block).toContain("execFile('claude'")
    expect(block).toContain("'auth', 'login'")
  })

  it('handles codex login via execFile', () => {
    expect(block).toContain("execFile('codex'")
    expect(block).toContain("'login'")
  })

  it('wraps in try/catch', () => {
    expect(block).toContain('try')
    expect(block).toContain('catch')
  })
})

describe('aiState helper', () => {
  it('defines aiState function or constant', () => {
    expect(mainJs).toContain('aiState')
    expect(mainJs).toContain('aiStateFile')
  })

  it('uses readJSON for safe loading', () => {
    expect(mainJs).toContain('readJSON(aiStateFile()')
  })
})

describe('credits floor (F-04)', () => {
  it('clamps credits with Math.max(0, ...)', () => {
    expect(mainJs).toContain('Math.max(0, state[agent].credits - 1)')
  })

  it('does not allow raw credits decrement', () => {
    const rawDecrements = mainJs.match(/\.credits\s*-=\s*1/g)
    expect(rawDecrements).toBeNull()
  })
})
