import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('blueprint:save answer control-char guard (S-03)', () => {
  it('rejects answer strings with control characters', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(v)')
  })
})

describe('blueprint:save module control-char guard (S-04)', () => {
  it('rejects module name with control characters', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(m.name)')
  })

  it('rejects module description with control characters', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(m.description)')
  })

  it('rejects module notes with control characters', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(m.notes)')
  })
})

describe('playOrchestra directivePath single statSync (P-10)', () => {
  it('removes existsSync+statSync triple pattern for directivePath in focus injection', () => {
    expect(mainJs).not.toContain('_ds = fs.existsSync(directivePath)')
    expect(mainJs).not.toContain('_ds2 = fs.existsSync(directivePath)')
    expect(mainJs).not.toContain('_ds3 = fs.existsSync(directivePath)')
  })

  it('uses single statSync try/catch for directivePath reads', () => {
    const block = mainJs.split('function playOrchestra')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('fs.statSync(directivePath)')
  })
})

describe('metrics:session-summary mtime skip (I-535)', () => {
  it('uses _complianceMtimeCache to skip unchanged ORCHESTRA_REPORT.md reads', () => {
    const block = mainJs.split("'metrics:session-summary'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('_complianceMtimeCache.get(p.path)')
    expect(block).toContain('_ssSt.mtimeMs')
  })
})

describe('mix-card-name title attribute (I-536)', () => {
  it('adds title attribute to mix-card-name for truncated name tooltip', () => {
    expect(rendererJs).toContain('class="mix-card-name" title="${esc(m.name)}"')
  })
})
