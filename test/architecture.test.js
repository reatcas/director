import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')

describe('file inventory', () => {
  const requiredFiles = [
    'main.js', 'renderer.js', 'preload.js', 'index.html', 'styles.css',
    'resource-scheduler.js', 'context-protocol.js', 'coordination-protocol.js',
    'mixer-chart.js', 'package.json'
  ]

  for (const f of requiredFiles) {
    it(`${f} exists`, () => {
      expect(fs.existsSync(path.join(ROOT, f))).toBe(true)
    })
  }
})

describe('CommonJS module exports', () => {
  it('resource-scheduler.js exports ResourceScheduler', () => {
    const src = fs.readFileSync(path.join(ROOT, 'resource-scheduler.js'), 'utf8')
    expect(src).toContain('module.exports')
    expect(src).toContain('ResourceScheduler')
  })

  it('context-protocol.js exports ContextProtocol', () => {
    const src = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')
    expect(src).toContain('module.exports')
    expect(src).toContain('ContextProtocol')
  })

  it('coordination-protocol.js exports CoordinationProtocol', () => {
    const src = fs.readFileSync(path.join(ROOT, 'coordination-protocol.js'), 'utf8')
    expect(src).toContain('module.exports')
    expect(src).toContain('CoordinationProtocol')
  })
})

describe('main.js requires protocol modules', () => {
  const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

  it('requires ResourceScheduler', () => {
    expect(mainJs).toContain("require('./resource-scheduler')")
  })

  it('requires ContextProtocol', () => {
    expect(mainJs).toContain("require('./context-protocol')")
  })

  it('requires CoordinationProtocol', () => {
    expect(mainJs).toContain("require('./coordination-protocol')")
  })
})

describe('state files structure', () => {
  it('ROADMAP.md exists with product features', () => {
    const roadmap = fs.readFileSync(path.join(ROOT, 'ROADMAP.md'), 'utf8')
    expect(roadmap).toContain('## Product Features')
    expect(roadmap).toContain('## Improvements')
    expect(roadmap).toContain('**F-')
    expect(roadmap).toContain('**I-')
  })

  it('DECISIONS.md has ADRs', () => {
    const decisions = fs.readFileSync(path.join(ROOT, 'DECISIONS.md'), 'utf8')
    expect(decisions).toContain('## Stack')
    expect(decisions).toContain('## Patterns')
    expect(decisions).toContain('### ADR-')
  })

  it('PENDING.md exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'PENDING.md'))).toBe(true)
  })

  it('PLAN.md exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'PLAN.md'))).toBe(true)
  })
})

describe('AGPL-3.0 license headers', () => {
  const files = ['main.js', 'renderer.js', 'preload.js', 'resource-scheduler.js',
    'context-protocol.js', 'coordination-protocol.js', 'mixer-chart.js']

  for (const f of files) {
    it(`${f} has copyright header`, () => {
      const content = fs.readFileSync(path.join(ROOT, f), 'utf8')
      expect(content).toContain('Copyright')
      expect(content).toContain('AGPL-3.0')
    })
  }
})

describe('test suite coverage', () => {
  const testFiles = fs.readdirSync(path.join(ROOT, 'test')).filter(f => f.endsWith('.test.js'))

  it('has at least 15 test files', () => {
    expect(testFiles.length).toBeGreaterThanOrEqual(15)
  })

  it('covers all protocol modules', () => {
    const names = testFiles.join(' ')
    expect(names).toContain('resource-scheduler')
    expect(names).toContain('context-protocol')
    expect(names).toContain('coordination-protocol')
  })

  it('covers harness invariants', () => {
    expect(testFiles).toContain('harness.test.js')
  })

  it('covers Smart Mix algorithm', () => {
    expect(testFiles).toContain('smart-mix.test.js')
  })
})

describe('package.json configuration', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

  it('has vitest as devDependency', () => {
    expect(pkg.devDependencies?.vitest || pkg.dependencies?.vitest).toBeDefined()
  })

  it('has electron as dependency', () => {
    expect(pkg.dependencies?.electron || pkg.devDependencies?.electron).toBeDefined()
  })

  it('defines main entry point', () => {
    expect(pkg.main).toBe('main.js')
  })
})
