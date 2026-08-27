import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

// ── isKnownProject ────────────────────────────────────────────────────────────

describe('isKnownProject — helper definition', () => {
  it('is defined as a function', () => {
    expect(mainJs).toContain('function isKnownProject(dir)')
  })

  it('rejects falsy dir immediately', () => {
    const body = mainJs.split('function isKnownProject')[1]?.split('\n}')[0] || ''
    expect(body).toContain('if (!dir || typeof dir !==')
    expect(body).toContain('return false')
  })

  it('uses cachedProjects() not readJSON(store()) directly', () => {
    const body = mainJs.split('function isKnownProject')[1]?.split('\n}')[0] || ''
    expect(body).toContain('cachedProjects()')
    expect(body).not.toContain('readJSON(store()')
  })

  it('checks p.path === dir for membership', () => {
    const body = mainJs.split('function isKnownProject')[1]?.split('\n}')[0] || ''
    expect(body).toContain("p.path === dir")
  })
})

describe('isKnownProject — project cache', () => {
  it('defines _projectsCache module-level variable', () => {
    expect(mainJs).toContain('let _projectsCache = null')
  })

  it('defines invalidateProjectsCache that nulls the cache', () => {
    expect(mainJs).toContain('function invalidateProjectsCache() { _projectsCache = null }')
  })

  it('defines cachedProjects that populates on first call', () => {
    expect(mainJs).toContain('function cachedProjects()')
    expect(mainJs).toContain('_projectsCache || (_projectsCache = readJSON(store(), []))')
  })

  it('repertoire:add calls invalidateProjectsCache after write', () => {
    const block = mainJs.split("'repertoire:add'")[1]?.split('ipcMain.handle')[0] || ''
    expect(block).toContain('invalidateProjectsCache()')
  })

  it('repertoire:remove calls invalidateProjectsCache after write', () => {
    const block = mainJs.split("'repertoire:remove'")[1]?.split('ipcMain.handle')[0] || ''
    expect(block).toContain('invalidateProjectsCache()')
  })
})

// ── notes:read ────────────────────────────────────────────────────────────────

describe('notes:read handler', () => {
  const block = mainJs.split("'notes:read'")[1]?.split("'notes:write'")[0] || ''

  it('uses isKnownProject to validate dir', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('returns empty string on validation failure', () => {
    expect(block).toContain("return ''")
  })

  it('reads from .claude/OPERATOR_NOTES.md', () => {
    expect(block).toContain('OPERATOR_NOTES.md')
  })

  it('wraps readFileSync in try/catch for missing file', () => {
    expect(block).toContain('try {')
    expect(block).toContain('} catch {')
  })
})

// ── notes:write ───────────────────────────────────────────────────────────────

describe('notes:write handler', () => {
  const block = mainJs.split("'notes:write'")[1]?.split('ipcMain.handle')[0] || ''

  it('uses isKnownProject for dir validation', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('validates content is a string', () => {
    expect(block).toContain("typeof content !== 'string'")
  })

  it('enforces 50000 char content length limit', () => {
    expect(block).toContain('content.length > 50000')
  })

  it('writes to .claude/OPERATOR_NOTES.md', () => {
    expect(block).toContain('OPERATOR_NOTES.md')
  })

  it('uses atomic write (tmp + rename)', () => {
    expect(block).toContain('.tmp')
    expect(block).toContain('renameSync')
  })

  it('persists first 80 chars as lifecycle event', () => {
    expect(block).toContain('persistLifecycleEvent')
    expect(block).toContain('.slice(0, 80)')
  })
})

// ── export:session ────────────────────────────────────────────────────────────

describe('export:session handler — structure', () => {
  const block = mainJs.split("'export:session'")[1]?.split('\n// ─')[0] || ''

  it('returns { ok: false } for missing dir', () => {
    expect(block).toContain('if (!dir) return { ok: false }')
  })

  it('assembles snapshot with exportedAt timestamp', () => {
    expect(block).toContain('exportedAt: new Date().toISOString()')
  })

  it('includes project name from path.basename', () => {
    expect(block).toContain('project: path.basename(dir)')
  })

  it('includes projectPath for reference', () => {
    expect(block).toContain('projectPath: dir')
  })

  it('reads lifecycle events from JSON', () => {
    expect(block).toContain('lifecycle-events.json')
  })

  it('reads mixer configuration', () => {
    expect(block).toContain('.claude/orchestra.json')
    expect(block).toContain('mixerConfig')
  })

  it('reads mixer history', () => {
    expect(block).toContain('mixer-history.json')
    expect(block).toContain('mixerHistory')
  })

  it('includes claude usage data', () => {
    expect(block).toContain('claudeUsage: getClaudeUsage(dir)')
  })

  it('filters ORCHESTRA_REPORT.md for COMPLIANCE lines', () => {
    expect(block).toContain('ORCHESTRA_REPORT.md')
    expect(block).toContain("includes('COMPLIANCE')")
  })

  it('includes ROADMAP, PLAN, PENDING state files', () => {
    expect(block).toContain("read('ROADMAP.md')")
    expect(block).toContain("read('PLAN.md')")
    expect(block).toContain("read('PENDING.md')")
  })

  it('shows save dialog with JSON filter', () => {
    expect(block).toContain("showSaveDialog")
    expect(block).toContain("extensions: ['json']")
  })

  it('returns { ok: false } when dialog is canceled', () => {
    expect(block).toContain('result.canceled')
    expect(block).toContain('return { ok: false }')
  })

  it('returns { ok: true, path } on success', () => {
    expect(block).toContain("ok: true")
    expect(block).toContain('path: result.filePath')
  })

  it('writes snapshot as formatted JSON', () => {
    expect(block).toContain('JSON.stringify(snapshot, null, 2)')
  })
})

describe('export:session handler — default filename', () => {
  it('includes project name in default filename', () => {
    const block = mainJs.split("'export:session'")[1]?.split('\n// ─')[0] || ''
    expect(block).toContain('director-session-')
    expect(block).toContain('snapshot.project')
  })

  it('uses documents folder as default save location', () => {
    const block = mainJs.split("'export:session'")[1]?.split('\n// ─')[0] || ''
    expect(block).toContain("app.getPath('documents')")
  })
})

// ── handler consistency across notes + lifecycle ───────────────────────────────

describe('dir validation consistency across handlers', () => {
  const handlers = [
    { channel: 'notes:read',     end: "'notes:write'" },
    { channel: 'notes:write',    end: 'ipcMain.handle' },
    { channel: 'lifecycle:list', end: "'lifecycle:add'" },
    { channel: 'lifecycle:add',  end: 'ipcMain.handle' },
  ]

  for (const { channel, end } of handlers) {
    it(`'${channel}' uses isKnownProject for dir validation`, () => {
      const block = mainJs.split(`'${channel}'`)[1]?.split(end)[0] || ''
      expect(block).toContain('isKnownProject(dir)')
    })
  }
})
