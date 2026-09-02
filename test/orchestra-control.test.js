import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('orchestra:play handler', () => {
  const block = mainJs.split("'orchestra:play'")[1]?.split('\nipcMain')[0] || ''

  it('calls playOrchestra function', () => {
    expect(block).toContain('playOrchestra')
  })

  it('syncs protocol files before play', () => {
    expect(mainJs).toContain('syncProtocol(dir)')
  })
})

describe('orchestra:fine handler', () => {
  it('defines fine (graceful stop) handler', () => {
    expect(mainJs).toContain("'orchestra:fine'")
  })
})

describe('orchestra:kill handler', () => {
  const block = mainJs.split("'orchestra:kill'")[1]?.split('\nipcMain')[0] || ''

  it('uses killProcessGroup', () => {
    expect(block).toContain('killProcessGroup')
  })
})

describe('orchestra:tail handler', () => {
  it('returns log content', () => {
    expect(mainJs).toContain("'orchestra:tail'")
  })
})

describe('orchestra:clearLog handler', () => {
  it('clears log file', () => {
    expect(mainJs).toContain("'orchestra:clearLog'")
  })
})

describe('orchestra:writeConfig handler', () => {
  const block = mainJs.split("'orchestra:writeConfig'")[1]?.split('\nipcMain')[0] || ''

  it('validates dir via isKnownProject', () => {
    expect(block).toContain('isKnownProject(dir)')
  })

  it('uses writeJSON for atomic writes', () => {
    expect(block).toContain('writeJSON')
  })
})

describe('saved mixes handlers', () => {
  it('list reads from saved-mixes.json', () => {
    const block = mainJs.split("'mixer:saved:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('saved-mixes.json')
    expect(block).toContain('readJSON')
  })

  it('save appends to mixes array', () => {
    const block = mainJs.split("'mixer:saved:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('mixes.push')
    expect(block).toContain('writeJSON')
  })

  it('delete filters by id', () => {
    const block = mainJs.split("'mixer:saved:delete'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('_msdFiltered')
    expect(block).toContain('writeJSON')
  })

  it('export returns JSON string', () => {
    const block = mainJs.split("'mixer:saved:export'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('JSON.stringify')
  })

  it('list merges preset mixes from default-mixes.json', () => {
    const block = mainJs.split("'mixer:saved:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('default-mixes.json')
  })
})

describe('atriles handlers', () => {
  it('list reads atriles', () => {
    expect(mainJs).toContain("'atriles:list'")
  })

  it('save persists atriles', () => {
    expect(mainJs).toContain("'atriles:save'")
  })
})

describe('orchestra version management', () => {
  it('has version-check handler', () => {
    expect(mainJs).toContain("'orchestra:version-check'")
  })

  it('has upgrade handler', () => {
    expect(mainJs).toContain("'orchestra:upgrade'")
  })
})
