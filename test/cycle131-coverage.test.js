import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('blueprint:load size guard (I-332)', () => {
  const block = mainJs.split("'blueprint:load'")[1]?.split('\nipcMain')[0] || ''

  it('guards blueprint.json at 512KB', () => {
    expect(block).toContain('512_000')
  })

  it('uses statSync pattern', () => {
    expect(block).toContain('fs.statSync(bpPath).size > 512_000')
  })
})

describe('blueprint:generate-brief size guard (I-333)', () => {
  const block = mainJs.split("'blueprint:generate-brief'")[1]?.split('\nipcMain')[0] || ''

  it('guards blueprint.json at 512KB', () => {
    expect(block).toContain('512_000')
    expect(block).toContain('let bp = null')
  })
})

describe('blueprint:readiness size guard (I-334)', () => {
  const block = mainJs.split("'blueprint:readiness'")[1]?.split('\nipcMain')[0] || ''

  it('guards blueprint.json at 512KB', () => {
    expect(block).toContain('512_000')
    expect(block).toContain('let bp = null')
  })
})

describe('export:session lifecycle+mixerHistory size guards (I-335)', () => {
  const block = mainJs.split("'export:session'")[1]?.split('\nipcMain')[0] || ''

  it('guards lifecycle-events.json at 2MB', () => {
    expect(block).toContain('2_097_152')
    expect(block).toContain('lifecycle-events.json')
  })

  it('guards mixer-history.json at 512KB', () => {
    expect(block).toContain('mixer-history.json')
    expect(block).toContain('512_000')
  })
})

describe('metrics:resource + metrics:snapshot orchestra.json guards (I-336)', () => {
  it('metrics:resource guards orchestra.json at 512KB', () => {
    const block = mainJs.split("'metrics:resource'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('512_000')
    expect(block).toContain('_cfgPath')
  })

  it('metrics:snapshot guards orchestra.json at 512KB', () => {
    const block = mainJs.split("'metrics:snapshot'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('512_000')
    expect(block).toContain('_snapPath')
  })
})

describe('blueprint:save answer length validation (I-337)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('rejects answers over 2000 chars', () => {
    expect(block).toContain('v.length > 2000')
  })

  it('validates answers object type', () => {
    expect(block).toContain('data.answers')
  })
})

describe('theme + blueprint buttons aria-labels (I-338)', () => {
  it('dark theme button has Spanish aria-label', () => {
    expect(html).toMatch(/data-theme="dark"[^>]*aria-label="[^"]*tema[^"]*"/)
  })

  it('auto theme button has Spanish aria-label', () => {
    expect(html).toMatch(/data-theme="auto"[^>]*aria-label="[^"]*tema[^"]*"/)
  })

  it('light theme button has Spanish aria-label', () => {
    expect(html).toMatch(/data-theme="light"[^>]*aria-label="[^"]*tema[^"]*"/)
  })

  it('bpSend has Spanish aria-label', () => {
    expect(html).toMatch(/id="bpSend"[^>]*aria-label/)
  })

  it('bpSkip has Spanish aria-label', () => {
    expect(html).toMatch(/id="bpSkip"[^>]*aria-label/)
  })

  it('bpAddModule has Spanish aria-label', () => {
    expect(html).toMatch(/id="bpAddModule"[^>]*aria-label="[^"]*Agregar[^"]*"/)
  })

  it('bpNewSession has Spanish aria-label', () => {
    expect(html).toMatch(/id="bpNewSession"[^>]*aria-label/)
  })

  it('bpGenerate has Spanish aria-label', () => {
    expect(html).toMatch(/id="bpGenerate"[^>]*aria-label="[^"]*Exportar[^"]*"/)
  })
})

describe('aiLoginBtn + knowledge base buttons aria-labels (I-339)', () => {
  it('aiLoginBtn has Spanish aria-label', () => {
    expect(html).toMatch(/id="aiLoginBtn"[^>]*aria-label="[^"]*AI[^"]*"/)
  })

  it('knBtnRoadmap has aria-label', () => {
    expect(html).toMatch(/id="knBtnRoadmap"[^>]*aria-label/)
  })

  it('knBtnReport has aria-label', () => {
    expect(html).toMatch(/id="knBtnReport"[^>]*aria-label/)
  })

  it('knBtnDb has aria-label', () => {
    expect(html).toMatch(/id="knBtnDb"[^>]*aria-label/)
  })

  it('knBtnPlan has aria-label', () => {
    expect(html).toMatch(/id="knBtnPlan"[^>]*aria-label/)
  })

  it('knBtnDecisions has aria-label', () => {
    expect(html).toMatch(/id="knBtnDecisions"[^>]*aria-label/)
  })

  it('knBtnPending has aria-label', () => {
    expect(html).toMatch(/id="knBtnPending"[^>]*aria-label/)
  })

  it('knBtnLearnings has aria-label', () => {
    expect(html).toMatch(/id="knBtnLearnings"[^>]*aria-label/)
  })

  it('knBtnBlueprint has aria-label', () => {
    expect(html).toMatch(/id="knBtnBlueprint"[^>]*aria-label/)
  })
})
