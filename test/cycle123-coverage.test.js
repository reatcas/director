import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const contextProto = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')

describe('orchestra:analyze read helper size guard (I-273)', () => {
  const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''

  it('read helper checks stat.size before readFileSync', () => {
    expect(block).toContain('statSync')
    expect(block).toContain('1_048_576')
  })

  it('read helper returns empty string on oversized file', () => {
    expect(block).toContain("return ''")
  })

  it('read helper is defined inline', () => {
    expect(block).toContain('const read = ')
  })
})

describe('context-protocol _persist size guard (I-274)', () => {
  it('_persist guards stat.size before JSON.parse', () => {
    expect(contextProto).toContain('statSync(file).size <= 1_048_576')
  })

  it('_persist reads context-metrics within size limit', () => {
    expect(contextProto).toContain('readFileSync(file')
    expect(contextProto).toContain('1_048_576')
  })
})

describe('metrics:context size guard (I-275)', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split('\nipcMain')[0] || ''

  it('guards file size before reading context-metrics.json', () => {
    expect(block).toContain('statSync')
    expect(block).toContain('1_048_576')
  })

  it('initializes hist as empty array', () => {
    expect(block).toContain('let hist = []')
  })

  it('still applies 500-entry cap', () => {
    expect(block).toContain('hist.length > 500')
  })
})

describe('featureStrip accessibility (I-276)', () => {
  it('featureStrip has role=status', () => {
    expect(html).toMatch(/id="featureStrip"[^>]*role="status"/)
  })

  it('featureStrip has aria-label in Spanish', () => {
    expect(html).toMatch(/id="featureStrip"[^>]*aria-label="[^"]*[Cc]aracterística[^"]*"/)
  })

  it('featureStrip has aria-live', () => {
    expect(html).toMatch(/id="featureStrip"[^>]*aria-live/)
  })
})
