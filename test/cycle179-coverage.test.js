import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('blueprint:save answer key control-char guard (S-05)', () => {
  it('rejects answer keys containing control characters', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('Object.keys(data.answers).some(k =>')
  })
})

describe('blueprint:save module features+dependencies control-char guard (S-06)', () => {
  it('rejects module features with control characters', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(f)')
  })

  it('rejects module dependencies with control characters', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(d)')
  })
})

describe('mixer:saved:list _defaultMixesCache type guard (I-537)', () => {
  it('filters _defaultMixesCache to valid objects with string id before merge', () => {
    const block = mainJs.split("'mixer:saved:list'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('validDefaults')
    expect(block).toContain("typeof p.id === 'string'")
  })
})

describe('loadRoadmapFreshness staleHours clamp (I-538)', () => {
  it('clamps staleHours with Math.max(0, ...) to prevent negative display', () => {
    const block = rendererJs.split('async function loadRoadmapFreshness')[1]?.split('\n}\n')[0] || ''
    expect(block).toContain('Math.max(0, data.staleHours)')
  })
})

describe('blueprint:save features/dependencies guards complete (T-11)', () => {
  it('features guard appears before the dependencies guard in same block', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    const fIdx = block.indexOf('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(f)')
    const dIdx = block.indexOf('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(d)')
    expect(fIdx).toBeGreaterThan(-1)
    expect(dIdx).toBeGreaterThan(-1)
    expect(fIdx).toBeLessThan(dIdx)
  })
})
