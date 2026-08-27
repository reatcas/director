import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('atriles:save icon control char guard (I-515)', () => {
  const block = mainJs.split("'atriles:save'")[1]?.split('\nipcMain')[0] || ''

  it('guards icon field for control characters', () => {
    expect(block).toContain("typeof a.icon === 'string' && /[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]/.test(a.icon)")
  })
})

describe('blueprint:save answers key count cap (I-516)', () => {
  const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''

  it('rejects answers with more than 200 keys', () => {
    expect(block).toContain('Object.keys(data.answers).length > 200')
  })
})

describe('repertoire:remove usageTracker cleanup (I-517)', () => {
  const block = mainJs.split("'repertoire:remove'")[1]?.split('\nipcMain')[0] || ''

  it('deletes usageTracker entry on project removal', () => {
    expect(block).toContain('usageTracker.delete(dir)')
  })
})

describe('transport a11y-live announcements (I-518)', () => {
  it('play action announces to a11y-live region', () => {
    const block = rendererJs.split('#playBtn\')) $(\'#playBtn\').onclick')[1]?.split('\nif ($')[0] || ''
    expect(block).toContain("'a11y-live'")
    expect(block).toContain('Orquesta iniciada')
  })

  it('fine action announces to a11y-live region', () => {
    const block = rendererJs.split('#fineBtn\')) $(\'#fineBtn\').onclick')[1]?.split('\nif ($')[0] || ''
    expect(block).toContain("'a11y-live'")
    expect(block).toContain('Cerrando último compás')
  })

  it('kill action announces to a11y-live region', () => {
    const block = rendererJs.split('#killBtn\')) $(\'#killBtn\').onclick')[1]?.split('\n// Note')[0] || ''
    expect(block).toContain("'a11y-live'")
    expect(block).toContain('Orquesta detenida')
  })
})
