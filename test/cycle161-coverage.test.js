import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('aiState usage-limit write cap (I-475)', () => {
  it('caps usage-limit aiState write via _aisUsageSer at 256KB', () => {
    expect(mainJs).toContain('_aisUsageSer')
    expect(mainJs).toContain('_aisUsageSer.length <= 262_144')
  })

  it('caps dirty aiState write via _aisDirtySer at 256KB', () => {
    expect(mainJs).toContain('_aisDirtySer')
    expect(mainJs).toContain('_aisDirtySer.length <= 262_144')
  })
})

describe('bpAskCurrent previous answer escaped (I-476)', () => {
  const block = rendererJs.split('function bpAskCurrent')[1]?.split('\nfunction ')[0] || ''

  it('escapes existing blueprint answer before HTML insertion', () => {
    expect(block).toContain('esc(existing)')
  })

  it('does not insert existing unescaped into prompt', () => {
    expect(block).not.toContain('${existing}')
  })
})

describe('getClaudeUsage dailyBudget guard (I-477)', () => {
  const block = mainJs.split('function getClaudeUsage')[1]?.split('\nfunction ')[0] || ''

  it('uses Number.isFinite guard on claudeUsageBudget', () => {
    expect(block).toContain('Number.isFinite(cfg.claudeUsageBudget)')
  })

  it('falls back to 1_000_000 if budget is invalid', () => {
    expect(block).toContain('1_000_000')
  })
})

describe('#analysisOut + #commitBreakdown aria (I-478)', () => {
  it('#analysisOut has aria-label and aria-readonly', () => {
    expect(indexHtml).toContain('id="analysisOut"')
    const block = indexHtml.split('id="analysisOut"')[1]?.split('>')[0] || ''
    expect(block).toContain('aria-label=')
    expect(block).toContain('aria-readonly="true"')
  })

  it('#commitBreakdown has role=img and aria-label', () => {
    const block = indexHtml.split('id="commitBreakdown"')[1]?.split('>')[0] || ''
    expect(block).toContain('role="img"')
    expect(block).toContain('aria-label=')
  })
})
