import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('getClaudeUsage caching', () => {
  it('has usage cache with 25s TTL', () => {
    expect(mainJs).toContain('usageTracker')
    expect(mainJs).toMatch(/25[_0]*\b/)
  })

  it('checks runStarted timestamp for iter counting', () => {
    const fn = mainJs.split('function getClaudeUsage')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('RUN_STARTED')
    expect(fn).toContain('mtimeMs')
  })

  it('estimates tokens from byte count', () => {
    expect(mainJs).toContain('totalBytes / 4')
  })

  it('calculates cost estimate', () => {
    expect(mainJs).toContain('0.000003')
    expect(mainJs).toContain('estCost')
  })

  it('returns status levels: critical, high, mid, normal', () => {
    const fn = mainJs.split('function getClaudeUsage')[1]?.split('\n}')[0] || ''
    expect(fn).toContain("'critical'")
    expect(fn).toContain("'high'")
    expect(fn).toContain("'mid'")
    expect(fn).toContain("'normal'")
  })

  it('caps percent at 99', () => {
    expect(mainJs).toContain('Math.min(99')
  })
})

describe('parseComplianceLine', () => {
  it('extracts COMPLIANCE regex with DRIFT and TESTS groups', () => {
    expect(mainJs).toContain('COMPLIANCE\\s+(.+?)(?:\\s+DRIFT:(.*?))?(?:\\s+TESTS:(\\w+))?$')
  })

  it('parses category ratios A/P format', () => {
    expect(mainJs).toContain("p.match(/([^:]+):(\\d+)\\/(\\d+)/)")
  })

  it('calculates score as percentage', () => {
    const fn = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('totalActual / totalPlanned * 100')
  })

  it('caps actual at planned to prevent >100% scores', () => {
    expect(mainJs).toContain('Math.min(actual, planned)')
  })

  it('returns null for non-matching lines', () => {
    const fn = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('if (!m) return null')
  })

  it('defaults drift to none and tests to unknown', () => {
    const fn = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''
    expect(fn).toContain("'none'")
    expect(fn).toContain("'unknown'")
  })
})

describe('metrics:compliance handler', () => {
  it('reads ORCHESTRA_REPORT.md', () => {
    const handler = mainJs.split("'metrics:compliance'")[1]?.split('})')[0] || ''
    expect(handler).toContain('ORCHESTRA_REPORT.md')
  })

  it('returns last 10 compliance lines', () => {
    expect(mainJs).toContain('slice(-10)')
  })

  it('calculates average score', () => {
    const handler = mainJs.split("'metrics:compliance'")[1]?.split('})')[0] || ''
    expect(handler).toContain('_rawSum')
    expect(handler).toContain('scores.length')
  })

  it('returns null on error or missing file', () => {
    const handler = mainJs.split("'metrics:compliance'")[1]?.split('})')[0] || ''
    expect(handler).toContain('catch')
    expect(handler).toContain('return null')
  })
})

