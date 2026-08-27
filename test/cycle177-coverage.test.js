import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const coordJs = fs.readFileSync(path.join(ROOT, 'coordination-protocol.js'), 'utf8')

describe('persistLifecycleEvent cutoffISO cache (P-06)', () => {
  it('defines _lcCutoff helper with 60s TTL', () => {
    expect(mainJs).toContain('function _lcCutoff()')
    expect(mainJs).toContain('now - _lcCutoffAt > 60_000')
  })

  it('uses _lcCutoff() instead of inline new Date in persistLifecycleEvent', () => {
    const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\n}\n')[0] || ''
    expect(block).toContain('_lcCutoff()')
  })
})

describe('pollGitCommits COMMIT_EDITMSG mtime guard (P-08)', () => {
  it('declares _gitCommitMtimes Map', () => {
    expect(mainJs).toContain('_gitCommitMtimes = new Map()')
  })

  it('stats COMMIT_EDITMSG before spawning git log', () => {
    const block = mainJs.split('function pollGitCommits')[1]?.split('\n}\n')[0] || ''
    expect(block).toContain('COMMIT_EDITMSG')
    expect(block).toContain('_gitCommitMtimes.get(dir)')
  })
})

describe('CoordinationProtocol cached totalmem (I-531) + clearLog ISO compare (I-533)', () => {
  it('stores _totalMemMB in constructor', () => {
    expect(coordJs).toContain('this._totalMemMB = Math.floor(os.totalmem()')
  })

  it('uses _totalMemMB instead of os.totalmem() in detectConflicts', () => {
    const block = coordJs.split('detectConflicts()')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('this._totalMemMB')
    expect(block).not.toContain('os.totalmem()')
  })

  it('clearLog lifecycle pruning uses ISO string compare', () => {
    const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\n  })\n')[0] || ''
    expect(block).toContain('_lcClearCutoffISO')
    expect(block).toContain('e.ts >= _lcClearCutoffISO')
  })
})

describe('copyDir path traversal guard (S-01)', () => {
  it('rejects filenames containing .. to prevent traversal', () => {
    const block = mainJs.split('function copyDir')[1]?.split('\n}\n')[0] || ''
    expect(block).toContain("e.name.includes('..')")
    expect(block).toContain('continue')
  })
})

describe('CoordinationProtocol.persistTelemetry Array.isArray guard (S-02)', () => {
  it('guards JSON.parse result with Array.isArray before use', () => {
    const block = coordJs.split('persistTelemetry')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('Array.isArray(_cpHist)')
  })
})

describe('isRunning single statSync (P-09)', () => {
  it('uses single statSync with catch return false instead of existsSync+statSync', () => {
    const block = mainJs.split('function isRunning')[1]?.split('\n}\n')[0] || ''
    expect(block).not.toContain('existsSync')
    expect(block).toContain('fs.statSync(pidFile)')
  })
})

describe('lc-icon aria-hidden in lifecycle timeline (I-534)', () => {
  it('adds aria-hidden=true to lc-icon span in lifecycle event HTML', () => {
    expect(rendererJs).toContain('<span class="lc-icon" aria-hidden="true">')
  })
})
