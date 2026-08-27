import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

describe('aiState credits non-negative guard (S-53)', () => {
  const block = mainJs.split('function aiState()')[1]?.split('\nipcMain')[0] || ''

  it('guards against non-finite credits from disk', () => {
    expect(block).toContain('Number.isFinite(state[id].credits)')
    expect(block).toContain('state[id].credits < 0')
  })

  it('resets invalid credits to defaults', () => {
    expect(block).toContain('state[id].credits = defaults.credits')
  })
})

describe('aiState credits max 100 clamp (BL-07)', () => {
  const block = mainJs.split('function aiState()')[1]?.split('\nipcMain')[0] || ''

  it('clamps credits to maximum 100', () => {
    expect(block).toContain('Math.min(100, state[id].credits)')
  })
})

describe('lifecycle:list type allowlist filter (S-54)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split("'lifecycle:add'")[0] || ''

  it('validates e.type against _LC_TYPES allowlist', () => {
    expect(block).toContain('_LC_TYPES.has(e.type)')
  })
})

describe('orchestra:play invalidates version-check cache (I-589)', () => {
  const block = mainJs.split("'orchestra:play'")[1]?.split("'orchestra:fine'")[0] || ''

  it('deletes version-check cache for dir on play', () => {
    expect(block).toContain("_metricsCache.delete('version-check:' + dir)")
  })
})

describe('sessionSummary idle count ss-idle class (FE-06)', () => {
  it('applies ss-idle class to idle count in renderer', () => {
    expect(rendererJs).toContain('ss-idle')
    expect(rendererJs).toContain('orquestas inactivas')
  })

  it('ss-idle class defined in CSS with dim color', () => {
    expect(css).toContain('.ss-idle')
    expect(css).toMatch(/\.ss-idle\s*\{[^}]*color/)
  })
})
