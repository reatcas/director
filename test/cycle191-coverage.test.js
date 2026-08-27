import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('orchestra:writeConfig claudeUsageBudget upper bound (S-23)', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\n})\n')[0] || ''

  it('caps claudeUsageBudget at 100_000_000_000', () => {
    expect(block).toContain('cfg.claudeUsageBudget > 100_000_000_000')
  })
})

describe('orchestra:readIterLog logPath pattern restriction (S-24)', () => {
  const block = mainJs.split("'orchestra:readIterLog'")[1]?.split('\n})\n')[0] || ''

  it('restricts logPath to iter-*.log pattern', () => {
    expect(block).toContain("iter-[\\w\\-.]+\\.log")
  })
})

describe('blueprint:generate-brief roadmapPath statSync (I-564)', () => {
  const block = mainJs.split("'blueprint:generate-brief'")[1]?.split('\n})\n')[0] || ''

  it('uses statSync for roadmapPath existence check', () => {
    expect(block).toContain('_gbRmExists')
    expect(block).not.toContain('fs.existsSync(roadmapPath)')
  })
})

describe('loadKnowledge _knCurrentFile reset after load (I-565)', () => {
  const block = rendererJs.split('async function loadKnowledge')[1]?.split('\n}')[0] || ''

  it('resets _knCurrentFile to null after successful load', () => {
    expect(block).toContain('_knCurrentFile = null')
  })
})
