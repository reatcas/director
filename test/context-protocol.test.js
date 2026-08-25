import { describe, it, expect, beforeEach } from 'vitest'
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
  })
})
