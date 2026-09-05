import { describe, it, expect } from 'vitest'
import fs from 'fs'

const RUN_SH = fs.readFileSync('resources/orchestra/run.sh', 'utf8')
const CLAUDE_MD = fs.readFileSync('resources/orchestra/CLAUDE.md', 'utf8')
const LOOP_MD = fs.readFileSync('resources/orchestra/.claude/commands/loop.md', 'utf8')
const SKILL_MD = fs.readFileSync('resources/orchestra/.claude/skills/plan-mode/plan-spec.md', 'utf8')
const MAIN_JS = fs.readFileSync('main.js', 'utf8')
const PRELOAD_JS = fs.readFileSync('preload.js', 'utf8')

describe('Plan-mode protocol (T7)', () => {
  describe('run.sh routing', () => {
    it('has plan-executor routing branch', () => {
      expect(RUN_SH).toContain('plan-executor')
    })

    it('has planner routing branch', () => {
      expect(RUN_SH).toContain('ROLE="planner"')
    })

    it('plan routing appears before deep-work routing', () => {
      const planExec = RUN_SH.indexOf('ROLE="plan-executor"')
      const deepWork = RUN_SH.indexOf('ROLE="deep-work"')
      expect(planExec).toBeGreaterThan(-1)
      expect(deepWork).toBeGreaterThan(-1)
      expect(planExec).toBeLessThan(deepWork)
    })

    it('uses MODEL_COMPLEX for plan roles', () => {
      const afterPlanExec = RUN_SH.slice(RUN_SH.indexOf('plan-executor'))
      expect(afterPlanExec).toContain('MODEL_COMPLEX')
    })

    it('injects planner instructions into PROMPT_CONTENT', () => {
      expect(RUN_SH).toContain('PLAN MODE — PLANNER')
    })

    it('injects executor instructions with MODULE BAN suspended', () => {
      expect(RUN_SH).toContain('PLAN MODE — EXECUTOR')
      expect(RUN_SH).toContain('MODULE BAN is SUSPENDED')
    })

    it('executor reads plan spec content into prompt', () => {
      expect(RUN_SH).toMatch(/plan-executor[\s\S]*?PLAN_SPEC_CONTENT/)
    })
  })

  describe('IPC handlers (main.js)', () => {
    it('has plan:list handler', () => {
      expect(MAIN_JS).toContain("ipcMain.handle('plan:list'")
    })

    it('has plan:read handler', () => {
      expect(MAIN_JS).toContain("ipcMain.handle('plan:read'")
    })

    it('plan:list validates isKnownProject', () => {
      const planList = MAIN_JS.slice(MAIN_JS.indexOf("ipcMain.handle('plan:list'"))
        .split("ipcMain.handle('plan:read'")[0]
      expect(planList).toContain('isKnownProject')
    })

    it('plan:read guards against path traversal', () => {
      const planRead = MAIN_JS.slice(MAIN_JS.indexOf("ipcMain.handle('plan:read'"))
        .split("// ─── Telemetry")[0]
      expect(planRead).toContain('..')
      expect(planRead).toContain('startsWith')
    })

    it('plan:read limits file size to 128KB', () => {
      expect(MAIN_JS).toContain('131_072')
    })

    it('plan:list limits results to 50', () => {
      expect(MAIN_JS).toContain('slice(0, 50)')
    })

    it("'plan' in _LC_TYPES", () => {
      expect(MAIN_JS).toMatch(/_LC_TYPES.*plan/)
    })

    it('plan-spec.md in UPGRADE_FILES', () => {
      expect(MAIN_JS).toContain('.claude/skills/plan-mode/plan-spec.md')
    })
  })

  describe('preload.js bridges', () => {
    it('has planList bridge method', () => {
      expect(PRELOAD_JS).toContain('planList')
    })

    it('has planRead bridge method', () => {
      expect(PRELOAD_JS).toContain('planRead')
    })

    it("'plan' in lifecycle type allowlist", () => {
      expect(PRELOAD_JS).toContain("'plan'")
    })

    it('planRead validates filename pattern', () => {
      const planRead = PRELOAD_JS.slice(PRELOAD_JS.indexOf('planRead'))
        .split('planList')[0]
      expect(planRead).toMatch(/F-\[A-Z/)
    })
  })

  describe('plan-spec.md skill template', () => {
    it('contains STATUS field', () => {
      expect(SKILL_MD).toContain('STATUS: active')
    })

    it('contains DAG task format', () => {
      expect(SKILL_MD).toContain('[TASK')
      expect(SKILL_MD).toContain('DEPENDS:')
      expect(SKILL_MD).toContain('VERIFY:')
    })

    it('contains PLANNER RULES section', () => {
      expect(SKILL_MD).toContain('PLANNER RULES')
    })

    it('contains EXECUTOR RULES section', () => {
      expect(SKILL_MD).toContain('EXECUTOR RULES')
    })

    it('specifies correct commit convention', () => {
      expect(SKILL_MD).toContain('plan(F-XX): write spec')
      expect(SKILL_MD).toContain('task(F-XX):')
      expect(SKILL_MD).toContain('plan(F-XX): mark complete')
    })

    it('instructs planner to EXIT after writing spec', () => {
      expect(SKILL_MD).toContain('EXIT')
    })
  })

  describe('loop.md boot step 1b', () => {
    it('has PLAN MODE CHECK step', () => {
      expect(LOOP_MD).toContain('PLAN MODE CHECK')
    })

    it('references plan-specs directory', () => {
      expect(LOOP_MD).toContain('plan-specs')
    })

    it('describes EXECUTOR MODE boot message', () => {
      expect(LOOP_MD).toContain('EXECUTOR MODE')
    })

    it('describes PLANNER MODE boot message', () => {
      expect(LOOP_MD).toContain('PLANNER MODE')
    })

    it('step 1b is between step 1 and PRODUCT GATE', () => {
      const step1b = LOOP_MD.indexOf('1b.')
      const productGate = LOOP_MD.indexOf('PRODUCT GATE')
      expect(step1b).toBeGreaterThan(-1)
      expect(productGate).toBeGreaterThan(step1b)
    })
  })

  describe('CLAUDE.md plan-mode rules', () => {
    it('contains Rule 43 ([plan-mode] routing)', () => {
      expect(CLAUDE_MD).toContain('43.')
      expect(CLAUDE_MD).toContain('[plan-mode]')
    })

    it('contains Rule 44 (executor mode)', () => {
      expect(CLAUDE_MD).toContain('44.')
      expect(CLAUDE_MD).toContain('Executor mode')
    })

    it('contains Rule 45 (no infinite loops)', () => {
      expect(CLAUDE_MD).toContain('45.')
      expect(CLAUDE_MD).toContain('STATUS: complete')
    })

    it('contains Rule 46 (MODULE BAN suspended)', () => {
      expect(CLAUDE_MD).toContain('46.')
      expect(CLAUDE_MD).toContain('MODULE BAN suspended')
    })

    it('has PLAN MODE section', () => {
      expect(CLAUDE_MD).toContain('## PLAN MODE')
    })
  })
})
