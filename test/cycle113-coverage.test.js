import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('orchestra:readIterLog file size guard (I-200)', () => {
  const block = mainJs.split("'orchestra:readIterLog'")[1]?.split('\nipcMain')[0] || ''

  it('stats the file before reading', () => {
    expect(block).toContain('statSync(fullPath)')
  })

  it('rejects files larger than 1MB', () => {
    expect(block).toContain('1_048_576')
  })

  it('returns empty string for oversized files', () => {
    const sizeBlock = block.split('1_048_576')[1]?.split('\n')[0] || ''
    expect(sizeBlock).toContain("return ''")
  })
})

describe('projects list aria attributes (I-201)', () => {
  it('projects ul has role=list', () => {
    expect(html).toContain('id="projects"')
    expect(html).toMatch(/id="projects"[^>]*role="list"/)
  })

  it('projects ul has aria-label in Spanish', () => {
    expect(html).toMatch(/id="projects"[^>]*aria-label/)
    expect(html).toContain('Repertorio de proyectos')
  })
})

describe('project list item keyboard accessibility (I-202)', () => {
  it('sets tabindex=0 on list items', () => {
    expect(rendererJs).toContain("'tabindex', '0'")
  })

  it('sets role=listitem on list items', () => {
    expect(rendererJs).toContain("'role', 'listitem'")
  })

  it('handles Enter key to open project', () => {
    expect(rendererJs).toContain("e.key === 'Enter'")
    expect(rendererJs).toContain('open(p.path)')
  })

  it('handles Space key to open project', () => {
    expect(rendererJs).toContain("e.key === ' '")
  })
})

describe('context-metrics telemetry cap (I-203)', () => {
  const block = mainJs.split("'metrics:context'")[1]?.split('\nipcMain')[0] || ''

  it('caps telemetry history at 500 entries', () => {
    expect(block).toContain('hist.length > 500')
  })

  it('slices to last 500 entries', () => {
    expect(block).toContain('hist.slice(-500)')
  })

  it('writes pruned history back to file', () => {
    expect(block).toContain('writeJSON(file, hist)')
  })
})

describe('repertoire:remove stopTailing+stopMetricsSampling (I-183 coverage)', () => {
  const block = mainJs.split("'repertoire:remove'")[1]?.split('\nipcMain')[0] || ''

  it('calls stopTailing for removed project', () => {
    expect(block).toContain('stopTailing(dir)')
  })

  it('calls stopMetricsSampling for removed project', () => {
    expect(block).toContain('stopMetricsSampling(dir)')
  })
})
