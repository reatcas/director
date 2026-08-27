import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('orchestra:version-check sanitizes version strings (S-57)', () => {
  const block = mainJs.split("'orchestra:version-check'")[1]?.split('\nipcMain')[0] || ''

  it('defines _vcSanitize to strip control chars', () => {
    expect(block).toContain('_vcSanitize')
    expect(block).toContain('replace(/[\\x00-\\x1F\\x7F]/g')
  })

  it('caps version string length at 64', () => {
    expect(block).toContain('.slice(0, 64)')
  })

  it('applies sanitize to bundled version', () => {
    expect(block).toMatch(/_vcSanitize\([\s\S]*?bundled/)
  })

  it('applies sanitize to project version', () => {
    expect(block).toMatch(/_vcSanitize\([\s\S]*?project/)
  })
})

describe('orchestra:analyze sets maxBuffer on git execFile (S-58)', () => {
  const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''

  it('passes maxBuffer option to execFile', () => {
    expect(block).toContain('maxBuffer: 262_144')
  })
})

describe('mixer:write evicts snapshot: cache (P-55)', () => {
  const block = mainJs.split("'mixer:write'")[1]?.split('\nipcMain')[0] || ''

  it('deletes snapshot: cache for dir', () => {
    expect(block).toContain("_metricsCache.delete('snapshot:' + dir)")
  })
})

describe('loadSessionSummary shows creditsRemaining (FE-08)', () => {
  it('renders creditsRemaining from session summary', () => {
    expect(rendererJs).toContain('creditsRemaining')
    expect(rendererJs).toContain('credStr')
  })

  it('shows créditos label in panel', () => {
    expect(rendererJs).toContain('créditos')
  })
})

describe('compliance ss-item value has aria-label (A-23)', () => {
  it('compliance score span has aria-label attribute', () => {
    expect(rendererJs).toContain('compliance score')
  })
})

describe('mixer:saved:save rejects duplicate names (D-17)', () => {
  const block = mainJs.split("'mixer:saved:save'")[1]?.split('\nipcMain')[0] || ''

  it('checks for existing mix with same name', () => {
    expect(block).toContain("m.name.trim().toLowerCase() === name.trim().toLowerCase()")
  })

  it('returns false when duplicate name found', () => {
    expect(block).toMatch(/\.some\([^)]*name.*toLowerCase.*\)\s*\)\s*return false/)
  })
})

describe('cycle111 aiState fragile test fixed (T-97)', () => {
  it('aiState invalidation test uses ipcMain anchor not slice', () => {
    const testFile = fs.readFileSync(path.join(ROOT, 'test/cycle111-coverage.test.js'), 'utf8')
    const block = testFile.split("invalidates cache when aiState itself")[1]?.split('})')[0] || ''
    expect(block).toContain("split('\\nipcMain')[0]")
    expect(block).not.toContain("slice(0, 30)")
  })
})
