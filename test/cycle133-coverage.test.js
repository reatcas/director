import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('mixer:read orchestra.json size guard (I-344)', () => {
  const block = mainJs.split("'mixer:read'")[1]?.split('\nipcMain')[0] || ''

  it('guards orchestra.json at 512KB', () => {
    expect(block).toContain('512_000')
    expect(block).toContain('let cfg = null')
  })

  it('still uses readJSON for read', () => {
    expect(block).toContain('readJSON')
  })
})

describe('mixer:write orchestra.json size guard (I-345)', () => {
  const block = mainJs.split("'mixer:write'")[1]?.split('\nipcMain')[0] || ''

  it('guards orchestra.json at 512KB before read', () => {
    expect(block).toContain('512_000')
    expect(block).toContain("let cfg = { version: '2.0.0' }")
  })
})

describe('startMetricsSampling orchestra.json size guard (I-346)', () => {
  it('startMetricsSampling uses _smPath guard', () => {
    expect(mainJs).toContain('_smPath')
    expect(mainJs).toContain("if (fs.statSync(_smPath).size <= 512_000)")
  })
})

describe('local-img:// protocol security (I-347)', () => {
  const block = mainJs.split("protocol.handle('local-img'")[1]?.split('\n  })\n')[0] || ''

  it('enforces extension whitelist (status 415)', () => {
    expect(block).toContain('status: 415')
    expect(block).toContain('mimeMap[ext]')
  })

  it('enforces size limit at 10MB (status 413)', () => {
    expect(block).toContain('10_485_760')
    expect(block).toContain('status: 413')
  })

  it('checks extension before reading file', () => {
    const extCheckIdx = block.indexOf('mimeMap[ext]')
    const readIdx = block.indexOf('readFileSync(filePath)')
    expect(extCheckIdx).toBeGreaterThan(-1)
    expect(readIdx).toBeGreaterThan(-1)
    expect(extCheckIdx).toBeLessThan(readIdx)
  })
})
