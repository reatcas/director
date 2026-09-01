import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT      = path.resolve(import.meta.dirname, '..')
const graphJs   = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')

// ─── P-64: _nodeMap for O(1) nodePos lookup ───────────────────────────────────

describe('_nodeMap declared at module state level (P-64)', () => {
  it('_nodeMap is declared as a new Map() in state block', () => {
    expect(graphJs).toContain('let _nodeMap    = new Map()')
  })

  it('comment describes O(1) lookup purpose', () => {
    expect(graphJs).toContain('O(1) lookup in nodePos()')
  })
})

describe('nodePos() uses _nodeMap.get() instead of find() (P-64)', () => {
  const nodePosBlock = graphJs.split('function nodePos')[1]?.split('\n  }')[0] || ''

  it('uses _nodeMap.get(id) for lookup', () => {
    expect(nodePosBlock).toContain('_nodeMap.get(id)')
  })

  it('does not use Array.find()', () => {
    expect(nodePosBlock).not.toContain('.find(')
  })

  it('does not check _gData directly (delegates to map)', () => {
    expect(nodePosBlock).not.toContain('_gData')
  })

  it('still guards on n.x === undefined', () => {
    expect(nodePosBlock).toContain('n.x === undefined')
  })
})

describe('_nodeMap populated in init() after buildData() (P-64)', () => {
  const initBlock = graphJs.split('function init(containerEl')[1]?.split('\n  function ')[0] || ''

  it('_nodeMap assigned from _gData.nodes after buildData()', () => {
    expect(initBlock).toContain('_nodeMap = new Map(_gData.nodes.map(n => [n.id, n]))')
  })

  it('_nodeMap assignment follows _gData = buildData()', () => {
    const buildIdx = initBlock.indexOf('_gData = buildData()')
    const mapIdx   = initBlock.indexOf('_nodeMap = new Map(')
    expect(buildIdx).toBeGreaterThan(-1)
    expect(mapIdx).toBeGreaterThan(buildIdx)
  })
})

describe('destroy() clears _nodeMap (P-64)', () => {
  const destroyBlock = graphJs.split('function destroy')[1]?.split('\n  }')[0] || ''

  it('destroy() calls _nodeMap.clear()', () => {
    expect(destroyBlock).toContain('_nodeMap.clear()')
  })

  it('_nodeMap cleared alongside _sectionMap', () => {
    const sectionIdx = destroyBlock.indexOf('_sectionMap.clear()')
    const nodeIdx    = destroyBlock.indexOf('_nodeMap.clear()')
    expect(sectionIdx).toBeGreaterThan(-1)
    expect(nodeIdx).toBeGreaterThan(-1)
  })
})

// ─── S-70: preload defense-in-depth for notesWrite and mixerSavedSave ─────────

describe('preload notesWrite validates content at boundary (S-70)', () => {
  const notesBlock = preloadJs.split('notesWrite:')[1]?.split('\n  },')[0] || ''

  it('checks content is a string at preload boundary', () => {
    expect(notesBlock).toContain("typeof c !== 'string'")
  })

  it('rejects content exceeding 50000 chars at preload boundary', () => {
    expect(notesBlock).toContain('c.length > 50000')
  })

  it('returns false immediately on invalid content without calling IPC', () => {
    expect(notesBlock).toContain('return Promise.resolve(false)')
  })
})

describe('preload mixerSavedSave validates name and focus at boundary (S-70)', () => {
  const saveBlock = preloadJs.split('mixerSavedSave:')[1]?.split('\n  },')[0] || ''

  it('validates name is non-empty string', () => {
    expect(saveBlock).toContain("typeof n !== 'string'")
    expect(saveBlock).toContain('n.length === 0')
  })

  it('rejects name exceeding 256 chars at preload', () => {
    expect(saveBlock).toContain('n.length > 256')
  })

  it('validates focus is a non-array object', () => {
    expect(saveBlock).toContain("typeof f !== 'object'")
    expect(saveBlock).toContain('Array.isArray(f)')
  })

  it('returns false immediately on invalid input without calling IPC', () => {
    expect(saveBlock).toContain('return Promise.resolve(false)')
  })
})

describe('systemKill preload guard still present after S-70 (consistency)', () => {
  it('systemKill validates pid is positive integer at preload', () => {
    expect(preloadJs).toContain('!Number.isInteger(pid) || pid <= 0')
  })

  it('systemKill validates signal is in allowlist', () => {
    expect(preloadJs).toContain("['SIGTERM', 'SIGKILL'].includes(sig)")
  })
})
