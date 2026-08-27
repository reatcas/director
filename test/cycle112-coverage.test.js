import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('system:kill-proc pid validation (I-184)', () => {
  const block = mainJs.split("'system:kill-proc'")[1]?.split('\nipcMain')[0] || ''

  it('validates pid is typeof number', () => {
    expect(block).toContain("typeof pid !== 'number'")
  })

  it('validates pid is an integer', () => {
    expect(block).toContain('Number.isInteger(pid)')
  })

  it('rejects non-positive pid', () => {
    expect(block).toContain('pid <= 0')
  })

  it('guards own process pid', () => {
    expect(block).toContain('pid === process.pid')
  })

  it('validates signal allowlist', () => {
    expect(block).toContain('SIGTERM')
    expect(block).toContain('SIGKILL')
  })
})

describe('mixer:history limit cap (I-185)', () => {
  const block = mainJs.split("'mixer:history'")[1]?.split('\nipcMain')[0] || ''

  it('has isKnownProject guard', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('caps limit to max 500', () => {
    expect(block).toContain('Math.min(limit, 500)')
  })

  it('uses default of 50 when limit invalid', () => {
    expect(block).toContain(': 50')
  })
})

describe('lifecycle:add type validation (I-186)', () => {
  const block = mainJs.split("'lifecycle:add'")[1]?.split('\nipcMain')[0] || ''

  it('validates type is string', () => {
    expect(block).toContain("typeof type !== 'string'")
  })

  it('enforces type character allowlist', () => {
    expect(block).toContain("/^[\\w\\-]+$/")
  })

  it('enforces max type length 64', () => {
    expect(block).toContain('type.length > 64')
  })

  it('enforces max message length 1024', () => {
    expect(block).toContain('message.length > 1024')
  })
})

describe('mixer:write focus validation (I-188)', () => {
  const block = mainJs.split("'mixer:write'")[1]?.split('\nipcMain')[0] || ''

  it('validates focus is non-null object', () => {
    expect(block).toContain("typeof focus !== 'object'")
  })

  it('rejects array focus', () => {
    expect(block).toContain('Array.isArray(focus)')
  })

  it('validates each weight is a number in 0-100', () => {
    expect(block).toContain('typeof v !== \'number\'')
    expect(block).toContain('v < 0')
    expect(block).toContain('v > 100')
  })
})

describe('persistLifecycleEvent age pruning (I-191)', () => {
  const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\n}\n')[0] || ''

  it('computes 90-day cutoff (via _lcCutoff helper or inline)', () => {
    expect(mainJs).toContain('90 * 24 * 60 * 60 * 1000')
  })

  it('filters events older than cutoff', () => {
    expect(block).toContain('.filter(')
    expect(block).toContain('cutoff')
  })

  it('still caps at 500 entries', () => {
    expect(block).toContain('> 500')
    expect(block).toContain('splice(0,')
  })
})

describe('addBtn aria-label (I-190)', () => {
  it('addBtn has aria-label in Spanish', () => {
    expect(html).toContain('id="addBtn"')
    expect(html).toMatch(/id="addBtn"[^>]*aria-label|aria-label[^>]*id="addBtn"/)
  })

  it('addBtn aria-label mentions agregar or proyecto', () => {
    expect(html).toContain('Agregar proyecto')
  })
})

describe('stall badge accessibility (I-189)', () => {
  it('stall badge has aria-label', () => {
    expect(rendererJs).toContain('stall-badge')
    expect(rendererJs).toContain('aria-label=')
  })

  it('stall badge aria-label mentions minutos', () => {
    expect(rendererJs).toContain('minutos sin commits')
  })
})
