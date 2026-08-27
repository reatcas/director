import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

describe('orchestra:kill evicts claude-usage cache (I-289)', () => {
  const block = mainJs.split("'orchestra:kill'")[1]?.split('\nipcMain')[0] || ''

  it('deletes claude-usage cache entry on kill', () => {
    expect(block).toContain("_metricsCache.delete('claude-usage:'")
  })
})

describe('orchestra:clearLog lifecycle size guard (I-290)', () => {
  const block = mainJs.split("'orchestra:clearLog'")[1]?.split('\nipcMain')[0] || ''

  it('guards lifecycle-events.json size before readJSON', () => {
    expect(block).toContain('statSync(lcFile).size <= 2_097_152')
  })

  it('initializes events as empty array', () => {
    expect(block).toContain('let events = []')
  })
})

describe('export:session read helper size guard (I-291)', () => {
  const block = mainJs.split("'export:session'")[1]?.split('\nipcMain')[0] || ''

  it('read helper guards file size at 1MB', () => {
    expect(block).toContain('statSync(p).size > 1_048_576')
  })

  it('returns empty string for oversized files', () => {
    expect(block).toContain("return ''")
  })
})

describe('orchestra:tail size guard (I-292)', () => {
  const block = mainJs.split("'orchestra:tail'")[1]?.split('\nipcMain')[0] || ''

  it('guards log file at 10MB before readFileSync', () => {
    expect(block).toContain('10_485_760')
  })

  it('returns empty string for oversized log', () => {
    expect(block).toContain("return ''")
  })
})

describe('metrics:allocation cache (I-293)', () => {
  const block = mainJs.split("'metrics:allocation'")[1]?.split('\nipcMain')[0] || ''

  it('checks allocation cache before computing', () => {
    expect(block).toContain("metricsGet('allocation:'")
    expect(block).toContain('if (hit !== null) return hit')
  })

  it('stores allocation result in cache', () => {
    expect(block).toContain("metricsSet('allocation:'")
  })
})

describe('mixer:write evicts allocation cache (I-296)', () => {
  const block = mainJs.split("'mixer:write'")[1]?.split('\nipcMain')[0] || ''

  it('evicts allocation cache when focus weights change', () => {
    expect(block).toContain("_metricsCache.delete('allocation:'")
  })
})

describe('emptyState aria role (I-294)', () => {
  it('emptyState has role=status', () => {
    expect(html).toMatch(/id="emptyState"[^>]*role="status"/)
  })

  it('emptyState has Spanish aria-label', () => {
    expect(html).toMatch(/id="emptyState"[^>]*aria-label="[^"]*[Ss]in[^"]*"/)
  })
})

describe('procsPanel region accessibility (I-295)', () => {
  it('procsPanel has role=region', () => {
    expect(html).toMatch(/id="procsPanel"[^>]*role="region"/)
  })

  it('procsPanel has Spanish aria-label', () => {
    expect(html).toMatch(/id="procsPanel"[^>]*aria-label="[^"]*[Pp]anel[^"]*"/)
  })
})
