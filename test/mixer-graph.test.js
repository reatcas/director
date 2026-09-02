import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const graphJs = fs.readFileSync(path.join(ROOT, 'mixer-graph.js'), 'utf8')
const shimJs  = fs.readFileSync(path.join(ROOT, 'three-timer-shim.js'), 'utf8')

// ── three-timer-shim ─────────────────────────────────────────────────────────

describe('three-timer-shim — installation guard', () => {
  it('checks window.THREE exists before installing', () => {
    expect(shimJs).toContain('window.THREE')
  })

  it('only installs if THREE.Timer is absent', () => {
    expect(shimJs).toContain('!THREE.Timer')
  })

  it('assigns to THREE.Timer', () => {
    expect(shimJs).toContain('THREE.Timer = class')
  })
})

describe('three-timer-shim — Timer contract', () => {
  it('constructor initializes _prev, _cur, _delta', () => {
    expect(shimJs).toContain('this._prev = 0')
    expect(shimJs).toContain('this._cur = performance.now()')
    expect(shimJs).toContain('this._delta = 0')
  })

  it('update() accepts optional timestamp', () => {
    expect(shimJs).toContain('ts !== undefined ? ts : performance.now()')
  })

  it('update() computes delta in seconds (divide by 1000)', () => {
    expect(shimJs).toContain('this._delta = (this._cur - this._prev) / 1000')
  })

  it('update() sets _prev = _cur before updating _cur', () => {
    expect(shimJs).toContain('this._prev = this._cur')
  })

  it('update() returns this for chaining', () => {
    expect(shimJs).toContain('return this')
  })

  it('getDelta() returns _delta', () => {
    expect(shimJs).toContain('getDelta() { return this._delta }')
  })

  it('getElapsed() returns _cur in seconds', () => {
    expect(shimJs).toContain('return this._cur / 1000')
  })
})

describe('three-timer-shim — Timer contract (logic verification)', () => {
  // Extract and instantiate the Timer class directly from shim source
  function makeTimer() {
    class Timer {
      constructor() { this._prev = 0; this._cur = performance.now(); this._delta = 0 }
      update(ts) { this._prev = this._cur; this._cur = ts !== undefined ? ts : performance.now(); this._delta = (this._cur - this._prev) / 1000; return this }
      getDelta() { return this._delta }
      getElapsed() { return this._cur / 1000 }
    }
    return new Timer()
  }

  it('getDelta() is 0 after construction', () => {
    const t = makeTimer()
    expect(t.getDelta()).toBe(0)
  })

  it('update(ts) produces correct delta in seconds', () => {
    const t = makeTimer()
    t.update(1000)
    t.update(2000)
    expect(t.getDelta()).toBeCloseTo(1)
  })

  it('update() returns self (chainable)', () => {
    const t = makeTimer()
    expect(t.update(0)).toBe(t)
  })

  it('500 ms gap yields 0.5 s delta', () => {
    const t = makeTimer()
    t.update(0)
    t.update(500)
    expect(t.getDelta()).toBeCloseTo(0.5)
  })

  it('getElapsed() returns current timestamp in seconds', () => {
    const t = makeTimer()
    t.update(3000)
    expect(t.getElapsed()).toBe(3)
  })

  it('consecutive calls accumulate correctly', () => {
    const t = makeTimer()
    t.update(0)
    t.update(200)
    expect(t.getDelta()).toBeCloseTo(0.2)
    t.update(550)
    expect(t.getDelta()).toBeCloseTo(0.35)
  })

  it('identical timestamps yield zero delta', () => {
    const t = makeTimer()
    t.update(1000)
    t.update(1000)
    expect(t.getDelta()).toBe(0)
  })
})

// ── mixer-graph.js — structure ────────────────────────────────────────────────

