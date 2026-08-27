import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('orchestra:analyze handler', () => {
  const block = mainJs.split("'orchestra:analyze'")[1]?.split('\nipcMain')[0] || ''

  it('validates dir parameter', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('reads RUN_STARTED file for time range', () => {
    expect(block).toContain('RUN_STARTED')
  })

  it('uses git log for commit history', () => {
    expect(block).toContain('git')
    expect(block).toContain('--oneline')
  })

  it('categorizes commits by conventional prefix', () => {
    expect(block).toContain('feat')
    expect(block).toContain('fix')
    expect(block).toContain('test')
  })

  it('generates report with commit count', () => {
    expect(block).toContain('commits')
    expect(block).toContain('report')
  })

  it('returns promise-based result', () => {
    expect(block).toContain('new Promise')
    expect(block).toContain('resolve')
  })
})

describe('blueprint:load handler', () => {
  it('uses readJSON with null fallback', () => {
    const block = mainJs.split("'blueprint:load'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('readJSON(blueprintFile(dir), null)')
  })

  it('validates dir parameter', () => {
    const block = mainJs.split("'blueprint:load'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('isKnownProject(dir)')
  })
})

describe('blueprint:save handler', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('validates dir parameter', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('creates directory recursively', () => {
    expect(block).toContain('mkdirSync')
    expect(block).toContain('recursive')
  })

  it('uses writeJSON for atomic persistence', () => {
    expect(block).toContain('writeJSON(p, data)')
  })
})

describe('blueprint:readiness handler', () => {
  const block = mainJs.split("'blueprint:readiness'")[1]?.split('\nipcMain')[0] || ''

  it('validates dir parameter', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('checks for required blueprint fields', () => {
    expect(block).toContain('projectName')
    expect(block).toContain('description')
    expect(block).toContain('stack')
    expect(block).toContain('projectType')
  })

  it('returns readiness status with missing fields', () => {
    expect(block).toContain('ready:')
    expect(block).toContain('missing')
  })

  it('checks for blueprint existence', () => {
    expect(block).toContain('hasBlueprint')
  })
})

describe('blueprintFile helper', () => {
  it('is defined as a function or constant', () => {
    expect(mainJs).toContain('blueprintFile')
    expect(mainJs).toMatch(/blueprintFile\s*[=(]/)
  })
})
