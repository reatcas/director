import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('atriles:save color field validation (S-01)', () => {
  const block = mainJs.split("'atriles:save'")[1]?.split('\nipcMain')[0] || ''

  it('validates color field with CSS-safe regex', () => {
    expect(block).toContain("a.color === undefined || (typeof a.color === 'string' && a.color.length <= 64 && /^[a-zA-Z0-9#(),. %]+$/.test(a.color))")
  })
})

describe('orchestra:writeConfig control-char guard (S-02)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('guards quietFlags for control characters', () => {
    expect(block).toContain('cfg.quietFlags')
    expect(block).toMatch(/quietFlags.*\[|cfg\.quietFlags.*test/)
  })

  it('guards version for control characters', () => {
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(cfg.version)')
  })
})

describe('snapshotMixer ISO cutoff string (P-04)', () => {
  const block = mainJs.split('function snapshotMixer')[1]?.split('\n}')[0] || ''

  it('uses ISO string cutoff instead of Date allocs', () => {
    expect(block).toContain('cutoffISO')
    expect(block).toContain("typeof h.ts === 'string' && h.ts >= cutoffISO")
  })

  it('does not use new Date().getTime() for filter comparison', () => {
    expect(block).not.toContain('new Date(h.ts).getTime()')
  })
})

describe('settingsModal/aboutModal close restores focus (I-524)', () => {
  it('closeSettings restores focus to settingsBtn', () => {
    expect(rendererJs).toContain("$('#closeSettings').onclick = () => { $('#settingsModal').hidden = true; const _stBtn = $('#settingsBtn'); if (_stBtn) _stBtn.focus()")
  })

  it('closeAbout restores focus to aboutBtn', () => {
    expect(rendererJs).toContain("$('#closeAbout').onclick = () => { $('#aboutModal').hidden = true; const _abBtn = $('#aboutBtn'); if (_abBtn) _abBtn.focus()")
  })

  it('settingsModal keydown Escape restores focus to settingsBtn', () => {
    const block = rendererJs.split("$('#settingsModal').addEventListener('keydown'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("modal.hidden = true; const _stBtn = $('#settingsBtn'); if (_stBtn) _stBtn.focus()")
  })

  it('aboutModal keydown Escape restores focus to aboutBtn', () => {
    const block = rendererJs.split("$('#aboutModal').addEventListener('keydown'")[1]?.split('\n})')[0] || ''
    expect(block).toContain("modal.hidden = true; const _abBtn = $('#aboutBtn'); if (_abBtn) _abBtn.focus()")
  })
})
