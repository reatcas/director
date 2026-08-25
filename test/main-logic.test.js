import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('F-04: credits floor at zero', () => {
  it('clamps credits decrement with Math.max(0, ...)', () => {
    expect(mainJs).toContain('Math.max(0, state[agent].credits - 1)')
  })

  it('does not allow raw decrement without clamping', () => {
    const rawDecrements = mainJs.match(/\.credits\s*-=\s*1/g)
    expect(rawDecrements).toBeNull()
  })
})

describe('F-03: PRODUCT_DIRECTIVE.md growth cap', () => {
  it('strips existing NEXT ITEM section before appending', () => {
    expect(mainJs).toContain("content.indexOf('## NEXT ITEM')")
    expect(mainJs).toContain('content.substring(0, nextIdx).trimEnd()')
  })

  it('overwrites NEXT ITEM instead of stacking', () => {
    const exitHandler = mainJs.split("child.on('exit'")[1] || ''
    const nextItemWrites = (exitHandler.match(/## NEXT ITEM/g) || []).length
    expect(nextItemWrites).toBeLessThanOrEqual(2)
  })
})

describe('F-02: final git check on process exit', () => {
  it('calls pollGitCommits before stopTailing in exit handler', () => {
    const exitHandler = mainJs.split("child.on('exit'")[1] || ''
    const pollIdx = exitHandler.indexOf('pollGitCommits(dir)')
    const stopIdx = exitHandler.indexOf('stopTailing(dir)')
    expect(pollIdx).toBeGreaterThan(-1)
    expect(stopIdx).toBeGreaterThan(-1)
    expect(pollIdx).toBeLessThan(stopIdx)
  })

  it('extracts pollGitCommits as a reusable function', () => {
    expect(mainJs).toContain('function pollGitCommits(dir)')
  })

  it('stores lastHash in a Map for cross-function access', () => {
    expect(mainJs).toContain('gitLastHash')
    expect(mainJs).toContain('gitLastHash.set(dir,')
  })
})
