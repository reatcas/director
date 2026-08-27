import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const contextProto = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')

describe('metrics:compliance size guard (I-265)', () => {
  const block = mainJs.split("'metrics:compliance'")[1]?.split('\nipcMain')[0] || ''

  it('checks stat.size before reading ORCHESTRA_REPORT', () => {
    expect(block).toContain('statSync')
    expect(block).toContain('1_048_576')
  })

  it('returns early for oversized report', () => {
    expect(block).toContain('return metricsSet')
  })

  it('reads file only when size is within limit', () => {
    const readIdx = block.indexOf('readFileSync')
    const sizeIdx = block.indexOf('1_048_576')
    expect(sizeIdx).toBeGreaterThan(-1)
    expect(readIdx).toBeGreaterThan(sizeIdx)
  })
})

describe('computeDelta state file size cap (I-266)', () => {
  it('defines 2MB cap constant', () => {
    expect(contextProto).toContain('2_097_152')
  })

  it('uses fsize in stat destructuring', () => {
    expect(contextProto).toContain('fsize')
  })

  it('skips files larger than 2MB', () => {
    expect(contextProto).toContain('if (fsize > 2_097_152) continue')
  })

  it('still reads mtimeMs from same stat', () => {
    const block = contextProto.split('fsize > 2_097_152')[0]?.split('\n').slice(-5).join('\n') || ''
    expect(block).toContain('mtimeMs')
    expect(block).toContain('fsize')
  })
})

describe('raw log overlay button aria-labels (I-267)', () => {
  it('closeRawBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="closeRawBtn"[^>]*aria-label="[^"]*Cerrar[^"]*"/)
  })

  it('copyRawBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="copyRawBtn"[^>]*aria-label="[^"]*Copiar[^"]*"/)
  })

  it('selectAllRawBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="selectAllRawBtn"[^>]*aria-label="[^"]*Seleccionar[^"]*"/)
  })
})

describe('procsRefresh aria-label (I-268)', () => {
  it('procsRefresh button has aria-label', () => {
    expect(html).toMatch(/id="procsRefresh"[^>]*aria-label/)
  })

  it('procsRefresh aria-label is in Spanish', () => {
    expect(html).toMatch(/id="procsRefresh"[^>]*aria-label="[^"]*[Rr]efrescar[^"]*"/)
  })
})
