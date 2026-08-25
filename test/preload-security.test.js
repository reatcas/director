import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const preload = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')

describe('preload.js systemKill defense-in-depth (I-57)', () => {
  it('validates pid as positive integer', () => {
    expect(preload).toContain('Number.isInteger(pid)')
    expect(preload).toContain('pid <= 0')
  })

  it('validates signal against allowlist', () => {
    expect(preload).toContain("'SIGTERM', 'SIGKILL'")
    expect(preload).toContain('.includes(sig)')
  })

  it('returns rejected promise for invalid input', () => {
    expect(preload).toContain('Promise.resolve(false)')
  })
})

describe('preload.js bridge invariants', () => {
  it('only uses ipcRenderer.invoke (never send/sendSync)', () => {
    expect(preload).not.toContain('ipcRenderer.send(')
    expect(preload).not.toContain('ipcRenderer.sendSync(')
    expect(preload).not.toContain('ipcRenderer.sendTo(')
  })

  it('uses contextBridge.exposeInMainWorld', () => {
    expect(preload).toContain('contextBridge.exposeInMainWorld')
  })

  it('wraps event listeners to strip IPC event object', () => {
    const listeners = preload.match(/ipcRenderer\.on\(/g) || []
    const wrappers = preload.match(/\(_e, d\) => cb\(d\)/g) || []
    expect(listeners.length).toBeGreaterThan(0)
    expect(wrappers.length).toBe(listeners.length)
  })

  it('does not expose require, process, or fs to renderer', () => {
    const exposed = preload.split('exposeInMainWorld')[1] || ''
    expect(exposed).not.toContain('require(')
    expect(exposed).not.toContain('process.')
    expect(exposed).not.toMatch(/\bfs\b/)
  })

  it('exposes mixer:history bridge method (F-17)', () => {
    expect(preload).toContain('mixerHistory')
    expect(preload).toContain("'mixer:history'")
  })

  it('exposes session-summary bridge method (F-18)', () => {
    expect(preload).toContain('sessionSummary')
    expect(preload).toContain("'metrics:session-summary'")
  })

  it('exposes all five event channels', () => {
    const channels = ['orchestra:line', 'orchestra:exit', 'orchestra:resumed', 'orchestra:usage_limit', 'metrics:update']
    for (const ch of channels) {
      expect(preload).toContain(ch)
    }
  })
})
