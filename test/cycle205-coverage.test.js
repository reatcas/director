import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('notes:read byte-length guard (S-43)', () => {
  const block = mainJs.split("'notes:read'")[1]?.split("'notes:write'")[0] || ''

  it('caps at 102_400 bytes', () => {
    expect(block).toContain('102_400')
    expect(block).toContain('st.size > 102_400')
  })

  it('returns empty string when over limit', () => {
    expect(block).toContain("return ''")
  })
})

describe('mixer:saved:delete validation filter (S-44)', () => {
  const block = mainJs.split("'mixer:saved:delete'")[1]?.split("'mixer:saved:export'")[0] || ''

  it('guards mixes array before filtering', () => {
    expect(block).toContain('!Array.isArray(mixes)')
  })

  it('validates mix entries before writing', () => {
    expect(block).toContain("typeof m === 'object'")
    expect(block).toContain("typeof m.id === 'string'")
  })

  it('excludes target id while filtering valid entries', () => {
    expect(block).toContain("m.id !== id")
  })
})

describe('metrics:session-summary slow TTL (P-44)', () => {
  const block = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''

  it('uses _SLOW_METRICS_TTL for session-summary cache', () => {
    expect(block).toContain('_SLOW_METRICS_TTL')
    expect(block).toContain("'session-summary'")
  })
})

describe('readJSON null guard (I-585)', () => {
  it('returns fallback when JSON.parse returns null', () => {
    const block = mainJs.split('const readJSON')[1]?.split('\n')[0] || ''
    expect(block).toMatch(/_r !== null/)
  })

  it('returns parsed value when non-null', () => {
    const block = mainJs.split('const readJSON')[1]?.split('\n')[0] || ''
    expect(block).toContain('return _r')
  })
})

describe('orchestra:play credits post-play (BL-03)', () => {
  const block = mainJs.split("'orchestra:play'")[1]?.split("'orchestra:fine'")[0] || ''

  it('calls playOrchestra before decrementing credits', () => {
    const playIdx = block.indexOf('playOrchestra(dir, agent)')
    const creditsIdx = block.indexOf('state[agent].credits')
    expect(playIdx).toBeGreaterThanOrEqual(0)
    expect(creditsIdx).toBeGreaterThan(playIdx)
  })

  it('only decrements credits on successful play', () => {
    expect(block).toContain('_playResult.ok')
    expect(block).toContain('state[agent].credits = Math.max(0')
  })
})
