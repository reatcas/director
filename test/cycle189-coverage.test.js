import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('repertoire:add control-char guard (S-19)', () => {
  const block = mainJs.split("'repertoire:add'")[1]?.split('\n})\n')[0] || ''

  it('checks full control-char range on droppedPath', () => {
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(droppedPath)')
  })

  it('applies 4096 length cap on droppedPath', () => {
    expect(block).toContain('droppedPath.length > 4096')
  })
})

describe('blueprint:save answer value type guard (S-20)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''

  it('rejects non-null non-string answer values', () => {
    expect(block).toContain("v !== null && typeof v !== 'string'")
  })
})

describe('git watcher pidFile statSync (P-24)', () => {
  const block = mainJs.split('ORCHESTRA_PID')[1]?.split('pidAlive')[0] || ''

  it('uses statSync instead of existsSync for pidFile', () => {
    expect(block).toContain('fs.statSync(pidFile)')
    expect(block).not.toContain('fs.existsSync(pidFile)')
  })
})

describe('git watcher newCommits cap (I-562)', () => {
  const block = mainJs.split('newCommits =')[1]?.split('\n')[0] || ''

  it('caps newCommits to 100 entries', () => {
    expect(block).toContain('.slice(0, 100)')
  })
})

describe('lifecycle:list ISO date pattern filter (I-561)', () => {
  const block = mainJs.split("'lifecycle:list'")[1]?.split('\n})\n')[0] || ''

  it('validates ts with ISO date regex', () => {
    expect(block).toContain('/^\\d{4}-\\d{2}-\\d{2}T/.test(e.ts)')
  })
})
