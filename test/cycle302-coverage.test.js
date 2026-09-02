// cycle302-coverage.test.js — C302 quality coverage
// T-288: S-180 nextItem ctrl-char strip; S-181 directive content strip
// T-289: P-118 renderSparkline scores.entries(); B-72 detectConflicts entries.entries()
// T-290: F-69 mixer-tab keydown tabs.entries()

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const mainJs     = readFileSync(join(root, 'main.js'), 'utf8')
const rendererJs = readFileSync(join(root, 'renderer.js'), 'utf8')
const coordJs    = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')

// ─── T-288: S-180 + S-181 ────────────────────────────────────────────────────
describe('T-288: S-180 nextItem from ROADMAP.md gets ctrl-char strip', () => {
  it('nextItem uses .replace narrow strip before if(nextItem)', () => {
    const block = mainJs.split('startsWith(\'- [ ]\')')[1]?.split('if (nextItem)')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g')
    expect(block).toContain('.replace(')
  })

  it('nextItem strip is applied before persistLifecycleEvent', () => {
    const block = mainJs.split('startsWith(\'- [ ]\')')[1]?.split('persistLifecycleEvent')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g')
  })
})

describe('T-288: S-181 PRODUCT_DIRECTIVE.md readFileSync gets ctrl-char strip', () => {
  it('directive readFileSync has narrow strip after read', () => {
    const block = mainJs.split('PRODUCT_DIRECTIVE.md')[2]?.split('## NEXT ITEM')[0] || ''
    expect(block).toContain('readFileSync(directivePath, \'utf8\').replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/g, \'\')')
  })
})

// ─── T-289: P-118 + B-72 ─────────────────────────────────────────────────────
describe('T-289: P-118 renderSparkline uses scores.entries() instead of indexed loop', () => {
  it('uses for(const [i, s] of scores.entries())', () => {
    expect(rendererJs).toContain('for (const [i, s] of scores.entries())')
  })

  it('does not use for(let i = 0; i < scores.length; i++)', () => {
    expect(rendererJs).not.toContain('for (let i = 0; i < scores.length; i++)')
  })
})

describe('T-289: B-72 detectConflicts outer loop uses entries.entries()', () => {
  it('uses for(const [i, [dirA, infoA]] of entries.entries())', () => {
    expect(coordJs).toContain('for (const [i, [dirA, infoA]] of entries.entries())')
  })

  it('does not use for(let i = 0; i < entries.length; i++)', () => {
    expect(coordJs).not.toContain('for (let i = 0; i < entries.length; i++)')
  })
})

// ─── T-290: F-69 ─────────────────────────────────────────────────────────────
describe('T-290: F-69 mixer-tab keydown uses tabs.entries() for focus search', () => {
  it('uses for(const [_ti, tab] of tabs.entries())', () => {
    expect(rendererJs).toContain('for (const [_ti, tab] of tabs.entries())')
  })

  it('does not use for(let _ti = 0; _ti < tabs.length; _ti++)', () => {
    expect(rendererJs).not.toContain('for (let _ti = 0; _ti < tabs.length; _ti++)')
  })

  it('uses tab === document.activeElement instead of tabs[_ti]', () => {
    const block = rendererJs.split('tabs.entries()')[1]?.split('if (idx === -1)')[0] || ''
    expect(block).toContain('tab === document.activeElement')
    expect(block).not.toContain('tabs[_ti]')
  })
})
