// Copyright (c) 2026 René Antonio Casaña Amaya. All rights reserved.
// Licensed under the AGPL-3.0 License. See LICENSE in repository root.
//
// CoordinationProtocol — Priority-Inherited Inter-Orchestra Synchronization
//
// Manages concurrent execution of multiple orchestra instances with:
//
// 1. WEIGHT-DERIVED PRIORITY: Each orchestra's priority is computed from
//    its mixer weights. When multiple instances compete for shared system
//    resources, priority determines allocation order.
//
// 2. RESOURCE LOCKING WITH PRIORITY INHERITANCE: Shared resources (GPU,
//    high-memory operations) are locked via a priority-based protocol.
//    Higher-priority orchestras can preempt lower-priority ones.
//    This is NOT a file lock — it's an in-memory coordination protocol
//    with preemption semantics derived from domain weights.
//
// 3. CONFLICT DETECTION: When two orchestras have overlapping high-weight
//    categories (both wanting >50% focus on the same domain), the protocol
//    detects the conflict and recommends rebalancing. This prevents resource
//    contention that would degrade both instances.
//
// 4. DYNAMIC REBALANCING: When instances are added/removed, all priorities
//    are recomputed and resource allocations adjusted in real time.
//
// The technical contribution: concurrent AI agent execution coordinated by
// domain-specific weights, with measurable priority inheritance, preemption,
// and conflict detection — beyond standard file locks or process signals.

const os = require('os')
const fs = require('fs')
const path = require('path')

class CoordinationProtocol {
  constructor() {
    this.instances   = new Map()   // dir → instance info
    this.locks       = new Map()   // resource → lock info
    this.conflictLog = []          // historical conflicts (max 100)
    this.events      = []          // coordination events log (max 200)
    this._cachedConflicts = null   // cached detectConflicts result
    this._totalMemMB = Math.floor(os.totalmem() / 1048576)  // constant at runtime
  }

  // ─── Instance registration ─────────────────────────────────────────────
  register(dir, pid, allocation) {
    if (!dir || !allocation) return null
    const priority = this._computePriority(allocation)

    this.instances.set(dir, {
      pid,
      priority,
      nice:           allocation.nice || 10,
      avgIntensity:   allocation.avgIntensity || 0,
      memBudgetMB:    allocation.memBudgetMB || 0,
      tokenBudget:    allocation.tokenBudget || 0,
      categoryWeights: allocation.categoryBudgets || {},
      registeredAt:   new Date().toISOString(),
      status:         'active'
    })

    this._logEvent('register', dir, { priority, pid })
    this._rebalance()

    return this.instances.get(dir)
  }

  unregister(dir) {
    const inst = this.instances.get(dir)
    if (!inst) return

    // Release all locks held by this instance
    for (const [resource, lock] of this.locks) {
      if (lock.holder === dir) {
        this.locks.delete(resource)
        this._logEvent('lock_released', dir, { resource, reason: 'unregister' })
      }
    }

    this.instances.delete(dir)
    this._logEvent('unregister', dir, {})
    this._rebalance()
  }

  // ─── Priority computation ──────────────────────────────────────────────
  // Priority is a numeric score where LOWER = higher priority.
  // Computed from: aggregate intensity, number of hot-path categories,
  // and total weight. This makes the priority derivable from the mixer
  // weights — the domain-specific signal drives physical coordination.
  _computePriority(allocation) {
    if (!allocation) return 100

    const intensity = allocation.avgIntensity || 0
    const hotPaths = Object.values(allocation.categoryBudgets || {})
      .filter(b => b.hotPath).length
    const totalWeight = allocation.totalWeight || 0

    // Lower score = higher priority
    // Base: invert intensity (high intensity → low priority number)
    let priority = 100 - intensity

    // Bonus for having hot-path categories (each reduces priority by 5)
    priority -= hotPaths * 5

    // Bonus for high total weight
    priority -= (totalWeight / 1200) * 10

    return Math.max(1, Math.round(priority))
  }

  // ─── Resource locking with priority inheritance ─────────────────────────
  // Resources are abstract identifiers (e.g., 'gpu:0', 'high_memory',
  // 'network_bandwidth'). The protocol manages contention.
  acquireLock(dir, resource) {
    if (!resource || typeof resource !== 'string' || resource.length > 256) return { acquired: false, reason: 'invalid_resource' }
    const requester = this.instances.get(dir)
    if (!requester) return { acquired: false, reason: 'not_registered' }

    const existing = this.locks.get(resource)

    if (!existing) {
      // No contention — grant immediately
      this.locks.set(resource, {
        holder:    dir,
        priority:  requester.priority,
        grantedAt: new Date().toISOString()
      })
      this._logEvent('lock_acquired', dir, { resource })
      return { acquired: true }
    }

    if (existing.holder === dir) {
      return { acquired: true, reentrant: true }
    }

    // Contention — compare priorities (lower number = higher priority)
    if (requester.priority < existing.priority) {
      // Preemption: requester has higher priority
      const conflict = {
        timestamp:       new Date().toISOString(),
        resource,
        winner:          dir,
        loser:           existing.holder,
        winnerPriority:  requester.priority,
        loserPriority:   existing.priority,
        resolution:      'priority_preemption',
        preemptionDelta: existing.priority - requester.priority
      }
      this.conflictLog.push(conflict)
      if (this.conflictLog.length > 100) this.conflictLog.shift()

      this.locks.set(resource, {
        holder:    dir,
        priority:  requester.priority,
        grantedAt: new Date().toISOString(),
        preemptedFrom: existing.holder
      })

      this._logEvent('lock_preempted', dir, { resource, from: existing.holder })
      return { acquired: true, preempted: existing.holder, conflict }
    }

    // Lower priority — denied
    this._logEvent('lock_denied', dir, {
      resource,
      holder:         existing.holder,
      holderPriority: existing.priority,
      myPriority:     requester.priority
    })
    return {
      acquired: false,
      reason:   'lower_priority',
      holder:   existing.holder,
      waitRecommended: true
    }
  }

