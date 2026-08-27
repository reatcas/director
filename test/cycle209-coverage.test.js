import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('mixer:saved:list focus value validation (S-49)', () => {
  const block = mainJs.split("'mixer:saved:list'")[1]?.split("'mixer:saved:save'")[0] || ''

  it('validates focus values are numbers', () => {
    expect(block).toContain("typeof v === 'number'")
    expect(block).toContain('Number.isFinite(v)')
  })

  it('validates focus values in range 0-100', () => {
    expect(block).toContain('v >= 0')
    expect(block).toContain('v <= 100')
  })

  it('uses Object.values on m.focus', () => {
    expect(block).toContain('Object.values(m.focus)')
  })
})

describe('lifecycle:list message cap at 4096 bytes (S-50)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split("'lifecycle:add'")[0] || ''

  it('caps message at 4096 bytes before return', () => {
    expect(block).toContain('4096')
    expect(block).toContain('message')
  })

  it('uses Buffer.byteLength for byte-accurate cap', () => {
    expect(block).toContain('Buffer.byteLength')
    expect(block).toContain("'utf8'")
  })
})

describe('metrics:coordination 2s TTL cache (P-49)', () => {
  const block = mainJs.split("'metrics:coordination'")[1]?.split("'metrics:snapshot'")[0] || ''

  it('checks metricsGet before calling getStatus', () => {
    expect(block).toContain("metricsGet('coordination')")
  })

  it('stores result with metricsSet', () => {
    expect(block).toContain("metricsSet('coordination'")
    expect(block).toContain('getStatus()')
  })
})

describe('orchestra:clearLog invalidates snapshot+context caches (I-588)', () => {
  const block = mainJs.split("'orchestra:clearLog'")[1]?.split("'orchestra:tail'")[0] || ''

  it('deletes snapshot cache for dir', () => {
    expect(block).toContain("_metricsCache.delete('snapshot:' + dir)")
  })

  it('deletes context cache for dir', () => {
    expect(block).toContain("_metricsCache.delete('context:' + dir)")
  })
})

describe('orchestra:upgrade invalidates version-check cache (BL-06)', () => {
  const block = mainJs.split("'orchestra:upgrade'")[1]?.split("'system:claude-procs'")[0] || ''

  it('deletes version-check cache for dir', () => {
    expect(block).toContain("_metricsCache.delete('version-check:' + dir)")
  })
})
