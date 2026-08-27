import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('repertoire:readFile sensitive file blocklist (I-248)', () => {
  const block = mainJs.split("'repertoire:readFile'")[1]?.split('\nipcMain')[0] || ''

  it('defines _BLOCKED_FILE_EXT Set', () => {
    expect(mainJs).toContain('_BLOCKED_FILE_EXT')
    expect(mainJs).toContain("'.env'")
    expect(mainJs).toContain("'.pem'")
    expect(mainJs).toContain("'.key'")
  })

  it('defines _BLOCKED_FILE_NAME Set', () => {
    expect(mainJs).toContain('_BLOCKED_FILE_NAME')
    expect(mainJs).toContain('id_rsa')
    expect(mainJs).toContain('id_ed25519')
  })

  it('checks extension against blocklist', () => {
    expect(block).toContain('_BLOCKED_FILE_EXT.has(ext)')
  })

  it('checks filename against blocklist', () => {
    expect(block).toContain('_BLOCKED_FILE_NAME.has(base)')
  })

  it('returns null for blocked files', () => {
    const blockCheckLine = block.split('_BLOCKED_FILE_EXT.has(ext)')[1]?.split('\n')[0] || ''
    expect(blockCheckLine).toContain('return null')
  })
})

describe('BrowserWindow security flags (I-249)', () => {
  it('enables contextIsolation', () => {
    expect(mainJs).toContain('contextIsolation: true')
  })

  it('disables nodeIntegration', () => {
    expect(mainJs).toContain('nodeIntegration: false')
  })

  it('enables webSecurity', () => {
    expect(mainJs).toContain('webSecurity: true')
  })
})

describe('metrics:claude-usage caching (I-250)', () => {
  const block = mainJs.split("'metrics:claude-usage'")[1]?.split('\nipcMain')[0] || ''

  it('checks cache before computing', () => {
    expect(block).toContain("metricsGet('claude-usage:'")
    expect(block).toContain('if (hit !== null) return hit')
  })

  it('stores result in cache', () => {
    expect(block).toContain("metricsSet('claude-usage:'")
  })
})

describe('transport header landmark (I-251)', () => {
  it('transport header has role=banner', () => {
    expect(html).toMatch(/id="transport"[^>]*role="banner"/)
  })

  it('transport header has aria-label', () => {
    expect(html).toMatch(/id="transport"[^>]*aria-label/)
  })
})

describe('alerts:config and blueprint-generate-brief (cycle 119 regression)', () => {
  it('alerts:config rejects arrays', () => {
    const block = mainJs.split("'alerts:config'")[1]?.split("'alerts:read'")[0] || ''
    expect(block).toContain('!Array.isArray(cfg)')
  })

  it('blueprint:generate-brief caps output', () => {
    const block = mainJs.split("'blueprint:generate-brief'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('512_000')
  })
})
