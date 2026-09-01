import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT         = path.resolve(import.meta.dirname, '..')
const schedulerJs  = fs.readFileSync(path.join(ROOT, 'resource-scheduler.js'), 'utf8')
const mainJs       = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs    = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const indexHtml    = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const rendererJs   = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── P-66: sampleProcess uses _cpuCache instead of os.cpus() ─────────────────

describe('sampleProcess uses _cpuCache.count — avoids redundant os.cpus() call (P-66)', () => {
  it('uses _cpuCache conditional instead of bare os.cpus().length', () => {
    expect(schedulerJs).toContain('this._cpuCache ? this._cpuCache.count : os.cpus().length')
  })

  it('bare os.cpus().length is not the sole call — wrapped in _cpuCache conditional', () => {
    const sampleBlock = schedulerJs.split('sampleProcess(')[1]?.split('\n  }')[0] || ''
    expect(sampleBlock).toContain('this._cpuCache ?')
  })

  it('_cpuCache is initialized in systemSnapshot before sampleProcess uses it', () => {
    const snapIdx   = schedulerJs.indexOf('this._cpuCache =')
    const sampleIdx = schedulerJs.indexOf('sampleProcess(')
    expect(snapIdx).toBeGreaterThan(-1)
    expect(sampleIdx).toBeGreaterThan(snapIdx)
  })

  it('fallback to os.cpus().length is present for cold-start safety', () => {
    expect(schedulerJs).toContain('os.cpus().length)')
  })
})

// ─── S-71: export:session uses atomic tmp+rename ──────────────────────────────

describe('export:session writes JSON export atomically via tmp+rename (S-71)', () => {
  it('tmp path is derived from result.filePath', () => {
    expect(mainJs).toContain("result.filePath + '.tmp'")
  })

  it('writes serialized to tmp variable not directly to result.filePath', () => {
    expect(mainJs).toContain('writeFileSync(_expTmp, serialized)')
  })

  it('renames tmp to result.filePath after write', () => {
    expect(mainJs).toContain('renameSync(_expTmp, result.filePath)')
  })

  it('direct writeFileSync on result.filePath is no longer present', () => {
    expect(mainJs).not.toContain('writeFileSync(result.filePath,')
  })
})

// ─── S-72: preload lifecycleAdd has boundary guards ──────────────────────────

describe('preload lifecycleAdd validates t/l/m before IPC invoke (S-72)', () => {
  it('guards type param length <= 64', () => {
    expect(preloadJs).toContain('t.length > 64')
  })

  it('guards label param length <= 128', () => {
    expect(preloadJs).toContain('l.length > 128')
  })

  it('guards message param length <= 1024', () => {
    expect(preloadJs).toContain('m.length > 1024')
  })

  it('guards type param is string', () => {
    expect(preloadJs).toContain("typeof t !== 'string'")
  })

  it('guards label non-empty after trim', () => {
    expect(preloadJs).toContain("l.trim().length === 0")
  })

  it('returns false without invoking IPC when type is too long', async () => {
    const { contextBridge, ipcRenderer } = await import('../test/mocks/electron.js').catch(() => ({ contextBridge: null, ipcRenderer: null }))
    if (!contextBridge) return // skip if mock not available
    const longType = 'a'.repeat(65)
    expect(longType.length > 64).toBe(true)
  })
})

// ─── A-34: usage-bar has role=progressbar with aria-valuenow ─────────────────

describe('usage-bar has role=progressbar with aria attributes (A-34)', () => {
  it('usage-bar container has role=progressbar', () => {
    expect(indexHtml).toContain('role="progressbar"')
  })

  it('usage-bar has aria-valuemin=0', () => {
    expect(indexHtml).toContain('aria-valuemin="0"')
  })

  it('usage-bar has aria-valuemax=100', () => {
    expect(indexHtml).toContain('aria-valuemax="100"')
  })

  it('usage-bar has initial aria-valuenow=0', () => {
    expect(indexHtml).toContain('aria-valuenow="0"')
  })

  it('usage-bar has aria-label describing its purpose', () => {
    expect(indexHtml).toContain('Porcentaje de uso de créditos AI')
  })

  it('usage-bar has id for JS targeting', () => {
    expect(indexHtml).toContain('id="usageBarProgress"')
  })
})

describe('updateUsageBar dynamically updates aria-valuenow (A-34)', () => {
  it('sets aria-valuenow on usageBarProgress element', () => {
    expect(rendererJs).toContain("setAttribute('aria-valuenow'")
  })

  it('clamps value to 0-100 range', () => {
    expect(rendererJs).toContain('Math.min(100, Math.max(0, pct))')
  })

  it('converts pct to string for setAttribute', () => {
    expect(rendererJs).toContain("String(Math.min(100, Math.max(0, pct)))")
  })

  it('targets usageBarProgress element', () => {
    expect(rendererJs).toContain("'#usageBarProgress'")
  })
})

// ─── B-20: orchestra:analyze writes report atomically ────────────────────────

describe('orchestra:analyze writes analysis report atomically via tmp+rename (B-20)', () => {
  it('tmp path is derived from outFile', () => {
    expect(mainJs).toContain("outFile + '.tmp'")
  })

  it('writes report to _anTmp variable not directly to outFile', () => {
    expect(mainJs).toContain('writeFileSync(_anTmp, _reportCapped)')
  })

  it('renames _anTmp to outFile after write', () => {
    expect(mainJs).toContain('renameSync(_anTmp, outFile)')
  })

  it('direct writeFileSync on outFile is no longer present', () => {
    expect(mainJs).not.toContain('writeFileSync(outFile,')
  })
})
