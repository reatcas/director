// cycle297-coverage.test.js — C297 quality coverage
// T-279: S-174 repertoire:readFile ctrl-char strip; S-175 mixer:history event strip
// T-280: P-115 _lgFiltered for-of; B-69 sectionMap/nodeMap for-of Map.set
// T-281: F-66 mixer-graph.js || → ?? batch

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs      = readFileSync(join(root, 'main.js'), 'utf8')
const mixerGraphJs = readFileSync(join(root, 'mixer-graph.js'), 'utf8')

// ─── T-279: S-174 + S-175 ────────────────────────────────────────────────────
describe('T-279: S-174 repertoire:readFile strips ctrl-chars from returned content', () => {
  it('applies narrow ctrl-char strip to readFileSync result before returning', () => {
    const block = mainJs.split("'repertoire:readFile'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain(".replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('strip is applied on the readFileSync return value', () => {
    const block = mainJs.split("'repertoire:readFile'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("readFileSync(p, 'utf8').replace(")
  })
})

describe('T-279: S-175 mixer:history strips ctrl-chars from h.event before push', () => {
  it('pushes object with event field stripped of ctrl-chars', () => {
    const block = mainJs.split("'mixer:history'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain("h.event.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, '')")
  })

  it('uses spread to copy entry with sanitized event', () => {
    const block = mainJs.split("'mixer:history'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('{ ...h, event:')
  })
})

// ─── T-280: P-115 + B-69 ─────────────────────────────────────────────────────
describe('T-280: P-115 mixer-graph _lgFiltered for-of instead of links.filter', () => {
  it('uses _lgFiltered variable', () => {
    expect(mixerGraphJs).toContain('_lgFiltered')
  })

  it('no longer calls _gData.links.filter', () => {
    expect(mixerGraphJs).not.toContain('_gData.links.filter(')
  })

  it('assigns _gData.links = _lgFiltered', () => {
    expect(mixerGraphJs).toContain('_gData.links = _lgFiltered')
  })
})

describe('T-280: B-69 mixer-graph sectionMap built with for-of Map.set', () => {
  it('sectionMap uses for-of instead of new Map(_sections.map)', () => {
    expect(mixerGraphJs).not.toContain('new Map(_sections.map(')
    expect(mixerGraphJs).toContain('_sectionMap.set(')
  })

  it('nodeMap uses for-of instead of new Map(_gData.nodes.map)', () => {
    expect(mixerGraphJs).not.toContain('new Map(_gData.nodes.map(')
    expect(mixerGraphJs).toContain('_nodeMap.set(')
  })
})

// ─── T-281: F-66 ─────────────────────────────────────────────────────────────
describe('T-281: F-66 mixer-graph uses ?? instead of || for node/cfg lookups', () => {
  it('node.weight uses ?? 0 not || 0', () => {
    expect(mixerGraphJs).toContain('node.weight ?? 0')
    expect(mixerGraphJs).not.toContain('node.weight || 0')
  })

  it('node.color uses ?? not || for default color fallback', () => {
    expect(mixerGraphJs).toContain("node.color ?? '#888888'")
    expect(mixerGraphJs).not.toContain("node.color || '#888888'")
  })

  it('node.color uses ?? for glow color fallback', () => {
    expect(mixerGraphJs).toContain("node.color ?? '#00ffee'")
    expect(mixerGraphJs).not.toContain("node.color || '#00ffee'")
  })

  it('cfg.rings uses ?? []', () => {
    expect(mixerGraphJs).toContain('cfg.rings ?? []')
    expect(mixerGraphJs).not.toContain('cfg.rings || []')
  })

  it('sections parameter uses ?? []', () => {
    expect(mixerGraphJs).toContain('sections ?? []')
    expect(mixerGraphJs).not.toContain('sections || []')
  })

  it('focus parameter uses ?? {}', () => {
    expect(mixerGraphJs).toContain('focus ?? {}')
    expect(mixerGraphJs).not.toContain('focus || {}')
  })
})
