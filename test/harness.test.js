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