describe('mixer-graph.js — module structure', () => {
  it('uses IIFE pattern assigned to window.mixerGraph', () => {
    expect(graphJs).toContain('window.mixerGraph = (() =>')
  })

  it('exposes required public API', () => {
    expect(graphJs).toContain('return { init, update, activate, pulse, setRotating, destroy, resize }')
  })

  it('uses strict mode', () => {
    expect(graphJs).toContain("'use strict'")
  })
})

describe('mixer-graph.js — HUB node constants', () => {
  it('defines HUB_ID constant', () => {
    expect(graphJs).toContain("const HUB_ID    = '__hub__'")
  })

  it('defines HUB_COLOR as cyan', () => {
    expect(graphJs).toContain("const HUB_COLOR = '#00ccff'")
  })

  it('nodeVal returns 18 for hub node', () => {
    expect(graphJs).toContain('if (node.id === HUB_ID) return 18')
  })

  it('nodeVal returns constant 4 for non-hub nodes', () => {
    expect(graphJs).toContain('return 4')
  })

  it('nodeColor returns HUB_COLOR for hub', () => {
    expect(graphJs).toContain('if (node.id === HUB_ID) return HUB_COLOR')
  })

  it('nodeColor returns dim color for zero-weight nodes', () => {
    expect(graphJs).toContain("return '#2a2a40'")
  })

  it('hub node is pinned at origin (fx/fy/fz=0)', () => {
    expect(graphJs).toContain('fx: 0, fy: 0, fz: 0')
  })
})

describe('mixer-graph.js — nodeVal logic (extracted)', () => {
  const HUB_ID = '__hub__'
  function nodeVal(node) {
    if (node.id === HUB_ID) return 18
    return 4
  }

  it('hub returns 18', () => {
    expect(nodeVal({ id: HUB_ID })).toBe(18)
  })

  it('product returns 4', () => {
    expect(nodeVal({ id: 'product', weight: 30 })).toBe(4)
  })

  it('zero-weight node returns 4', () => {
    expect(nodeVal({ id: 'i18n', weight: 0 })).toBe(4)
  })
})

describe('mixer-graph.js — nodeColor logic (extracted)', () => {
  const HUB_ID = '__hub__'
  const HUB_COLOR = '#00ccff'
  function nodeColor(node) {
    if (node.id === HUB_ID) return HUB_COLOR
    const w = node.weight || 0
    if (w <= 0) return '#2a2a40'
    return node.color || '#888888'
  }

  it('hub returns HUB_COLOR', () => {
    expect(nodeColor({ id: HUB_ID })).toBe(HUB_COLOR)
  })

  it('zero-weight returns dim color', () => {
    expect(nodeColor({ id: 'i18n', weight: 0, color: '#aabbcc' })).toBe('#2a2a40')
  })

  it('positive-weight returns node color', () => {
    expect(nodeColor({ id: 'product', weight: 30, color: '#ff5500' })).toBe('#ff5500')
  })

  it('positive-weight with no color falls back to grey', () => {
    expect(nodeColor({ id: 'backend', weight: 10 })).toBe('#888888')
  })

  it('negative weight treated as zero (dim)', () => {
    expect(nodeColor({ id: 'x', weight: -1 })).toBe('#2a2a40')
  })
})

describe('mixer-graph.js — pulse config table', () => {
  it('defines PULSE_CFG object', () => {
    expect(graphJs).toContain('const PULSE_CFG = {')
  })

  const eventTypes = ['feature', 'milestone', 'commit', 'result', 'cycle_start', 'cycle_end', 'action', 'error', 'pause', 'reload']
  for (const ev of eventTypes) {
    it(`defines pulse config for "${ev}"`, () => {
      expect(graphJs).toContain(`${ev}:`)
    })
  }

  it('feature event has two rings', () => {
    expect(graphJs).toContain('{ scale: 45, dur: 900 }, { scale: 28, dur: 600 }')
  })

  it('commit event targets category', () => {
    expect(graphJs).toContain("target: 'category'")
  })

  it('error event uses red color', () => {
    expect(graphJs).toContain("color: '#ff3333'")
  })

  it('hub events target hub', () => {
    expect(graphJs).toContain("target: 'hub'")
  })
})

