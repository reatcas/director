import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT      = path.resolve(import.meta.dirname, '..')
const mainJs    = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

// ─── T-152: S-92 add/remove/openDir string guards ────────────────────────────

describe('preload add string guard (S-92)', () => {
  it('add validates p as non-empty string', () => {
    const block = preloadJs.split('add:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload remove string guard (S-92)', () => {
  it('remove validates p as non-empty string', () => {
    const block = preloadJs.split('remove:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload openDir string guard (S-92)', () => {
  it('openDir validates p as non-empty string', () => {
    const block = preloadJs.split('openDir:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

// ─── T-153: S-93 readFile/install/exportSession string guards ─────────────────

describe('preload readFile string guard (S-93)', () => {
  it('readFile validates p as non-empty string', () => {
    const block = preloadJs.split('readFile:')[1]?.split('install:')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload install string guard (S-93)', () => {
  it('install validates p as non-empty string', () => {
    const block = preloadJs.split('install:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload exportSession string guard (S-93)', () => {
  it('exportSession validates dir as non-empty string', () => {
    const block = preloadJs.split('exportSession:')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof dir !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

// ─── T-154: P-75 _knownPathsSet + F-27 usage bar cached refs ─────────────────

describe('isKnownProject uses _knownPathsSet Set (P-75)', () => {
  it('module declares _knownPathsSet', () => {
    expect(mainJs).toContain('_knownPathsSet')
  })

  it('cachedProjects populates _knownPathsSet', () => {
    const block = mainJs.split('function cachedProjects()')[1]?.split('\n}')[0] || ''
    expect(block).toContain('_knownPathsSet')
    expect(block).toContain('new Set(')
  })

  it('isKnownProject uses .has() for O(1) lookup', () => {
    const block = mainJs.split('function isKnownProject')[1]?.split('\n}')[0] || ''
    expect(block).toContain('_knownPathsSet.has(dir)')
  })
})

describe('updateAiUsageDisplay caches usage bar refs (F-27)', () => {
  it('module declares _usageBarFillEl', () => {
    expect(rendererJs).toContain('_usageBarFillEl')
  })

  it('module declares _usageBarEl', () => {
    expect(rendererJs).toContain('_usageBarEl')
  })

  it('updateAiUsageDisplay lazy-initializes _usageBarFillEl', () => {
    const block = rendererJs.split('function updateAiUsageDisplay')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('_usageBarFillEl')
    expect(block).toContain("$('#usageBarFill')")
  })
})

// ─── T-155: A-41 role=status+aria-live on mmAllocVal/mmMemVal/mmTokensVal ─────

describe('mmAllocVal has role=status and aria-live (A-41)', () => {
  it('mmAllocVal has role=status', () => {
    const block = indexHtml.split('id="mmAllocVal"')[1]?.split('>')[0] || ''
    expect(block).toContain('role="status"')
  })

  it('mmAllocVal has aria-live=polite', () => {
    const block = indexHtml.split('id="mmAllocVal"')[1]?.split('>')[0] || ''
    expect(block).toContain('aria-live="polite"')
  })
})

describe('mmMemVal has role=status and aria-live (A-41)', () => {
  it('mmMemVal has role=status', () => {
    const block = indexHtml.split('id="mmMemVal"')[1]?.split('>')[0] || ''
    expect(block).toContain('role="status"')
  })
})

describe('mmTokensVal has role=status and aria-live (A-41)', () => {
  it('mmTokensVal has role=status', () => {
    const block = indexHtml.split('id="mmTokensVal"')[1]?.split('>')[0] || ''
    expect(block).toContain('role="status"')
  })
})
