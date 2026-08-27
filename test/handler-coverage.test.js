import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

// ── alerts:config ─────────────────────────────────────────────────────────────

describe('alerts:config handler', () => {
  const block = mainJs.split("'alerts:config'")[1]?.split("'alerts:read'")[0] || ''

  it('validates cfg is an object before mutating', () => {
    expect(block).toContain('cfg && typeof cfg === \'object\'')
  })

  it('validates stall flag is boolean', () => {
    expect(block).toContain("typeof cfg.stall === 'boolean'")
  })

  it('validates alto flag is boolean', () => {
    expect(block).toContain("typeof cfg.alto === 'boolean'")
  })

  it('validates usageLimit flag is boolean', () => {
    expect(block).toContain("typeof cfg.usageLimit === 'boolean'")
  })

  it('returns shallow copy of _alertConfig', () => {
    expect(block).toContain('{ ..._alertConfig }')
  })
})

describe('alerts:read handler', () => {
  it('returns shallow copy of _alertConfig', () => {
    const block = mainJs.split("'alerts:read'")[1]?.split('ipcMain.handle')[0] || ''
    expect(block).toContain('{ ..._alertConfig }')
  })
})

describe('_alertConfig defaults', () => {
  it('stall alert defaults to true', () => {
    expect(mainJs).toContain('{ stall: true, alto: true, usageLimit: true }')
  })

  it('uses 5-minute cooldown between repeated alerts', () => {
    expect(mainJs).toContain('300000')
  })

  it('checks Notification.isSupported() before showing', () => {
    expect(mainJs).toContain('Notification.isSupported()')
  })
})

// ── mixer:read ────────────────────────────────────────────────────────────────

describe('mixer:read handler', () => {
  const block = mainJs.split("'mixer:read'")[1]?.split("'mixer:write'")[0] || ''

  it('uses isKnownProject for dir validation', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('returns null on invalid dir', () => {
    expect(block).toContain('return null')
  })

  it('reads orchestra.json from project dir', () => {
    expect(block).toContain('.claude/orchestra.json')
  })

  it('returns null fallback for missing config', () => {
    expect(block).toContain(', null)')
  })
})

// ── mixer:write ───────────────────────────────────────────────────────────────

describe('mixer:write handler', () => {
  const block = mainJs.split("'mixer:write'")[1]?.split("'orchestra:writeConfig'")[0] || ''

  it('uses isKnownProject for dir validation', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('returns false on invalid dir', () => {
    expect(block).toContain('return false')
  })

  it('writes focus weights to orchestra.json', () => {
    expect(block).toContain('cfg.focus = focus')
    expect(block).toContain('.claude/orchestra.json')
  })

  it('invalidates coordination conflict cache after write', () => {
    expect(block).toContain('coordinator.invalidateConflictCache()')
  })

  it('uses writeJSON for atomic write', () => {
    expect(block).toContain('writeJSON(p,')
  })
})

// ── orchestra:writeConfig ─────────────────────────────────────────────────────

describe('orchestra:writeConfig handler', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split("'mixer:saved:list'")[0] || ''

  it('uses isKnownProject for dir validation', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('uses writeJSON for atomic write', () => {
    expect(block).toContain('writeJSON(p,')
  })

  it('writes to orchestra.json', () => {
    expect(block).toContain('.claude/orchestra.json')
  })
})

// ── orchestra:clearLog ────────────────────────────────────────────────────────

describe('orchestra:clearLog handler', () => {
  const block = mainJs.split("'orchestra:clearLog'")[1]?.split("'orchestra:tail'")[0] || ''

  it('uses isKnownProject for dir validation', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('truncates both stdout and master log files', () => {
    expect(block).toContain('orchestra-stdout.log')
    expect(block).toContain('orchestra.log')
  })

  it('wraps truncation in try/catch for missing files', () => {
    expect(block).toContain('try {')
    expect(block).toContain('} catch {}')
  })
})

// ── orchestra:analyze ─────────────────────────────────────────────────────────

describe('orchestra:analyze handler', () => {
  const block = mainJs.split("'orchestra:analyze'")[1]?.split('\n// ─')[0] || ''

  it('uses isKnownProject for dir validation', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('returns { report, file: null } for invalid dir', () => {
    expect(block).toContain('No project selected')
    expect(block).toContain('file: null')
  })

  it('runs git log since orchestra start', () => {
    expect(block).toContain("'git'")
    expect(block).toContain('--oneline')
    expect(block).toContain('--since')
  })

  it('uses execFile (not execSync) for git command', () => {
    expect(block).toContain('execFile(')
    expect(block).not.toContain('execSync(')
  })

  it('sets 8000ms timeout on git command', () => {
    expect(block).toContain('timeout: 8000')
  })

  it('categorizes commits by conventional prefix', () => {
    expect(block).toContain('feat|fix|test|refactor|chore|security')
  })

  it('reads ORCHESTRA_REPORT.md for compliance lines', () => {
    expect(block).toContain("'ORCHESTRA_REPORT.md'")
    expect(block).toContain('COMPLIANCE')
  })

  it('writes analysis to timestamped file in .claude/', () => {
    expect(block).toContain('analysis-')
    expect(block).toContain('.txt')
    expect(block).toContain('.claude')
  })

  it('wraps file write in try/catch', () => {
    expect(block).toContain('try { fs.writeFileSync')
  })

  it('resolves with capped report and file', () => {
    expect(block).toContain('resolve({ report: _reportCapped, file: outFile })')
  })

  it('includes mixer-history in report', () => {
    expect(block).toContain('mixer-history.json')
  })
})

// ── cachedProjects() system ───────────────────────────────────────────────────

describe('cachedProjects() — hot-reload path', () => {
  const body = mainJs.split('function hotReloadAllProjects')[1]?.split('\nfunction ')[0] || ''

  it('uses cachedProjects() not readJSON(store())', () => {
    expect(body).toContain('cachedProjects()')
    expect(body).not.toContain('readJSON(store()')
  })

  it('invalidates _defaultMixesCache on hot-reload', () => {
    expect(body).toContain('_defaultMixesCache = null')
  })
})

describe('cachedProjects() — local-img:// protocol', () => {
  const block = mainJs.split("protocol.handle('local-img'")[1]?.split('\n  })\n')[0] || ''

  it('uses cachedProjects() for allowed dir check', () => {
    expect(block).toContain('cachedProjects()')
  })

  it('adds userData path to allowed dirs', () => {
    expect(block).toContain("app.getPath('userData')")
  })

  it('returns 403 for disallowed paths', () => {
    expect(block).toContain('status: 403')
  })
})

describe('cachedProjects() — repertoire:list', () => {
  const block = mainJs.split("'repertoire:list'")[1]?.split('ipcMain.handle')[0] || ''

  it('uses cachedProjects() as base list', () => {
    expect(block).toContain('cachedProjects()')
  })

  it('augments with projectInfo() for each entry', () => {
    expect(block).toContain('projectInfo(p.path)')
  })
})
