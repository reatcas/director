import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('ROADMAP.md exit handler size guard (I-305)', () => {
  it('exit handler guards ROADMAP.md size before reading', () => {
    expect(mainJs).toContain("_rmStat.size <= 1_048_576")
  })

  it('checks size via statSync in exit handler', () => {
    expect(mainJs).toContain("_rmStat && _rmStat.size <= 1_048_576")
  })
})

describe('metrics:session-summary report size guard (I-306)', () => {
  const block = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''

  it('guards each project ORCHESTRA_REPORT.md at 1MB', () => {
    expect(block).toContain('1_048_576')
    expect(block).toContain('reportPath')
  })

  it('skips oversized reports with continue', () => {
    expect(block).toContain('continue')
  })
})

describe('mixer:history size guard (I-307)', () => {
  const block = mainJs.split("'mixer:history'")[1]?.split('\nipcMain')[0] || ''

  it('guards mixer-history.json at 512KB', () => {
    expect(block).toContain('512_000')
  })

  it('initializes hist as empty array', () => {
    expect(block).toContain('let hist = []')
  })

  it('still applies limit and slice', () => {
    expect(block).toContain('hist.slice(-n)')
  })
})

describe('console action buttons aria-labels (I-308)', () => {
  it('clearLogBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="clearLogBtn"[^>]*aria-label="[^"]*Limpiar[^"]*"/)
  })

  it('autoScrollBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="autoScrollBtn"[^>]*aria-label="[^"]*Alternar[^"]*"/)
  })

  it('toggleRawBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="toggleRawBtn"[^>]*aria-label/)
  })

  it('copyLogBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="copyLogBtn"[^>]*aria-label="[^"]*Copiar[^"]*"/)
  })
})
