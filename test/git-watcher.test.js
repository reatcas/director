import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

describe('pollGitCommits function', () => {
  const block = mainJs.split('function pollGitCommits')[1]?.split('\nfunction ')[0] || ''

  it('tracks last hash via gitLastHash Map', () => {
    expect(block).toContain('gitLastHash.get(dir)')
    expect(block).toContain('gitLastHash.set(dir,')
  })

  it('uses git log to get current hash', () => {
    expect(block).toContain('git log -1 --format=%H')
  })

  it('detects new commits by hash comparison', () => {
    expect(block).toContain('currentHash !== lastHash')
  })

  it('sends commit events to renderer', () => {
    expect(block).toContain('orchestra:line')
  })

  it('uses timeout on git commands', () => {
    expect(block).toContain('timeout:')
  })

  it('wraps in try/catch for resilience', () => {
    expect(block).toContain('try')
    expect(block).toContain('catch')
  })
})

describe('startTailing function', () => {
  const block = mainJs.split('function startTailing')[1]?.split('\nfunction ')[0] || ''

  it('prevents duplicate tailers', () => {
    expect(block).toContain('tailers.has(dir)')
  })

  it('uses setInterval for polling', () => {
    expect(block).toContain('setInterval')
  })

  it('tracks file position for incremental reads', () => {
    expect(block).toContain('pos')
    expect(block).toContain('statSync')
  })

  it('detects stale log files', () => {
    expect(block).toContain('staleCount')
  })
})

describe('IPC channel architecture', () => {
  it('has all repertoire handlers', () => {
    expect(mainJs).toContain("'repertoire:list'")
    expect(mainJs).toContain("'repertoire:add'")
    expect(mainJs).toContain("'repertoire:remove'")
    expect(mainJs).toContain("'repertoire:readFile'")
  })

  it('has all orchestra handlers', () => {
    expect(mainJs).toContain("'orchestra:play'")
    expect(mainJs).toContain("'orchestra:fine'")
    expect(mainJs).toContain("'orchestra:kill'")
    expect(mainJs).toContain("'orchestra:tail'")
    expect(mainJs).toContain("'orchestra:clearLog'")
    expect(mainJs).toContain("'orchestra:analyze'")
  })

  it('has all mixer handlers', () => {
    expect(mainJs).toContain("'mixer:read'")
    expect(mainJs).toContain("'mixer:write'")
    expect(mainJs).toContain("'mixer:history'")
    expect(mainJs).toContain("'mixer:saved:list'")
    expect(mainJs).toContain("'mixer:saved:save'")
    expect(mainJs).toContain("'mixer:saved:delete'")
    expect(mainJs).toContain("'mixer:saved:export'")
  })

  it('has all metrics handlers', () => {
    expect(mainJs).toContain("'metrics:resource'")
    expect(mainJs).toContain("'metrics:context'")
    expect(mainJs).toContain("'metrics:coordination'")
    expect(mainJs).toContain("'metrics:compliance'")
    expect(mainJs).toContain("'metrics:roadmap-freshness'")
    expect(mainJs).toContain("'metrics:session-summary'")
  })

  it('has lifecycle handlers', () => {
    expect(mainJs).toContain("'lifecycle:list'")
    expect(mainJs).toContain("'lifecycle:add'")
  })

  it('has system handlers', () => {
    expect(mainJs).toContain("'system:claude-procs'")
    expect(mainJs).toContain("'system:kill-proc'")
  })

  it('has blueprint handlers', () => {
    expect(mainJs).toContain("'blueprint:load'")
    expect(mainJs).toContain("'blueprint:save'")
    expect(mainJs).toContain("'blueprint:readiness'")
  })
})

describe('preload.js + main.js IPC alignment', () => {
  const preload = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')

  it('every preload channel has a main.js handler', () => {
    const channels = preload.match(/ipcRenderer\.invoke\('([^']+)'/g) || []
    const channelNames = channels.map(c => c.match(/'([^']+)'/)[1])
    for (const ch of channelNames) {
      expect(mainJs).toContain(`'${ch}'`)
    }
  })
})