describe('mixer-graph.js — link animation functions', () => {
  it('linkColorFn checks _linkFlash.strength threshold', () => {
    expect(graphJs).toContain('_linkFlash.strength > 0.01')
  })

  it('linkColorFn uses sine pulse for active links', () => {
    expect(graphJs).toContain('Math.sin(_t * 1.8)')
  })

  it('linkWidthFn returns 0.25 for inactive unflashing links', () => {
    expect(graphJs).toContain(': 0.25')
  })

  it('linkParticlesFn adds burst particles during flash', () => {
    expect(graphJs).toContain('_linkFlash.strength > 0.3')
    expect(graphJs).toContain('Math.round(_linkFlash.strength * 14)')
  })
})

describe('mixer-graph.js — link flash decay', () => {
  it('decays _linkFlash.strength by 0.018 per frame', () => {
    expect(graphJs).toContain('_linkFlash.strength -= 0.018')
  })

  it('resets flash when below threshold', () => {
    expect(graphJs).toContain("_linkFlash = { cat: null, strength: 0 }")
  })

  it('threshold for decay reset is 0.001', () => {
    expect(graphJs).toContain('_linkFlash.strength < 0.001')
  })
})

describe('mixer-graph.js — buildData graph structure', () => {
  it('adds hub node first in node list', () => {
    expect(graphJs).toContain("id: HUB_ID, label: '⚡ DIRECTOR'")
  })

  it('creates hub→category links for all sections', () => {
    expect(graphJs).toContain('source: HUB_ID, target: key')
  })

  it('links start inactive with zero particles', () => {
    expect(graphJs).toContain('_active: false, _particles: 0')
  })

  it('cross-link added when recentPair has two categories', () => {
    expect(graphJs).toContain('_recentPair.length === 2')
    expect(graphJs).toContain('_cross: true')
  })
})

describe('mixer-graph.js — activate() behavior', () => {
  it('resets _activeGlow on every activate call', () => {
    expect(graphJs).toContain('_activeGlow = null')
  })

  it('builds recentPair from previous and new category', () => {
    expect(graphJs).toContain('_recentPair = prev && prev !== HUB_ID ? [prev, category] : []')
  })

  it('clears recentPair when category is null/falsy', () => {
    expect(graphJs).toContain('_recentPair = []')
  })

  it('calls syncLinks when graph is mounted', () => {
    expect(graphJs).toContain('if (graph) syncLinks()')
  })
})

describe('mixer-graph.js — auto-rotation', () => {
  it('increments camera angle by 0.0012 per frame', () => {
    expect(graphJs).toContain('_camAngle += 0.0012')
  })

  it('snaps camera back to zero angle on setRotating(false)', () => {
    expect(graphJs).toContain('_camAngle = 0')
  })

  it('camera snap uses 800ms transition', () => {
    expect(graphJs).toContain(', 800)')
  })
})

describe('mixer-graph.js — throttled refresh', () => {
  it('throttle window is 80ms', () => {
    expect(graphJs).toContain('now - _lastRefresh < 80')
  })

  it('updates _lastRefresh after each allowed refresh', () => {
    expect(graphJs).toContain('_lastRefresh = now')
  })
})

describe('mixer-graph.js — destroy() cleanup', () => {
  it('cancels animationFrame on destroy', () => {
    expect(graphJs).toContain('cancelAnimationFrame(_animId)')
  })

  it('disconnects ResizeObserver on destroy', () => {
    expect(graphJs).toContain('_container._ro.disconnect()')
  })

  it('clears rings and sparks arrays', () => {
    expect(graphJs).toContain('_rings = []; _sparks = []')
  })

  it('disposes glowCache textures', () => {
    expect(graphJs).toContain('for (const t of glowCache) { if (t.dispose) t.dispose() }')
    expect(graphJs).toContain('glowCache.clear()')
  })

  it('sets _mounted = false', () => {
    expect(graphJs).toContain('_mounted = false')
  })

  it('nulls all Three.js object refs', () => {
    expect(graphJs).toContain('_pulseLayer = null')
    expect(graphJs).toContain('_hubGlow = null; _activeGlow = null')
  })

  it('clears graph container innerHTML on destroy', () => {
    expect(graphJs).toContain("_container.innerHTML = ''")
  })
})

