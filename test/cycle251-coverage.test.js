// cycle251-coverage.test.js — C251 quality_tests coverage
// T-169: S-99 play(p,a) typeof p guard source + p-before-a ordering
// T-170: S-100 tail(p,lines) typeof p guard source
// T-171: P-79 _retentionCurveCache source + Map.get() reuse integration
// T-172: A-44 #ppath aria-live + #pbadgeText aria attrs in index.html

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const preloadJs   = readFileSync(join(root, 'preload.js'), 'utf8')
const rendererJs  = readFileSync(join(root, 'renderer.js'), 'utf8')
const schedulerJs = readFileSync(join(root, 'resource-scheduler.js'), 'utf8')
const indexHtml   = readFileSync(join(root, 'index.html'), 'utf8')

// ─── T-169: S-99 — play(p,a) typeof p guard ───────────────────────────────────
describe('T-169: S-99 play(p,a) has typeof p guard before agent check', () => {
  it('play handler has typeof p !== string guard', () => {
    const body = preloadJs.split('play:')[1]?.split('aiCredits:')[0] || ''
    expect(body).toContain("typeof p !== 'string' || !p")
    expect(body).toContain("'invalid path'")
  })

  it('p guard appears before agent guard in play()', () => {
    const body = preloadJs.split('play:')[1]?.split('aiCredits:')[0] || ''
    const pIdx = body.indexOf("typeof p !== 'string'")
    const aIdx = body.indexOf("typeof a !== 'string'")
    expect(pIdx).toBeGreaterThan(-1)
    expect(aIdx).toBeGreaterThan(-1)
    expect(pIdx).toBeLessThan(aIdx)
  })

  it('play p guard returns { ok: false } not null', () => {
    const body = preloadJs.split('play:')[1]?.split('aiCredits:')[0] || ''
    // Finds the first Promise.resolve after the p guard
    const pGuardIdx = body.indexOf("typeof p !== 'string'")
    const resolveAfterP = body.indexOf('Promise.resolve(', pGuardIdx)
    const nextResolve = body.slice(resolveAfterP, resolveAfterP + 60)
    expect(nextResolve).toContain('ok: false')
  })
})

// ─── T-170: S-100 — tail(p,lines) typeof p guard ─────────────────────────────
describe('T-170: S-100 tail(p,lines) has typeof p guard', () => {
  it('tail handler has typeof p !== string guard', () => {
    const body = preloadJs.split('tail:')[1]?.split('clearLog:')[0] || ''
    expect(body).toContain("typeof p !== 'string' || !p")
    expect(body).toContain("Promise.resolve('')")
  })

  it('tail p guard returns empty string on invalid path', () => {
    const body = preloadJs.split('tail:')[1]?.split('clearLog:')[0] || ''
    // Early return with empty string
    const guardIdx = body.indexOf("typeof p !== 'string'")
    const resolveIdx = body.indexOf("Promise.resolve('')", guardIdx)
    expect(guardIdx).toBeGreaterThan(-1)
    expect(resolveIdx).toBeGreaterThan(guardIdx)
  })
})

// ─── T-171: P-79 — _retentionCurveCache memoization ────────────────────────
describe('T-171: P-79 _retentionCurveCache Map memoization in ResourceScheduler', () => {
  it('constructor initializes _retentionCurveCache as Map', () => {
    expect(schedulerJs).toContain('this._retentionCurveCache = new Map()')
  })

  it('_retentionCurve uses Map.get() keyed by Math.round(share*1000)', () => {
    const body = schedulerJs.split('_retentionCurve(share) {')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('Math.round(share * 1000)')
    expect(body).toContain('this._retentionCurveCache.get(_key)')
    expect(body).toContain('this._retentionCurveCache.set(_key, _val)')
  })

  it('_retentionCurve returns cached value on second call with same share', () => {
    const { ResourceScheduler } = require(join(root, 'resource-scheduler.js'))
    const rs = new ResourceScheduler()
    const share = 0.5
    const r1 = rs._retentionCurve(share)
    // Overwrite cache to verify it reads from cache, not recomputes
    const key = Math.round(share * 1000)
    rs._retentionCurveCache.set(key, 42)
    const r2 = rs._retentionCurve(share)
    expect(r1).not.toBe(42)
    expect(r2).toBe(42)
  })

  it('_retentionCurve computes correct sigmoid for share=0.5', () => {
    const { ResourceScheduler } = require(join(root, 'resource-scheduler.js'))
    const rs = new ResourceScheduler()
    const r = rs._retentionCurve(0.5)
    expect(r).toBeGreaterThan(0.10)
    expect(r).toBeLessThan(0.95)
    // Sigmoid should be >0.5 for share>0.3
    expect(r).toBeGreaterThan(0.7)
  })
})

// ─── T-172: A-44 — #ppath aria-live + #pbadgeText aria attrs ─────────────────
describe('T-172: A-44 aria-live on #ppath and aria attrs on #pbadgeText', () => {
  it('#ppath has aria-live="polite"', () => {
    const ppathAttrs = indexHtml.split('id="ppath"')[1]?.split('>')[0] || ''
    expect(ppathAttrs).toContain('aria-live="polite"')
  })

  it('#ppath has aria-label', () => {
    const ppathAttrs = indexHtml.split('id="ppath"')[1]?.split('>')[0] || ''
    expect(ppathAttrs).toContain('aria-label=')
  })

  it('#pbadgeText has aria-live="polite"', () => {
    const badgeAttrs = indexHtml.split('id="pbadgeText"')[1]?.split('>')[0] || ''
    expect(badgeAttrs).toContain('aria-live="polite"')
  })

  it('#pbadgeText has aria-label', () => {
    const badgeAttrs = indexHtml.split('id="pbadgeText"')[1]?.split('>')[0] || ''
    expect(badgeAttrs).toContain('aria-label=')
  })
})
