import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('export:session mixerConfig size guard (I-356)', () => {
  const block = mainJs.split("'export:session'")[1]?.split('\nipcMain')[0] || ''

  it('guards mixerConfig orchestra.json at 512KB', () => {
    expect(block).toContain('mixerConfig')
    expect(block).toContain('512_000')
  })

  it('uses IIFE pattern for mixerConfig guard', () => {
    expect(block).toMatch(/mixerConfig:.*statSync.*512_000/)
  })
})

describe('orchestra:writeConfig key whitelist (I-357)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('rejects keys not in allowlist', () => {
    expect(block).toContain('_allowedKeys')
    expect(block).toContain("'version'")
  })

  it('allows focus, agent, model, claudeUsageBudget, nice', () => {
    expect(block).toContain("'focus'")
    expect(block).toContain("'agent'")
    expect(block).toContain("'model'")
    expect(block).toContain("'claudeUsageBudget'")
    expect(block).toContain("'nice'")
  })

  it('validates all keys against allowlist', () => {
    expect(block).toContain('_allowedKeys.has(k)')
  })
})

describe('cmdResults listbox role (I-358)', () => {
  it('cmdResults has role=listbox', () => {
    expect(html).toMatch(/id="cmdResults"[^>]*role="listbox"/)
  })

  it('cmdResults has aria-label', () => {
    expect(html).toMatch(/id="cmdResults"[^>]*aria-label/)
  })
})

describe('allocToggle aria-expanded (I-359)', () => {
  it('allocToggle has aria-expanded attribute', () => {
    expect(html).toMatch(/id="allocToggle"[^>]*aria-expanded="false"/)
  })
})