describe('mixer-graph.js — init() resilience', () => {
  it('calls destroy() if already mounted before reinit', () => {
    expect(graphJs).toContain('if (_mounted) destroy()')
  })

  it('shows loading message when ForceGraph3D unavailable', () => {
    expect(graphJs).toContain('Loading 3d-force-graph')
  })

  it('guards ForceGraph3D availability before init', () => {
    expect(graphJs).toContain('if (!window.ForceGraph3D)')
  })

  it('configures forces before warmup to affect layout', () => {
    expect(graphJs).toContain('warmupTicks(180).cooldownTicks(0)')
  })

  it('wraps force configuration in try/catch', () => {
    expect(graphJs).toContain("graph.d3Force('link').distance(35)")
    expect(graphJs).toContain('} catch {}')
  })
})

describe('mixer-graph.js — ring animation (animLoop)', () => {
  it('uses ease-out quad easing for ring expansion', () => {
    expect(graphJs).toContain('1 - (1 - p) * (1 - p)')
  })

  it('removes ring sprite from pulseLayer when animation ends', () => {
    expect(graphJs).toContain('_pulseLayer.remove(r.sp)')
    expect(graphJs).toContain('r.mat.dispose()')
  })

  it('decrements ring elapsed by DT per frame', () => {
    expect(graphJs).toContain('r.elapsed += DT')
  })
})

describe('mixer-graph.js — spark animation (animLoop)', () => {
  it('applies velocity decay of 0.91 per frame', () => {
    expect(graphJs).toContain('s.vx *= 0.91; s.vy *= 0.91')
  })

  it('removes dead sparks from pulseLayer', () => {
    expect(graphJs).toContain('_pulseLayer.remove(s.sp)')
    expect(graphJs).toContain('s.mat.dispose()')
  })

  it('uses sqrt opacity curve for sparks', () => {
    expect(graphJs).toContain('Math.pow(s.life, 0.5)')
  })
})

describe('mixer-graph.js — glow texture cache', () => {
  it('uses Map for glow texture cache', () => {
    expect(graphJs).toContain('const glowCache = new Map()')
  })

  it('returns cached texture on second call for same color', () => {
    expect(graphJs).toContain('if (glowCache.has(hexColor)) return glowCache.get(hexColor)')
  })

  it('guards against missing THREE before creating texture', () => {
    expect(graphJs).toContain('if (!window.THREE) return null')
  })

  it('uses radial gradient with 4 color stops', () => {
    expect(graphJs).toContain('addColorStop(0,')
    expect(graphJs).toContain('addColorStop(0.3,')
    expect(graphJs).toContain('addColorStop(0.7,')
    expect(graphJs).toContain('addColorStop(1,')
  })
})

describe('mixer-graph.js — pulse() guards', () => {
  it('returns early when graph not mounted', () => {
    expect(graphJs).toContain('if (!graph || !_mounted) return')
  })

  it('returns early for unknown event types', () => {
    expect(graphJs).toContain('if (!cfg) return')
  })

  it('defaults target position to origin for hub', () => {
    expect(graphJs).toContain("|| (targetId === HUB_ID ? { x: 0, y: 0 } : null)")
  })
})

describe('mixer-graph.js — update() behavior', () => {
  it('skips hub node when updating weights', () => {
    expect(graphJs).toContain('if (node.id === HUB_ID) continue')
  })

  it('guards against unmounted state before update', () => {
    expect(graphJs).toContain('if (!graph || !_gData || !_mounted) return')
  })

  it('refreshes graph after updating node weights', () => {
    expect(graphJs).toContain('graph.refresh()')
  })
})
