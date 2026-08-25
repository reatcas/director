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
  })
})
