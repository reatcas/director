import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('alerts:config array rejection (I-241)', () => {
  const block = mainJs.split("'alerts:config'")[1]?.split("'alerts:read'")[0] || ''

  it('rejects array input', () => {
    expect(block).toContain('Array.isArray(cfg)')
  })

  it('still accepts plain objects', () => {
    expect(block).toContain("typeof cfg === 'object'")
  })

  it('validates boolean fields', () => {
    expect(block).toContain("typeof cfg.stall === 'boolean'")
    expect(block).toContain("typeof cfg.alto === 'boolean'")
  })
})

describe('blueprint:generate-brief output cap (I-240)', () => {
  const block = mainJs.split("'blueprint:generate-brief'")[1]?.split('\nipcMain')[0] || ''

  it('caps brief output at 512KB', () => {
    expect(block).toContain('512_000')
    expect(block).toContain('slice(0, 512_000)')
  })

  it('still writes brief to BLUEPRINT.md', () => {
    expect(block).toContain('BLUEPRINT.md')
    expect(block).toContain('writeFileSync(briefPath, brief)')
  })
})

describe('parseComplianceLine input guard (I-234 cycle 118)', () => {
  const block = mainJs.split('function parseComplianceLine')[1]?.split('\n}')[0] || ''

  it('checks typeof string', () => {
    expect(block).toContain("typeof line !== 'string'")
  })

  it('checks includes COMPLIANCE before regex', () => {
    expect(block).toContain("!line.includes('COMPLIANCE')")
  })

  it('returns null on guard failure', () => {
    const guardLine = block.split("typeof line !== 'string'")[0] || ''
    expect(block).toContain('return null')
  })
})

describe('stopMetricsSampling cache eviction (I-243)', () => {
  const block = mainJs.split('function stopMetricsSampling')[1]?.split('\n}')[0] || ''

  it('clears metrics sampler interval', () => {
    expect(block).toContain('clearInterval(iv)')
    expect(block).toContain('metricsSamplers.delete(dir)')
  })

  it('evicts _metricsCache entries for stopped dir', () => {
    expect(block).toContain('_metricsCache.keys()')
    expect(block).toContain('_metricsCache.delete(key)')
  })
})

describe('node graph accessibility (I-242)', () => {
  it('nodeGraphSection has interactive role', () => {
    expect(html).toMatch(/id="nodeGraphSection"[^>]*role="(?:img|application)"/)
  })

  it('nodeGraphSection has aria-label', () => {
    expect(html).toMatch(/id="nodeGraphSection"[^>]*aria-label/)
  })

  it('mixerGraphCanvas is aria-hidden', () => {
    expect(html).toMatch(/id="mixerGraphCanvas"[^>]*aria-hidden="true"/)
  })

  it('nodeGraphSection is inside mixerDrawer', () => {
    const mixIdx = html.indexOf('id="mixerDrawer"')
    const ngIdx  = html.indexOf('id="nodeGraphSection"')
    expect(mixIdx).toBeGreaterThanOrEqual(0)
    expect(ngIdx).toBeGreaterThan(mixIdx)
  })
})

describe('metrics:resource and metrics:context null check (I-232)', () => {
  const resBlock = mainJs.split("'metrics:resource'")[1]?.split('\nipcMain')[0] || ''
  const ctxBlock = mainJs.split("'metrics:context'")[1]?.split('\nipcMain')[0] || ''

  it('metrics:resource uses hit !== null', () => {
    expect(resBlock).toContain('if (hit !== null) return hit')
  })

  it('metrics:context uses hit !== null', () => {
    expect(ctxBlock).toContain('if (hit !== null) return hit')
  })
})
