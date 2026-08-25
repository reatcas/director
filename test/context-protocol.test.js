import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { ContextProtocol } from '../context-protocol.js'

describe('ContextProtocol', () => {
  let proto

  beforeEach(() => {
    proto = new ContextProtocol()
  })

  describe('_hash', () => {
    it('returns 16-char hex string', () => {
      const h = proto._hash('hello world')
      expect(h).toMatch(/^[a-f0-9]{16}$/)
    })

    it('same input produces same hash', () => {
      expect(proto._hash('test')).toBe(proto._hash('test'))
    })

    it('different input produces different hash', () => {
      expect(proto._hash('a')).not.toBe(proto._hash('b'))
    })
  })

  describe('_estimateTokens', () => {
    it('returns 0 for empty input', () => {
      expect(proto._estimateTokens('')).toBe(0)
      expect(proto._estimateTokens(null)).toBe(0)
      expect(proto._estimateTokens(undefined)).toBe(0)
    })

    it('counts short words as 1 token each', () => {
      const tokens = proto._estimateTokens('I am a')
      expect(tokens).toBe(3)
    })

    it('splits long words into multiple tokens', () => {
      const tokens = proto._estimateTokens('internationalization')
      expect(tokens).toBeGreaterThan(1)
    })

    it('handles numbers with ~2 digits per token', () => {
      const tokens = proto._estimateTokens('123456')
      expect(tokens).toBe(3) // 6 digits / 2
    })

    it('handles mixed content', () => {
      const tokens = proto._estimateTokens('The user_id is 42')
      expect(tokens).toBeGreaterThan(3)
    })
  })

  describe('_splitSections', () => {
    it('splits markdown by headers', () => {
      const content = '# Section 1\nfoo\n## Section 2\nbar'
      const sections = proto._splitSections(content)
      expect(sections.length).toBeGreaterThanOrEqual(2)
    })

    it('returns single section for no headers', () => {
      const sections = proto._splitSections('just plain text')
      expect(sections.length).toBe(1)
    })

    it('preserves section titles', () => {
      const content = '# First\nfoo\n## Second\nbar\n### Third\nbaz'
      const sections = proto._splitSections(content)
      const titles = sections.map(s => s.title)
      expect(titles).toContain('First')
      expect(titles).toContain('Second')
      expect(titles).toContain('Third')
    })

    it('computes hash and tokens per section', () => {
      const content = '# Title\nsome body text here'
      const sections = proto._splitSections(content)
      expect(sections[0].hash).toMatch(/^[a-f0-9]{16}$/)
      expect(sections[0].tokens).toBeGreaterThan(0)
    })
  })

  describe('computeDelta', () => {
    let tmpDir

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctx-proto-'))
    })

    it('detects added files on first scan', () => {
      fs.writeFileSync(path.join(tmpDir, 'PLAN.md'), '# Plan\nsome content')
      const result = proto.computeDelta(tmpDir, { product: 50 })
      expect(result.delta.added).toContain('PLAN.md')
      expect(result.metrics.totalTokens).toBeGreaterThan(0)
    })

    it('detects unchanged files on second scan', () => {
      fs.writeFileSync(path.join(tmpDir, 'PLAN.md'), '# Plan\nstatic')
      proto.computeDelta(tmpDir, { product: 50 })
      const result = proto.computeDelta(tmpDir, { product: 50 })
      expect(result.delta.unchanged).toContain('PLAN.md')
    })

    it('detects changed files when content updates', () => {
      fs.writeFileSync(path.join(tmpDir, 'PLAN.md'), '# Plan\nv1')
      proto.computeDelta(tmpDir, { product: 50 })
      fs.writeFileSync(path.join(tmpDir, 'PLAN.md'), '# Plan\nv2 updated')
      const result = proto.computeDelta(tmpDir, { product: 50 })
      expect(result.delta.changed).toContain('PLAN.md')
    })

    it('tracks section-level changes', () => {
      fs.writeFileSync(path.join(tmpDir, 'PLAN.md'), '# A\nfoo\n## B\nbar')
      proto.computeDelta(tmpDir, { product: 50 })
      fs.writeFileSync(path.join(tmpDir, 'PLAN.md'), '# A\nfoo\n## B\nchanged')
      const result = proto.computeDelta(tmpDir, { product: 50 })
      const details = result.delta.sectionDetails['PLAN.md']
      expect(details.unchanged).toContain('A')
      expect(details.changed.length).toBe(1)
      expect(details.changed[0].title).toBe('B')
    })

    it('returns retention plan with token savings', () => {
      fs.writeFileSync(path.join(tmpDir, 'PLAN.md'), '# Plan\n' + 'word '.repeat(200))
      const result = proto.computeDelta(tmpDir, { product: 5, security: 90 })
      expect(result.retentionPlan).toBeDefined()
      expect(result.retentionPlan.summary['PLAN.md']).toBeDefined()
    })

    it('compression ratio is between 0 and 100', () => {
      fs.writeFileSync(path.join(tmpDir, 'PLAN.md'), '# Plan\ncontent here')
      proto.computeDelta(tmpDir, { product: 50 })
      const result = proto.computeDelta(tmpDir, { product: 50 })
      expect(result.metrics.compressionRatio).toBeGreaterThanOrEqual(0)
      expect(result.metrics.compressionRatio).toBeLessThanOrEqual(100)
    })
  })

  describe('_computeRetention (via computeDelta)', () => {
    let tmpDir

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctx-ret-'))
    })

    it('high-weight categories retain more tokens', () => {
      fs.writeFileSync(path.join(tmpDir, 'PLAN.md'), '# Plan\n' + 'content '.repeat(100))
      const highWeight = proto.computeDelta(tmpDir, { product: 90, security: 5 })
      const planRetention = highWeight.retentionPlan.summary['PLAN.md']?.retentionPct
      expect(planRetention).toBeGreaterThan(70)
    })

    it('low-weight categories get compacted', () => {
      fs.writeFileSync(path.join(tmpDir, 'AUDIT_LOG.md'), '# Audit\n' + 'finding '.repeat(100))
      const result = proto.computeDelta(tmpDir, { product: 90, security: 2 })
      const auditRetention = result.retentionPlan.summary['AUDIT_LOG.md']?.retentionPct
      expect(auditRetention).toBeLessThan(50)
    })

    it('returns empty plan for zero total weight', () => {
      fs.writeFileSync(path.join(tmpDir, 'PLAN.md'), '# Plan\ncontent')
      const result = proto.computeDelta(tmpDir, {})
      expect(result.retentionPlan.tokensSaved).toBe(0)
    })
  })
})
