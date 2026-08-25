import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('syncProtocol function', () => {
  const block = mainJs.split('function syncProtocol')[1]?.split('\nfunction ')[0] || ''

  it('copies from orchestraSrc()', () => {
    expect(block).toContain('orchestraSrc()')
  })

  it('purges legacy files', () => {
    expect(block).toContain('LEGACY_PURGE')
    expect(block).toContain('unlinkSync')
  })

  it('copies UPGRADE_FILES to project directory', () => {
    expect(block).toContain('UPGRADE_FILES')
    expect(block).toContain('copyFileSync')
  })

  it('creates target directories recursively', () => {
    expect(block).toContain('mkdirSync')
    expect(block).toContain('recursive')
  })
})

describe('hot-reload watcher', () => {
  it('uses fs.watch on orchestraSrc', () => {
    const block = mainJs.split('startHotReloadWatcher')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('fs.watch(src')
  })

  it('debounces rapid file changes', () => {
    expect(mainJs).toContain('hotReloadDebounce')
    expect(mainJs).toContain('clearTimeout')
    expect(mainJs).toContain('setTimeout')
  })

  it('filters dotfiles', () => {
    const block = mainJs.split('startHotReloadWatcher')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain("startsWith('.')")
  })

  it('syncs to all running projects', () => {
    expect(mainJs).toContain('hotReloadAllProjects')
  })
})

describe('metrics sampling', () => {
  it('defines startMetricsSampling', () => {
    expect(mainJs).toContain('startMetricsSampling')
  })

  it('uses setInterval for periodic sampling', () => {
    const block = mainJs.split('startMetricsSampling')[0] || ''
    expect(mainJs).toContain('setInterval')
  })

  it('sends metrics:update event to renderer', () => {
    expect(mainJs).toContain("'metrics:update'")
  })
})

describe('app startup sequence', () => {
  const readyBlock = mainJs.split('app.whenReady()')[1] || ''

  it('starts hot-reload watcher on ready', () => {
    expect(readyBlock).toContain('startHotReloadWatcher')
  })

  it('re-attaches tailers for running projects on startup', () => {
    expect(readyBlock).toContain('startTailing')
  })

  it('cleans up stale USAGE_LIMIT signals on startup', () => {
    expect(readyBlock).toContain('USAGE_LIMIT')
  })

  it('checks pidAlive before re-attaching', () => {
    expect(readyBlock).toContain('pidAlive')
  })
})

describe('app shutdown sequence', () => {
  it('kills running processes on before-quit', () => {
    expect(mainJs).toContain("'before-quit'")
    expect(mainJs).toContain('killProcessGroup')
  })

  it('clears procs map on shutdown', () => {
    const quitBlock = mainJs.split("'before-quit'")[1]?.split("app.on")[0] || ''
    expect(quitBlock).toContain('procs.clear()')
  })

  it('quits on all windows closed', () => {
    expect(mainJs).toContain("'window-all-closed'")
    expect(mainJs).toContain('app.quit()')
  })
})

describe('data flow invariants', () => {
  it('orchestra.json is read/written via readJSON/writeJSON', () => {
    expect(mainJs).toContain("readJSON(path.join(dir, '.claude/orchestra.json'")
  })

  it('store path uses app.getPath(userData)', () => {
    expect(mainJs).toContain("app.getPath('userData')")
  })

  it('ORCHESTRA_PID tracks running process', () => {
    expect(mainJs).toContain('ORCHESTRA_PID')
    expect(mainJs).toMatch(/writeFileSync.*ORCHESTRA_PID/s)
  })
})
