import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('mixer:saved:list validDefaults rigor (S-37)', () => {
  const block = mainJs.split("'mixer:saved:list'")[1]?.split("'mixer:saved:save'")[0] || ''

  it('validates id with alphanumeric pattern', () => {
    expect(block).toContain('/^[0-9a-z_\\-]+$/')
  })

  it('validates id length <= 64', () => {
    expect(block).toContain('p.id.length <= 64')
  })

  it('validates name is string with length', () => {
    expect(block).toContain("typeof p.name === 'string'")
    expect(block).toContain('p.name.length > 0')
    expect(block).toContain('p.name.length <= 256')
  })

  it('validates focus is non-array object', () => {
    expect(block).toContain("typeof p.focus === 'object'")
    expect(block).toContain('!Array.isArray(p.focus)')
  })
})

describe('export:session lifecycle validation (S-38)', () => {
  const block = mainJs.split("'export:session'")[1]?.split("'export:upload'")[0] || ''

  it('validates lifecycle event type field', () => {
    expect(block).toContain("typeof e.type === 'string'")
  })

  it('validates lifecycle event ts ISO pattern', () => {
    expect(block).toContain("typeof e.ts === 'string'")
    expect(block).toContain('/^\\d{4}-\\d{2}-\\d{2}T/')
  })

  it('validates lifecycle event label and message are strings', () => {
    expect(block).toContain("typeof e.label === 'string'")
    expect(block).toContain("typeof e.message === 'string'")
  })
})

describe('resource cache invalidation on focus change (P-39)', () => {
  it('deletes resource cache in mixer:write', () => {
    const block = mainJs.split("'mixer:write'")[1]?.split("'orchestra:writeConfig'")[0] || ''
    expect(block).toContain("_metricsCache.delete('resource:' + dir)")
  })

  it('deletes resource cache in orchestra:writeConfig when focus changes', () => {
    const block = mainJs.split("'orchestra:writeConfig'")[1]?.split("'mixer:saved:list'")[0] || ''
    expect(block).toContain("_metricsCache.delete('resource:' + dir)")
  })
})

describe('_invalidateIsRunning on natural process exit (BL-01)', () => {
  const block = mainJs.split("child.on('exit'")[1]?.split("child.on('error'")[0] || ''

  it('calls _invalidateIsRunning on child exit', () => {
    expect(block).toContain('_invalidateIsRunning(dir)')
  })

  it('calls after procs.delete', () => {
    const deleteIdx = block.indexOf('procs.delete(dir)')
    const invalidateIdx = block.indexOf('_invalidateIsRunning(dir)')
    expect(deleteIdx).toBeGreaterThanOrEqual(0)
    expect(invalidateIdx).toBeGreaterThan(deleteIdx)
  })
})
