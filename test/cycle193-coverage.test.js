import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('orchestra:writeConfig quietFlags shell-safe restriction (S-25)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\n})\n')[0] || ''

  it('restricts quietFlags to shell-safe characters', () => {
    expect(block).toContain('[^-a-zA-Z0-9 =./]')
    expect(block).toContain('cfg.quietFlags')
  })
})

describe('atriles:list load-time validation (S-26)', () => {
  const block = mainJs.split("'atriles:list'")[1]?.split('\n})\n')[0] || ''

  it('validates name length and control chars on load', () => {
    expect(block).toContain('a.name.length <= 256')
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(a.name)')
  })

  it('validates path length and control chars on load', () => {
    expect(block).toContain('a.path.length <= 4096')
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(a.path)')
  })
})

describe('findLogo single statSync in step 5 (P-29)', () => {
  const block = mainJs.split('function findLogo')[1]?.split('\n}')[0] || ''

  it('uses single statSync for root image scan', () => {
    expect(block).toContain('_flSt = fs.statSync(fp)')
    expect(block).toContain('_flSt.isFile()')
    expect(block).toContain('_flSt.size')
  })
})

describe('getClaudeUsage dailyBudget local var (I-570)', () => {
  const block = mainJs.split('function getClaudeUsage')[1]?.split('\n}')[0] || ''

  it('uses _dailyBudget local var instead of double map fetch', () => {
    expect(block).toContain('let _dailyBudget = 1_000_000')
    expect(block).toContain('const dailyBudget = _dailyBudget')
    expect(block).not.toContain('usageTracker.get(dir)?.dailyBudget')
  })
})

describe('loadKnowledge disables buttons during load (I-569)', () => {
  const block = rendererJs.split('async function loadKnowledge')[1]?.split('\n}')[0] || ''

  it('disables all knowledge tab buttons during load', () => {
    expect(block).toContain('b.disabled = true')
    expect(block).toContain('b.disabled = false')
  })
})
