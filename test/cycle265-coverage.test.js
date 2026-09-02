// cycle265-coverage.test.js — C265 quality_tests coverage
// T-204: S-130 _isRunningCache size cap; S-131 _gitCommitMtimes size cap
// T-205: P-93 procs single for...of pass; B-47 compliance scores for...of
// T-206: F-44 _burnHistory for...of sum

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-204: S-130 + S-131 ────────────────────────────────────────────────────
describe('T-204: S-130 _isRunningCache has size cap before .set()', () => {
  it('isRunning caps _isRunningCache at 200 on false path', () => {
    const body = mainJs.split('function isRunning(dir) {')[1]?.split('\n}')[0] || ''
    expect(body).toContain('_isRunningCache.size >= 200')
    expect(body).toContain('_isRunningCache.delete(_isRunningCache.keys().next().value)')
  })

  it('isRunning caps _isRunningCache at 200 on main set path', () => {
    const body = mainJs.split('function isRunning(dir) {')[1]?.split('\n}')[0] || ''
    const matches = body.match(/_isRunningCache\.size >= 200/g) || []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })
})

describe('T-204: S-131 _gitCommitMtimes has size cap before .set()', () => {
  it('git watcher caps _gitCommitMtimes at 200', () => {
    expect(mainJs).toContain('_gitCommitMtimes.size >= 200')
    expect(mainJs).toContain('_gitCommitMtimes.delete(_gitCommitMtimes.keys().next().value)')
  })
})

// ─── T-205: P-93 + B-47 ──────────────────────────────────────────────────────
describe('T-205: P-93 process list uses single for...of for CPU+MEM totals', () => {
  it('renderer uses single for...of to compute totalCpu and totalMem', () => {
    expect(rendererJs).toContain('let totalCpu = 0, totalMem = 0; for (const p of procs)')
  })

  it('renderer no longer uses two separate reduce calls for CPU/MEM', () => {
    expect(rendererJs).not.toContain('procs.reduce((s, p) => s + (parseFloat(p.cpu)')
    expect(rendererJs).not.toContain('procs.reduce((s, p) => s + (parseFloat(p.mem)')
  })
})

describe('T-205: B-47 metrics:compliance uses for...of to build scores array', () => {
  it('compliance handler uses for...of loop to collect scores', () => {
    const body = mainJs.split("'metrics:compliance'")[1]?.split('\nipcMain')[0] || ''
    expect(body).toContain('for (const l of recent)')
    expect(body).toContain('scores.push(_p.score)')
  })

  it('compliance handler no longer chains map+filter for scores', () => {
    const body = mainJs.split("'metrics:compliance'")[1]?.split('\nipcMain')[0] || ''
    expect(body).not.toContain('.map(l => parseComplianceLine(l)).filter(Boolean)')
  })
})

// ─── T-206: F-44 _burnHistory for...of sum ───────────────────────────────────
describe('T-206: F-44 burnHistory average uses for...of instead of reduce', () => {
  it('token burn uses for...of to accumulate _burnSum', () => {
    expect(rendererJs).toContain('let _burnSum = 0; for (const v of _burnHistory) _burnSum += v')
  })

  it('token burn no longer uses _burnHistory.reduce', () => {
    expect(rendererJs).not.toContain('_burnHistory.reduce')
  })
})
