import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { ContextProtocol } from '../context-protocol.js'

const ROOT      = path.resolve(import.meta.dirname, '..')
const contextJs = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')

// ─── P-65: _tokenCache in ContextProtocol ────────────────────────────────────

describe('ContextProtocol has _tokenCache for section token estimates (P-65)', () => {
  it('_tokenCache declared as new Map() in constructor', () => {
    expect(contextJs).toContain("this._tokenCache    = new Map()")
  })

  it('comment describes cross-project cache with 10k cap', () => {
    expect(contextJs).toContain('sectionHash → tokenCount')
    expect(contextJs).toContain('10k)')
  })
})

describe('_splitSections uses _tokenCache for O(1) repeated lookups (P-65)', () => {
  let proto

  beforeEach(() => { proto = new ContextProtocol() })

  it('returns correct token count on first call (cache miss)', () => {
    const sections = proto._splitSections('# Title\nsome body text here')
    expect(sections[0].tokens).toBeGreaterThan(0)
  })

  it('cached result equals direct estimation on same body', () => {
    const content = '## Section\nhello world this is a test of the token cache system'
    const s1 = proto._splitSections(content)
    const s2 = proto._splitSections(content)
    expect(s1[0].tokens).toBe(s2[0].tokens)
  })

  it('_tokenCache is populated after first call', () => {
    proto._splitSections('## Head\nsome content here')
    expect(proto._tokenCache.size).toBeGreaterThan(0)
  })

  it('_tokenCache entries survive across multiple files', () => {
    proto._splitSections('## Shared\nidentical body text used twice')
    const size1 = proto._tokenCache.size
    proto._splitSections('## Shared\nidentical body text used twice')
    expect(proto._tokenCache.size).toBe(size1)  // cache hit: same content = same hash
  })

  it('different body content produces different cache entries', () => {
    proto._splitSections('## A\nalpha body')
    const size1 = proto._tokenCache.size
    proto._splitSections('## B\nbeta body different')
    expect(proto._tokenCache.size).toBeGreaterThan(size1)
  })

  it('cache cap enforced at 10_000 entries', () => {
    expect(contextJs).toContain('this._tokenCache.size >= 10_000')
  })
})

// ─── BL-13: duplicate section title deduplication in _splitSections ──────────

describe('_splitSections deduplicates repeated section titles (BL-13)', () => {
  let proto

  beforeEach(() => { proto = new ContextProtocol() })

  it('first occurrence of a title keeps original name', () => {
    const sections = proto._splitSections('## Stats\nfirst\n## Stats\nsecond')
    expect(sections[0].title).toBe('Stats')
  })

  it('second occurrence of a duplicate title gets _1 suffix', () => {
    const sections = proto._splitSections('## Stats\nfirst\n## Stats\nsecond')
    expect(sections[1].title).toBe('Stats_1')
  })

  it('third occurrence of a triplicate title gets _2 suffix', () => {
    const content = '## Stats\nfirst\n## Stats\nsecond\n## Stats\nthird'
    const sections = proto._splitSections(content)
    expect(sections[2].title).toBe('Stats_2')
  })

  it('non-duplicate titles are not modified', () => {
    const content = '## Units\nsome\n## Stats\nother'
    const sections = proto._splitSections(content)
    expect(sections[0].title).toBe('Units')
    expect(sections[1].title).toBe('Stats')
  })

  it('titleCount is tracked per _splitSections call, not shared', () => {
    const s1 = proto._splitSections('## Stats\nfoo')
    const s2 = proto._splitSections('## Stats\nfoo')
    expect(s1[0].title).toBe('Stats')
    expect(s2[0].title).toBe('Stats')
  })
})

describe('_splitSections source uses titleCount Map for deduplication (BL-13)', () => {
  it('declares titleCount Map', () => {
    expect(contextJs).toContain('const titleCount = new Map()')
  })

  it('uses count-based suffix pattern', () => {
    expect(contextJs).toContain('`${rawTitle}_${count}`')
  })

  it('first occurrence (count 0) gets raw title without suffix', () => {
    expect(contextJs).toContain('count === 0 ? rawTitle :')
  })
})
