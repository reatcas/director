import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('lifecycle:list before cursor length cap (S-31)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split("'lifecycle:add'")[0] || ''

  it('caps before cursor at 64 chars', () => {
    expect(block).toContain('before.length <= 64')
  })

  it('validates before with ISO date pattern', () => {
    expect(block).toContain('/^\\d{4}-\\d{2}-\\d{2}T/')
    expect(block).toContain('_llBefore')
  })
})

describe('atriles:save path.isAbsolute guard (S-32)', () => {
  const block = mainJs.split("'atriles:save'")[1]?.split("'blueprint:load'")[0] || ''

  it('rejects relative paths with path.isAbsolute', () => {
    expect(block).toContain('path.isAbsolute(a.path)')
  })

  it('returns false for non-absolute paths', () => {
    expect(block).toContain('return false')
  })
})

describe('periodic cache eviction for _orchJsonCache and _logoCache (P-34)', () => {
  const block = mainJs.split('}, _METRICS_EVICT_AGE).unref()')[0]?.split('setInterval(() => {').pop() || ''

  it('evicts stale _orchJsonCache entries (>10s)', () => {
    expect(block).toContain('_orchJsonCache')
    expect(block).toContain('10_000')
  })

  it('evicts stale _logoCache entries (>60s)', () => {
    expect(block).toContain('_logoCache')
    expect(block).toContain('60_000')
  })
})

describe('repertoire:remove cache cleanup (D-07)', () => {
  const block = mainJs.split("'repertoire:remove'")[1]?.split("'repertoire:open'")[0] || ''

  it('evicts _orchJsonCache on project removal', () => {
    expect(block).toContain('_orchJsonCache.delete(dir)')
  })

  it('evicts _logoCache on project removal', () => {
    expect(block).toContain('_logoCache.delete(dir)')
  })
})

describe('shortcutsModal requestAnimationFrame focus (I-577)', () => {
  const block = rendererJs.split("e.key === '?'")[1]?.split("e.key === ' '")[0] || ''

  it('uses requestAnimationFrame for focus on open', () => {
    expect(block).toContain('requestAnimationFrame')
    expect(block).toContain('_scf.focus()')
  })

  it('shows shortcutsModal on ? key', () => {
    expect(block).toContain('_scm.hidden = false')
  })
})
