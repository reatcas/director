import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('F-04: credits floor at zero', () => {
  it('clamps credits decrement with Math.max(0, ...)', () => {
    expect(mainJs).toContain('Math.max(0, state[agent].credits - 1)')
  })

  it('does not allow raw decrement without clamping', () => {
    const rawDecrements = mainJs.match(/\.credits\s*-=\s*1/g)
    expect(rawDecrements).toBeNull()
  })
})

describe('F-03: PRODUCT_DIRECTIVE.md growth cap', () => {
  it('strips existing NEXT ITEM section before appending', () => {
    expect(mainJs).toContain("content.indexOf('## NEXT ITEM')")
    expect(mainJs).toContain('content.substring(0, nextIdx).trimEnd()')
  })

  it('overwrites NEXT ITEM instead of stacking', () => {
    const exitHandler = mainJs.split("child.on('exit'")[1] || ''
    const nextItemWrites = (exitHandler.match(/## NEXT ITEM/g) || []).length
    expect(nextItemWrites).toBeLessThanOrEqual(2)
  })
})

describe('F-02: final git check on process exit', () => {
  it('calls pollGitCommits before stopTailing in exit handler', () => {
    const exitHandler = mainJs.split("child.on('exit'")[1] || ''
    const pollIdx = exitHandler.indexOf('pollGitCommits(dir)')
    const stopIdx = exitHandler.indexOf('stopTailing(dir)')
    expect(pollIdx).toBeGreaterThan(-1)
    expect(stopIdx).toBeGreaterThan(-1)
    expect(pollIdx).toBeLessThan(stopIdx)
  })

  it('extracts pollGitCommits as a reusable function', () => {
    expect(mainJs).toContain('function pollGitCommits(dir)')
  })

  it('stores lastHash in a Map for cross-function access', () => {
    expect(mainJs).toContain('gitLastHash')
    expect(mainJs).toContain('gitLastHash.set(dir,')
  })
})

describe('I-02: auto-restart try/catch', () => {
  it('wraps agent-switch playOrchestra in try/catch', () => {
    const switchBlock = mainJs.split('SWITCH')[1]?.split('} else {')[0] || ''
    expect(switchBlock).toContain('try {')
    expect(switchBlock).toContain('playOrchestra(dir, nextAgent)')
    expect(switchBlock).toContain('catch (err)')
  })

  it('wraps infinite-loop playOrchestra in try/catch', () => {
    const loopBlock = mainJs.split('Reiniciando orquesta automáticamente')[1]?.split('orchestra:exit')[0] || ''
    expect(loopBlock).toContain('try {')
    expect(loopBlock).toContain('playOrchestra(dir, agent)')
    expect(loopBlock).toContain('catch (err)')
  })

  it('logs crash events via persistLifecycleEvent', () => {
    const crashLogs = mainJs.match(/Auto-restart falló/g) || []
    expect(crashLogs.length).toBeGreaterThanOrEqual(2)
  })
})

describe('I-03: stale USAGE_LIMIT cleanup on startup', () => {
  it('checks pidAlive before watching for resume on startup', () => {
    const startupBlock = mainJs.split('Re-attach tailers')[1]?.split('app.on')[0] || ''
    expect(startupBlock).toContain('pidAlive(pid)')
  })

  it('removes stale USAGE_LIMIT signal when PID is dead', () => {
    const startupBlock = mainJs.split('Re-attach tailers')[1]?.split('app.on')[0] || ''
    expect(startupBlock).toContain('fs.unlinkSync(usageSig)')
  })

  it('only watches for resume if PID is still alive', () => {
    const startupBlock = mainJs.split('Re-attach tailers')[1]?.split('app.on')[0] || ''
    const watchIdx = startupBlock.indexOf('watchForResume')
    const pidCheckIdx = startupBlock.indexOf('pidStillAlive')
    expect(pidCheckIdx).toBeGreaterThan(-1)
    expect(watchIdx).toBeGreaterThan(pidCheckIdx)
  })
})

describe('I-05: security hardening', () => {
  it('restricts kill-proc signals to allowlist', () => {
    expect(mainJs).toContain("const allowed = ['SIGTERM', 'SIGKILL']")
    expect(mainJs).toContain('allowed.includes(signal)')
  })
})

describe('main.js invariants', () => {
  it('uses atomic writes for all JSON output', () => {
    const rawWrites = mainJs.match(/fs\.writeFileSync\([^)]+\.json/g) || []
    const safeWrites = rawWrites.filter(w => !w.includes('.tmp'))
    expect(safeWrites.length).toBe(0)
  })

  it('has USAGE_LIMIT_SIGNAL constant defined', () => {
    expect(mainJs).toContain("const USAGE_LIMIT_SIGNAL = '.claude/USAGE_LIMIT'")
  })

  it('cleans up PID file on exit', () => {
    const exitBlock = mainJs.split("child.on('exit'")[1] || ''
    expect(exitBlock).toContain('ORCHESTRA_PID')
    expect(exitBlock).toContain('unlinkSync')
  })
})

describe('IPC handler invariants', () => {
  it('validates dir parameter in metrics handlers', () => {
    expect(mainJs).toMatch(/metrics:context.*if \(!dir\) return null/s)
    expect(mainJs).toMatch(/metrics:claude-usage.*if \(!dir\) return null/s)
  })

  it('uses readJSON with fallback for all JSON reads', () => {
    const readCalls = mainJs.match(/readJSON\([^)]+,\s*[^)]+\)/g) || []
    expect(readCalls.length).toBeGreaterThan(5)
  })

  it('exposes readFile IPC with string validation (I-07)', () => {
    expect(mainJs).toContain("typeof subpath !== 'string'")
  })

  it('defines writeJSON with atomic tmp+rename pattern', () => {
    expect(mainJs).toContain('const writeJSON')
    expect(mainJs).toContain('.tmp')
    expect(mainJs).toContain('renameSync')
  })

  it('defines pidAlive for process liveness check', () => {
    expect(mainJs).toContain('function pidAlive')
    expect(mainJs).toContain('process.kill(pid, 0)')
  })

  it('defines killProcessGroup with SIGTERM escalation', () => {
    expect(mainJs).toContain('function killProcessGroup')
    expect(mainJs).toContain('SIGTERM')
    expect(mainJs).toContain('SIGKILL')
  })
})

