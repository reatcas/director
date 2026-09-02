'use strict'
// Mixer Node Graph — 3D force-directed visualization of mix focus weights.
// Built on 3d-force-graph + three.js (CDN-loaded in index.html).
//
// Event-driven pulse system: pulse(eventType, category) called from renderer.js
// on every meaningful log event. Creates rings, sparkles, glow bursts at node
// positions in a dedicated pulse layer on top of the force graph scene.
// Auto-rotation: subtle camera wobble while orchestra is running.

window.mixerGraph = (() => {
  const HUB_ID    = '__hub__'
  const HUB_COLOR = '#00ccff'

  // ── State ────────────────────────────────────────────────────────────────
  let graph = null, _container = null, _sections = [], _focus = {}
  let _sectionMap = new Map()        // key → section entry, O(1) lookup in hot paths
  let _nodeMap    = new Map()        // node id → node object, O(1) lookup in nodePos()
  let _activeCategory = null, _recentPair = [], _gData = null, _mounted = false
  let _animId = null, _t = 0
  let _hubGlow = null, _activeGlow = null
  let _pulseLayer = null           // THREE.Group added to scene for effects
  let _rings = []                  // expanding ring animations
  let _sparks = []                 // flying spark sprites
  let _autoRotate = false
  let _camAngle = 0, _camDist = 300
  let _lastRefresh = 0
  let _linkFlash = { cat: null, strength: 0 }  // animated link flash on pulse events

  // ── Texture cache ─────────────────────────────────────────────────────────
  const glowCache = new Map()
  function makeGlowTexture(hexColor) {
    if (glowCache.has(hexColor)) return glowCache.get(hexColor)
    if (!window.THREE) return null
    const size = 128, c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d'), r = size / 2
    const hex = hexColor.replace('#', '')
    const ri = parseInt(hex.slice(0,2),16)||0
    const gi = parseInt(hex.slice(2,4),16)||0
    const bi = parseInt(hex.slice(4,6),16)||0
    const g = ctx.createRadialGradient(r,r,0,r,r,r)
    g.addColorStop(0,   `rgba(${ri},${gi},${bi},1)`)
    g.addColorStop(0.3, `rgba(${ri},${gi},${bi},0.7)`)
    g.addColorStop(0.7, `rgba(${ri},${gi},${bi},0.15)`)
    g.addColorStop(1,   `rgba(${ri},${gi},${bi},0)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(c)
    glowCache.set(hexColor, tex)
    return tex
  }

  // ── Node properties ───────────────────────────────────────────────────────
  function nodeVal(node) {
    if (node.id === HUB_ID) return 18
    return 4  // constant — weight shown via color, not size (large nodeVal breaks d3 force)
  }
  function nodeColor(node) {
    if (node.id === HUB_ID) return HUB_COLOR
    const w = node.weight ?? 0
    if (w <= 0) return '#2a2a40'  // dim but visible on dark background
    return node.color ?? '#888888'
  }

  // ── Glow sprite (extends default sphere for hub + active node) ───────────
  function nodeThreeObject(node) {
    if (!window.THREE) return null
    const isHub    = node.id === HUB_ID
    const isActive = node.id === _activeCategory
    if (!isHub && !isActive) return null

    const color  = isHub ? HUB_COLOR : (node.color ?? '#00ffee')
    const tex    = makeGlowTexture(color)
    if (!tex) return null

    const mat = new THREE.SpriteMaterial({
      map: tex, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
      opacity: isHub ? 0.7 : 0.85,
    })
    const sprite = new THREE.Sprite(mat)
    const base   = isHub ? 28 : Math.max(24, (node.weight??0)*0.6+22)
    sprite.scale.set(base, base, 1)
    sprite.userData.baseScale = base
    if (isHub)    _hubGlow    = sprite
    if (isActive) _activeGlow = sprite
    return sprite
  }

  // ── Link color animation ──────────────────────────────────────────────────
  // Reads _t (incremented each rAF frame) and _linkFlash for live animation.
  // graph.refresh() must be called periodically from animLoop for this to update.
  function linkColorFn(link) {
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    const flashing = _linkFlash.strength > 0.01 && _linkFlash.cat === tgt
    if (!link._active) {
      if (flashing) return `rgba(255,255,255,${(_linkFlash.strength * 0.35).toFixed(2)})`
      return 'rgba(255,255,255,0.05)'
    }
    const s = _sectionMap.get(tgt)
    const hex = (s ? s[2] : HUB_COLOR).replace('#', '')
    const r = parseInt(hex.slice(0,2),16)||0
    const g = parseInt(hex.slice(2,4),16)||0
    const b = parseInt(hex.slice(4,6),16)||0
    const pulse = 0.4 + 0.6 * Math.abs(Math.sin(_t * 1.8))
    const flash = flashing ? _linkFlash.strength * 0.7 : 0
    const a = Math.min(1, pulse + flash).toFixed(2)
    return `rgba(${r},${g},${b},${a})`
  }
  function linkWidthFn(link) {
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    if (!link._active) {
      return _linkFlash.strength > 0.01 && _linkFlash.cat === tgt
        ? 0.25 + _linkFlash.strength * 1.2
        : 0.25
    }
    return 1.4 + 0.8 * Math.abs(Math.sin(_t * 1.8))
  }
  function linkParticlesFn(link) {
    if (!link._particles) return 0
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    const burst = _linkFlash.strength > 0.3 && _linkFlash.cat === tgt ? Math.round(_linkFlash.strength * 14) : 0
    return link._particles + burst
  }

  // ── Graph data ────────────────────────────────────────────────────────────
  function buildData() {
    const nodes = [], links = []
    nodes.push({ id: HUB_ID, label: '⚡ DIRECTOR', color: HUB_COLOR, weight: -1, fx: 0, fy: 0, fz: 0 })
    for (const [key, label, color] of _sections) {
      const w = _focus[key] ?? 0
      nodes.push({ id: key, label: `${label} ${w}%`, color, weight: w })
      links.push({ id: `hub→${key}`, source: HUB_ID, target: key, _active: false, _particles: 0 })
    }
    if (_recentPair.length === 2) {
      const [a, b] = _recentPair
      if ((_focus[a] ?? 0) > 0 && (_focus[b] ?? 0) > 0)
        links.push({ id: `x→${a}→${b}`, source: a, target: b, _active: true, _particles: 3, _cross: true })
    }
    return { nodes, links }
  }

  function syncLinks() {
    if (!_gData) return
    for (const link of _gData.links) {
      if (link._cross) continue
      const tgt = typeof link.target === 'object' ? link.target.id : link.target
      link._active    = tgt === _activeCategory
      link._particles = link._active ? 6 : 0
    }
    const _lgFiltered = []; for (const l of _gData.links) { if (!l._cross) _lgFiltered.push(l) }; _gData.links = _lgFiltered
    if (_recentPair.length === 2) {
      const [a, b] = _recentPair
      if ((_focus[a] ?? 0) > 0 && (_focus[b] ?? 0) > 0)
        _gData.links.push({ id: `x→${a}→${b}`, source: a, target: b, _active: true, _particles: 3, _cross: true })
    }
    throttledRefresh()
  }

  // ── Throttled graph refresh ───────────────────────────────────────────────
  function throttledRefresh() {
    const now = performance.now()
    if (now - _lastRefresh < 80) return
    _lastRefresh = now
    if (graph) graph.refresh()
  }

  // ── Pulse effects ─────────────────────────────────────────────────────────
  function nodePos(id) {
    const n = _nodeMap.get(id)
    if (!n || n.x === undefined) return null
    return { x: n.x, y: n.y }
  }

  const _MAX_RINGS = 20
  const _MAX_SPARKS = 50

  function emitRing(x, y, color, maxScale, duration) {
    if (!window.THREE || !_pulseLayer) return
    const tex = makeGlowTexture(color)
    if (!tex) return
    if (_rings.length >= _MAX_RINGS) {
      const old = _rings.shift()
      _pulseLayer.remove(old.sp); old.mat.dispose()
    }
    const mat = new THREE.SpriteMaterial({
      map: tex, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, opacity: 1,
    })
    const sp = new THREE.Sprite(mat)
    sp.position.set(x, y, 0.5)
    sp.scale.setScalar(6)
    _pulseLayer.add(sp)
    _rings.push({ sp, mat, maxScale, duration, elapsed: 0 })
  }

  function emitSparks(x, y, color, count) {
    if (!window.THREE || !_pulseLayer) return
    const tex = makeGlowTexture(color)
    if (!tex) return
    for (const _ of Array.from({length: count})) {
      if (_sparks.length >= _MAX_SPARKS) {
        const old = _sparks.shift()
        _pulseLayer.remove(old.sp); old.mat.dispose()
      }
      const angle = Math.random() * Math.PI * 2
      const speed = 1.5 + Math.random() * 4
      const mat = new THREE.SpriteMaterial({
        map: tex, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9,
      })
      const sp = new THREE.Sprite(mat)
      sp.position.set(x + (Math.random()-0.5)*4, y + (Math.random()-0.5)*4, 0.5)
      sp.scale.setScalar(2 + Math.random() * 3)
      _pulseLayer.add(sp)
      _sparks.push({
        sp, mat,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1, decay: 0.018 + Math.random() * 0.022,
      })
    }
  }

  // Pulse configs: ring maxScale, ring duration, spark count
  const PULSE_CFG = {
    feature:     { rings: [{ scale: 45, dur: 900 }, { scale: 28, dur: 600 }], sparks: 10, target: 'category' },
    milestone:   { rings: [{ scale: 30, dur: 700 }], sparks: 6,  target: 'category' },
    commit:      { rings: [{ scale: 38, dur: 800 }, { scale: 20, dur: 500 }], sparks: 12, target: 'category' },
    result:      { rings: [{ scale: 28, dur: 600 }], sparks: 7,  target: 'category' },
    cycle_start: { rings: [{ scale: 22, dur: 600 }], sparks: 4,  target: 'hub' },
    cycle_end:   { rings: [{ scale: 18, dur: 500 }], sparks: 2,  target: 'hub' },
    action:      { rings: [{ scale: 16, dur: 400 }], sparks: 3,  target: 'hub' },
    error:       { rings: [{ scale: 24, dur: 500 }], sparks: 5,  target: 'hub', color: '#ff3333' },
    pause:       { rings: [{ scale: 14, dur: 400 }], sparks: 2,  target: 'hub', color: '#ddbb00' },
    reload:      { rings: [{ scale: 18, dur: 500 }], sparks: 4,  target: 'hub', color: '#00ffee' },
  }

  function pulse(eventType, category) {
    if (!graph || !_mounted) return
    const cfg = PULSE_CFG[eventType]
    if (!cfg) return
    if (category !== null && category !== undefined) {
      if (typeof category !== 'string' || category.length > 64) category = null
    }

    const targetId = cfg.target === 'hub' ? HUB_ID : (category ?? HUB_ID)
    const pos = nodePos(targetId) ?? (targetId === HUB_ID ? { x: 0, y: 0 } : null)
    if (!pos) return

    const color = cfg.color ?? (() => {
      if (targetId === HUB_ID) return HUB_COLOR
      const s = _sectionMap.get(targetId)
      return s ? s[2] : HUB_COLOR
    })()

    for (const r of (cfg.rings ?? [])) emitRing(pos.x, pos.y, color, r.scale, r.dur)
    if (cfg.sparks > 0) emitSparks(pos.x, pos.y, color, cfg.sparks)

    // Flash the link connecting hub → this node
    if (cfg.target === 'category' && targetId !== HUB_ID) {
      _linkFlash = { cat: targetId, strength: 1.0 }
    } else {
      // Hub events flash all active links briefly
      _linkFlash = { cat: _activeCategory ?? HUB_ID, strength: 0.6 }
    }
    _ensureAnimLoop()
  }

  // ── Animation loop ────────────────────────────────────────────────────────
  const DT = 16  // ~60fps

  function _ensureAnimLoop() {
    if (!_animId && _mounted) _animId = requestAnimationFrame(animLoop)
  }

  function animLoop() {
    _t = (_t + 0.05) % (Math.PI * 2)

    // Hub + active glow handled via _pulseLayer rings; sprites not used

    // Expand rings
    const _nextRings = []
    for (const r of _rings) {
      r.elapsed += DT
      const p = Math.min(r.elapsed / r.duration, 1)
      const ease = 1 - (1 - p) * (1 - p)           // ease-out quad
      r.sp.scale.setScalar(6 + ease * r.maxScale)
      r.mat.opacity = (1 - ease) * 0.85
      if (p >= 1) { _pulseLayer.remove(r.sp); r.mat.dispose() } else _nextRings.push(r)
    }
    _rings = _nextRings

    // Move sparks
    const _nextSparks = []
    for (const s of _sparks) {
      s.life -= s.decay
      if (s.life <= 0) { _pulseLayer.remove(s.sp); s.mat.dispose(); continue }
      s.sp.position.x += s.vx
      s.sp.position.y += s.vy
      s.vx *= 0.91; s.vy *= 0.91
      s.mat.opacity = Math.pow(s.life, 0.5) * 0.85
      const sc = s.sp.scale.x * 1.015
      s.sp.scale.setScalar(sc)
      _nextSparks.push(s)
    }
    _sparks = _nextSparks

    // Auto-rotate: gentle camera wobble while running
    if (_autoRotate && graph) {
      _camAngle += 0.0012
      const ox = Math.sin(_camAngle) * _camDist * 0.06
      const oy = Math.cos(_camAngle * 0.7) * _camDist * 0.035
      graph.cameraPosition({ x: ox, y: oy, z: _camDist }, { x: 0, y: 0, z: 0 })
    }

    // Decay link flash and refresh graph when animating links
    if (_linkFlash.strength > 0.001) {
      _linkFlash.strength -= 0.018  // ~55 frames to decay (~900ms at 60fps)
      if (_linkFlash.strength < 0.001) _linkFlash = { cat: null, strength: 0 }
    }
    if (_activeCategory !== null || _linkFlash.strength > 0.001) {
      throttledRefresh()
    }

    // Cancel self when fully idle — resumed by _ensureAnimLoop on next event
    const idle = _rings.length === 0 && _sparks.length === 0 &&
                 _linkFlash.strength <= 0.001 && !_autoRotate &&
                 _activeCategory === null
    if (idle) { _animId = null; return }

    _animId = requestAnimationFrame(animLoop)
  }

  // ── Public API ────────────────────────────────────────────────────────────

  function init(containerEl, sections) {
    if (_mounted) destroy()
    if (!window.ForceGraph3D) {
      containerEl.innerHTML = '<div style="color:rgba(0,255,238,.3);font:10px monospace;padding:12px;text-align:center">Loading 3d-force-graph…</div>'
      return
    }

    _container = containerEl
    _sections  = sections ?? []
    _sectionMap = new Map(); for (const s of _sections) _sectionMap.set(s[0], s)
    _hubGlow = _activeGlow = null
    _rings = []; _sparks = []
    _gData = buildData()
    _nodeMap = new Map(); for (const n of _gData.nodes) _nodeMap.set(n.id, n)
    _mounted = true

    const w = containerEl.clientWidth  || 500
    const h = containerEl.clientHeight || 280
    _camDist = Math.max(w, h) * 0.72

    // Build graph without data first so we can configure forces BEFORE warmup
    graph = ForceGraph3D({ antialias: true, alpha: true })(containerEl)
      .width(w).height(h)
      .backgroundColor('rgba(0,0,0,0)')
      .numDimensions(2)
      .nodeId('id').nodeLabel('label')
      .nodeVal(nodeVal).nodeColor(nodeColor).nodeOpacity(0.92)
      .linkColor(linkColorFn)
      .linkWidth(linkWidthFn)
      .linkDirectionalParticles(linkParticlesFn)
      .linkDirectionalParticleSpeed(0.005)
      .linkDirectionalParticleWidth(link => link._active ? 2.2 : 0)
      .linkDirectionalParticleColor(link => {
        const tgt = typeof link.target === 'object' ? link.target.id : link.target
        const s   = _sectionMap.get(tgt)
        return s ? s[2] : HUB_COLOR
      })

    // Configure forces BEFORE warmup so the 120 warmup ticks use our layout forces
    try {
      graph.d3Force('link').distance(35).strength(0.9)
      graph.d3Force('charge').strength(-60)
    } catch {}

    // Now set data — warmup ticks run here with our forces already applied
    graph.warmupTicks(180).cooldownTicks(0).graphData(_gData)

    // Add pulse layer + set devicePixelRatio via underlying renderer
    setTimeout(() => {
      if (!graph) return
      _pulseLayer = new THREE.Group()
      graph.scene().add(_pulseLayer)
      try {
        const renderer = graph.renderer()
        if (renderer && renderer.setPixelRatio) renderer.setPixelRatio(window.devicePixelRatio || 1)
      } catch {}
    }, 50)

    // Position camera
    setTimeout(() => {
      if (!graph) return
      graph.cameraPosition({ x: 0, y: 0, z: _camDist }, { x: 0, y: 0, z: 0 }, 0)
    }, 200)

    _ensureAnimLoop()

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        if (!graph || !_container) return
        const nw = _container.clientWidth, nh = _container.clientHeight
        graph.width(nw).height(nh)
        _camDist = Math.max(nw, nh) * 0.72
      })
      ro.observe(containerEl)
      _container._ro = ro
    }
  }

  function update(focus) {
    _focus = focus ?? {}
    if (!graph || !_gData || !_mounted) return
    for (const node of _gData.nodes) {
      if (node.id === HUB_ID) continue
      node.weight = _focus[node.id] ?? 0
      const sec = _sectionMap.get(node.id)
      node.label = sec ? `${sec[1]} ${node.weight}%` : node.id
    }
    graph.nodeVal(nodeVal).nodeColor(nodeColor)
    graph.refresh()
  }

  function activate(category) {
    if (category !== null && category !== undefined) {
      if (typeof category !== 'string' || category.length > 64) return
    }
    const prev = _activeCategory
    if (category === prev) return
    _activeCategory = category
    _activeGlow = null
    if (category && category !== prev) {
      _recentPair = prev && prev !== HUB_ID ? [prev, category] : []
    } else if (!category) {
      _recentPair = []
    }
    if (graph) syncLinks()
    if (category) _ensureAnimLoop()
  }

  function setRotating(on) {
    _autoRotate = !!on
    // Snap camera back to straight when stopping
    if (!on && graph) {
      _camAngle = 0
      graph.cameraPosition({ x: 0, y: 0, z: _camDist }, { x: 0, y: 0, z: 0 }, 800)
    }
    if (on) _ensureAnimLoop()
  }

  function resize() {
    if (!graph || !_container) return
    const w = _container.clientWidth, h = _container.clientHeight
    graph.width(w).height(h)
    _camDist = Math.max(w, h) * 0.72
  }

  function destroy() {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null }
    if (_container && _container._ro) { _container._ro.disconnect(); _container._ro = null }
    _rings = []; _sparks = []
    if (graph) {
      try { graph._destructor && graph._destructor() } catch {}
      if (_container) _container.innerHTML = ''
      graph = null
    }
    for (const t of glowCache) { if (t.dispose) t.dispose() }
    glowCache.clear()
    _pulseLayer = null; _gData = null; _mounted = false
    _activeCategory = null; _recentPair = []
    _hubGlow = null; _activeGlow = null
    _sections = []; _sectionMap.clear(); _nodeMap.clear()
    _focus = {}
    _lastRefresh = 0
    _autoRotate = false; _camAngle = 0; _linkFlash = { cat: null, strength: 0 }
  }

  return { init, update, activate, pulse, setRotating, destroy, resize }
})()
