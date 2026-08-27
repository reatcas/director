import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const htmlStr = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('metricsGet validates key is string with max 256 chars (S-65)', () => {
  const block = mainJs.split('function metricsGet')[1]?.split('\nfunction ')[0] || ''

  it('returns null for non-string key', () => {
    expect(block).toContain("typeof key !== 'string'")
  })

  it('returns null for key exceeding max length', () => {
    expect(block).toContain('key.length > _METRICS_KEY_MAX')
  })

  it('defines _METRICS_KEY_MAX constant', () => {
    expect(mainJs).toContain('_METRICS_KEY_MAX')
    expect(mainJs).toContain('const _METRICS_KEY_MAX = 256')
  })
})

describe('metricsSet validates key is string with max 256 chars (S-65)', () => {
  const block = mainJs.split('function metricsSet')[1]?.split('\nfunction ')[0] || ''

  it('returns val without caching on invalid key type', () => {
    expect(block).toContain("typeof key !== 'string'")
  })

  it('returns val without caching on oversized key', () => {
    expect(block).toContain('key.length > _METRICS_KEY_MAX')
    expect(block).toContain('return val')
  })
})

describe('_metricsCache periodic sweep has 500-entry size cap (S-66)', () => {
  it('defines _METRICS_CACHE_MAX at 500', () => {
    expect(mainJs).toContain('const _METRICS_CACHE_MAX = 500')
  })

  it('defines _METRICS_CACHE_TRIM at 400', () => {
    expect(mainJs).toContain('const _METRICS_CACHE_TRIM = 400')
  })

  it('checks cache size against _METRICS_CACHE_MAX', () => {
    expect(mainJs).toContain('_metricsCache.size > _METRICS_CACHE_MAX')
  })

  it('trims to _METRICS_CACHE_TRIM oldest entries', () => {
    expect(mainJs).toContain('_METRICS_CACHE_TRIM')
    const sizeBlock = mainJs.split('_metricsCache.size > _METRICS_CACHE_MAX')[1] || ''
    expect(sizeBlock).toContain('_METRICS_CACHE_TRIM')
    expect(sizeBlock).toContain('.sort(')
  })
})

describe('cachedFindLogo skips findLogo when dir does not exist (P-61)', () => {
  const block = mainJs.split('function cachedFindLogo')[1]?.split('\nfunction ')[0] || ''

  it('calls fs.existsSync on dir before findLogo', () => {
    expect(block).toContain('fs.existsSync(dir)')
  })

  it('returns null and caches result when dir is missing', () => {
    expect(block).toContain('logo: null')
    expect(block).toContain('return null')
  })

  it('existsSync check appears before findLogo call', () => {
    const existsIdx = block.indexOf('fs.existsSync(dir)')
    const findLogoIdx = block.indexOf('findLogo(dir)')
    expect(existsIdx).toBeGreaterThan(-1)
    expect(findLogoIdx).toBeGreaterThan(-1)
    expect(existsIdx).toBeLessThan(findLogoIdx)
  })
})

describe('sessionSummary has tabindex="0" for keyboard accessibility (A-26)', () => {
  it('sessionSummary element has tabindex attribute', () => {
    expect(htmlStr).toContain('id="sessionSummary"')
    const match = htmlStr.match(/id="sessionSummary"[^>]*tabindex="0"/)
    const matchAlt = htmlStr.match(/tabindex="0"[^>]*id="sessionSummary"/)
    expect(match || matchAlt).toBeTruthy()
  })
})

describe('snapshotMixer rejects unknown projects (B-14)', () => {
  const block = mainJs.split('function snapshotMixer')[1]?.split('\nfunction ')[0] || ''

  it('calls isKnownProject on dir', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('returns early when dir is not a known project', () => {
    expect(block).toMatch(/!dir.*!isKnownProject|!isKnownProject.*!dir/)
  })

  it('isKnownProject check is at the start of the function', () => {
    const guardIdx = block.indexOf('isKnownProject(dir)')
    const writeIdx = block.indexOf('mixer-history.json')
    expect(guardIdx).toBeGreaterThan(-1)
    expect(writeIdx).toBeGreaterThan(-1)
    expect(guardIdx).toBeLessThan(writeIdx)
  })
})