describe('lifecycle and protocol invariants', () => {
  it('defines persistLifecycleEvent function', () => {
    expect(mainJs).toContain('function persistLifecycleEvent')
  })

  it('lifecycle events have max cap (500)', () => {
    expect(mainJs).toContain('500')
    expect(mainJs).toMatch(/events\.length\s*>\s*500/)
  })

  it('initializes all three protocol modules', () => {
    expect(mainJs).toContain('ResourceScheduler')
    expect(mainJs).toContain('ContextProtocol')
    expect(mainJs).toContain('CoordinationProtocol')
  })

  it('defines syncProtocol for harness file copying', () => {
    expect(mainJs).toContain('function syncProtocol')
  })

  it('hot-reload watcher uses fs.watch', () => {
    expect(mainJs).toContain('startHotReloadWatcher')
    expect(mainJs).toContain('fs.watch')
  })

  it('metrics sampling interval is defined', () => {
    expect(mainJs).toContain('startMetricsSampling')
    expect(mainJs).toContain('setInterval')
  })

  it('defines readJSON helper with try/catch fallback', () => {
    expect(mainJs).toContain('const readJSON')
    expect(mainJs).toMatch(/readJSON\s*=.*try.*catch/s)
  })
})

describe('F-17: mixer history IPC', () => {
  it('defines mixer:history handler', () => {
    expect(mainJs).toContain("'mixer:history'")
  })

  it('reads mixer-history.json via readJSON', () => {
    const block = mainJs.split("'mixer:history'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('mixer-history.json')
    expect(block).toContain('readJSON')
  })

  it('validates dir parameter via isKnownProject', () => {
    const block = mainJs.split("'mixer:history'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('isKnownProject(dir)')
  })

  it('defaults to 50 entries when limit not specified', () => {
    const block = mainJs.split("'mixer:history'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('50')
    expect(block).toContain('.slice(-n)')
  })
})

describe('F-18: session summary IPC', () => {
  it('defines metrics:session-summary handler', () => {
    expect(mainJs).toContain("'metrics:session-summary'")
  })

  it('reads projects from store', () => {
    const block = mainJs.split("'metrics:session-summary'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('readJSON(store()')
  })

  it('tracks active and idle counts', () => {
    const block = mainJs.split("'metrics:session-summary'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('isRunning(p.path)')
    expect(block).toContain('active++')
    expect(block).toContain('idle++')
  })

  it('aggregates totalTokens from context protocol', () => {
    const block = mainJs.split("'metrics:session-summary'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('totalTokensProcessed')
  })

  it('finds worst compliance across projects', () => {
    const block = mainJs.split("'metrics:session-summary'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('worstCompliance')
    expect(block).toContain('last.score < worstCompliance.score')
  })

  it('returns structured summary object', () => {
    const block = mainJs.split("'metrics:session-summary'")[1]?.split('ipcMain')[0] || ''
    expect(block).toContain('active, idle, total:')
    expect(block).toContain('totalTokens')
    expect(block).toContain('worstCompliance')
  })
})
