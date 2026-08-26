'use strict'
// Mixer Node Graph — 3D force-directed visualization of mix focus weights.
// Built on 3d-force-graph + three.js (CDN-loaded in index.html).
// Simplified approach: built-in nodeColor/nodeVal for all nodes; custom
// Three.js glow sprite added via nodeThreeObjectExtend(true) only for hub
// and active category node. Guaranteed to render regardless of THREE errors.

window.mixerGraph = (() => {
  const HUB_ID = '__hub__'
  const HUB_COLOR = '#00ccff'

  let graph = null
  let _container = null
  let _sections = []
  let _focus = {}
  let _activeCategory = null
  let _recentPair = []
  let _gData = null
  let _mounted = false
  let _animId = null
  let _t = 0

  // Active glow sprite ref (updated by nodeThreeObject)
  let _hubGlow = null
  let _activeGlow = null

  // ── Glow texture cache ────────────────────────────────────────────────────
  const glowCache = new Map()
  function makeGlowTexture(hexColor) {
    if (glowCache.has(hexColor)) return glowCache.get(hexColor)
    if (!window.THREE) return null
    const size = 128
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')
    const r = size / 2
    // Parse hex safely
    const hex = hexColor.replace('#', '')
    const ri = parseInt(hex.slice(0, 2), 16) || 0
    const gi = parseInt(hex.slice(2, 4), 16) || 0
    const bi = parseInt(hex.slice(4, 6), 16) || 0
    const g = ctx.createRadialGradient(r, r, 0, r, r, r)
    g.addColorStop(0,    `rgba(${ri},${gi},${bi},1)`)
    g.addColorStop(0.3,  `rgba(${ri},${gi},${bi},0.6)`)
    g.addColorStop(0.7,  `rgba(${ri},${gi},${bi},0.15)`)
    g.addColorStop(1,    `rgba(${ri},${gi},${bi},0)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(c)
    glowCache.set(hexColor, tex)
    return tex
  }

  // ── Node sizing ───────────────────────────────────────────────────────────
  // nodeVal maps to sphere volume: radius ∝ val^(1/3)
  // We want radius 3..18, so val 3..100 works
  function nodeVal(node) {
    if (node.id === HUB_ID) return 30
    const w = node.weight || 0
    if (w <= 0) return 1
    return Math.max(2, w * 1.5)
  }

  function nodeColor(node) {
    if (node.id === HUB_ID) return HUB_COLOR
    const w = node.weight || 0
    if (w <= 0) return '#111120'   // near-invisible for zero-weight stands
    return node.color || '#888888'
  }

  // ── Glow object (added on top of default sphere via nodeThreeObjectExtend) ─
  function nodeThreeObject(node) {
    if (!window.THREE) return null
    const isHub = node.id === HUB_ID
    const isActive = node.id === _activeCategory
    if (!isHub && !isActive) return null

    const color = isHub ? HUB_COLOR : (node.color || '#00ffee')
    const glowTex = makeGlowTexture(color)
    if (!glowTex) return null

    const mat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: isHub ? 0.7 : 0.85,
    })
    const sprite = new THREE.Sprite(mat)
    const baseScale = isHub ? 28 : Math.max(24, (node.weight || 0) * 0.6 + 22)
    sprite.scale.set(baseScale, baseScale, 1)
    sprite.userData.baseScale = baseScale

    if (isHub) _hubGlow = sprite
    if (isActive) _activeGlow = sprite

    return sprite
  }

  // ── Build graph data ───────────────────────────────────────────────────────
  function buildData() {
    const nodes = []
    const links = []

    nodes.push({ id: HUB_ID, label: '⚡ DIRECTOR', color: HUB_COLOR, weight: -1, fx: 0, fy: 0, fz: 0 })

    for (const [key, label, color] of _sections) {
      const w = _focus[key] ?? 0
      nodes.push({ id: key, label: `${label} ${w}%`, color, weight: w })
      links.push({ id: `hub→${key}`, source: HUB_ID, target: key, _active: false, _particles: 0 })
    }

    if (_recentPair.length === 2) {
      const [a, b] = _recentPair
      links.push({ id: `x→${a}→${b}`, source: a, target: b, _active: true, _particles: 3, _cross: true })
    }

    return { nodes, links }
  }

  // ── Sync active link particles without full rebuild ────────────────────────
  function syncLinks() {
    if (!_gData) return
    for (const link of _gData.links) {
      if (link._cross) continue
      const tgt = typeof link.target === 'object' ? link.target.id : link.target
      link._active = tgt === _activeCategory
      link._particles = link._active ? 5 : 0
    }
    _gData.links = _gData.links.filter(l => !l._cross)
    if (_recentPair.length === 2) {
      const [a, b] = _recentPair
      _gData.links.push({ id: `x→${a}→${b}`, source: a, target: b, _active: true, _particles: 3, _cross: true })
    }
    if (graph) graph.refresh()
  }

  // ── Animation loop — pulse glow sprites ───────────────────────────────────
  function animLoop() {
    _t += 0.05
    if (_hubGlow) {
      const s = _hubGlow.userData.baseScale * (1 + 0.15 * Math.sin(_t * 0.6))
      _hubGlow.scale.set(s, s, 1)
    }
    if (_activeGlow) {
      const s = _activeGlow.userData.baseScale * (1 + 0.4 * Math.sin(_t * 2))
      _activeGlow.scale.set(s, s, 1)
      _activeGlow.material.opacity = 0.6 + 0.35 * Math.sin(_t * 2)
    }
    _animId = requestAnimationFrame(animLoop)
  }

  // ── Public API ────────────────────────────────────────────────────────────

  function init(containerEl, sections) {
    if (_mounted) destroy()
    if (!window.ForceGraph3D) {
      // Show a message so the user knows why it's empty
      containerEl.innerHTML = '<div style="color:rgba(0,255,238,.3);font:10px monospace;padding:12px;text-align:center">Loading 3d-force-graph…</div>'
      return
    }

    _container = containerEl
    _sections = sections
    _hubGlow = null
    _activeGlow = null
    _gData = buildData()
    _mounted = true

    const w = containerEl.clientWidth || 500
    const h = containerEl.clientHeight || 280

    graph = ForceGraph3D({ antialias: true, alpha: true })(containerEl)
      .width(w)
      .height(h)
      .backgroundColor('#04040a')
      .numDimensions(2)
      .warmupTicks(120)
      .cooldownTicks(0)
      .nodeId('id')
      .nodeLabel('label')
      .nodeVal(nodeVal)
      .nodeColor(nodeColor)
      .nodeOpacity(0.92)
      .nodeThreeObject(nodeThreeObject)
      .nodeThreeObjectExtend(true)
      .linkColor(link => {
        if (!link._active) return 'rgba(255,255,255,0.04)'
        const tgt = typeof link.target === 'object' ? link.target.id : link.target
        const s = _sections.find(s => s[0] === tgt)
        return s ? s[2] : HUB_COLOR
      })
      .linkWidth(link => link._active ? 1.2 : 0.25)
      .linkDirectionalParticles(link => link._particles || 0)
      .linkDirectionalParticleSpeed(0.005)
      .linkDirectionalParticleWidth(link => link._active ? 2 : 0)
      .linkDirectionalParticleColor(link => {
        const tgt = typeof link.target === 'object' ? link.target.id : link.target
        const s = _sections.find(s => s[0] === tgt)
        return s ? s[2] : HUB_COLOR
      })
      .graphData(_gData)

    // Configure forces — simple uniform values, no per-node functions
    try {
      graph.d3Force('link').distance(70).strength(0.8)
      graph.d3Force('charge').strength(-120)
    } catch (e) {}

    // Position camera to show 2D plane
    setTimeout(() => {
      if (!graph) return
      const camDist = Math.max(w, h) * 0.7
      graph.cameraPosition({ x: 0, y: 0, z: camDist }, { x: 0, y: 0, z: 0 }, 0)
    }, 200)

    _animId = requestAnimationFrame(animLoop)

    // Auto-resize
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        if (graph && _container) graph.width(_container.clientWidth).height(_container.clientHeight)
      })
      ro.observe(containerEl)
      _container._ro = ro
    }
  }

  function update(focus) {
    _focus = focus || {}
    if (!graph || !_gData || !_mounted) return

    // Mutate existing node data in-place (preserves simulation positions)
    for (const node of _gData.nodes) {
      if (node.id === HUB_ID) continue
      node.weight = _focus[node.id] ?? 0
      node.label = (() => {
        const s = _sections.find(s => s[0] === node.id)
        return s ? `${s[1]} ${node.weight}%` : node.id
      })()
    }

    // Re-apply accessors to update colors and sizes
    graph.nodeVal(nodeVal).nodeColor(nodeColor)
    graph.refresh()
  }

  function activate(category) {
    const prev = _activeCategory
    _activeCategory = category
    _activeGlow = null

    if (category && category !== prev) {
      _recentPair = prev && prev !== HUB_ID ? [prev, category] : []
    } else if (!category) {
      _recentPair = []
    }

    // Re-apply nodeThreeObject so glow appears on new active node
    if (graph) {
      graph.nodeThreeObject(nodeThreeObject)
      syncLinks()
    }
  }

  function resize() {
    if (!graph || !_container) return
    graph.width(_container.clientWidth).height(_container.clientHeight)
  }

  function destroy() {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null }
    if (_container && _container._ro) { _container._ro.disconnect(); _container._ro = null }
    if (graph) {
      try { graph._destructor && graph._destructor() } catch {}
      if (_container) _container.innerHTML = ''
      graph = null
    }
    glowCache.forEach(t => t.dispose && t.dispose())
    glowCache.clear()
    _gData = null
    _mounted = false
    _activeCategory = null
    _recentPair = []
    _hubGlow = null
    _activeGlow = null
  }

  return { init, update, activate, destroy, resize }
})()
