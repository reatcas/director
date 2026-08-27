import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('repertoire:readFile security (I-208)', () => {
  const block = mainJs.split("'repertoire:readFile'")[1]?.split('\nipcMain')[0] || ''

  it('uses isKnownProject guard (not bare !dir)', () => {
    expect(block).toContain('isKnownProject(dir)')
    expect(block).not.toContain('!dir ||')
  })

  it('validates subpath is a string', () => {
    expect(block).toContain("typeof subpath !== 'string'")
  })

  it('rejects path traversal', () => {
    expect(block).toContain('startsWith(dir + path.sep)')
  })

  it('enforces 2MB file size limit', () => {
    expect(block).toContain('2_097_152')
  })

  it('returns null for oversized files', () => {
    const sizeBlock = block.split('2_097_152')[1]?.split('\n')[0] || ''
    expect(sizeBlock).toContain('return null')
  })
})

describe('ai:auth-status validation (I-209)', () => {
  const block = mainJs.split("'ai:auth-status'")[1]?.split('\nipcMain')[0] || ''

  it('validates id is a string', () => {
    expect(block).toContain("typeof id !== 'string'")
  })

  it('validates id is in AI_DEFAULTS', () => {
    expect(block).toContain('AI_DEFAULTS')
    expect(block).toContain('.includes(id)')
  })

  it('returns loggedIn:false for invalid id', () => {
    const guardLine = block.split("typeof id !== 'string'")[0]?.split('\n').pop() || ''
    expect(block).toContain('{ loggedIn: false }')
  })
})

describe('ai:login validation (I-209)', () => {
  const block = mainJs.split("'ai:login'")[1]?.split('\nipcMain')[0] || ''

  it('validates id is a string', () => {
    expect(block).toContain("typeof id !== 'string'")
  })

  it('validates id is in AI_DEFAULTS allowlist', () => {
    expect(block).toContain('AI_DEFAULTS')
    expect(block).toContain('.includes(id)')
  })

  it('returns ok:false for unknown provider', () => {
    expect(block).toContain("{ ok: false, msg: 'Unknown provider' }")
  })
})

describe('snapshotMixer 30-day age pruning (I-210)', () => {
  const block = mainJs.split('function snapshotMixer')[1]?.split('\n}\n')[0] || ''

  it('computes 30-day cutoff', () => {
    expect(block).toContain('30 * 24 * 60 * 60 * 1000')
  })

  it('filters history by cutoff before push', () => {
    expect(block).toContain('.filter(')
    expect(block).toContain('cutoffISO')
  })

  it('still caps at 100 entries', () => {
    expect(block).toContain('> 100')
    expect(block).toContain('splice(0,')
  })
})

describe('nextAvailableAi business logic (I-211)', () => {
  const block = mainJs.split('function nextAvailableAi')[1]?.split('\n}')[0] || ''

  it('uses indexOf to locate current agent', () => {
    expect(block).toContain('providers.indexOf(currentAgent)')
  })

  it('handles unknown agent without skipping valid provider', () => {
    expect(block).toContain('idx >= 0')
  })

  it('guards against missing state entry before credits check', () => {
    expect(block).toContain('state[candidate] &&')
  })

  it('returns null when no credits available', () => {
    expect(block).toContain('return null')
  })
})
