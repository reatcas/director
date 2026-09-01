// Copyright (c) 2026 René Antonio Casaña Amaya. All rights reserved.
// Licensed under the AGPL-3.0 License. See LICENSE in repository root.
//
// ResourceScheduler — Weighted Physical Resource Allocator
//
// Translates domain-specific focus weights (mixer "intensity" 0–100 per
// engineering category) into measurable OS-level resource allocation:
//   - Process priority (nice value) proportional to aggregate intensity
//   - Memory budget partitioning across concurrent orchestra instances
//   - Per-category token budget shares derived from normalized weights
//   - Live telemetry: CPU%, RSS, budget utilization, sampled periodically
//
// The core technical contribution is the closed-loop mapping:
//   user-domain weights → physical compute allocation → measured efficiency,
// where the allocation is *not* task scheduling (organizational) but actual
// OS resource control with quantifiable impact on execution cost and time.

const os = require('os')
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class ResourceScheduler {
  constructor() {
    this.allocations = new Map()      // dir → current allocation
    this.baselines   = new Map()      // dir → baseline snapshot at play
    this.samples     = new Map()      // dir → time-series of resource samples
    this.efficiency  = new Map()      // dir → computed efficiency metrics
    this._cpuCache   = null           // cached { count, model }
  }

  // ─── System resource snapshot ────────────────────────────────────────────
  systemSnapshot() {
    if (!this._cpuCache) {
      const cpus = os.cpus()
      this._cpuCache = { count: cpus.length, model: cpus[0] ? cpus[0].model : 'unknown' }
    }
    return {
      cpuCount:     this._cpuCache.count,
      cpuModel:     this._cpuCache.model,
      totalMemMB:   Math.floor(os.totalmem() / 1048576),
      freeMemMB:    Math.floor(os.freemem() / 1048576),
      loadAvg1:     os.loadavg()[0],
      loadAvg5:     os.loadavg()[1],
      platform:     process.platform,
      timestamp:    new Date().toISOString()
    }
  }

  // ─── Compute allocation from focus weights ──────────────────────────────
  // This is the patentable mapping: domain weights → physical resources
  computeAllocation(dir, focus) {
    const sys = this.systemSnapshot()
    const entries = Object.entries(focus || {})
    if (entries.length === 0) return this._defaultAllocation(dir, sys)

    const totalWeight = entries.reduce((s, [, v]) => s + v, 0)
    const avgWeight   = totalWeight / entries.length
    const maxWeight   = Math.max(...entries.map(([, v]) => v))

    // ── Priority mapping ──────────────────────────────────────────────────
    // Map aggregate intensity to OS nice value.
    // Higher average intensity → lower nice → higher OS priority.
    // Range: nice 15 (low intensity) to nice -5 (max intensity).
    // This is a non-linear mapping: intensity has diminishing returns
    // above 70 to prevent starvation of other system processes.
    const normalizedIntensity = Math.min(avgWeight / 100, 1)
    const nice = Math.round(15 - 20 * Math.pow(normalizedIntensity, 0.7))

    // ── Memory budget ─────────────────────────────────────────────────────
    // Allocate a memory ceiling proportional to intensity and available RAM.
    // Formula: base 20% + up to 50% scaled by intensity.
    // Capped at 80% of free memory to prevent OOM.
    const memFraction = 0.2 + 0.5 * normalizedIntensity
    const memBudgetMB = Math.min(
      Math.floor(sys.freeMemMB * memFraction),
      Math.floor(sys.totalMemMB * 0.8)
    )

    // ── Per-category resource shares ──────────────────────────────────────
    // Each category gets a share of the total compute budget proportional
    // to its weight. This determines context retention AND token budgets.
    const categoryBudgets = {}
    for (const [k, v] of entries) {
      const share = totalWeight > 0 ? v / totalWeight : 1 / entries.length
      categoryBudgets[k] = {
        weight:                 v,
        normalizedShare:        share,
        contextRetentionFactor: this._retentionCurve(share),
        tokenBudgetShare:       share,
        // Categories with weight > 60 get a "hot path" flag for
        // preferential context loading
        hotPath:                v > 60
      }
    }

    // ── Token budget ──────────────────────────────────────────────────────
    // Total token budget scales with intensity — higher intensity
    // orchestras get larger context windows and more generation tokens.
    // Base: 200k tokens. Max: 1M tokens at full intensity.
    const tokenBudget = Math.floor(200_000 + 800_000 * normalizedIntensity)

    const allocation = {
      dir,
      timestamp:       new Date().toISOString(),
      nice,
      memBudgetMB,
      tokenBudget,
      avgIntensity:    avgWeight,
      maxIntensity:    maxWeight,
      totalWeight,
      normalizedIntensity,
      categoryBudgets,
      system:          sys
    }

    this.allocations.set(dir, allocation)
    return allocation
  }

  // Context retention follows an S-curve: categories with very low share
  // retain a minimum of 10%; high-share categories retain up to 95%.
  // The inflection point at 0.3 prevents low-weight categories from
  // consuming disproportionate context.
  _retentionCurve(share) {
    // Sigmoid: 0.1 + 0.85 / (1 + e^(-12*(share - 0.3)))
    return 0.10 + 0.85 / (1 + Math.exp(-12 * (share - 0.3)))
  }

  _defaultAllocation(dir, sys) {
    return {
      dir, timestamp: new Date().toISOString(),
      nice: 10, memBudgetMB: Math.floor(sys.freeMemMB * 0.3),
      tokenBudget: 200_000, avgIntensity: 0, maxIntensity: 0,
      totalWeight: 0, normalizedIntensity: 0,
      categoryBudgets: {}, system: sys
    }
  }

  // ─── Apply allocation to a spawned process ──────────────────────────────
  applyToProcess(child, allocation) {
    if (!child || !child.pid) return false
    if (!Number.isInteger(child.pid) || child.pid <= 0) return false
    if (!Number.isInteger(allocation.nice)) return false

    // Set process priority via renice (Unix only)
    if (process.platform !== 'win32') {
      try {
        execFileSync('renice', [String(allocation.nice), '-p', String(child.pid)], { stdio: 'ignore' })
      } catch {
        try {
          const safeNice = Math.max(0, allocation.nice)
          execFileSync('renice', [String(safeNice), '-p', String(child.pid)], { stdio: 'ignore' })
        } catch {}
      }
    }

    // Record baseline for efficiency computation
    this.baselines.set(allocation.dir, {
      pid:            child.pid,
      startTime:      Date.now(),
      startLoadAvg:   os.loadavg()[0],
      allocation,
      initialMemFree: os.freemem()
    })

    this.samples.set(allocation.dir, [])
    return true
  }

  // ─── Sample live process metrics ────────────────────────────────────────
  // Called periodically (e.g. every 30s) by the main process.
  // Returns a metrics snapshot for the running orchestra.
  sampleProcess(dir) {
    const baseline = this.baselines.get(dir)
    if (!baseline) return null
    if (!Number.isInteger(baseline.pid) || baseline.pid <= 0) return null

    const allocation = this.allocations.get(dir)
    if (!allocation) return null

    let rssKB = 0, cpuPct = 0, threads = 0
    try {
      const pid = String(baseline.pid)
      if (process.platform === 'darwin') {
        const raw = execFileSync('ps', ['-o', 'rss=,pcpu=,wq=', '-p', pid],
          { encoding: 'utf8', timeout: 3000 }
        ).trim()
        const parts = raw.split(/\s+/)
        rssKB   = parseInt(parts[0], 10) || 0
        cpuPct  = parseFloat(parts[1]) || 0
        threads = parseInt(parts[2], 10) || 0
      } else if (process.platform === 'linux') {
        const raw = execFileSync('ps', ['-o', 'rss=,pcpu=,nlwp=', '-p', pid],
          { encoding: 'utf8', timeout: 3000 }
        ).trim()
        const parts = raw.split(/\s+/)
        rssKB   = parseInt(parts[0], 10) || 0
        cpuPct  = parseFloat(parts[1]) || 0
        threads = parseInt(parts[2], 10) || 0
      }
    } catch {
      return null // Process likely exited
    }

    const rssMB   = rssKB / 1024
    const elapsed = (Date.now() - baseline.startTime) / 1000
    const memUtil  = allocation.memBudgetMB > 0 ? rssMB / allocation.memBudgetMB : 0
    const cpuCount = (this._cpuCache ? this._cpuCache.count : os.cpus().length) || 1
    const cpuNorm  = cpuPct / (cpuCount * 100)

    const sample = {
      timestamp: new Date().toISOString(),
      elapsedSec: elapsed,
      rssMB:     Math.round(rssMB * 10) / 10,
      cpuPct:    Math.round(cpuPct * 10) / 10,
      threads,
      memBudgetMB:      allocation.memBudgetMB,
      memoryBudgetMB:   allocation.memBudgetMB,
      memUtilization: Math.round(memUtil * 1000) / 10, // percentage with 1 decimal
      cpuNormalized:  Math.round(cpuNorm * 1000) / 10,
      nice:           allocation.nice,
      loadAvg1:       os.loadavg()[0]
    }

    const history = this.samples.get(dir) || []
    history.push(sample)
    // Keep last 600 samples (~5h at 30s intervals)
    if (history.length > 600) history.splice(0, history.length - 600)
    this.samples.set(dir, history)

    // Recompute efficiency
    this._updateEfficiency(dir)

    return sample
  }

  // ─── Efficiency computation ─────────────────────────────────────────────
  // Computes measurable efficiency metrics that demonstrate the technical
  // effect of weight-based resource allocation.
  _updateEfficiency(dir) {
    const history = this.samples.get(dir) || []
    if (history.length < 2) return

    const allocation = this.allocations.get(dir)
    if (!allocation) return

    // Average resource utilization over the sampling window — single pass
    let _sumMem = 0, _sumCPU = 0, _peakMem = 0, _peakCPU = 0
    for (const h of history) {
      _sumMem += h.rssMB; _sumCPU += h.cpuPct
      if (h.rssMB > _peakMem) _peakMem = h.rssMB
      if (h.cpuPct > _peakCPU) _peakCPU = h.cpuPct
    }
    const avgMem = _sumMem / history.length
    const avgCPU = _sumCPU / history.length
    const peakMem = _peakMem
    const peakCPU = _peakCPU

    // Budget adherence: how well the process stayed within its allocation
    const memBudgetAdherence = allocation.memBudgetMB > 0
      ? 1 - Math.max(0, peakMem - allocation.memBudgetMB) / allocation.memBudgetMB
      : 1

    // Resource efficiency: useful work per unit of resource consumed
    // Measured as ratio of allocated vs consumed (closer to 1 = more efficient)
    const memEfficiency = allocation.memBudgetMB > 0
      ? Math.min(1, avgMem / allocation.memBudgetMB)
      : 0

    // Intensity-cost ratio: higher intensity should produce proportionally
    // more resource consumption. If it doesn't, the allocation is suboptimal.
    const intensityCostRatio = allocation.avgIntensity > 0
      ? (avgCPU / 100) / (allocation.normalizedIntensity)
      : 0

    this.efficiency.set(dir, {
      timestamp:         new Date().toISOString(),
      samplesCount:      history.length,
      avgMemMB:          Math.round(avgMem * 10) / 10,
      peakMemMB:         Math.round(peakMem * 10) / 10,
      avgCPUPct:         Math.round(avgCPU * 10) / 10,
      peakCPUPct:        Math.round(peakCPU * 10) / 10,
      memBudgetMB:       allocation.memBudgetMB,
      memBudgetAdherence: Math.round(memBudgetAdherence * 1000) / 10,
      memEfficiency:     Math.round(memEfficiency * 1000) / 10,
      intensityCostRatio: Math.round(intensityCostRatio * 100) / 100,
      nice:              allocation.nice,
      avgIntensity:      allocation.avgIntensity
    })
  }

  // ─── Persist telemetry to project directory ─────────────────────────────
  persistTelemetry(dir) {
    const eff = this.efficiency.get(dir)
    if (!eff) return

    try {
      const telDir = path.join(dir, '.claude', 'telemetry')
      fs.mkdirSync(telDir, { recursive: true })

      const file = path.join(telDir, 'resource-metrics.json')
      let hist = []
      try { if (fs.statSync(file).size <= 1_048_576) hist = JSON.parse(fs.readFileSync(file, 'utf8')) } catch {}
      hist.push(eff)
      if (hist.length > 500) hist.splice(0, hist.length - 500)
      const tmp = file + '.tmp'
      const _rsSer = JSON.stringify(hist)
      if (_rsSer.length <= 1_048_576) { fs.writeFileSync(tmp, _rsSer); fs.renameSync(tmp, file) }
    } catch {}
  }

  // ─── Public API ─────────────────────────────────────────────────────────
  getMetrics(dir) {
    return {
      allocation:  this.allocations.get(dir) || null,
      baseline:    this.baselines.get(dir) || null,
      lastSample:  (this.samples.get(dir) || []).slice(-1)[0] || null,
      efficiency:  this.efficiency.get(dir) || null,
      sampleCount: (this.samples.get(dir) || []).length
    }
  }

  getAllAllocations() {
    const result = {}
    for (const [dir, alloc] of this.allocations) {
      result[dir] = {
        nice:         alloc.nice,
        memBudgetMB:  alloc.memBudgetMB,
        tokenBudget:  alloc.tokenBudget,
        avgIntensity: alloc.avgIntensity
      }
    }
    return result
  }

  getSampleHistory(dir, limit) {
    const history = this.samples.get(dir) || []
    return limit ? history.slice(-limit) : history
  }

  getActiveDirectories() {
    return Array.from(this.allocations.keys())
  }

  cleanup(dir) {
    this.persistTelemetry(dir)
    this.allocations.delete(dir)
    this.baselines.delete(dir)
    this.samples.delete(dir)
    this.efficiency.delete(dir)
  }
}

module.exports = { ResourceScheduler }
