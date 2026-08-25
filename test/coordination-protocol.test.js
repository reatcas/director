import { describe, it, expect, beforeEach } from 'vitest'
import { CoordinationProtocol } from '../coordination-protocol.js'

describe('CoordinationProtocol', () => {
  let coord

  beforeEach(() => {
    coord = new CoordinationProtocol()
  })

  describe('_computePriority', () => {
    it('returns lower priority number for higher intensity (lower=higher priority)', () => {
      const low = coord._computePriority({ avgIntensity: 10, maxIntensity: 20, totalWeight: 10, tokenBudget: 200000, categoryBudgets: {} })
      const high = coord._computePriority({ avgIntensity: 80, maxIntensity: 90, totalWeight: 80, tokenBudget: 900000, categoryBudgets: {} })
      expect(high).toBeLessThan(low)
    })

    it('returns numeric value', () => {
      const p = coord._computePriority({ avgIntensity: 50, maxIntensity: 50, totalWeight: 50, tokenBudget: 500000, categoryBudgets: {} })
      expect(typeof p).toBe('number')
    })
  })

  describe('register + getStatus', () => {
    it('registers an instance', () => {
      coord.register('/project-a', 1234, {
        nice: 5, avgIntensity: 50, maxIntensity: 70,
        memBudgetMB: 4096, tokenBudget: 500000,
        categoryBudgets: { product: { weight: 50 } }
      })
      expect(coord.instances.size).toBe(1)
      const status = coord.getStatus()
      expect(status.activeInstances).toBe(1)
    })

    it('detects conflicts between overlapping high-weight categories', () => {
      coord.register('/a', 100, {
        nice: 0, avgIntensity: 80, maxIntensity: 80,
        memBudgetMB: 4096, tokenBudget: 800000,
        categoryBudgets: { product: { weight: 70 } }
      })
      coord.register('/b', 200, {
        nice: 0, avgIntensity: 80, maxIntensity: 80,
        memBudgetMB: 4096, tokenBudget: 800000,
        categoryBudgets: { product: { weight: 70 } }
      })
      const status = coord.getStatus()
      expect(status.activeInstances).toBe(2)
    })
  })

  describe('unregister', () => {
    it('removes an instance', () => {
      coord.register('/a', 100, {
        nice: 5, avgIntensity: 50, maxIntensity: 50,
        memBudgetMB: 2048, tokenBudget: 400000,
        categoryBudgets: {}
      })
      coord.unregister('/a')
      expect(coord.instances.size).toBe(0)
    })

    it('releases locks held by unregistered instance', () => {
      coord.register('/a', 100, {
        nice: 5, avgIntensity: 50, maxIntensity: 50,
        memBudgetMB: 2048, tokenBudget: 400000,
        categoryBudgets: {}
      })
      coord.acquireLock('/a', 'gpu:0')
      expect(coord.locks.size).toBe(1)
      coord.unregister('/a')
      expect(coord.locks.size).toBe(0)
    })
  })

  describe('acquireLock', () => {
    it('grants lock when no contention', () => {
      coord.register('/a', 100, {
        nice: 5, avgIntensity: 50, maxIntensity: 50,
        memBudgetMB: 2048, tokenBudget: 400000,
        categoryBudgets: {}
      })
      const result = coord.acquireLock('/a', 'gpu:0')
      expect(result.acquired).toBe(true)
    })

    it('allows reentrant lock from same holder', () => {
      coord.register('/a', 100, {
        nice: 5, avgIntensity: 50, maxIntensity: 50,
        memBudgetMB: 2048, tokenBudget: 400000,
        categoryBudgets: {}
      })
      coord.acquireLock('/a', 'gpu:0')
      const result = coord.acquireLock('/a', 'gpu:0')
      expect(result.acquired).toBe(true)
      expect(result.reentrant).toBe(true)
    })

    it('preempts lower-priority holder', () => {
      coord.register('/low', 100, {
        nice: 10, avgIntensity: 20, maxIntensity: 20,
        memBudgetMB: 2048, tokenBudget: 200000,
        totalWeight: 20,
        categoryBudgets: {}
      })
      coord.register('/high', 200, {
        nice: 0, avgIntensity: 90, maxIntensity: 90,
        memBudgetMB: 4096, tokenBudget: 900000,
        totalWeight: 90,
        categoryBudgets: {}
      })
      coord.acquireLock('/low', 'gpu:0')
      const result = coord.acquireLock('/high', 'gpu:0')
      expect(result.acquired).toBe(true)
      expect(result.preempted).toBe('/low')
    })

    it('denies lower-priority requester', () => {
      coord.register('/high', 200, {
        nice: 0, avgIntensity: 90, maxIntensity: 90,
        memBudgetMB: 4096, tokenBudget: 900000,
        totalWeight: 90,
        categoryBudgets: {}
      })
      coord.register('/low', 100, {
        nice: 10, avgIntensity: 20, maxIntensity: 20,
        memBudgetMB: 2048, tokenBudget: 200000,
        totalWeight: 20,
        categoryBudgets: {}
      })
      coord.acquireLock('/high', 'gpu:0')
      const result = coord.acquireLock('/low', 'gpu:0')
      expect(result.acquired).toBe(false)
      expect(result.reason).toBe('lower_priority')
    })

    it('rejects unregistered instance', () => {
      const result = coord.acquireLock('/unknown', 'gpu:0')
      expect(result.acquired).toBe(false)
      expect(result.reason).toBe('not_registered')
    })
  })

  describe('releaseLock', () => {
    it('releases lock held by instance', () => {
      coord.register('/a', 100, {
        nice: 5, avgIntensity: 50, maxIntensity: 50,
        memBudgetMB: 2048, tokenBudget: 400000,
        categoryBudgets: {}
      })
      coord.acquireLock('/a', 'gpu:0')
      expect(coord.releaseLock('/a', 'gpu:0')).toBe(true)
      expect(coord.locks.size).toBe(0)
    })

    it('returns false for non-holder', () => {
      expect(coord.releaseLock('/nobody', 'gpu:0')).toBe(false)
    })
  })

  describe('detectConflicts', () => {
    it('returns empty when no overlapping high weights', () => {
      coord.register('/a', 100, {
        nice: 5, avgIntensity: 50, maxIntensity: 50,
        memBudgetMB: 2048, tokenBudget: 400000,
        categoryBudgets: { product: { weight: 80 } }
      })
      coord.register('/b', 200, {
        nice: 5, avgIntensity: 50, maxIntensity: 50,
        memBudgetMB: 2048, tokenBudget: 400000,
        categoryBudgets: { security: { weight: 80 } }
      })
      const conflicts = coord.detectConflicts()
      expect(conflicts.length).toBe(0)
    })

    it('detects overlapping high-weight categories', () => {
      coord.register('/a', 100, {
        nice: 0, avgIntensity: 80, maxIntensity: 80,
        memBudgetMB: 4096, tokenBudget: 800000,
        categoryBudgets: { product: { weight: 60 } }
      })
      coord.register('/b', 200, {
        nice: 0, avgIntensity: 80, maxIntensity: 80,
        memBudgetMB: 4096, tokenBudget: 800000,
        categoryBudgets: { product: { weight: 60 } }
      })
      const conflicts = coord.detectConflicts()
      expect(conflicts.length).toBe(1)
      expect(conflicts[0].overlappingCategories[0].category).toBe('product')
    })
  })

  describe('_computePriority', () => {
    it('returns 100 for null allocation', () => {
      expect(coord._computePriority(null)).toBe(100)
    })

    it('clamps to minimum of 1', () => {
      const p = coord._computePriority({
        avgIntensity: 100, maxIntensity: 100,
        totalWeight: 12000, tokenBudget: 1000000,
        categoryBudgets: { a: { hotPath: true }, b: { hotPath: true }, c: { hotPath: true }, d: { hotPath: true } }
      })
      expect(p).toBeGreaterThanOrEqual(1)
    })

    it('gives bonus for hot-path categories', () => {
      const noHot = coord._computePriority({
        avgIntensity: 50, maxIntensity: 50, totalWeight: 50,
        tokenBudget: 500000, categoryBudgets: {}
      })
      const withHot = coord._computePriority({
        avgIntensity: 50, maxIntensity: 50, totalWeight: 50,
        tokenBudget: 500000, categoryBudgets: { a: { hotPath: true }, b: { hotPath: true } }
      })
      expect(withHot).toBeLessThan(noHot)
    })
  })

  describe('getStatus', () => {
    it('returns complete status with no instances', () => {
      const status = coord.getStatus()
      expect(status.activeInstances).toBe(0)
      expect(status.instances).toEqual({})
      expect(status.activeLocks).toEqual({})
      expect(status.conflicts).toEqual([])
    })

    it('includes conflict history', () => {
      coord.register('/a', 100, {
        nice: 10, avgIntensity: 20, maxIntensity: 20,
        memBudgetMB: 2048, tokenBudget: 200000,
        totalWeight: 20, categoryBudgets: {}
      })
      coord.register('/b', 200, {
        nice: 0, avgIntensity: 90, maxIntensity: 90,
        memBudgetMB: 4096, tokenBudget: 900000,
        totalWeight: 90, categoryBudgets: {}
      })
      coord.acquireLock('/a', 'gpu:0')
      coord.acquireLock('/b', 'gpu:0')
      const status = coord.getStatus()
      expect(status.conflictHistory.length).toBeGreaterThan(0)
    })
  })

  describe('_rebalance', () => {
    it('assigns rank and resourceShare to multiple instances', () => {
      coord.register('/a', 100, {
        nice: 10, avgIntensity: 30, maxIntensity: 30,
        memBudgetMB: 2048, tokenBudget: 300000,
        totalWeight: 30, categoryBudgets: {}
      })
      coord.register('/b', 200, {
        nice: 5, avgIntensity: 60, maxIntensity: 60,
        memBudgetMB: 4096, tokenBudget: 600000,
        totalWeight: 60, categoryBudgets: {}
      })
      const infoA = coord.instances.get('/a')
      const infoB = coord.instances.get('/b')
      expect(infoA.rank).toBeDefined()
      expect(infoB.rank).toBeDefined()
      expect(infoA.resourceShare).toBe(0.5)
      expect(infoB.resourceShare).toBe(0.5)
    })
  })

  describe('getInstanceCount', () => {
    it('returns correct count', () => {
      expect(coord.getInstanceCount()).toBe(0)
      coord.register('/x', 999, {
        nice: 5, avgIntensity: 50, maxIntensity: 50,
        memBudgetMB: 2048, tokenBudget: 400000,
        categoryBudgets: {}
      })
      expect(coord.getInstanceCount()).toBe(1)
      coord.unregister('/x')
      expect(coord.getInstanceCount()).toBe(0)
    })
  })

  describe('event log', () => {
    it('caps events at 200', () => {
      for (let i = 0; i < 210; i++) {
        coord._logEvent('test', '/dir', { i })
      }
      expect(coord.events.length).toBe(200)
    })
  })
})
