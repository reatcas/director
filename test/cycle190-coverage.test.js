import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('blueprint:save sessions.started ISO validation (S-21)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''

  it('validates sessions.started with ISO date regex', () => {
    expect(block).toContain('s.started !== undefined')
    expect(block).toContain('s.started)')
    const startedLine = block.split('\n').find(l => l.includes('s.started !== undefined')) || ''
    expect(startedLine).toContain('\\d{4}')
  })
})

describe('blueprint:save sessions.ended ISO validation (S-22)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\n})\n')[0] || ''

  it('validates sessions.ended with ISO date regex', () => {
    expect(block).toContain('s.ended !== undefined')
    expect(block).toContain('/^\\d{4}-\\d{2}-\\d{2}T/.test(s.ended)')
  })
})

describe('app restart watcher statSync (P-25)', () => {
  const block = mainJs.split('p.path, USAGE_LIMIT_SIGNAL')[1]?.split('watchForResume')[0] || ''

  it('uses statSync for logFile instead of existsSync', () => {
    expect(mainJs).toContain('_lfSt')
    expect(mainJs).not.toContain('fs.existsSync(logFile)')
  })

  it('uses statSync for usageSig instead of existsSync', () => {
    expect(block).toContain('_usSt')
    expect(mainJs).not.toContain('fs.existsSync(usageSig)')
  })
})

describe('orchestra:install statSync hooks (I-563)', () => {
  const block = mainJs.split("'orchestra:install'")[1]?.split('\n})\n')[0] || ''

  it('uses statSync for hooks directory', () => {
    expect(block).toContain('_hkSt')
    expect(block).not.toContain('fs.existsSync(hooks)')
  })
})
