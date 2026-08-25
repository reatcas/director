import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')

describe('run.sh harness', () => {
  const runSh = path.join(ROOT, 'resources/orchestra/run.sh')

  it('passes bash syntax check', () => {
    const result = execSync(`bash -n "${runSh}" 2>&1`, { encoding: 'utf8' })
    expect(result).toBe('')
  })

  it('uses pipefail', () => {
    const content = fs.readFileSync(runSh, 'utf8')
    expect(content).toContain('set -uo pipefail')
  })

  it('captures PIPESTATUS inside each branch, not after fi', () => {
    const content = fs.readFileSync(runSh, 'utf8')
    // PIPESTATUS should appear BEFORE "else" and BEFORE the closing of the branch
    const lines = content.split('\n')
    let foundInClaude = false
    let foundInElse = false
    let inClaude = false
    let inElse = false

    for (const line of lines) {
      if (line.includes('if [ "$AI_AGENT" = "claude" ]')) inClaude = true
      if (inClaude && line.includes('EXIT=${PIPESTATUS[0]}')) {
        foundInClaude = true
        inClaude = false
      }
      if (line.trim() === 'else') { inClaude = false; inElse = true }
      if (inElse && line.includes('EXIT=${PIPESTATUS[0]}')) {
        foundInElse = true
        inElse = false
      }
      if (line.trim() === 'fi') { inElse = false }
    }

    expect(foundInClaude).toBe(true)
    expect(foundInElse).toBe(true)
  })

  it('has separate BLOCKED_STREAK from HALLUCINATION_STREAK', () => {
    const content = fs.readFileSync(runSh, 'utf8')
    expect(content).toContain('BLOCKED_STREAK=0')
    expect(content).toContain('BLOCKED_STREAK=$((BLOCKED_STREAK + 1))')
    // LEGIT_BLOCK path should NOT increment HALLUCINATION_STREAK
    const legitBlock = content.split('LEGIT_BLOCK" = true')[1]?.split('continue')[0] || ''
    expect(legitBlock).not.toContain('HALLUCINATION_STREAK=$((HALLUCINATION_STREAK + 1))')
  })

  it('uses atomic writes for orchestra.json in Smart Mix', () => {
    const content = fs.readFileSync(runSh, 'utf8')
    expect(content).toContain('os.replace(tmp_path, cfg_path)')
  })

  it('guards IMPROVEMENT_STREAK with REAL_COMMITS > 0', () => {
    const content = fs.readFileSync(runSh, 'utf8')
    expect(content).toContain('REAL_COMMITS:-0}" -gt 0')
  })

  it('uses Smart Mix v3 with damping', () => {
    const content = fs.readFileSync(runSh, 'utf8')
    expect(content).toContain('SMOOTHING = 0.3')
    expect(content).toContain('SESSION_CAP = 15')
    expect(content).toContain('damped_adj')
  })
})

describe('CLAUDE.md constitution', () => {
  const claudeMd = path.join(ROOT, 'resources/orchestra/CLAUDE.md')

  it('exists', () => {
    expect(fs.existsSync(claudeMd)).toBe(true)
  })

  it('contains MIXER=HARD CONTRACT rule', () => {
    const content = fs.readFileSync(claudeMd, 'utf8')
    expect(content).toContain('MIXER=HARD CONTRACT')
  })

  it('contains ANTI-SLOP rules', () => {
    const content = fs.readFileSync(claudeMd, 'utf8')
    expect(content).toContain('CATEGORY BAN')
    expect(content).toContain('MODULE BAN')
    expect(content).toContain('BATCH MECHANICAL')
  })

  it('contains verification-gate requirement', () => {
    const content = fs.readFileSync(claudeMd, 'utf8')
    expect(content).toContain('verification-gate')
  })
})

describe('writeJSON atomicity', () => {
  it('writes via .tmp + rename pattern', () => {
    const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
    expect(mainJs).toContain("const tmp = p + '.tmp'")
    expect(mainJs).toContain('fs.renameSync(tmp, p)')
  })
})

describe('XSS hardening in renderer.js', () => {
  const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

  it('defines esc() function for HTML escaping', () => {
    expect(rendererJs).toContain('function esc(str)')
    expect(rendererJs).toContain('&amp;')
    expect(rendererJs).toContain('&lt;')
    expect(rendererJs).toContain('&gt;')
  })

  it('escapes all log entry message fields', () => {
    const logFunctions = [
      'addCycleEntry', 'addErrorEntry', 'addClaudeMessageEntry',
      'addConclusionEntry', 'addActionEntry'
    ]
    for (const fn of logFunctions) {
      const block = rendererJs.split(`function ${fn}`)[1]?.split('function ')[0] || ''
      const msgMatch = block.match(/le-msg[^>]*>(\$\{[^}]+\})/g) || []
      for (const m of msgMatch) {
        expect(m).toContain('esc(')
      }
    }
  })

  it('escapes group body text', () => {
    expect(rendererJs).toContain('le-group-body">${esc(text)}')
  })

  it('escapes history entry labels and messages', () => {
    const histBlock = rendererJs.split('le-history')[1]?.split('function ')[0] || ''
    expect(histBlock).toContain('esc(ev.label)')
    expect(histBlock).toContain('esc(ev.message)')
  })

  it('escapes process command in system monitor', () => {
    expect(rendererJs).toContain('${esc(p.cmd)}')
  })
})

describe('protocol module atomic writes', () => {
  it('context-protocol uses tmp+rename for telemetry', () => {
    const cp = fs.readFileSync(path.join(ROOT, 'context-protocol.js'), 'utf8')
    expect(cp).toContain("file + '.tmp'")
    expect(cp).toContain('fs.renameSync(tmp, file)')
  })

  it('resource-scheduler uses tmp+rename for telemetry', () => {
    const rs = fs.readFileSync(path.join(ROOT, 'resource-scheduler.js'), 'utf8')
    expect(rs).toContain("'.tmp'")
    expect(rs).toContain('renameSync')
  })
})

describe('preload.js security invariants', () => {
  const preload = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')

  it('uses contextBridge.exposeInMainWorld', () => {
    expect(preload).toContain('contextBridge.exposeInMainWorld')
  })

  it('only uses ipcRenderer.invoke for request-response', () => {
    expect(preload).not.toContain('ipcRenderer.send(')
    expect(preload).not.toContain('ipcRenderer.sendSync(')
    expect(preload).not.toContain('ipcRenderer.sendTo(')
  })

  it('does not expose require, process, or fs to renderer', () => {
    const exposed = preload.split('exposeInMainWorld')[1] || ''
    expect(exposed).not.toContain('require(')
    expect(exposed).not.toContain('process.')
    expect(exposed).not.toMatch(/\bfs\b/)
  })

  it('wraps event listeners to strip IPC event object', () => {
    const listeners = preload.match(/ipcRenderer\.on\(/g) || []
    const wrappers = preload.match(/\(_e, d\) => cb\(d\)/g) || []
    expect(listeners.length).toBeGreaterThan(0)
    expect(wrappers.length).toBe(listeners.length)
  })
})
