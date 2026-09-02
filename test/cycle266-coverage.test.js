// cycle266-coverage.test.js — C266 quality_tests coverage
// T-207: S-132 readFile p.length cap; S-133 lifecycleAdd p.length cap
// T-208: P-94 commit starburst for...of total; B-48 _rebalanceResources for...of inversePriorities
// T-209: F-45 hue() for...of instead of spread+reduce

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs       = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs      = readFileSync(join(root, 'renderer.js'), 'utf8')
const coordinationJs  = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')

// ─── T-207: S-132 + S-133 ────────────────────────────────────────────────────
describe('T-207: S-132 readFile p has length cap', () => {
  it('readFile rejects p longer than 4096 chars', () => {
    const body = preloadJs.split('readFile: (p, s) =>')[1]?.split('},')[0] || ''
    expect(body).toContain('p.length > 4096')
  })
})

describe('T-207: S-133 lifecycleAdd p has length cap', () => {
  it('lifecycleAdd rejects p longer than 4096 chars', () => {
    const body = preloadJs.split('lifecycleAdd:')[1]?.split('},')[0] || ''
    expect(body).toContain('p.length > 4096')
  })
})

// ─── T-208: P-94 + B-48 ──────────────────────────────────────────────────────
describe('T-208: P-94 commit starburst uses for...of for total', () => {
  it('starburst uses for...of to sum commit type total', () => {
    expect(rendererJs).toContain('let total = 0; for (const v of Object.values(cat)) total += v')
  })

  it('starburst no longer uses Object.values(cat).reduce', () => {
    expect(rendererJs).not.toContain('Object.values(cat).reduce')
  })
})

describe('T-208: B-48 _rebalance uses for...of for inversePriorities', () => {
  it('_rebalance uses for...of to build inversePriorities', () => {
    const body = coordinationJs.split('_rebalance() {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('for (const [, info] of entries)')
    expect(body).toContain('inversePriorities.push(inv)')
  })

  it('_rebalance no longer uses .map() with totalInverse side effect', () => {
    const body = coordinationJs.split('_rebalance() {')[1]?.split('\n  }')[0] || ''
    expect(body).not.toContain('entries.map(([, info])')
  })
})

// ─── T-209: F-45 hue() for...of ──────────────────────────────────────────────
describe('T-209: F-45 hue() uses for...of instead of spread+reduce', () => {
  it('hue uses for...of loop to accumulate charCodes', () => {
    expect(rendererJs).toContain('for (const c of s) h += c.charCodeAt(0)')
  })

  it('hue no longer uses spread+reduce pattern', () => {
    expect(rendererJs).not.toContain('[...s].reduce')
  })
})
