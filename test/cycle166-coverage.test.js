import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('bpGenerateBrief briefPath escaping (I-492)', () => {
  it('escapes result.briefPath with esc() in bpAddMessage call', () => {
    expect(rendererJs).toContain('esc(result.briefPath)')
  })
})

describe('fetchIterSummary separator fix (I-493)', () => {
  const block = rendererJs.split('function fetchIterSummary')[1]?.split('\nfunction ')[0] || ''

  it('uses · separator instead of <br>', () => {
    expect(block).toContain("join(' · ')")
    expect(block).not.toContain("join('<br>')")
  })

  it('does not use redundant manual replace for < >', () => {
    expect(block).not.toContain("replace(/</g, '&lt;')")
  })
})

describe('orchestra:writeConfig version validation (I-494)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('validates cfg.version as string ≤64 chars when present', () => {
    expect(block).toContain("cfg.version !== undefined && (typeof cfg.version !== 'string' || cfg.version.length > 64)")
  })
})

describe('bp-mod-del aria-label (I-495)', () => {
  it('bp-mod-del button has Spanish aria-label', () => {
    expect(rendererJs).toContain('aria-label="Eliminar módulo"')
  })
})
