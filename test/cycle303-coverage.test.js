// cycle303-coverage.test.js — C303 quality coverage
// T-291: S-182 export:session roadmap/plan/pending strip; S-183 analyzer mixer-history strip
// T-292: P-119 particles.entries() outer loop; B-73 nextAvailableAi _rotated slice for-of
// T-293: F-70 glowCache for-of instead of forEach

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs       = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs   = readFileSync(join(root, 'renderer.js'), 'utf8')
const mixerGraphJs = readFileSync(join(root, 'mixer-graph.js'), 'utf8')

// ─── T-291: S-182 + S-183 ────────────────────────────────────────────────────
describe('T-291: S-182 export:session strips ctrl-chars from roadmap/plan/pending', () => {
  it('roadmap read has narrow ctrl-char strip', () => {
    const block = mainJs.split('export:session')[1]?.split('serialized')[0] || ''
    expect(block).toContain("read('ROADMAP.md').replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('plan read has narrow ctrl-char strip', () => {
    const block = mainJs.split('export:session')[1]?.split('serialized')[0] || ''
    expect(block).toContain("read('PLAN.md').replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('pending read has narrow ctrl-char strip', () => {
    const block = mainJs.split('export:session')[1]?.split('serialized')[0] || ''
    expect(block).toContain("read('PENDING.md').replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })
})

describe('T-291: S-183 orchestra:analyze strips ctrl-chars from mixer-history.json', () => {
  it('mixer-history.json read in analyze report has narrow strip', () => {
    const block = mainJs.split('mixer-history.json ---')[1]?.split('outFile')[0] || ''
    expect(block).toContain("read('.claude/mixer-history.json').replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })
})

// ─── T-292: P-119 + B-73 ─────────────────────────────────────────────────────
describe('T-292: P-119 particles connection loop uses entries() on outer iteration', () => {
  it('uses for(const [i, pi] of particles.entries())', () => {
    expect(rendererJs).toContain('for (const [i, pi] of particles.entries())')
  })

  it('uses pi.x and pi.y instead of particles[i].x', () => {
    const block = rendererJs.split('particles.entries()')[0]?.split('draw()')[1] || ''
    expect(rendererJs).toContain('pi.x')
    expect(rendererJs).toContain('pi.color')
  })

  it('does not use particles[i] in connection loop', () => {
    const block = rendererJs.split('particles.entries()')[1]?.split('for (const p of particles)')[0] || ''
    expect(block).not.toContain('particles[i]')
  })
})

describe('T-292: B-73 nextAvailableAi uses rotated slice + for-of', () => {
  it('uses _rotated slice spread instead of modular arithmetic loop', () => {
    const block = mainJs.split('function nextAvailableAi')[1]?.split('function nextReset')[0] || ''
    expect(block).toContain('const _rotated = [...providers.slice(start + 1), ...providers.slice(0, start + 1)]')
    expect(block).toContain('for (const candidate of _rotated)')
  })

  it('does not use offset-based modular arithmetic loop', () => {
    const block = mainJs.split('function nextAvailableAi')[1]?.split('function nextReset')[0] || ''
    expect(block).not.toContain('for (let offset = 1; offset <= providers.length; offset++)')
    expect(block).not.toContain('providers.length) % providers.length')
  })
})

// ─── T-293: F-70 ─────────────────────────────────────────────────────────────
describe('T-293: F-70 glowCache uses for-of instead of forEach', () => {
  it('uses for(const t of glowCache) instead of glowCache.forEach', () => {
    expect(mixerGraphJs).toContain('for (const t of glowCache) { if (t.dispose) t.dispose() }')
  })

  it('does not use glowCache.forEach', () => {
    expect(mixerGraphJs).not.toContain('glowCache.forEach')
  })
})
