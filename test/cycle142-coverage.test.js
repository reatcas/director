import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('projectInfo() ORCHESTRA_VERSION size guard (I-395)', () => {
  const block = mainJs.split('function projectInfo')[1]?.split('\nfunction ')[0] || ''

  it('guards ORCHESTRA_VERSION with size check ≤1024', () => {
    expect(block).toContain('ORCHESTRA_VERSION')
    expect(block).toContain('1024')
    expect(block).toContain('statSync')
  })
})

describe('projectInfo() RUN_STARTED size guard (I-395)', () => {
  const block = mainJs.split('function projectInfo')[1]?.split('\nfunction ')[0] || ''

  it('guards RUN_STARTED with size check ≤1024', () => {
    expect(block).toContain('_sfStat')
    expect(block).toContain('startFile')
  })
})

describe('App startup repertoire.json size guard (I-396)', () => {
  const block = mainJs.split('app.whenReady()')[1] || ''

  it('guards startup readJSON(store()) with statSync', () => {
    expect(block).toContain('statSync(store())')
    expect(block).toContain('512_000')
  })
})

describe('orchestra:analyze report size cap (I-397)', () => {
  const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''

  it('caps report at 4MB before writing', () => {
    expect(block).toContain('4_194_304')
    expect(block).toContain('report.length')
  })
})

describe('getClaudeUsage() RUN_STARTED size guard (I-395)', () => {
  const block = mainJs.split('function getClaudeUsage')[1]?.split('\nfunction ')[0] || ''

  it('guards RUN_STARTED read with statSync size check ≤1024', () => {
    expect(block).toContain('RUN_STARTED')
    expect(block).toContain('statSync')
    expect(block).toContain('1024')
  })

  it('does not read RUN_STARTED without size check in getClaudeUsage', () => {
    const unguarded = /readFileSync\([^)]*RUN_STARTED[^)]*\)(?![^;]*statSync)/.test(block)
    expect(unguarded).toBe(false)
  })
})

describe('orchestra:version-check ORCHESTRA_VERSION size guards (I-395)', () => {
  const block = mainJs.split("'orchestra:version-check'")[1]?.split('\nipcMain')[0] || ''

  it('guards bundled ORCHESTRA_VERSION read with statSync ≤1024', () => {
    expect(block).toContain('statSync')
    expect(block).toContain('1024')
    expect(block).toContain('ORCHESTRA_VERSION')
  })

  it('does not raw-readFileSync ORCHESTRA_VERSION without size check', () => {
    const lines = block.split('\n')
    for (const line of lines) {
      if (line.includes('readFileSync') && line.includes('ORCHESTRA_VERSION')) {
        expect(line).toContain('statSync')
      }
    }
  })
})

describe('cmdInput arrow key navigation (I-398)', () => {
  const block = rendererJs.split("'cmdInput'")[1]?.split('\n}')[0] || ''

  it('handles ArrowDown navigation', () => {
    expect(rendererJs).toContain("'ArrowDown'")
    expect(rendererJs).toContain("'ArrowUp'")
  })

  it('updates aria-selected during navigation', () => {
    const navBlock = rendererJs.split("'ArrowDown' || e.key === 'ArrowUp'")[1] || ''
    expect(navBlock).toContain('aria-selected')
  })
})
