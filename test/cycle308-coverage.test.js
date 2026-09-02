// cycle308-coverage.test.js — C308 quality coverage
// T-300: S-188 export:session mixerHistory ts strip; S-189 blueprint:load answer/module strip
// T-301: P-122 particles.slice inner loop; B-76 _azCommits.length in analyze
// T-302: F-73 Object.entries hooks copyDir merge

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-300: S-188 + S-189 ────────────────────────────────────────────────────
describe('T-300: S-188 export:session mixerHistory strips ts alongside event', () => {
  it('pushes spread entry with ts stripped', () => {
    const block = mainJs.split("'export:session'")[1]?.split("'orchestra:analyze'")[0] || ''
    expect(block).toContain("ts: e.ts.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('still strips event field alongside ts', () => {
    const block = mainJs.split("'export:session'")[1]?.split("'orchestra:analyze'")[0] || ''
    expect(block).toContain("event: e.event.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })
})

describe('T-300: S-189 blueprint:load strips ctrl-chars from answers and modules', () => {
  it('defines _bpStrip helper in blueprint:load', () => {
    const block = mainJs.split("'blueprint:load'")[1]?.split("'blueprint:save'")[0] || ''
    expect(block).toContain('_bpStrip')
    expect(block).toContain(".replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('iterates answers with Object.entries and applies strip', () => {
    const block = mainJs.split("'blueprint:load'")[1]?.split("'blueprint:save'")[0] || ''
    expect(block).toContain('Object.entries(data.answers)')
    expect(block).toContain('data.answers[k] = _bpStrip(v)')
  })

  it('strips module name, description and notes', () => {
    const block = mainJs.split("'blueprint:load'")[1]?.split("'blueprint:save'")[0] || ''
    expect(block).toContain('m.name = _bpStrip(m.name)')
    expect(block).toContain('m.description = _bpStrip(m.description)')
    expect(block).toContain('m.notes = _bpStrip(m.notes)')
  })
})

// ─── T-301: P-122 + B-76 ─────────────────────────────────────────────────────
describe('T-301: P-122 particle inner loop uses particles.slice(i+1) for-of', () => {
  it('uses for-of particles.slice(i+1) in particle connection loop', () => {
    expect(rendererJs).toContain('for (const pj of particles.slice(i + 1))')
  })

  it('no longer uses indexed for(let j=i+1;j<particles.length;j++)', () => {
    expect(rendererJs).not.toContain('for (let j = i + 1; j < particles.length; j++)')
  })
})

describe('T-301: B-76 orchestra:analyze uses _azCommits.length not commits.length', () => {
  it('uses _azCommits.length in analyze report', () => {
    expect(mainJs).toContain('Commits since start: ${_azCommits.length}')
  })

  it('no longer references undefined commits.length', () => {
    expect(mainJs).not.toContain('Commits since start: ${commits.length}')
  })
})

// ─── T-302: F-73 ─────────────────────────────────────────────────────────────
describe('T-302: F-73 copyDir settings.json hooks merge uses Object.entries', () => {
  it('uses Object.entries for hooks merge in copyDir', () => {
    expect(mainJs).toContain('for (const [k, v] of Object.entries(b.hooks ?? {}))')
  })

  it('uses v directly instead of b.hooks[k]', () => {
    const block = mainJs.split('function copyDir')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('...v]')
    expect(block).not.toContain('...b.hooks[k]')
  })

  it('no longer uses Object.keys(b.hooks) in copyDir', () => {
    const block = mainJs.split('function copyDir')[1]?.split('\nfunction ')[0] || ''
    expect(block).not.toContain('Object.keys(b.hooks')
  })
})
