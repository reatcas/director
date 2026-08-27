import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('export:session lifecycle + mixerHistory filter (I-468)', () => {
  const block = mainJs.split("'export:session'")[1]?.split('\nipcMain')[0] || ''

  it('filters lifecycle array to valid objects', () => {
    const lcBlock = block.split('lifecycle:')[1]?.split('mixerConfig:')[0] || ''
    expect(lcBlock).toContain("typeof e === 'object'")
    expect(lcBlock).toContain('d.filter')
  })

  it('filters mixerHistory array to valid objects', () => {
    const mhBlock = block.split('mixerHistory:')[1]?.split('claudeUsage:')[0] || ''
    expect(mhBlock).toContain("typeof e === 'object'")
    expect(mhBlock).toContain('d.filter')
  })
})

describe('#notesArea maxlength (I-469)', () => {
  it('has maxlength="50000" matching backend validation limit', () => {
    expect(indexHtml).toContain('id="notesArea"')
    expect(indexHtml).toContain('maxlength="50000"')
  })
})

describe('#lifecycleTimeline accessibility (I-470)', () => {
  it('has role=list on #lifecycleTimeline', () => {
    expect(indexHtml).toContain('id="lifecycleTimeline"')
    expect(indexHtml).toContain('role="list"')
  })

  it('has aria-label on #lifecycleTimeline', () => {
    const block = indexHtml.split('id="lifecycleTimeline"')[1]?.split('>')[0] || ''
    expect(block).toContain('aria-label=')
  })

  it('renders lc-event items with role=listitem', () => {
    expect(rendererJs).toContain('role="listitem"')
    expect(rendererJs).toContain('lc-event')
  })
})
