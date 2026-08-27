import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const coordJs = fs.readFileSync(path.join(ROOT, 'coordination-protocol.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')

describe('coordination-metrics.json size guard (I-406)', () => {
  const block = coordJs.split('coordination-metrics.json')[1]?.split('\n}')[0] || ''

  it('guards coordination-metrics.json read with statSync 1MB limit', () => {
    expect(block).toContain('statSync(file).size <= 1_048_576')
  })

  it('only parses if within size limit', () => {
    expect(block).toContain('JSON.parse(fs.readFileSync(file')
    const guardIdx = block.indexOf('1_048_576')
    const parseIdx = block.indexOf('JSON.parse')
    expect(guardIdx).toBeLessThan(parseIdx)
  })
})

describe('blueprint:readiness answeredFields typeof guard (I-407)', () => {
  const block = mainJs.split("'blueprint:readiness'")[1]?.split('\nipcMain')[0] || ''

  it('uses typeof string check before calling trim()', () => {
    expect(block).toContain("typeof a[k] === 'string'")
    expect(block).toContain('answeredFields')
  })

  it('does not call trim() without typeof guard', () => {
    const lines = block.split('\n')
    for (const line of lines) {
      if (line.includes('trim()') && line.includes('a[k]')) {
        expect(line).toContain("typeof a[k] === 'string'")
      }
    }
  })
})

describe('metrics:session-summary per-project outer try/catch (I-408)', () => {
  const block = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''

  it('wraps isRunning() in outer per-project try/catch', () => {
    const outerTry = block.indexOf('try {')
    const isRunningIdx = block.indexOf('isRunning(p.path)')
    expect(outerTry).toBeGreaterThanOrEqual(0)
    expect(isRunningIdx).toBeGreaterThan(outerTry)
  })
})

describe('preload lifecycleList forwards limit param (I-409)', () => {
  it('lifecycleList passes limit to IPC invoke', () => {
    expect(preloadJs).toContain('lifecycleList')
    expect(preloadJs).toMatch(/lifecycleList.*limit.*lifecycle:list.*limit/)
  })
})
