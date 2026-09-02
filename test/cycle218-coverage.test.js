import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

describe('cachedProjects validates name and id as bounded strings (S-63)', () => {
  const block = mainJs.split('function cachedProjects')[1]?.split('\nfunction ')[0] || ''

  it('validates p.name is string when present', () => {
    expect(block).toContain("typeof p.name === 'string'")
  })

  it('validates p.id is string when present', () => {
    expect(block).toContain("typeof p.id === 'string'")
  })

  it('caps p.name at 256 chars', () => {
    expect(block).toContain('p.name.length <= 256')
  })

  it('caps p.id at 64 chars', () => {
    expect(block).toContain('p.id.length <= 64')
  })
})

describe('orchestra:kill validates PID range before killing (S-64)', () => {
  const block = mainJs.split("'orchestra:kill'")[1]?.split('\nipcMain')[0] || ''

  it('checks pid >= 2', () => {
    expect(block).toContain('pid >= 2')
  })

  it('checks pid <= 4194304', () => {
    expect(block).toContain('4_194_304')
  })

  it('checks pid is integer', () => {
    expect(block).toContain('Number.isInteger(pid)')
  })
})

describe('persistLifecycleEvent evicts lc:dir:* cache after writing (P-60)', () => {
  const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\nfunction ')[0] || ''

  it('deletes lc:dir keys after writing lifecycle file', () => {
    expect(block).toContain("k.startsWith('lc:' + dir + ':')")
  })

  it('eviction is inside the size guard block', () => {
    const sizeGuardBlock = block.split('_lcSer.length <= 2_097_152')[1] || ''
    expect(sizeGuardBlock).toContain("k.startsWith('lc:' + dir + ':')")
  })
})

describe('sessionSummary ss-idle class when active===0 (FE-11)', () => {
  it('defines activeClass variable based on s.active count', () => {
    expect(rendererJs).toContain('activeClass')
    expect(rendererJs).toContain("(s.active ?? 0) > 0 ? 'ss-live' : 'ss-idle'")
  })

  it('uses activeClass in innerHTML instead of hardcoded ss-live', () => {
    const block = rendererJs.split('function loadSessionSummary')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('${activeClass}')
  })
})

describe('sessionSummary focus-visible CSS outline (A-25)', () => {
  it('defines focus-visible outline for #sessionSummary', () => {
    expect(css).toContain('#sessionSummary:focus-visible')
    expect(css).toContain('outline:')
  })
})

describe('metricsSet TTL guard is inside function body not global (T-106 regression S-61)', () => {
  const block = mainJs.split('function metricsSet')[1]?.split('\nfunction ')[0] || ''

  it('TTL guard expression is inside metricsSet body', () => {
    expect(block).toContain('Number.isFinite(ttl) && ttl > 0')
  })

  it('falls back to _METRICS_TTL inside the function', () => {
    expect(block).toContain('_METRICS_TTL')
  })
})