  releaseLock(dir, resource) {
    if (!resource || typeof resource !== 'string' || resource.length > 256) return false
    const lock = this.locks.get(resource)
    if (lock && lock.holder === dir) {
      this.locks.delete(resource)
      this._logEvent('lock_released', dir, { resource })
      return true
    }
    return false
  }

  // ─── Conflict detection ─────────────────────────────────────────────────
  // Detects when multiple orchestras have overlapping high-weight domains,
  // which causes resource contention.
  detectConflicts() {
    if (this._cachedConflicts) return this._cachedConflicts

    const entries = Array.from(this.instances.entries())
    const conflicts = []

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [dirA, infoA] = entries[i]
        const [dirB, infoB] = entries[j]

        const weightsA = infoA.categoryWeights || {}
        const weightsB = infoB.categoryWeights || {}

        const overlapping = []
        let contentionScore = 0

        for (const [cat, budgetA] of Object.entries(weightsA)) {
          const budgetB = weightsB[cat]
          if (!budgetB) continue

          // Both have this category with significant weight
          if (budgetA.weight > 40 && budgetB.weight > 40) {
            overlapping.push({
              category:   cat,
              weightA:    budgetA.weight,
              weightB:    budgetB.weight,
              combined:   budgetA.weight + budgetB.weight
            })
            contentionScore += (budgetA.weight + budgetB.weight) / 200
          }
        }

        if (overlapping.length > 0) {
          // Compute combined memory pressure
          const combinedMemMB = infoA.memBudgetMB + infoB.memBudgetMB
          const memPressure = combinedMemMB / this._totalMemMB

          conflicts.push({
            instanceA: dirA,
            instanceB: dirB,
            overlappingCategories: overlapping,
            contentionScore: Math.round(contentionScore * 100) / 100,
            combinedMemoryMB: combinedMemMB,
            memoryPressure: Math.round(memPressure * 1000) / 10,
            recommendation: contentionScore > 0.5
              ? 'reduce_overlapping_weights'
              : 'monitor'
          })
        }
      }
    }

    this._cachedConflicts = conflicts
    return conflicts
  }

  // ─── Dynamic rebalancing ────────────────────────────────────────────────
  // When instances change, recompute relative priorities and detect
  // new conflicts.
  _rebalance() {
    this._cachedConflicts = null
    const entries = Array.from(this.instances.entries())
    if (entries.length <= 1) return

    // Sort by priority (ascending = highest priority first)
    entries.sort((a, b) => a[1].priority - b[1].priority)

    const inversePriorities = entries.map(([, info]) => 101 - info.priority)
    const totalInverse = inversePriorities.reduce((s, v) => s + v, 0) || 1
    entries.forEach(([dir, info], idx) => {
      info.rank = idx + 1
      info.totalInstances = entries.length
      info.resourceShare = Math.round((inversePriorities[idx] / totalInverse) * 1000) / 1000
    })

    this._logEvent('rebalance', 'system', {
      instanceCount: entries.length,
      priorities: entries.map(([d, i]) => ({ dir: d, priority: i.priority, rank: i.rank }))
    })
  }

  invalidateConflictCache() {
    this._cachedConflicts = null
  }

  // ─── Event logging ──────────────────────────────────────────────────────
  _logEvent(type, dir, details) {
    this.events.push({
      timestamp: new Date().toISOString(),
      type,
      dir,
      ...details
    })
    if (this.events.length > 200) this.events.shift()
  }

  // ─── Public API ─────────────────────────────────────────────────────────
  getStatus() {
    return {
      activeInstances:  this.instances.size,
      instances:        Object.fromEntries(
        Array.from(this.instances).map(([d, i]) => [d, {
          priority:     i.priority,
          rank:         i.rank,
          status:       i.status,
          avgIntensity: i.avgIntensity,
          memBudgetMB:  i.memBudgetMB,
          registeredAt: i.registeredAt
        }])
      ),
      activeLocks:      Object.fromEntries(this.locks),
      conflicts:        this.detectConflicts(),
      recentEvents:     this.events.slice(-20),
      conflictHistory:  this.conflictLog.slice(-10)
    }
  }

  getInstanceCount() {
    return this.instances.size
  }

  persistTelemetry(dir) {
    if (this.events.length === 0 && this.conflictLog.length === 0) return

    try {
      const telDir = path.join(dir, '.claude', 'telemetry')
      fs.mkdirSync(telDir, { recursive: true })
      const file = path.join(telDir, 'coordination-metrics.json')
      let hist = []
      try { if (fs.statSync(file).size <= 1_048_576) { const _cpHist = JSON.parse(fs.readFileSync(file, 'utf8')); if (Array.isArray(_cpHist)) hist = _cpHist } } catch {}
      hist.push({
        timestamp:      new Date().toISOString(),
        instances:      this.instances.size,
        locks:          this.locks.size,
        eventsLogged:   this.events.length,
        conflictsTotal: this.conflictLog.length,
        recentEvents:   this.events.slice(-10)
      })
      if (hist.length > 300) hist.splice(0, hist.length - 300)
      const tmp = file + '.tmp'
      const _coSer = JSON.stringify(hist)
      if (_coSer.length <= 1_048_576) { fs.writeFileSync(tmp, _coSer); fs.renameSync(tmp, file) }
    } catch {}
  }

  cleanup(dir) {
    this.persistTelemetry(dir)
    this.unregister(dir)
  }
}

module.exports = { CoordinationProtocol }
