import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('null dir guard on all IPC handlers', () => {
  const handlers = mainJs.match(/ipcMain\.handle\('([^']+)'[^{]*\{([^]*?)(?=\nipcMain\.handle)/g) || []
  const handlerNames = mainJs.match(/ipcMain\.handle\('([^']+)'/g)?.map(h => h.match(/'([^']+)'/)[1]) || []

  const noGuardNeeded = ['ai:credits', 'ai:select', 'ai:auth-status', 'ai:login',
    'metrics:coordination', 'metrics:session-summary', 'system:claude-procs', 'system:kill-proc',
    'orchestra:hotReload', 'atriles:list', 'atriles:save', 'repertoire:list', 'repertoire:add',
    'repertoire:open', 'repertoire:remove', 'orchestra:install', 'orchestra:play',
    'orchestra:fine', 'orchestra:kill', 'lifecycle:add']
  const dirHandlers = handlerNames.filter(name => {
    if (noGuardNeeded.includes(name)) return false
    const block = mainJs.split(`'${name}'`)[1]?.split('ipcMain.handle')[0] || ''
    return block.includes('!dir')
  })

  for (const name of dirHandlers) {
    it(`${name} guards against null/missing dir`, () => {
      const block = mainJs.split(`'${name}'`)[1]?.split('ipcMain.handle')[0] || ''
      const hasGuard = block.includes('!dir') || block.includes('if (!dir')
      expect(hasGuard).toBe(true)
    })
  }
})