describe('metrics:roadmap-freshness handler', () => {
  it('uses git log to get last commit timestamp', () => {
    const handler = mainJs.split("'metrics:roadmap-freshness'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('git')
    expect(handler).toContain("'--format=%ct'")
  })

  it('calculates staleHours from commit vs mtime delta', () => {
    const handler = mainJs.split("'metrics:roadmap-freshness'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('staleHours')
    expect(handler).toContain('3_600_000')
  })

  it('considers stale after 24 hours', () => {
    expect(mainJs).toContain('staleHours > 24')
  })
})

describe('syncProtocol', () => {
  it('purges legacy backup files', () => {
    expect(mainJs).toContain('LEGACY_PURGE')
    expect(mainJs).toContain('.bak')
  })

  it('copies from orchestraSrc to project dir', () => {
    const fn = mainJs.split('function syncProtocol')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('orchestraSrc()')
    expect(fn).toContain('copyFileSync')
  })

  it('creates directories recursively', () => {
    const fn = mainJs.split('function syncProtocol')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('mkdirSync')
    expect(fn).toContain('recursive')
  })
})

describe('orchestra:version-check handler', () => {
  it('reads ORCHESTRA_VERSION from both bundled and project', () => {
    const handler = mainJs.split("'orchestra:version-check'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('ORCHESTRA_VERSION')
    expect(handler).toContain('bundled')
    expect(handler).toContain('project')
  })

  it('returns needsUpgrade flag', () => {
    const handler = mainJs.split("'orchestra:version-check'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('needsUpgrade')
  })
})

describe('orchestra:upgrade handler', () => {
  it('uses UPGRADE_FILES list', () => {
    expect(mainJs).toContain('UPGRADE_FILES')
  })

  it('includes all key protocol files', () => {
    const upgradeBlock = mainJs.split('UPGRADE_FILES = [')[1]?.split(']')[0] || ''
    expect(upgradeBlock).toContain('CLAUDE.md')
    expect(upgradeBlock).toContain('run.sh')
    expect(upgradeBlock).toContain('loop.md')
    expect(upgradeBlock).toContain('ORCHESTRA_VERSION')
  })
})

describe('orchestra:analyze handler', () => {
  const handler = mainJs.split("'orchestra:analyze'")[1]?.split('ipcMain.handle')[0] || ''

  it('reads RUN_STARTED timestamp', () => {
    expect(handler).toContain('RUN_STARTED')
  })

  it('uses execFile not execSync for git log', () => {
    expect(handler).toContain('execFile')
    expect(handler).not.toContain('execSync')
  })

  it('classifies commits by conventional type', () => {
    expect(handler).toContain('feat|fix|test|refactor|chore|security|sec|perf|docs|style|i18n')
  })

  it('includes all state files in report', () => {
    expect(handler).toContain('ORCHESTRA_REPORT.md')
    expect(handler).toContain('ROADMAP.md')
    expect(handler).toContain('PENDING.md')
    expect(handler).toContain('PLAN.md')
    expect(handler).toContain('mixer-history.json')
  })

  it('limits report sections to prevent huge output', () => {
    expect(handler).toContain('slice(-150)')
    expect(handler).toContain('slice(-80)')
    expect(handler).toContain('slice(-60)')
  })

  it('writes analysis to timestamped file', () => {
    expect(handler).toContain('analysis-')
    expect(handler).toContain('Date.now()')
  })
})

describe('metrics sampling lifecycle', () => {
  it('samples every 30 seconds', () => {
    expect(mainJs).toContain('30_000')
    expect(mainJs).toContain('setInterval')
  })

  it('pushes metrics via webContents.send', () => {
    const fn = mainJs.split('function startMetricsSampling')[1]?.split('\n}')[0] || ''
    expect(fn).toContain("win.webContents.send('metrics:update'")
  })

  it('includes all metric types in update', () => {
    const fn = mainJs.split('function startMetricsSampling')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('resource:')
    expect(fn).toContain('context:')
    expect(fn).toContain('coordination:')
    expect(fn).toContain('claudeUsage:')
  })

  it('checks win is not destroyed before sending', () => {
    const fn = mainJs.split('function startMetricsSampling')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('isDestroyed()')
  })

  it('stopMetricsSampling clears interval', () => {
    const fn = mainJs.split('function stopMetricsSampling')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('clearInterval')
    expect(fn).toContain('delete')
  })
})

describe('persistLifecycleEvent', () => {
  it('caps events at 500', () => {
    expect(mainJs).toContain('.length > 500')
    expect(mainJs).toContain('splice(0, ')
  })

  it('stores ISO timestamp', () => {
    const fn = mainJs.split('function persistLifecycleEvent')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('toISOString()')
  })

  it('creates log directory recursively', () => {
    const fn = mainJs.split('function persistLifecycleEvent')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('mkdirSync')
    expect(fn).toContain('recursive')
  })

  it('uses writeJSON for atomic persistence', () => {
    const fn = mainJs.split('function persistLifecycleEvent')[1]?.split('\n}')[0] || ''
    expect(fn).toContain('writeJSON')
  })
})

describe('playOrchestra process management', () => {
  it('spawns with detached:true for process group', () => {
    expect(mainJs).toContain('detached: true')
  })

  it('passes DIRECTOR_AI_AGENT env variable', () => {
    expect(mainJs).toContain('DIRECTOR_AI_AGENT')
  })

  it('stores process in procs Map', () => {
    expect(mainJs).toMatch(/procs\s*\.set/)
  })

  it('starts tailing and metrics in playOrchestra', () => {
    const fn = mainJs.split('function playOrchestra')[1]?.split('\nfunction ')[0] || ''
    expect(fn).toContain('startTailing')
    expect(fn).toContain('startMetricsSampling')
  })

  it('registers with coordinator in playOrchestra', () => {
    const fn = mainJs.split('function playOrchestra')[1]?.split('\nfunction ')[0] || ''
    expect(fn).toContain('coordinator.register')
  })
})

describe('log tailing safety', () => {
  it('limits read buffer to 64KB per poll', () => {
    expect(mainJs).toContain('65536')
  })

  it('detects orphaned tailers via staleCount', () => {
    expect(mainJs).toContain('staleCount')
  })

  it('checks if process is alive before declaring orphan', () => {
    const fn = mainJs.split('function startTailing')[1]?.split('\nfunction ')[0] || ''
    expect(fn).toContain('isRunning')
  })
})

describe('hot-reload watcher', () => {
  it('watches resources/orchestra directory', () => {
    expect(mainJs).toContain("resources', 'orchestra'")
    expect(mainJs).toContain('fs.watch')
  })

  it('syncs to all projects on file change', () => {
    expect(mainJs).toContain('syncProtocol')
  })
})

describe('readJSON / writeJSON helpers', () => {
  it('readJSON returns fallback on error', () => {
    const fn = mainJs.split('const readJSON')[1]?.split('\n')[0] || ''
    expect(fn).toContain('catch')
    expect(fn).toContain('fb')
  })

  it('writeJSON uses atomic tmp+rename', () => {
    const fn = mainJs.split('const writeJSON')[1]?.split('\nconst ')[0] || mainJs.split('const writeJSON')[1]?.split('\n\n')[0] || ''
    expect(fn).toContain("'.tmp'")
    expect(fn).toContain('renameSync')
  })
})
