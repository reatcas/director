import { describe, it, expect } from 'vitest'
import fs from 'fs'

const RUN_SH = fs.readFileSync('resources/orchestra/run.sh', 'utf8')

describe('Cycle counter persistence (T2)', () => {
  it('defines CYCLE_COUNTER_FILE variable', () => {
    expect(RUN_SH).toContain('CYCLE_COUNTER_FILE=".claude/CYCLE_COUNTER"')
  })

  it('uses atomic write (.tmp + mv) for counter', () => {
    expect(RUN_SH).toContain('CYCLE_COUNTER_FILE}.tmp')
    expect(RUN_SH).toContain('mv "${CYCLE_COUNTER_FILE}.tmp"')
  })

  it('guards counter against non-integer content', () => {
    expect(RUN_SH).toContain("grep -E '^[0-9]+$'")
  })

  it('injects global cycle into prompt', () => {
    expect(RUN_SH).toContain('GLOBAL_CYCLE')
    expect(RUN_SH).toContain('Global cycle counter =')
  })

  it('counter injection happens after CAVEMAN block and before role injection', () => {
    const caveman = RUN_SH.indexOf('caveman')
    const globalCycle = RUN_SH.indexOf('GLOBAL_CYCLE')
    const plannerRole = RUN_SH.indexOf('PLAN MODE — PLANNER')
    expect(caveman).toBeGreaterThan(-1)
    expect(globalCycle).toBeGreaterThan(caveman)
    expect(plannerRole).toBeGreaterThan(globalCycle)
  })

  it('increments counter only when commits were made', () => {
    expect(RUN_SH).toMatch(/START_COMMIT.*!=.*END_COMMIT[\s\S]*?CYCLE_COUNTER_FILE/)
  })
})
