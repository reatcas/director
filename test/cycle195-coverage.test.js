import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('lifecycle:add label trim check (S-29)', () => {
  const block = mainJs.split("'lifecycle:add'")[1]?.split('\n})\n')[0] || ''

  it('rejects whitespace-only label', () => {
    expect(block).toContain('label.trim().length === 0')
  })
})

describe('blueprint:readiness completeness clamp (S-30)', () => {
  const block = mainJs.split("'blueprint:readiness'")[1]?.split('\n})\n')[0] || ''

  it('guards completeness with Number.isFinite and clamp', () => {
    expect(block).toContain('Number.isFinite(bp.completeness)')
    expect(block).toContain('Math.min(100, Math.max(0, bp.completeness))')
  })
})

describe('metrics:allocation finite focus guard (I-574)', () => {
  const block = mainJs.split("'metrics:allocation'")[1]?.split('\n})\n')[0] || ''

  it('filters non-finite focus values before computeAllocation', () => {
    expect(block).toContain('_maFocus')
    expect(block).toContain('Number.isFinite(v)')
    expect(block).toContain('computeAllocation(dir, _maFocus)')
  })
})

describe('settingsModal requestAnimationFrame focus (I-573)', () => {
  const block = rendererJs.split("$('#settingsBtn').onclick")[1]?.split("$('#closeSettings')")[0] || ''

  it('uses requestAnimationFrame for focus on open', () => {
    expect(block).toContain('requestAnimationFrame')
    expect(block).toContain('_sf.focus()')
  })
})
