import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('ai:auth-status type guard (cycle 115)', () => {
  const block = mainJs.split("'ai:auth-status'")[1]?.split('\nipcMain')[0] || ''

  it('validates id typeof string', () => {
    expect(block).toContain("typeof id !== 'string'")
  })

  it('validates id in AI_DEFAULTS', () => {
    expect(block).toContain('AI_DEFAULTS')
  })

  it('returns loggedIn:false for invalid id early', () => {
    expect(block).toContain('{ loggedIn: false }')
  })
})

describe('ai:login type guard (cycle 115)', () => {
  const block = mainJs.split("'ai:login'")[1]?.split('\nipcMain')[0] || ''

  it('validates id typeof string', () => {
    expect(block).toContain("typeof id !== 'string'")
  })

  it('returns ok:false for invalid id early', () => {
    expect(block).toContain("{ ok: false, msg: 'Unknown provider' }")
  })
})

describe('nextAvailableAi robustness (cycle 115)', () => {
  const block = mainJs.split('function nextAvailableAi')[1]?.split('\n}')[0] || ''

  it('checks state[candidate] exists before accessing credits', () => {
    expect(block).toContain('state[candidate] &&')
  })

  it('handles unknown currentAgent (idx >= 0 branch)', () => {
    expect(block).toContain('idx >= 0')
  })
})

describe('snapshotMixer age-based pruning (cycle 115)', () => {
  const block = mainJs.split('function snapshotMixer')[1]?.split('\n}\n')[0] || ''

  it('uses _smCutoff() for 30-day cutoff', () => {
    expect(block).toContain('cutoffISO')
    expect(block).toContain('_smCutoff()')
  })

  it('filters history array before push', () => {
    expect(block).toContain('.filter(')
  })
})

describe('export:session serialization order (cycle 117)', () => {
  const block = mainJs.split("'export:session'")[1]?.split('\nipcMain')[0] || ''

  it('serializes snapshot BEFORE showing dialog', () => {
    const serIdx = block.indexOf('serialized')
    const dialogIdx = block.indexOf('showSaveDialog')
    expect(serIdx).toBeLessThan(dialogIdx)
  })

  it('writes serialized (not re-serialized) to file', () => {
    expect(block).toContain('writeFileSync(result.filePath, serialized)')
  })
})

describe('metrics:session-summary completeness', () => {
  const block = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''

  it('counts active orchestras', () => {
    expect(block).toContain('active++')
  })

  it('returns total project count', () => {
    expect(block).toContain('total: projects.length')
  })

  it('includes creditsRemaining', () => {
    expect(block).toContain('creditsRemaining')
  })

  it('identifies worst compliance project', () => {
    expect(block).toContain('worstCompliance')
    expect(block).toContain('worstCompliance.score')
  })
})
