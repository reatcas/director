import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('orchestra:fine security', () => {
  const block = mainJs.split("'orchestra:fine'")[1]?.split('\nipcMain')[0] || ''

  it('uses isKnownProject guard', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('returns { ok: false } for unknown project', () => {
    expect(block).toContain('{ ok: false }')
  })

  it('writes ALTO file after guard passes', () => {
    expect(block).toContain('ALTO')
    expect(block).toContain('writeFileSync')
  })
})

describe('orchestra:kill security', () => {
  const block = mainJs.split("'orchestra:kill'")[1]?.split('\nipcMain')[0] || ''

  it('uses isKnownProject guard', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('returns { ok: false } for unknown project', () => {
    expect(block).toContain('{ ok: false }')
  })

  it('kills process group after guard passes', () => {
    expect(block).toContain('killProcessGroup')
  })
})

describe('orchestra:play agent validation', () => {
  const block = mainJs.split("'orchestra:play'")[1]?.split('\nipcMain')[0] || ''

  it('uses isKnownProject guard', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('validates agent is a string', () => {
    expect(block).toContain("typeof agent !== 'string'")
  })

  it('validates agent against AI_DEFAULTS allowlist', () => {
    expect(block).toContain('AI_DEFAULTS')
    expect(block).toContain('includes(agent)')
  })

  it('returns error for unknown agent', () => {
    expect(block).toContain("'Select an AI developer first'")
  })
})

describe('mixer:saved:delete id validation', () => {
  const block = mainJs.split("'mixer:saved:delete'")[1]?.split('\nipcMain')[0] || ''

  it('uses isKnownProject guard', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('validates id is string', () => {
    expect(block).toContain("typeof id !== 'string'")
  })

  it('rejects empty id', () => {
    expect(block).toContain('id.length === 0')
  })

  it('enforces max id length of 64', () => {
    expect(block).toContain('id.length > 64')
  })
})

describe('mixer:saved:export id validation', () => {
  const block = mainJs.split("'mixer:saved:export'")[1]?.split('\nipcMain')[0] || ''

  it('validates id is string', () => {
    expect(block).toContain("typeof id !== 'string'")
  })

  it('enforces max id length of 64', () => {
    expect(block).toContain('id.length > 64')
  })

  it('returns null for invalid id', () => {
    expect(block).toContain('return null')
  })
})

describe('transport button keyboard shortcuts', () => {
  it('playBtn has aria-keyshortcuts Control+P', () => {
    expect(html).toContain('id="playBtn"')
    expect(html).toContain('aria-keyshortcuts="Control+P"')
  })

  it('fineBtn has aria-keyshortcuts Control+Period', () => {
    expect(html).toContain('aria-keyshortcuts="Control+Period"')
  })

  it('killBtn has aria-keyshortcuts Control+K', () => {
    expect(html).toContain('aria-keyshortcuts="Control+K"')
  })

  it('renderer handles Ctrl+P for play', () => {
    expect(rendererJs).toContain("e.ctrlKey && e.key === 'p'")
    expect(rendererJs).toContain('#playBtn')
  })

  it('renderer handles Ctrl+. for fine', () => {
    expect(rendererJs).toContain("e.ctrlKey && e.key === '.'")
    expect(rendererJs).toContain('#fineBtn')
  })

  it('renderer handles Ctrl+K for kill', () => {
    expect(rendererJs).toContain("e.ctrlKey && e.key === 'k'")
    expect(rendererJs).toContain('#killBtn')
  })
})
