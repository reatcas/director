import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const scheduler = fs.readFileSync(path.join(ROOT, 'resource-scheduler.js'), 'utf8')

describe('repertoire:add droppedPath type guard (I-281)', () => {
  const block = mainJs.split("'repertoire:add'")[1]?.split('\nipcMain')[0] || ''

  it('validates droppedPath is string when provided', () => {
    expect(block).toContain("typeof droppedPath !== 'string'")
  })

  it('returns null for non-string droppedPath', () => {
    expect(block).toContain('return null')
  })

  it('allows null/undefined droppedPath to proceed to dialog', () => {
    expect(block).toContain('droppedPath !== null')
    expect(block).toContain('droppedPath !== undefined')
  })
})

describe('lifecycle:list size guard (I-282)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split('\nipcMain')[0] || ''

  it('guards lifecycle-events.json with stat.size check', () => {
    expect(block).toContain('statSync')
    expect(block).toContain('2_097_152')
  })

  it('initializes events as empty array', () => {
    expect(block).toContain('let events = []')
  })

  it('still returns last 200 events (via _llLimit default)', () => {
    expect(block).toContain('events.slice(-_llLimit)')
    expect(block).toContain('200')
  })
})

describe('usageBanner alert role (I-283)', () => {
  it('usageBanner has role=alert', () => {
    expect(html).toMatch(/id="usageBanner"[^>]*role="alert"/)
  })

  it('usageBanner has aria-live=assertive', () => {
    expect(html).toMatch(/id="usageBanner"[^>]*aria-live="assertive"/)
  })

  it('usageBanner has Spanish aria-label', () => {
    expect(html).toMatch(/id="usageBanner"[^>]*aria-label="[^"]*[Aa]viso[^"]*"/)
  })
})

describe('resource-scheduler persistTelemetry size guard (I-284)', () => {
  it('guards resource-metrics.json with stat.size check', () => {
    expect(scheduler).toContain('statSync(file).size <= 1_048_576')
  })

  it('only parses file when within size limit', () => {
    const block = scheduler.split('persistTelemetry(dir)')[1]?.split('hist.push')[0] || ''
    expect(block).toContain('1_048_576')
    expect(block).toContain('JSON.parse')
  })
})
