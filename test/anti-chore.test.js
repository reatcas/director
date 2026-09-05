import { describe, it, expect } from 'vitest'
import fs from 'fs'

const RUN_SH = fs.readFileSync('resources/orchestra/run.sh', 'utf8')
const CLAUDE_MD = fs.readFileSync('resources/orchestra/CLAUDE.md', 'utf8')

describe('Anti-chore enforcement (T1)', () => {
  describe('run.sh STANDALONE_STATE detection', () => {
    it('detects standalone state commits', () => {
      expect(RUN_SH).toContain('STANDALONE_STATE')
    })

    it('greps for chore commits touching PLAN.md', () => {
      expect(RUN_SH).toMatch(/STANDALONE_STATE.*grep.*PLAN\.md/s)
    })

    it('flags violation and writes to CYCLE_LEARNINGS.md', () => {
      expect(RUN_SH).toMatch(/STANDALONE_STATE.*CYCLE_LEARNINGS/s)
    })

    it('writes warning to PRODUCT_DIRECTIVE.md', () => {
      expect(RUN_SH).toMatch(/STANDALONE_STATE.*PRODUCT_DIRECTIVE/s)
    })
  })

  describe('run.sh CHORE_COUNT cap', () => {
    it('counts chore commits per iteration', () => {
      expect(RUN_SH).toContain('CHORE_COUNT')
    })

    it('enforces max 3 chore commits', () => {
      expect(RUN_SH).toMatch(/CHORE_COUNT.*-gt 3/s)
    })

    it('stamps MECHANICAL_CHORE_OVERLOAD on violation', () => {
      expect(RUN_SH).toContain('MECHANICAL_CHORE_OVERLOAD')
    })
  })

  describe('CLAUDE.md rules', () => {
    it('contains Rule 41 (standalone state ban)', () => {
      expect(CLAUDE_MD).toContain('STANDALONE STATE BAN')
      expect(CLAUDE_MD).toContain('41.')
    })

    it('contains Rule 42 (chore budget)', () => {
      expect(CLAUDE_MD).toContain('CHORE BUDGET')
      expect(CLAUDE_MD).toContain('42.')
    })

    it('Rule 41 mentions PLAN.md explicitly', () => {
      const r41 = CLAUDE_MD.match(/41\..+?(?=42\.)/s)?.[0] ?? ''
      expect(r41).toContain('PLAN.md')
    })

    it('Rule 42 mentions max 3', () => {
      const r42 = CLAUDE_MD.match(/42\..+?(?=43\.|##)/s)?.[0] ?? ''
      expect(r42).toContain('3')
    })
  })
})
