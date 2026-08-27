import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('blueprint:save currentPhase + sessionActive guards (S-17)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''

  it('rejects non-integer or negative currentPhase', () => {
    expect(block).toContain('data.currentPhase !== undefined')
    expect(block).toContain('!Number.isInteger(data.currentPhase)')
    expect(block).toContain('data.currentPhase < 0')
  })

  it('rejects non-boolean sessionActive', () => {
    expect(block).toContain('data.sessionActive !== undefined')
    expect(block).toContain("typeof data.sessionActive !== 'boolean'")
  })
})

describe('blueprint:save currentQuestion guard (S-18)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''

  it('rejects non-integer or negative currentQuestion', () => {
    expect(block).toContain('data.currentQuestion !== undefined')
    expect(block).toContain('!Number.isInteger(data.currentQuestion)')
    expect(block).toContain('data.currentQuestion < 0')
  })
})

describe('metrics:compliance mtime cache on empty file (I-556)', () => {
  it('updates _complianceMtimeCache even when no COMPLIANCE lines found', () => {
    const block = mainJs.split("'metrics:compliance'")[1]?.split('\n})\n')[0] || ''
    const emptyPath = block.split('if (!lines.length)')[1]?.split('\n')[0] || ''
    expect(emptyPath).toContain('_complianceMtimeCache.set')
  })
})

describe('loadKnowledge empty file fix (I-557)', () => {
  it('uses content != null instead of content || for empty file check', () => {
    const block = rendererJs.split('async function loadKnowledge')[1]?.split('\n}')[0] || ''
    expect(block).toContain('content != null')
    expect(block).not.toContain('content || `[Archivo')
  })
})

describe('orchestra:clearLog uses _lcCutoff() (I-558)', () => {
  it('uses _lcCutoff() for lifecycle pruning cutoff', () => {
    const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('_lcCutoff()')
    expect(block).not.toContain('90 * 24 * 3_600_000')
  })
})
