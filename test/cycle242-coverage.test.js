import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT      = path.resolve(import.meta.dirname, '..')
const mainJs    = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const coordJs   = fs.readFileSync(path.join(ROOT, 'coordination-protocol.js'), 'utf8')

// ─── T-142: S-85 aiLogin/aiAuthStatus + S-86 orch guards ──────────────────

describe('preload aiLogin string guard (S-85)', () => {
  it('aiLogin validates id as non-empty string ≤64 chars', () => {
    const block = preloadJs.split('aiLogin')[1]?.split('\n  },')[0] || ''
    expect(block).toContain("typeof id !== 'string'")
    expect(block).toContain('64')
    expect(block).toContain('Promise.resolve(')
  })
})

describe('preload aiAuthStatus string guard (S-85)', () => {
  it('aiAuthStatus validates id as string', () => {
    const block = preloadJs.split('aiAuthStatus')[1]?.split('\n  },')[0] || ''
    expect(block).toContain("typeof id !== 'string'")
    expect(block).toContain('loggedIn: false')
  })
})

describe('preload orchestraVersionCheck string guard (S-86)', () => {
  it('orchestraVersionCheck validates p as non-empty string', () => {
    const block = preloadJs.split('orchestraVersionCheck')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(null)')
  })
})

describe('preload orchestraUpgrade string guard (S-86)', () => {
  it('orchestraUpgrade validates p as non-empty string', () => {
    const block = preloadJs.split('orchestraUpgrade')[1]?.split('\n')[0] || ''
    expect(block).toContain("typeof p !== 'string'")
    expect(block).toContain('Promise.resolve(')
  })
})

// ─── T-143: P-72 _coordTelDirReady + B-26 coordination TTL ──────────────────

describe('CoordinationProtocol _coordTelDirReady Set (P-72)', () => {
  it('constructor declares _coordTelDirReady Set', () => {
    expect(coordJs).toContain('_coordTelDirReady')
    expect(coordJs).toContain('new Set()')
  })

  it('persistTelemetry uses _coordTelDirReady to skip redundant mkdirSync', () => {
    const block = coordJs.split('persistTelemetry(dir) {')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('_coordTelDirReady.has(dir)')
    expect(block).toContain('_coordTelDirReady.add(dir)')
  })

  it('cleanup removes dir from _coordTelDirReady', () => {
    const block = coordJs.split('cleanup(dir) {')[1]?.split('\n  }')[0] || ''
    expect(block).toContain('_coordTelDirReady.delete(dir)')
  })
})

describe('metrics:coordination uses slow TTL when no active instances (B-26)', () => {
  it('coordination handler checks getInstanceCount() === 0', () => {
    const block = mainJs.split("ipcMain.handle('metrics:coordination'")[1]?.split('\n})')[0] || ''
    expect(block).toContain('getInstanceCount() === 0')
  })

  it('coordination handler uses _SLOW_METRICS_TTL for idle state', () => {
    const block = mainJs.split("ipcMain.handle('metrics:coordination'")[1]?.split('\n})')[0] || ''
    expect(block).toContain('_SLOW_METRICS_TTL')
  })
})

// ─── T-144: F-24 compressionStats+compressionHist cached refs ────────────────

describe('updateCompressionPanel caches DOM refs (F-24)', () => {
  it('module declares _compressionStatsEl and _compressionHistEl', () => {
    expect(rendererJs).toContain('_compressionStatsEl')
    expect(rendererJs).toContain('_compressionHistEl')
  })

  it('updateCompressionPanel uses cached _compressionStatsEl ref', () => {
    const block = rendererJs.split('function updateCompressionPanel')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('_compressionStatsEl')
    expect(block).toContain('_compressionHistEl')
  })

  it('updateCompressionPanel lazy-initializes refs with $ lookup', () => {
    const block = rendererJs.split('function updateCompressionPanel')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain("$('#compressionStats')")
    expect(block).toContain("$('#compressionHistory')")
  })
})
