import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('blueprint:save answer key length cap (S-09)', () => {
  it('rejects answer keys longer than 64 chars', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('k.length > 64')
  })
})

describe('blueprint:save module key count cap (S-10)', () => {
  it('rejects module objects with more than 20 keys', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('Object.keys(m).length > 20')
  })
})

describe('projectInfo single statSync for version file (P-15)', () => {
  it('removes existsSync for ORCHESTRA_VERSION file', () => {
    const block = mainJs.split('function projectInfo')[1]?.split('\nfunction ')[0] || ''
    expect(block).not.toContain('fs.existsSync(vf)')
    expect(block).toContain('fs.statSync(vf)')
  })

  it('removes existsSync for RUN_STARTED file', () => {
    const block = mainJs.split('function projectInfo')[1]?.split('\nfunction ')[0] || ''
    expect(block).not.toContain('fs.existsSync(startFile)')
    expect(block).toContain('fs.statSync(startFile)')
  })
})

describe('metrics:compliance null result caching (I-545)', () => {
  it('caches null with TTL when no COMPLIANCE lines found', () => {
    const block = mainJs.split("'metrics:compliance'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain("metricsSet('compliance:' + dir, null, _SLOW_METRICS_TTL)")
  })
})

describe('loadLifecycleTimeline invalid date guard (I-546)', () => {
  it('guards invalid ev.ts with isNaN(d.getTime()) fallback', () => {
    expect(rendererJs).toContain('isNaN(d.getTime())')
  })
})
