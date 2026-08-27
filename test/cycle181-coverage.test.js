import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('blueprint:save sessions s.started control-char guard (S-07)', () => {
  it('rejects s.started containing control characters', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(s.started)')
  })
})

describe('blueprint:save sessions per-session key count cap (S-08)', () => {
  it('rejects session objects with more than 20 keys', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''
    expect(block).toContain('Object.keys(s).length > 20')
  })
})

describe('repertoire:add single statSync (P-14)', () => {
  it('uses single statSync try/catch instead of existsSync+statSync for dir check', () => {
    const block = mainJs.split("'repertoire:add'")[1]?.split('\n})\n')[0] || ''
    expect(block).not.toContain('fs.existsSync(dir)')
    expect(block).toContain('fs.statSync(dir).isDirectory()')
  })
})

describe('mix-card keydown handler (I-544)', () => {
  it('handles Enter and Space keys to activate mix-card load', () => {
    expect(rendererJs).toContain("e.key === 'Enter' || e.key === ' '")
    expect(rendererJs).toContain('e.preventDefault()')
  })
})