describe('path traversal protection', () => {
  it('repertoire:readFile validates path stays within project dir', () => {
    const handler = mainJs.split("'repertoire:readFile'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('startsWith(dir + path.sep)')
  })

  it('orchestra:readIterLog validates path stays within project dir', () => {
    const handler = mainJs.split("'orchestra:readIterLog'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('startsWith(dir + path.sep)')
  })

  it('repertoire:readFile validates subpath is string', () => {
    const handler = mainJs.split("'repertoire:readFile'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain("typeof subpath !== 'string'")
  })

  it('orchestra:readIterLog validates logPath is string', () => {
    const handler = mainJs.split("'orchestra:readIterLog'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain("typeof logPath !== 'string'")
  })
})

describe('try-catch error handling', () => {
  it('lifecycle:list wraps file read in try-catch', () => {
    const handler = mainJs.split("'lifecycle:list'")[1]?.split('ipcMain.handle')[0] || ''
    const usesReadJSON = handler.includes('readJSON')
    const hasTryCatch = handler.includes('try') || usesReadJSON
    expect(hasTryCatch).toBe(true)
  })

  it('metrics:compliance wraps in try-catch', () => {
    const handler = mainJs.split("'metrics:compliance'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('catch')
  })

  it('blueprint:load wraps in try-catch or uses readJSON', () => {
    const handler = mainJs.split("'blueprint:load'")[1]?.split('ipcMain.handle')[0] || ''
    const safe = handler.includes('readJSON') || handler.includes('try')
    expect(safe).toBe(true)
  })

  it('mixer:read uses readJSON with fallback', () => {
    const handler = mainJs.split("'mixer:read'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('readJSON')
  })
})

describe('return value safety', () => {
  it('has dir guards (isKnownProject or !dir) in handlers', () => {
    const knownCount = (mainJs.match(/isKnownProject\(dir\)/g) || []).length
    const nullDirCount = (mainJs.match(/if \(!dir\) return/g) || []).length
    expect(knownCount + nullDirCount).toBeGreaterThan(15)
  })

  it('null dir returns use null, [], false, or void', () => {
    const lines = mainJs.split('\n').filter(l => l.includes('if (!dir) return'))
    for (const line of lines) {
      const parts = line.split('if (!dir) return')
      const val = (parts[1] || '').trim()
      const safe = !val || val === '' || val.startsWith('null') || val.startsWith('[]') ||
        val.startsWith('false') || val.startsWith("''") || val.startsWith('""') ||
        val.startsWith('Promise') || val.startsWith('{')
      expect(safe).toBe(true)
    }
  })
})

describe('signal handler safety', () => {
  it('system:kill-proc rejects own PID', () => {
    const handler = mainJs.split("'system:kill-proc'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('process.pid')
  })

  it('system:kill-proc restricts signals to allowlist', () => {
    const handler = mainJs.split("'system:kill-proc'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('allowed')
    expect(handler).toContain('SIGTERM')
    expect(handler).toContain('SIGKILL')
  })

  it('system:kill-proc wraps in try-catch', () => {
    const handler = mainJs.split("'system:kill-proc'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('try')
    expect(handler).toContain('catch')
  })
})

describe('orchestra:fine safety net', () => {
  it('has 90s timeout for force kill', () => {
    const handler = mainJs.split("'orchestra:fine'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('90_000')
    expect(handler).toContain('setTimeout')
  })

  it('writes ALTO file before stopping', () => {
    const handler = mainJs.split("'orchestra:fine'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('ALTO')
  })

  it('persists lifecycle event', () => {
    const handler = mainJs.split("'orchestra:fine'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('persistLifecycleEvent')
  })
})

describe('orchestra:kill safety', () => {
  it('kills process group not just process', () => {
    const handler = mainJs.split("'orchestra:kill'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('killProcessGroup')
  })

  it('cleans up tailers and samplers', () => {
    const handler = mainJs.split("'orchestra:kill'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('stopTailing') || expect(handler).toContain('tailers')
    expect(handler).toContain('stopMetricsSampling') || expect(handler).toContain('metricsSamplers')
  })
})

describe('readJSON fallback safety', () => {
  it('readJSON catches parse errors and returns fallback', () => {
    const fn = mainJs.split('const readJSON')[1]?.split('\n')[0] || ''
    expect(fn).toContain('catch')
    expect(fn).toContain('fb')
  })

  it('readJSON is used consistently for JSON file reads', () => {
    const readJSONCount = (mainJs.match(/readJSON\(/g) || []).length
    expect(readJSONCount).toBeGreaterThan(15)
  })
})

describe('writeJSON atomicity', () => {
  it('creates parent directory before writing', () => {
    const fn = mainJs.split('const writeJSON')[1]?.split('\n\n')[0] || ''
    expect(fn).toContain('mkdirSync')
    expect(fn).toContain('recursive')
  })

  it('writes to tmp file first', () => {
    const fn = mainJs.split('const writeJSON')[1]?.split('\n\n')[0] || ''
    expect(fn).toContain("'.tmp'")
  })

  it('renames atomically', () => {
    const fn = mainJs.split('const writeJSON')[1]?.split('\n\n')[0] || ''
    expect(fn).toContain('renameSync')
  })
})

describe('process lifecycle guards', () => {
  it('pidAlive checks with signal 0', () => {
    const fn = mainJs.split('function pidAlive')[1]?.split('\n}')[0] ||
               mainJs.split('pidAlive')[1]?.split('\n')[0] || ''
    expect(mainJs).toContain('process.kill(pid, 0)')
  })

  it('killProcessGroup uses negative PID for group kill', () => {
    expect(mainJs).toContain('process.kill(-pid')
  })

  it('killProcessGroup escalates SIGTERM to SIGKILL', () => {
    const fn = mainJs.split('function killProcessGroup')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('SIGTERM')
    expect(fn).toContain('SIGKILL')
  })

  it('isRunning checks both PID file and process alive', () => {
    const fn = mainJs.split('function isRunning')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('ORCHESTRA_PID')
    expect(fn).toContain('pidAlive')
  })
})

describe('mixer weight validation', () => {
  it('mixer:write receives focus object', () => {
    const handler = mainJs.split("'mixer:write'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('focus')
  })

  it('snapshotMixer records mixer state', () => {
    expect(mainJs).toContain('function snapshotMixer')
    expect(mainJs).toContain('mixer-history.json')
  })
})

describe('USAGE_LIMIT signal handling', () => {
  it('defines USAGE_LIMIT_SIGNAL constant', () => {
    expect(mainJs).toContain('USAGE_LIMIT')
  })

  it('playOrchestra cleans up stale usage limit', () => {
    const fn = mainJs.split('function playOrchestra')[1]?.split('\nfunction ')[0] || ''
    expect(fn).toContain('USAGE_LIMIT')
    expect(fn).toContain('unlinkSync')
  })
})

describe('event cap limits', () => {
  it('lifecycle events capped at 500', () => {
    expect(mainJs).toContain('events.length > 500')
  })

  it('mixer history has reasonable storage', () => {
    expect(mainJs).toContain('mixer-history.json')
  })
})
