import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('blueprint:save sessions agent field guard (S-15)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''

  it('rejects non-string agent field', () => {
    expect(block).toContain("s.agent !== undefined")
    expect(block).toContain("typeof s.agent !== 'string'")
  })

  it('rejects agent longer than 64 chars', () => {
    expect(block).toContain('s.agent.length > 64')
  })

  it('rejects agent with control characters', () => {
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(s.agent)')
  })
})

describe('blueprint:save sessions model field guard (S-16)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''

  it('rejects non-string model field', () => {
    expect(block).toContain("s.model !== undefined")
    expect(block).toContain("typeof s.model !== 'string'")
  })

  it('rejects model longer than 256 chars', () => {
    expect(block).toContain('s.model.length > 256')
  })

  it('rejects model with control characters', () => {
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(s.model)')
  })
})

describe('orchestra:clearLog no existsSync for log files (P-20)', () => {
  it('does not use existsSync for stdoutLog in clearLog', () => {
    const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\n})\n')[0] || ''
    expect(block).not.toContain('existsSync(stdoutLog)')
    expect(block).not.toContain('existsSync(masterLog)')
  })
})

describe('getClaudeUsage iter-log statSync try/catch (I-554)', () => {
  it('wraps individual statSync in try/catch inside iter-log loop', () => {
    const block = mainJs.split('function getClaudeUsage')[1]?.split('\n}\n')[0] || ''
    const loopBlock = block.split('for (const f of files)')[1]?.split('} catch {}')[0] || ''
    expect(loopBlock).toContain('try {')
    expect(loopBlock).toContain('fs.statSync')
  })
})

describe('formatReset invalid date guard (I-555)', () => {
  it('guards invalid ISO date with isNaN(_frD.getTime())', () => {
    expect(rendererJs).toContain('isNaN(_frD.getTime())')
  })
})
