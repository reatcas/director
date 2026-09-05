import { describe, it, expect } from 'vitest'
import fs from 'fs'

const MIXES = JSON.parse(fs.readFileSync('resources/orchestra/.claude/default-mixes.json', 'utf8'))

const ALL_CATEGORIES = [
  'product', 'backend', 'frontend', 'business_logic', 'security',
  'quality_tests', 'devops_infra', 'performance', 'ux_accessibility',
  'data_db', 'documentation', 'i18n', 'refactoring', 'architecture',
  'api_integrations'
]

describe('Default mixes (T6)', () => {
  it('has exactly 8 presets', () => {
    expect(MIXES).toHaveLength(8)
  })

  it('all presets have required fields', () => {
    for (const m of MIXES) {
      expect(m).toHaveProperty('id')
      expect(m).toHaveProperty('name')
      expect(m).toHaveProperty('preset', true)
      expect(m).toHaveProperty('ts')
      expect(m).toHaveProperty('focus')
    }
  })

  it('all presets have all 15 categories', () => {
    for (const m of MIXES) {
      for (const cat of ALL_CATEGORIES) {
        expect(m.focus).toHaveProperty(cat)
      }
    }
  })

  it('all focus weights sum to exactly 100', () => {
    for (const m of MIXES) {
      const total = Object.values(m.focus).reduce((a, b) => a + b, 0)
      expect(total).toBe(100)
    }
  })

  it('all focus weights are non-negative integers', () => {
    for (const m of MIXES) {
      for (const [cat, w] of Object.entries(m.focus)) {
        expect(Number.isInteger(w), `${m.id}.focus.${cat} is not integer`).toBe(true)
        expect(w, `${m.id}.focus.${cat} is negative`).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('preset-deep-ship exists', () => {
    const ds = MIXES.find(m => m.id === 'preset-deep-ship')
    expect(ds).toBeTruthy()
    expect(ds.name).toBe('Deep Ship')
  })

  it('preset-architect exists', () => {
    const arch = MIXES.find(m => m.id === 'preset-architect')
    expect(arch).toBeTruthy()
    expect(arch.name).toBe('Architect')
  })

  it('preset-deep-ship is product-heavy (>=35)', () => {
    const ds = MIXES.find(m => m.id === 'preset-deep-ship')
    expect(ds.focus.product).toBeGreaterThanOrEqual(35)
  })

  it('preset-architect is quality/security-heavy', () => {
    const arch = MIXES.find(m => m.id === 'preset-architect')
    expect(arch.focus.quality_tests + arch.focus.security).toBeGreaterThanOrEqual(35)
  })

  it('original 6 presets still exist', () => {
    const ids = MIXES.map(m => m.id)
    expect(ids).toContain('preset-smart')
    expect(ids).toContain('preset-elite-balanced')
    expect(ids).toContain('preset-quality-first')
    expect(ids).toContain('preset-ship-fast')
    expect(ids).toContain('preset-hardening')
    expect(ids).toContain('preset-polish')
  })
})
