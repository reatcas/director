// cycle299-coverage.test.js — C299 quality coverage
// T-282: S-176 session-summary _ssLines strip; S-177 compliance _mcLines strip
// T-283: P-116 _ribParts for-of; B-70 _ciParts indexed for-loop
// T-284: F-67 _optParts and _lcParts for-of

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')

// ─── T-282: S-176 + S-177 ────────────────────────────────────────────────────
describe('T-282: S-176 session-summary _ssLines strips ctrl-chars before push', () => {
  it('applies narrow ctrl-char strip on l before pushing to _ssLines', () => {
    const block = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_ssLines.push(l.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\'))')
  })

  it('_ssLines no longer pushes raw l', () => {
    const block = mainJs.split("'metrics:session-summary'")[1]?.split('\nipcMain')[0] || ''
    expect(block).not.toContain('_ssLines.push(l)')
  })
})

describe('T-282: S-177 metrics:compliance _mcLines strips ctrl-chars before push', () => {
  it('applies narrow ctrl-char strip on l before pushing to _mcLines', () => {
    const block = mainJs.split("'metrics:compliance'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_mcLines.push(l.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\'))')
  })

  it('_mcLines no longer pushes raw l', () => {
    const block = mainJs.split("'metrics:compliance'")[1]?.split('\nipcMain')[0] || ''
    expect(block).not.toContain('_mcLines.push(l)')
  })
})

// ─── T-283: P-116 + B-70 ─────────────────────────────────────────────────────
describe('T-283: P-116 renderMixRibbon uses _ribParts for-of instead of segments.map', () => {
  it('uses _ribParts variable', () => {
    expect(rendererJs).toContain('_ribParts')
  })

  it('no longer calls segments.map(', () => {
    expect(rendererJs).not.toContain('segments.map(')
  })

  it('uses for-of over segments', () => {
    expect(rendererJs).toContain('for (const s of segments)')
  })
})

describe('T-283: B-70 renderCmdResults uses _ciParts indexed for-loop instead of sliced.map', () => {
  it('uses _ciParts variable', () => {
    expect(rendererJs).toContain('_ciParts')
  })

  it('no longer calls sliced.map(', () => {
    expect(rendererJs).not.toContain('sliced.map(')
  })

  it('uses indexed for-loop over sliced', () => {
    expect(rendererJs).toContain('for (let i = 0; i < sliced.length; i++)')
  })
})

// ─── T-284: F-67 ─────────────────────────────────────────────────────────────
describe('T-284: F-67 credit.models uses _optParts for-of instead of .map', () => {
  it('uses _optParts variable', () => {
    expect(rendererJs).toContain('_optParts')
  })

  it('no longer calls credit.models.map(', () => {
    expect(rendererJs).not.toContain('credit.models.map(')
  })

  it('uses for-of over credit.models', () => {
    expect(rendererJs).toContain('for (const m of credit.models)')
  })
})

describe('T-284: F-67 lifecycle events uses _lcParts for-of instead of recent.map', () => {
  it('uses _lcParts variable', () => {
    expect(rendererJs).toContain('_lcParts')
  })

  it('no longer calls recent.map(', () => {
    expect(rendererJs).not.toContain('recent.map(')
  })

  it('uses for-of over recent', () => {
    expect(rendererJs).toContain('for (const ev of recent)')
  })
})
