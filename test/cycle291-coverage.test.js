// cycle291-coverage.test.js — C291 quality coverage
// T-267: S-166 persistLifecycleEvent label/message ctrl-char strip
// T-268: S-167 newCommits _cSafe ctrl-char strip; P-111 cachedProjects for-of (_rpFiltered)
// T-269: B-65 snapshotMixer for-of (_smFiltered); F-62 bpUpdateCompleteness for-of (_bpAnswered)

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-267: S-166 ────────────────────────────────────────────────────────────
describe('T-267: S-166 persistLifecycleEvent strips ctrl-chars from label and message', () => {
  it('applies narrow ctrl-char strip to _evLabel before storage', () => {
    const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain("replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '').slice(0, 128)")
  })

  it('applies narrow ctrl-char strip to _evMsgRaw before storage', () => {
    const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain("_evMsgRaw = (typeof message === 'string' ? message : String(message)).replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('does not use raw label.slice(0, 128) without strip', () => {
    const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\nfunction ')[0] || ''
    expect(block).not.toContain("label.slice(0, 128)")
  })
})

// ─── T-268: S-167 + P-111 ────────────────────────────────────────────────────
describe('T-268: S-167 pollGitCommits strips ctrl-chars from commit lines', () => {
  it('creates _cSafe with narrow ctrl-char strip from commit lines', () => {
    expect(mainJs).toContain("_cSafe = c.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '').slice(0, 256)")
  })

  it('uses _cSafe in webContents.send instead of raw c', () => {
    expect(mainJs).toContain('[commit] ${_cSafe}')
  })

  it('uses _cSafe in persistLifecycleEvent instead of raw c', () => {
    expect(mainJs).toContain("persistLifecycleEvent(dir, 'commit', 'COMMIT', _cSafe)")
  })
})

describe('T-268: P-111 cachedProjects uses for-of (_rpFiltered)', () => {
  it('uses _rpFiltered with for-of push instead of _rpData.filter()', () => {
    expect(mainJs).toContain('_rpFiltered')
    expect(mainJs).toContain('for (const p of _rpData)')
    expect(mainJs).not.toContain('_rpData = _rpData.filter(')
  })
})

// ─── T-269: B-65 + F-62 ──────────────────────────────────────────────────────
describe('T-269: B-65 snapshotMixer uses for-of (_smFiltered)', () => {
  it('uses _smFiltered with for-of push instead of hist.filter()', () => {
    const block = mainJs.split('function snapshotMixer')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('_smFiltered')
    expect(block).toContain('for (const h of hist)')
    expect(block).not.toContain('hist.filter(')
  })
})

describe('T-269: F-62 bpUpdateCompleteness uses for-of (_bpAnswered)', () => {
  it('uses _bpAnswered with for-of count instead of BP_QUESTIONS.filter().length', () => {
    expect(rendererJs).toContain('_bpAnswered')
    expect(rendererJs).not.toContain('BP_QUESTIONS.filter(q => bpState.answers[q.key]')
  })
})
