// cycle285-coverage.test.js — C285 quality coverage
// T-255: S-158 blueprint:generate-brief mod.name/desc/notes _bpInline
// T-256: S-159 ai:auth-status email ctrl-char strip
// T-257: P-107 particles for loop; B-61 hooks??{}; F-58 maxIterations/notesRead??

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-255: S-158 ────────────────────────────────────────────────────────────
describe('T-255: S-158 blueprint:generate-brief wraps mod.name in _bpInline', () => {
  it('uses _bpInline(mod.name) for module heading', () => {
    const block = mainJs.split("'blueprint:generate-brief'")[1]?.split("'blueprint:readiness'")[0] || ''
    expect(block).toContain('_bpInline(mod.name)')
    expect(block).not.toContain('`### ${mod.name}`')
  })

  it('uses _bpInline(mod.description) for module description line', () => {
    const block = mainJs.split("'blueprint:generate-brief'")[1]?.split("'blueprint:readiness'")[0] || ''
    expect(block).toContain('_bpInline(mod.description)')
  })

  it('uses _bpInline(mod.notes) for module notes line', () => {
    const block = mainJs.split("'blueprint:generate-brief'")[1]?.split("'blueprint:readiness'")[0] || ''
    expect(block).toContain('_bpInline(mod.notes)')
  })
})

// ─── T-256: S-159 ────────────────────────────────────────────────────────────
describe('T-256: S-159 ai:auth-status strips control chars from email', () => {
  it('applies replace(/[\\x00-\\x1F\\x7F]/g) to email before returning', () => {
    const block = mainJs.split("'ai:auth-status'")[1]?.split("'ai:write-credits'")[0] || ''
    expect(block).toContain("_emailRaw.replace(/[\\x00-\\x1F\\x7F]/g, '').slice(0, 254)")
  })

  it('does not assign raw regex match directly to email', () => {
    const block = mainJs.split("'ai:auth-status'")[1]?.split("'ai:write-credits'")[0] || ''
    expect(block).not.toContain('const email = (out.match(')
  })
})

// ─── T-257: P-107 + B-61 + F-58 ─────────────────────────────────────────────
describe('T-257: P-107 initParticles uses for loop instead of Array.from', () => {
  it('uses for loop with _pi variable for particle creation', () => {
    expect(rendererJs).toContain('for (let _pi = 0; _pi < N; _pi++) particles.push({')
    expect(rendererJs).not.toContain('Array.from({ length: N }')
  })
})

describe('T-257: B-61 copyDir hooks merge uses ?? instead of ||', () => {
  it('uses a.hooks ?? {} instead of a.hooks || {}', () => {
    const block = mainJs.split('function copyDir')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('a.hooks = a.hooks ?? {}')
    expect(block).not.toContain('a.hooks = a.hooks || {}')
  })

  it('uses b.hooks ?? {} instead of b.hooks || {}', () => {
    const block = mainJs.split('function copyDir')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('b.hooks ?? {}')
    expect(block).not.toContain('b.hooks || {}')
  })

  it('uses a.hooks[k] ?? [] instead of a.hooks[k] || []', () => {
    const block = mainJs.split('function copyDir')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('a.hooks[k] ?? []')
    expect(block).not.toContain('a.hooks[k] || []')
  })
})

describe('T-257: F-58 settings render uses ?? for maxIterations and notesRead', () => {
  it('uses cfg.maxIterations ?? 0 instead of || 0', () => {
    expect(rendererJs).toContain('cfg.maxIterations ?? 0')
    expect(rendererJs).not.toContain('cfg.maxIterations || 0')
  })

  it('uses notesRead(current) ?? \'\' instead of || \'\'', () => {
    expect(rendererJs).toContain("window.director.notesRead(current) ?? ''")
    expect(rendererJs).not.toContain("window.director.notesRead(current) || ''")
  })
})
