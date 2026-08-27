import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('projectInfo orchestra.json size guard (I-348)', () => {
  it('uses _piPath guard in projectInfo', () => {
    expect(mainJs).toContain('_piPath')
    expect(mainJs).toContain('fs.statSync(_piPath).size <= 512_000')
  })
})

describe('getClaudeUsage orchestra.json size guard (I-349)', () => {
  it('uses _guPath guard in getClaudeUsage', () => {
    expect(mainJs).toContain('_guPath')
    expect(mainJs).toContain('fs.statSync(_guPath).size <= 512_000')
  })
})

describe('playOrchestra orchestra.json size guard (I-350)', () => {
  it('uses _poPath guard in playOrchestra', () => {
    expect(mainJs).toContain('_poPath')
    expect(mainJs).toContain('fs.statSync(_poPath).size <= 512_000')
  })
})

describe('metrics:allocation orchestra.json size guard (I-351)', () => {
  const block = mainJs.split("'metrics:allocation'")[1]?.split('\nipcMain')[0] || ''

  it('uses _maPath guard', () => {
    expect(block).toContain('_maPath')
    expect(block).toContain('512_000')
  })
})

describe('snapshotMixer orchestra.json size guard (I-352)', () => {
  it('uses _ssPath guard in snapshotMixer', () => {
    expect(mainJs).toContain('_ssPath')
    expect(mainJs).toContain('fs.statSync(_ssPath).size <= 512_000')
  })
})

describe('atriles:save NUL byte validation (I-353)', () => {
  const block = mainJs.split("'atriles:save'")[1]?.split('\nipcMain')[0] || ''

  it('rejects NUL bytes in name', () => {
    expect(block).toContain('a.name')
    expect(block).toContain('\\x00')
  })

  it('rejects NUL bytes in path', () => {
    expect(block).toContain('a.path')
    expect(block).toContain('\\x00')
  })
})

describe('mixer tab panels role=tabpanel (I-354)', () => {
  it('mixTab has role=tabpanel', () => {
    expect(html).toMatch(/id="mixTab"[^>]*role="tabpanel"/)
  })

  it('bpTab has role=tabpanel', () => {
    expect(html).toMatch(/id="bpTab"[^>]*role="tabpanel"/)
  })

  it('knowledgeTab has role=tabpanel', () => {
    expect(html).toMatch(/id="knowledgeTab"[^>]*role="tabpanel"/)
  })

  it('notesTab has role=tabpanel', () => {
    expect(html).toMatch(/id="notesTab"[^>]*role="tabpanel"/)
  })
})

describe('rack aside complementary role (I-355)', () => {
  it('aside#rack has role=complementary', () => {
    expect(html).toMatch(/id="rack"[^>]*role="complementary"/)
  })
})
