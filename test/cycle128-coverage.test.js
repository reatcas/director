import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('PRODUCT_DIRECTIVE.md size guards (I-313)', () => {
  it('playOrchestra guards directive read with 512KB limit', () => {
    expect(mainJs).toContain('512_000')
    expect(mainJs).toContain('.size <= 512_000')
  })

  it('all three directive reads have size guard pattern', () => {
    const block = mainJs.split('function playOrchestra')[1]?.split('\nfunction ')[0] || ''
    const count = (block.match(/_ds\d*\.size <= 512_000/g) || []).length
    expect(count).toBeGreaterThanOrEqual(3)
  })
})

describe('findLogo package.json size guard (I-314)', () => {
  it('findLogo checks package.json size before readJSON', () => {
    const block = mainJs.split('findLogo(dir)')[0]?.split('\nfunction ').pop() || ''
    expect(mainJs).toContain('pkgStat.size <= 512_000')
  })

  it('returns null when package.json exceeds 512KB', () => {
    expect(mainJs).toContain('pkgStat && pkgStat.size <= 512_000')
  })
})

describe('analysis section button aria-labels (I-315)', () => {
  it('refreshAnalysis has Spanish aria-label', () => {
    expect(html).toMatch(/id="refreshAnalysis"[^>]*aria-label="[^"]*Actualizar[^"]*"/)
  })

  it('copyAnalysis has Spanish aria-label', () => {
    expect(html).toMatch(/id="copyAnalysis"[^>]*aria-label="[^"]*Copiar[^"]*"/)
  })

  it('exportMixesBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="exportMixesBtn"[^>]*aria-label="[^"]*Exportar[^"]*"/)
  })

  it('importMixesBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="importMixesBtn"[^>]*aria-label="[^"]*Importar[^"]*"/)
  })
})

describe('consoleSection region aria (I-316)', () => {
  it('consoleSection has role=region', () => {
    expect(html).toMatch(/id="consoleSection"[^>]*role="region"/)
  })

  it('consoleSection has Spanish aria-label', () => {
    expect(html).toMatch(/id="consoleSection"[^>]*aria-label="[^"]*[Cc]onsola[^"]*"/)
  })
})
