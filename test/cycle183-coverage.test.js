import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('blueprint:save sessions label field guard (S-11)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''

  it('rejects session label that is not a string', () => {
    expect(block).toContain("s.label !== undefined")
    expect(block).toContain("typeof s.label !== 'string'")
  })

  it('rejects session label longer than 128 chars', () => {
    expect(block).toContain('s.label.length > 128')
  })

  it('rejects session label with control characters', () => {
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(s.label)')
  })
})

describe('blueprint:save sessions duration+commits field guards (S-12)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''

  it('rejects non-finite or negative duration', () => {
    expect(block).toContain('s.duration !== undefined')
    expect(block).toContain('!Number.isFinite(s.duration)')
    expect(block).toContain('s.duration < 0')
  })

  it('rejects non-integer or negative commits', () => {
    expect(block).toContain('s.commits !== undefined')
    expect(block).toContain('!Number.isInteger(s.commits)')
    expect(block).toContain('s.commits < 0')
  })
})

describe('orchestra:tail no existsSync dead guard (I-548)', () => {
  it('orchestra:tail block does not use existsSync for log file', () => {
    const block = mainJs.split("'orchestra:tail'")[1]?.split('\n})\n')[0] || ''
    expect(block).not.toContain('existsSync')
    expect(block).toContain('statSync')
  })
})

describe('snapshotMixer dedup guard (I-549)', () => {
  it('skips write when last focus entry is identical', () => {
    const block = mainJs.split('function snapshotMixer')[1]?.split('\n}\n')[0] || ''
    expect(block).toContain('_ssLast.focus')
    expect(block).toContain('_ssFocus')
  })
})

describe('loadLifecycleHistory invalid date guard (I-547)', () => {
  it('guards invalid ev.ts with isNaN(_lhD.getTime())', () => {
    expect(rendererJs).toContain('isNaN(_lhD.getTime())')
  })
})
