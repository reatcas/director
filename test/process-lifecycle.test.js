import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('pidAlive function', () => {
  it('uses process.kill with signal 0', () => {
    const block = mainJs.split('function pidAlive')[1]?.split('\n}')[0] || ''
    expect(block).toContain('process.kill(pid, 0)')
  })

  it('returns boolean', () => {
    const block = mainJs.split('function pidAlive')[1]?.split('\n}')[0] || ''
    expect(block).toContain('return true')
    expect(block).toContain('return false')
  })

  it('wraps in try/catch for dead processes', () => {
    const block = mainJs.split('function pidAlive')[1]?.split('\n}')[0] || ''
    expect(block).toContain('try')
    expect(block).toContain('catch')
  })
})

describe('killProcessGroup function', () => {
  it('uses negative PID for group kill', () => {
    const block = mainJs.split('function killProcessGroup')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('process.kill(-pid')
  })

  it('defaults to SIGTERM', () => {
    expect(mainJs).toContain("signal = 'SIGTERM'")
  })

  it('escalates to SIGKILL after timeout', () => {
    const block = mainJs.split('function killProcessGroup')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('SIGKILL')
    expect(block).toContain('setTimeout')
  })

  it('checks pidAlive before SIGKILL escalation', () => {
    const block = mainJs.split('function killProcessGroup')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('pidAlive(pid)')
  })
})

describe('isRunning function', () => {
  it('checks procs map first', () => {
    const block = mainJs.split('function isRunning')[1]?.split('\n}')[0] || ''
    expect(block).toContain('procs.has(dir)')
  })

  it('checks ORCHESTRA_PID file', () => {
    const block = mainJs.split('function isRunning')[1]?.split('\n}')[0] || ''
    expect(block).toContain('ORCHESTRA_PID')
  })

  it('verifies PID is alive, not just file exists', () => {
    const block = mainJs.split('function isRunning')[1]?.split('\n}')[0] || ''
    expect(block).toContain('pidAlive(pid)')
  })

  it('cleans up stale PID file', () => {
    const block = mainJs.split('function isRunning')[1]?.split('\n}')[0] || ''
    expect(block).toContain('unlinkSync(pidFile)')
  })
})

describe('watchForResume function', () => {
  it('prevents duplicate watchers', () => {
    const block = mainJs.split('function watchForResume')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('resumeTimers.has(dir)')
  })

  it('references USAGE_LIMIT_SIGNAL', () => {
    const block = mainJs.split('function watchForResume')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('USAGE_LIMIT_SIGNAL')
  })
})

describe('USAGE_LIMIT_SIGNAL constant', () => {
  it('is defined as .claude/USAGE_LIMIT', () => {
    expect(mainJs).toContain("const USAGE_LIMIT_SIGNAL = '.claude/USAGE_LIMIT'")
  })
})

describe('process management maps', () => {
  it('defines procs Map for running orchestras', () => {
    expect(mainJs).toMatch(/const procs\s+= new Map\(\)/)
  })

  it('defines gitLastHash Map for commit tracking', () => {
    expect(mainJs).toContain('gitLastHash')
  })

  it('defines resumeTimers Map for usage limit watchers', () => {
    expect(mainJs).toContain('resumeTimers')
  })
})
