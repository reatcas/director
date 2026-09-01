import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT      = path.resolve(import.meta.dirname, '..')
const graphJs   = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const mainJs    = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

// ─── P-63: _t modulo bound in animLoop ───────────────────────────────────────

describe('animLoop bounds _t with modulo to prevent float precision loss (P-63)', () => {
  const animBlock = graphJs.split('function animLoop')[1]?.split('\nfunction ')[0] || ''

  it('uses modulo assignment instead of plain increment', () => {
    expect(animBlock).toContain('_t = (_t + 0.05) % (Math.PI * 2)')
  })

  it('plain _t += 0.05 is no longer present in animLoop', () => {
    expect(animBlock).not.toContain('_t += 0.05')
  })

  it('_t bound uses Math.PI * 2 — full rotation period', () => {
    expect(animBlock).toContain('Math.PI * 2')
  })

  it('modulo expression precedes any loop in animLoop', () => {
    const modIdx = animBlock.indexOf('_t = (_t + 0.05) % (Math.PI * 2)')
    const forIdx = animBlock.indexOf('for (')
    expect(modIdx).toBeGreaterThan(-1)
    expect(forIdx).toBeGreaterThan(modIdx)
  })
})

describe('_t state declaration is still present at module level (P-63)', () => {
  it('_t initialized to 0 in state block', () => {
    expect(graphJs).toContain('_t = 0')
  })

  it('_t only mutated via modulo expression in animLoop', () => {
    const incrementCount = (graphJs.match(/_t \+= /g) || []).length
    expect(incrementCount).toBe(0)
  })
})

// ─── S-69: .env.* and .envrc blocked in repertoire:readFile ──────────────────

describe('repertoire:readFile blocks .env.* variants (S-69)', () => {
  const readFileBlock = mainJs.split("ipcMain.handle('repertoire:readFile'")[1]?.split('\n})')[0] || ''

  it('has a regex guard for .env. prefixed files', () => {
    expect(readFileBlock).toContain('/^\\.env\\./.test(base)')
  })

  it('blocks .envrc explicitly', () => {
    expect(readFileBlock).toContain("base === '.envrc'")
  })

  it('env-variant guard returns null', () => {
    const guardLine = readFileBlock.split('/^\\.env\\./.test(base)')[1]?.split('\n')[0] || ''
    expect(guardLine).toContain('return null')
  })

  it('env-variant guard appears after _BLOCKED_FILE_NAME check', () => {
    const blockedIdx = readFileBlock.indexOf('_BLOCKED_FILE_NAME.has(base)')
    const envIdx     = readFileBlock.indexOf('/^\\.env\\./.test(base)')
    expect(blockedIdx).toBeGreaterThan(-1)
    expect(envIdx).toBeGreaterThan(blockedIdx)
  })

  it('env-variant guard is before the try block', () => {
    const envIdx = readFileBlock.indexOf('/^\\.env\\./.test(base)')
    const tryIdx = readFileBlock.indexOf('try {')
    expect(envIdx).toBeGreaterThan(-1)
    expect(tryIdx).toBeGreaterThan(envIdx)
  })
})

describe('original .env block still present alongside S-69 guard (S-69 consistency)', () => {
  const readFileBlock = mainJs.split("ipcMain.handle('repertoire:readFile'")[1]?.split('\n})')[0] || ''

  it('_BLOCKED_FILE_NAME set still used for exact-match blocking', () => {
    expect(readFileBlock).toContain('_BLOCKED_FILE_NAME.has(base)')
  })

  it('_BLOCKED_FILE_EXT set still used for extension blocking', () => {
    expect(readFileBlock).toContain('_BLOCKED_FILE_EXT.has(ext)')
  })

  it('isKnownProject guard still present', () => {
    expect(readFileBlock).toContain('isKnownProject(dir)')
  })
})
