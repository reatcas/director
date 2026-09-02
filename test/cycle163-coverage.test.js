import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('proc-row innerHTML escaping (I-482)', () => {
  const block = rendererJs.split('row.innerHTML')[1]?.split('list.appendChild(row)')[0] || ''

  it('escapes p.pid via esc(String(p.pid))', () => {
    expect(block).toContain('esc(String(p.pid))')
  })

  it('escapes p.cpu, p.mem, p.time in proc-stats span', () => {
    expect(block).toContain('esc(String(p.cpu))')
    expect(block).toContain('esc(String(p.mem))')
    expect(block).toContain('esc(String(p.time))')
  })
})

describe('project list p.version escaping (I-483)', () => {
  it('escapes p.version with esc(String(p.version)) in li.innerHTML', () => {
    const block = rendererJs.split('li.innerHTML')[0]?.split('\n').slice(-30).join('\n') || ''
    expect(rendererJs).toContain("'v' + esc(String(p.version))")
  })
})

describe('proc-kill-btn aria-label (I-485)', () => {
  it('proc-kill-btn has aria-label instead of only title', () => {
    const block = rendererJs.split('row.innerHTML')[1]?.split('list.appendChild(row)')[0] || ''
    expect(block).toContain('aria-label=')
    expect(block).not.toContain('title="Terminate')
    expect(block).not.toContain('title="Kill')
  })
})

describe('metrics:compliance null-score filter (I-484)', () => {
  const block = mainJs.split("'metrics:compliance'")[1]?.split('\nipcMain')[0] || ''

  it('filters null scores before computing average', () => {
    expect(block).toContain('_p.score !== null')
  })

  it('guards avg with Number.isFinite', () => {
    expect(block).toContain('Number.isFinite(_rawAvg)')
  })
})
