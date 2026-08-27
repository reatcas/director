import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('findLogo path containment (I-360)', () => {
  it('validates logo path starts within project dir', () => {
    const block = mainJs.split('function findLogo(')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('fp.startsWith(dir + path.sep)')
  })

  it('checks both icon/logo/image fields and build.icon', () => {
    const block = mainJs.split('function findLogo(')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain("'icon'")
    expect(block).toContain('pkg.build')
  })
})

describe('repertoire:add path validation (I-361)', () => {
  const block = mainJs.split("'repertoire:add'")[1]?.split('\nipcMain')[0] || ''

  it('rejects NUL bytes in droppedPath', () => {
    expect(block).toContain("droppedPath.includes('\\x00')")
  })

  it('rejects non-absolute paths', () => {
    expect(block).toContain('path.isAbsolute(droppedPath)')
  })
})

describe('mixer:saved:list default-mixes.json size guard (I-362)', () => {
  const block = mainJs.split("'mixer:saved:list'")[1]?.split('\nipcMain')[0] || ''

  it('guards default-mixes.json at 512KB', () => {
    expect(block).toContain('_dmPath')
    expect(block).toContain('512_000')
  })

  it('initializes defaultMixesCache to empty array on guard fail', () => {
    expect(block).toContain('_defaultMixesCache = []')
  })
})

describe('notes:write DEL char rejection (I-363)', () => {
  const block = mainJs.split("'notes:write'")[1]?.split('\nipcMain')[0] || ''

  it('rejects DEL character (\\x7F) in content', () => {
    expect(block).toContain('\\x7F')
  })

  it('still rejects other control chars', () => {
    expect(block).toContain('\\x00-\\x08')
    expect(block).toContain('\\x0E-\\x1F')
  })
})
