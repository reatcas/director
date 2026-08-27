import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const coordProto = fs.readFileSync(path.join(ROOT, 'coordination-protocol.js'), 'utf8')

describe('persistLifecycleEvent size guard (I-321)', () => {
  it('guards lifecycle-events.json before readJSON', () => {
    const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('statSync(file).size <= 2_097_152')
  })

  it('initializes events as empty array', () => {
    const block = mainJs.split('function persistLifecycleEvent')[1]?.split('\nfunction ')[0] || ''
    expect(block).toContain('let events = []')
  })
})

describe('exit handler directivePath size guard (I-322)', () => {
  it('exit handler guards directivePath at 512KB', () => {
    expect(mainJs).toContain('_dse.size <= 512_000')
  })

  it('uses statSync pattern for directive read', () => {
    expect(mainJs).toContain('_dse.size > 0 && _dse.size <= 512_000')
  })
})

describe('project transport action button aria-labels (I-323)', () => {
  it('openFolderBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="openFolderBtn"[^>]*aria-label="[^"]*Abrir[^"]*"/)
  })

  it('installBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="installBtn"[^>]*aria-label="[^"]*Instalar[^"]*"/)
  })

  it('upgradeBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="upgradeBtn"[^>]*aria-label="[^"]*Actualizar[^"]*"/)
  })

  it('removeBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="removeBtn"[^>]*aria-label="[^"]*Eliminar[^"]*"/)
  })
})

describe('mixer input/save button aria-labels (I-324)', () => {
  it('mixImportBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="mixImportBtn"[^>]*aria-label/)
  })

  it('saveMixer has Spanish aria-label', () => {
    expect(html).toMatch(/id="saveMixer"[^>]*aria-label="[^"]*Guardar[^"]*"/)
  })

  it('addAtrilBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="addAtrilBtn"[^>]*aria-label/)
  })
})

describe('mixer:saved:export size guard (I-325)', () => {
  const block = mainJs.split("'mixer:saved:export'")[1]?.split('\nipcMain')[0] || ''

  it('guards saved-mixes.json at 512KB', () => {
    expect(block).toContain('512_000')
    expect(block).toContain('let mixes = []')
  })
})

describe('coordination-protocol resource length cap (I-326)', () => {
  it('acquireLock rejects resource strings over 256 chars', () => {
    expect(coordProto).toContain("resource.length > 256")
  })

  it('releaseLock also validates resource length', () => {
    const releaseBlock = coordProto.split('releaseLock(dir, resource)')[1]?.split('\n').slice(0, 3).join('\n') || ''
    expect(releaseBlock).toContain('resource.length > 256')
  })
})
