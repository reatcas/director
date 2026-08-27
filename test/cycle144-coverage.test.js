import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('isRunning() PID file size guard (I-402)', () => {
  const block = mainJs.split('function isRunning')[1]?.split('\n}')[0] || ''

  it('uses _irStat for PID file stat', () => {
    expect(block).toContain('_irStat')
    expect(block).toContain('statSync(pidFile)')
  })

  it('guards PID read at 64 bytes', () => {
    expect(block).toContain('64')
    expect(block).toContain('_irStat.size')
  })

  it('wraps PID read in try/catch', () => {
    expect(block).toContain('try {')
    expect(block).toContain('} catch {}')
  })
})

describe('copyDir CLAUDE.md size guard (I-403)', () => {
  const block = mainJs.split('function copyDir')[1]?.split('\n}')[0] || ''

  it('uses _cdStat for CLAUDE.md stat', () => {
    expect(block).toContain('_cdStat')
    expect(block).toContain('CLAUDE.md')
  })

  it('guards CLAUDE.md read at 1MB', () => {
    expect(block).toContain('1_048_576')
    expect(block).toContain('_cdStat.size')
  })
})

describe('lifecycle:list limit parameter (I-404)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split('\nipcMain')[0] || ''

  it('accepts limit parameter with _llLimit variable', () => {
    expect(block).toContain('_llLimit')
    expect(block).toContain('limit')
  })

  it('validates limit: integer, >0, <=500', () => {
    expect(block).toContain('Number.isInteger(limit)')
    expect(block).toContain('500')
  })

  it('defaults to 200 when limit is invalid', () => {
    expect(block).toContain('200')
    expect(block).toContain('_llLimit')
  })
})

describe('cmdResults aria-live (I-405)', () => {
  it('cmdResults has aria-live="polite"', () => {
    expect(html).toContain('id="cmdResults"')
    expect(html).toMatch(/id="cmdResults"[^>]*aria-live="polite"/)
  })
})
