import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('orchestra:clearLog context-metrics size guard (I-297)', () => {
  const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''

  it('guards context-metrics.json with stat.size check', () => {
    expect(block).toContain('statSync(ctxFile).size <= 1_048_576')
  })

  it('initializes hist as empty array before guard', () => {
    expect(block).toContain('let hist = []')
  })

  it('still caps at 500 entries', () => {
    expect(block).toContain('hist.length > 500')
  })
})

describe('smartModelToggle Spanish aria-label (I-298)', () => {
  it('smartModelToggle has aria-label', () => {
    expect(html).toMatch(/id="smartModelToggle"[^>]*aria-label/)
  })

  it('smartModelToggle aria-label is in Spanish', () => {
    expect(html).toMatch(/id="smartModelToggle"[^>]*aria-label="[^"]*Alternar[^"]*"/)
  })
})

describe('snapshotMixer size guard (I-299)', () => {
  it('snapshotMixer guards mixer-history.json at 512KB', () => {
    const block = mainJs.split('function snapshotMixer')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('512_000')
    expect(block).toContain('statSync(histFile).size <= 512_000')
  })

  it('snapshotMixer initializes hist as empty array', () => {
    const block = mainJs.split('function snapshotMixer')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('let hist = []')
  })
})

describe('startMetricsSampling cached claude usage (I-300)', () => {
  it('sampling reads from cache before calling getClaudeUsage', () => {
    const block = mainJs.split('function startMetricsSampling')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain("metricsGet('claude-usage:'")
    expect(block).toContain('cachedUsage')
  })

  it('falls back to getClaudeUsage when cache misses', () => {
    const block = mainJs.split('function startMetricsSampling')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('getClaudeUsage(dir)')
    expect(block).toContain('cachedUsage !== null')
  })
})
