import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('lifecycle:list message type filter (S-01)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split('\n})')[0] || ''

  it('filters events requiring typeof e.message === string', () => {
    expect(block).toContain("typeof e.message === 'string'")
  })
})

describe('buildMixRibbon CSS color guard (S-02)', () => {
  const block = rendererJs.split('function buildMixRibbon')[1]?.split('\n}')[0] || ''

  it('validates color with CSS-safe regex before style injection', () => {
    expect(block).toContain('_colorSafe')
    expect(block).toContain('/^[a-zA-Z0-9#(),. %]+$/.test(c)')
  })

  it('uses _colorSafe(s.color) in template literal', () => {
    expect(block).toContain('background:${_colorSafe(s.color)}')
  })
})

describe('getClaudeUsage caches dailyBudget (P-05)', () => {
  const block = mainJs.split('function getClaudeUsage')[1]?.split('\nfunction ')[0] || ''

  it('stores dailyBudget in usageTracker cache', () => {
    expect(block).toContain('dailyBudget: _dailyBudget')
  })

  it('reads dailyBudget from usageTracker on cache hit', () => {
    expect(block).toContain("usageTracker.get(dir)?.dailyBudget || 1_000_000")
  })
})

describe('repertoire:remove _complianceMtimeCache cleanup (I-525)', () => {
  const block = mainJs.split("'repertoire:remove'")[1]?.split('\n})')[0] || ''

  it('deletes _complianceMtimeCache entry on project removal', () => {
    expect(block).toContain('_complianceMtimeCache.delete(dir)')
  })
})

describe('debouncedMixerGraph on slider input (I-526)', () => {
  it('defines debouncedMixerGraph with 80ms timeout', () => {
    expect(rendererJs).toContain('function debouncedMixerGraph()')
    expect(rendererJs).toContain('_mixerGraphTimer = setTimeout(')
    expect(rendererJs).toContain('updateMixerGraph(); updateSmartAuroraColors()')
  })

  it('slider input listener uses debouncedMixerGraph instead of direct calls', () => {
    const block = rendererJs.split('inp.addEventListener(\'input\'')[1]?.split('\n    })')[0] || ''
    expect(block).toContain('debouncedMixerGraph()')
    expect(block).not.toContain('updateMixerGraph()')
    expect(block).not.toContain('updateSmartAuroraColors()')
  })
})
