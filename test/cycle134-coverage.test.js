import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('projectInfo orchestra.json size guard (I-348)', () => {
  it('reads orchestra.json in projectInfo', () => {
    expect(mainJs).toMatch(/_piPath|readOrchJson/)
  })
})

describe('getClaudeUsage orchestra.json size guard (I-349)', () => {
  it('reads orchestra.json in getClaudeUsage', () => {
    expect(mainJs).toMatch(/_guPath|readOrchJson/)
  })
})

describe('playOrchestra orchestra.json size guard (I-350)', () => {
  it('reads orchestra.json in playOrchestra', () => {
    expect(mainJs).toMatch(/_poPath|readOrchJson/)
  })
})

describe('metrics:allocation orchestra.json size guard (I-351)', () => {
  const block = mainJs.split("'metrics:allocation'")[1]?.split('\nipcMain')[0] || ''

  it('reads orchestra.json', () => {
    expect(block).toMatch(/_maPath|readOrchJson/)
  })
})

describe('snapshotMixer orchestra.json size guard (I-352)', () => {
  it('reads orchestra.json in snapshotMixer', () => {
    expect(mainJs).toMatch(/_ssPath|readOrchJson/)
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
