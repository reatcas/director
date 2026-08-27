import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const srcFiles = ['main.js', 'renderer.js', 'preload.js', 'index.html',
  'resource-scheduler.js', 'context-protocol.js', 'coordination-protocol.js', 'mixer-chart.js']
const srcs = {}
for (const f of srcFiles) {
  srcs[f] = fs.readFileSync(path.join(ROOT, f), 'utf8')
}

describe('no eval/Function usage in source files', () => {
  for (const f of srcFiles) {
    it(`${f} does not use eval()`, () => {
      expect(srcs[f]).not.toMatch(/\beval\s*\(/)
    })

    it(`${f} does not use new Function()`, () => {
      expect(srcs[f]).not.toMatch(/new\s+Function\s*\(/)
    })
  }
})

describe('no execSync in main process (except auth status)', () => {
  it('main.js uses execSync only for auth/agent checks and git operations', () => {
    const blocks = srcs['main.js'].split('execSync(')
    blocks.shift()
    for (const block of blocks) {
      const cmd = block.split(')')[0] + block.split(')').slice(1).join(')').split('\n')[0]
      const context = block.substring(0, 200)
      const isAuth = context.includes('auth') || context.includes('--help') || context.includes('login')
      const isGit = context.includes('git ')
      expect(isAuth || isGit).toBe(true)
    }
  })
})

describe('no shell interpretation in resource-scheduler', () => {
  it('uses execFileSync not execSync', () => {
    expect(srcs['resource-scheduler.js']).toContain('execFileSync')
    expect(srcs['resource-scheduler.js']).not.toContain('execSync(')
  })
})

describe('no direct require/process exposure in preload', () => {
  it('does not expose require to renderer', () => {
    const exposed = srcs['preload.js'].split('exposeInMainWorld')[1] || ''
    expect(exposed).not.toContain('require(')
  })

  it('does not expose process object to renderer via bridge', () => {
    const exposed = srcs['preload.js'].split('exposeInMainWorld')[1] || ''
    expect(exposed).not.toContain('process.env')
    expect(exposed).not.toContain('process.exit')
    expect(exposed).not.toContain('process.cwd')
  })

  it('does not expose fs to renderer', () => {
    const exposed = srcs['preload.js'].split('exposeInMainWorld')[1] || ''
    expect(exposed).not.toMatch(/\bfs\b/)
  })
})

describe('no inline event handlers in HTML', () => {
  const html = srcs['index.html']

  it('no onclick attributes', () => {
    expect(html).not.toMatch(/\bonclick\s*=/)
  })

  it('no onload attributes', () => {
    expect(html).not.toMatch(/\bonload\s*=/)
  })

  it('no onerror attributes', () => {
    expect(html).not.toMatch(/\bonerror\s*=/)
  })

  it('no onsubmit attributes', () => {
    expect(html).not.toMatch(/\bonsubmit\s*=/)
  })

  it('no javascript: URIs', () => {
    expect(html).not.toMatch(/javascript:/i)
  })
})

describe('no inline scripts in HTML', () => {
  it('all script tags have src attribute', () => {
    const scriptTags = srcs['index.html'].match(/<script[^>]*>/g) || []
    for (const tag of scriptTags) {
      expect(tag).toContain('src=')
    }
  })
})

describe('renderer.js XSS protection', () => {
  it('defines esc() function', () => {
    expect(srcs['renderer.js']).toContain('function esc(str)')
  })

  it('esc() handles all HTML special chars', () => {
    const escBlock = srcs['renderer.js'].split('function esc(str)')[1]?.split('\n}')[0] || ''
    expect(escBlock).toContain('&amp;')
    expect(escBlock).toContain('&lt;')
    expect(escBlock).toContain('&gt;')
    expect(escBlock).toContain('&quot;')
  })

  it('no innerHTML with unescaped template literals in log entries', () => {
    const logFns = ['addCycleEntry', 'addErrorEntry', 'addClaudeMessageEntry',
      'addConclusionEntry', 'addActionEntry']
    for (const fn of logFns) {
      const block = srcs['renderer.js'].split(`function ${fn}`)[1]?.split('\nfunction ')[0] || ''
      const msgSpans = block.match(/le-msg[^>]*>\$\{(?!esc\()/g) || []
      expect(msgSpans.length).toBe(0)
    }
  })
})

describe('mixer-chart.js XSS protection', () => {
  it('uses esc() for all text content', () => {
    expect(srcs['mixer-chart.js']).toContain('esc(')
  })

  it('does not use innerHTML with unescaped data', () => {
    const innerHTMLs = srcs['mixer-chart.js'].match(/innerHTML\s*=\s*`[^`]*\$\{(?!esc\()/g) || []
    expect(innerHTMLs.length).toBe(0)
  })
})

describe('atomic writes (ADR-002)', () => {
  it('main.js writeJSON uses tmp+rename', () => {
    expect(srcs['main.js']).toContain("const tmp = p + '.tmp'")
    expect(srcs['main.js']).toContain('fs.renameSync(tmp, p)')
  })

  it('context-protocol uses tmp+rename', () => {
    expect(srcs['context-protocol.js']).toContain("'.tmp'")
    expect(srcs['context-protocol.js']).toContain('renameSync')
  })

  it('resource-scheduler uses tmp+rename', () => {
    expect(srcs['resource-scheduler.js']).toContain("'.tmp'")
    expect(srcs['resource-scheduler.js']).toContain('renameSync')
  })

  it('coordination-protocol uses tmp+rename', () => {
    expect(srcs['coordination-protocol.js']).toContain("'.tmp'")
    expect(srcs['coordination-protocol.js']).toContain('renameSync')
  })
})

describe('PID validation in process management', () => {
  it('main.js validates pid in kill handler rejects own PID', () => {
    const killHandler = srcs['main.js'].split("'system:kill-proc'")[1]?.split('})')[0] || ''
    expect(killHandler).toContain('process.pid')
    expect(killHandler).toContain('invalid pid')
  })

  it('resource-scheduler validates pid before shell commands', () => {
    expect(srcs['resource-scheduler.js']).toContain('Number.isInteger')
  })

  it('preload validates pid at bridge boundary', () => {
    expect(srcs['preload.js']).toContain('Number.isInteger(pid)')
  })
})

describe('no path traversal in file operations', () => {
  it('main.js validates file path arguments as strings', () => {
    const readFileHandler = srcs['main.js'].split("'repertoire:readFile'")[1]?.split('})')[0] || ''
    expect(readFileHandler).toContain("typeof")
  })
})

describe('CSP and security headers', () => {
  it('index.html has CSP meta tag or relies on Electron defaults', () => {
    const hasMeta = srcs['index.html'].includes('Content-Security-Policy')
    const hasNoUnsafe = !srcs['index.html'].includes("'unsafe-inline'")
    expect(hasMeta || hasNoUnsafe).toBe(true)
  })
})

describe('no dangerous Electron features', () => {
  it('does not enable nodeIntegration in renderer', () => {
    expect(srcs['main.js']).not.toMatch(/nodeIntegration\s*:\s*true/)
  })

  it('does not disable contextIsolation (Electron defaults to true)', () => {
    expect(srcs['main.js']).not.toMatch(/contextIsolation\s*:\s*false/)
  })
})

describe('signal validation in kill handler', () => {
  it('main.js restricts kill signals', () => {
    const killHandler = srcs['main.js'].split("'system:kill-proc'")[1]?.split('})')[0] || ''
    expect(killHandler).toContain('SIGTERM')
    expect(killHandler).toContain('SIGKILL')
  })

  it('preload restricts signals to SIGTERM/SIGKILL only', () => {
    expect(srcs['preload.js']).toContain("['SIGTERM', 'SIGKILL']")
  })
})

describe('no sensitive data exposure', () => {
  for (const f of srcFiles) {
    it(`${f} does not contain hardcoded secrets`, () => {
      expect(srcs[f]).not.toMatch(/password\s*=\s*['"][^'"]+['"]/)
      expect(srcs[f]).not.toMatch(/api[_-]?key\s*=\s*['"][^'"]+['"]/)
      expect(srcs[f]).not.toMatch(/secret\s*=\s*['"][^'"]+['"]/)
    })
  }
})

describe('timeout protection on external commands', () => {
  it('git commands have timeouts', () => {
    const gitExecs = srcs['main.js'].match(/execSync\([^)]*git[^)]*\)/g) || []
    for (const cmd of gitExecs) {
      expect(cmd).toContain('timeout')
    }
  })

  it('auth status checks have timeouts', () => {
    const authExecs = srcs['main.js'].match(/execSync\([^)]*auth[^)]*\)/g) || []
    for (const cmd of authExecs) {
      expect(cmd).toContain('timeout')
    }
  })
})

describe('notes:write dir validation', () => {
  it('notes:write uses isKnownProject before writing', () => {
    const handler = srcs['main.js'].split("'notes:write'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('isKnownProject(dir)')
  })

  it('notes:write still enforces content length limit', () => {
    const handler = srcs['main.js'].split("'notes:write'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('content.length > 50000')
  })
})

describe('lifecycle:list dir validation', () => {
  it('lifecycle:list uses isKnownProject before reading events', () => {
    const handler = srcs['main.js'].split("'lifecycle:list'")[1]?.split("'lifecycle:add'")[0] || ''
    expect(handler).toContain('isKnownProject(dir)')
  })
})

describe('lifecycle:add input validation', () => {
  it('main.js defines isKnownProject helper', () => {
    expect(srcs['main.js']).toContain('function isKnownProject(dir)')
  })

  it('isKnownProject validates dir type before checking store', () => {
    expect(srcs['main.js']).toContain("typeof dir !== 'string'")
  })

  it('lifecycle:add rejects unknown project dirs', () => {
    const handler = srcs['main.js'].split("'lifecycle:add'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('isKnownProject(dir)')
  })

  it('lifecycle:add validates string types for all fields', () => {
    const handler = srcs['main.js'].split("'lifecycle:add'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain("typeof type !== 'string'")
    expect(handler).toContain("typeof label !== 'string'")
    expect(handler).toContain("typeof message !== 'string'")
  })

  it('lifecycle:add enforces length limits on all string inputs', () => {
    const handler = srcs['main.js'].split("'lifecycle:add'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toContain('type.length > 64')
    expect(handler).toContain('label.length > 128')
    expect(handler).toContain('message.length > 1024')
  })

  it('lifecycle:add returns false on validation failure', () => {
    const handler = srcs['main.js'].split("'lifecycle:add'")[1]?.split('ipcMain.handle')[0] || ''
    expect(handler).toMatch(/return false/)
  })
})

describe('IPC channel naming conventions', () => {
  it('all ipcMain.handle calls use namespaced channels', () => {
    const handles = srcs['main.js'].match(/ipcMain\.handle\(['"]([^'"]+)/g) || []
    for (const h of handles) {
      const channel = h.match(/['"]([^'"]+)/)?.[1] || ''
      expect(channel).toMatch(/^[a-z]+:/)
    }
  })

  it('preload invoke calls match main handler channels', () => {
    const preloadChannels = srcs['preload.js'].match(/ipcRenderer\.invoke\(['"]([^'"]+)/g)?.map(
      m => m.match(/['"]([^'"]+)/)?.[1]
    ).filter(Boolean) || []
    const mainChannels = srcs['main.js'].match(/ipcMain\.handle\(['"]([^'"]+)/g)?.map(
      m => m.match(/['"]([^'"]+)/)?.[1]
    ).filter(Boolean) || []
    for (const ch of preloadChannels) {
      expect(mainChannels).toContain(ch)
    }
  })
})

describe('blueprint handler security', () => {
  const mainJs = srcs['main.js']

  it('blueprint:load uses isKnownProject guard', () => {
    const block = mainJs.split("'blueprint:load'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('isKnownProject(dir)')
  })

  it('blueprint:save uses isKnownProject guard', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('isKnownProject(dir)')
  })

  it('blueprint:save rejects non-object data', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('typeof data !== \'object\'')
    expect(block).toContain('Array.isArray(data)')
  })

  it('blueprint:save enforces size limit', () => {
    const block = mainJs.split("'blueprint:save'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('512_000')
  })

  it('blueprint:generate-brief uses isKnownProject guard', () => {
    const block = mainJs.split("'blueprint:generate-brief'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('isKnownProject(dir)')
  })

  it('blueprint:readiness uses isKnownProject guard', () => {
    const block = mainJs.split("'blueprint:readiness'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('isKnownProject(dir)')
  })
})

describe('orchestra:upgrade security', () => {
  const mainJs = srcs['main.js']

  it('orchestra:upgrade uses isKnownProject guard', () => {
    const block = mainJs.split("'orchestra:upgrade'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('isKnownProject(dir)')
  })

  it('mixer:saved:list uses isKnownProject guard', () => {
    const block = mainJs.split("'mixer:saved:list'")[1]?.split('\nipcMain')[0] || ''
    expect(block).toContain('isKnownProject(dir)')
  })

  it('all blueprint + upgrade handlers have isKnownProject', () => {
    const handlers = ['blueprint:load', 'blueprint:save', 'blueprint:generate-brief', 'blueprint:readiness', 'orchestra:upgrade', 'mixer:saved:list']
    for (const h of handlers) {
      const block = mainJs.split(`'${h}'`)[1]?.split('\nipcMain')[0] || ''
      expect(block, `${h} missing isKnownProject`).toContain('isKnownProject(dir)')
    }
  })
})
