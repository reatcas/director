'use strict'
// Mixer Node Graph — 3D force-directed visualization of the mix focus weights.
// Built on 3d-force-graph + three.js (CDN-loaded in index.html, same pattern
// as pulsand NGO ecosystem graph). One hub node + 16 category nodes.
// Node size ∝ weight%. Active category glows + edge particles flow.

window.mixerGraph = (() => {
  const HUB_ID = '__hub__'
  const HUB_COLOR = '#00ffee'
  const MIN_RADIUS = 2.5
  const MAX_RADIUS = 18

  let graph = null
  let _container = null
  let _sections = []          // [[key, label, color, svg], …]
  let _focus = {}             // { key: weight, … }
  let _activeCategory = null  // currently working category
  let _recentPair = []        // last 2 worked categories for cross-edge glow
  let _gData = null           // stable graphData object (mutated in-place)
  let _animId = null
  let _mounted = false

  // ── Registry of Three.js objects ──────────────────────────────────────────
  // nodeThreeObject stores refs here; rAF loop updates them.
  const nodeReg = new Map()   // id → { group, sphere, mat, glow, glowMat }

  // ── Glow texture cache ────────────────────────────────────────────────────
  const glowCache = new Map()
  function makeGlowTexture(hex) {
    if (glowCache.has(hex)) return glowCache.get(hex)
    const size = 128
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')
    const r = size / 2
    const ri = parseInt(hex.slice(1, 3), 16)
    const gi = parseInt(hex.slice(3, 5), 16)
    const bi = parseInt(hex.slice(5, 7), 16)
    const g = ctx.createRadialGradient(r, r, 0, r, r, r)
    g.addColorStop(0,    `rgba(${ri},${gi},${bi},0.9)`)
    g.addColorStop(0.35, `rgba(${ri},${gi},${bi},0.4)`)
    g.addColorStop(0.7,  `rgba(${ri},${gi},${bi},0.1)`)
    g.addColorStop(1,    `rgba(${ri},${gi},${bi},0)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(c)
    glowCache.set(hex, tex)
    return tex
  }

  // ── Resolve hex color to canonical 6-char form ────────────────────────────
  function toHex6(color) {
    if (!color) return '#888888'
    if (color.startsWith('#') && color.length === 7) return color
    // Fallback: return as-is (already valid for most cases)
    return color
  }

  // ── Node radius from weight ───────────────────────────────────────────────
  function nodeRadius(weight) {
    if (weight <= 0) return MIN_RADIUS
    return MIN_RADIUS + (Math.min(weight, 100) / 100) * (MAX_RADIUS - MIN_RADIUS)
  }

  // ── nodeThreeObject — called by 3d-force-graph for each node ──────────────
  function nodeThreeObject(node) {
    if (!window.THREE) return null

    const isHub = node.id === HUB_ID
    const radius = isHub ? 6 : nodeRadius(node.weight || 0)
    const color = toHex6(node.color)
    const dimmed = !isHub && (node.weight || 0) === 0
    const opacity = dimmed ? 0.18 : (isHub ? 0.9 : 0.85)

    const group = new THREE.Group()
    group.userData.nodeId = node.id

    // Sphere
    const geo = new THREE.SphereGeometry(radius, 20, 20)
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity,
    })
    const sphere = new THREE.Mesh(geo, mat)
    group.add(sphere)

    // Glow sprite — always present, scale driven by rAF
    const glowTex = makeGlowTexture(color)
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: isHub ? 0.55 : 0,
    })
    const glow = new THREE.Sprite(glowMat)
    const baseGlowSize = radius * (isHub ? 5 : 4)
    glow.scale.set(baseGlowSize, baseGlowSize, 1)
    glow.userData.baseSize = baseGlowSize
    group.add(glow)

    // Store in registry
    nodeReg.set(node.id, { group, sphere, mat, glow, glowMat, radius, isHub })
    return group
  }

  // ── Build stable graph data ───────────────────────────────────────────────
  function buildData() {
    const nodes = []
    const links = []

    // Hub
    nodes.push({ id: HUB_ID, label: '⚡', color: HUB_COLOR, weight: -1, fx: 0, fy: 0, fz: 0 })

    for (const [key, label, color] of _sections) {
      const w = _focus[key] ?? 0
      nodes.push({ id: key, label, color, weight: w })
      links.push({
        id: `hub→${key}`,
        source: HUB_ID,
        target: key,
        _active: false,
        _particles: 0,
      })
    }

    // Cross-links between recent pair
    if (_recentPair.length === 2) {
      const [a, b] = _recentPair
      links.push({
        id: `cross→${a}→${b}`,
        source: a,
        target: b,
        _active: true,
        _particles: 3,
        _cross: true,
      })
    }

    return { nodes, links }
  }

  // ── Sync link active states without rebuilding ────────────────────────────
  function syncLinks() {
    if (!_gData) return
    for (const link of _gData.links) {
      if (link._cross) continue
      const tgt = typeof link.target === 'object' ? link.target.id : link.target
      link._active = tgt === _activeCategory
      link._particles = link._active ? 5 : 0
    }
    // Rebuild cross-link
    _gData.links = _gData.links.filter(l => !l._cross)
    if (_recentPair.length === 2) {
      const [a, b] = _recentPair
      _gData.links.push({
        id: `cross→${a}→${b}`,
        source: a,
        target: b,
        _active: true,
        _particles: 3,
        _cross: true,
      })
    }
    if (graph) graph.refresh()
  }

  // ── rAF animation loop — pulse active glow ────────────────────────────────
  let _t = 0
  function animLoop() {
    _t += 0.05
    for (const [id, reg] of nodeReg) {
      const isActive = id === _activeCategory
      const { glow, glowMat, mat, radius, isHub } = reg

      if (isHub) {
        // Hub always softly pulses
        const scale = glow.userData.baseSize * (1 + 0.12 * Math.sin(_t * 0.7))
        glow.scale.set(scale, scale, 1)
        continue
      }

      if (isActive) {
        // Bright pulsing glow
        const pulse = 1 + 0.35 * Math.sin(_t * 1.8)
        const baseSize = Math.max(radius * 4, 20)
        glow.scale.set(baseSize * pulse, baseSize * pulse, 1)
        glowMat.opacity = 0.6 + 0.3 * Math.sin(_t * 1.8)
        mat.opacity = 0.95
      } else {
        // Fade glow out
        glowMat.opacity = Math.max(0, glowMat.opacity - 0.04)
        if (glowMat.opacity <= 0) glow.scale.set(0, 0, 1)
        mat.opacity = (reg.isHub) ? 0.9 : ((reg.weight || 0) === 0 ? 0.18 : 0.85)
      }
    }
    _animId = requestAnimationFrame(animLoop)
  }

  // ── Public API ────────────────────────────────────────────────────────────

  function init(containerEl, sections) {
    if (_mounted) destroy()
    if (!window.ForceGraph3D || !window.THREE) {
      // CDN not loaded yet — silently skip, will retry on next loadMixer
      return
    }

    _container = containerEl
    _sections = sections
    nodeReg.clear()
    _gData = buildData()
    _mounted = true

    graph = ForceGraph3D({
      antialias: true,
      alpha: true,
      rendererConfig: { alpha: true, antialias: true },
    })(containerEl)
      .backgroundColor('rgba(0,0,0,0)')
      .numDimensions(2)
      .warmupTicks(80)
      .cooldownTicks(0)
      .nodeId('id')
      .nodeLabel('label')
      .nodeThreeObject(nodeThreeObject)
      .nodeThreeObjectExtend(false)
      .linkColor(link => link._active ? toHex6(
        (() => {
          const tgt = typeof link.target === 'object' ? link.target.id : link.target
          const s = _sections.find(s => s[0] === tgt)
          return s ? s[2] : '#ffffff'
        })()
      ) : 'rgba(255,255,255,0.06)')
      .linkWidth(link => link._active ? 1.5 : 0.4)
      .linkDirectionalParticles(link => link._particles || 0)
      .linkDirectionalParticleSpeed(0.006)
      .linkDirectionalParticleWidth(link => link._active ? 1.8 : 0)
      .linkDirectionalParticleColor(link => {
        const tgt = typeof link.target === 'object' ? link.target.id : link.target
        const s = _sections.find(s => s[0] === tgt)
        return s ? s[2] : HUB_COLOR
      })
      .graphData(_gData)

    // Adjust forces for hub-spoke
    graph.d3Force('charge', null)
    try {
      const { forceSimulation } = graph.d3Force
      graph.d3Force('link').distance(d => {
        const src = typeof d.source === 'object' ? d.source.id : d.source
        return src === HUB_ID ? 60 : 30
      }).strength(0.8)
    } catch {}

    // Camera: look at center from above (2D plane)
    setTimeout(() => {
      if (graph && graph.cameraPosition) {
        graph.cameraPosition({ x: 0, y: 0, z: 200 }, { x: 0, y: 0, z: 0 }, 0)
      }
    }, 100)

    _animId = requestAnimationFrame(animLoop)
  }

  function update(focus) {
    _focus = focus || {}
    if (!graph || !_mounted) return

    // Update weights in existing node objects (mutate in-place)
    for (const node of _gData.nodes) {
      if (node.id === HUB_ID) continue
      node.weight = _focus[node.id] ?? 0
      const reg = nodeReg.get(node.id)
      if (reg) {
        reg.weight = node.weight
        const r = nodeRadius(node.weight)
        // Rescale sphere
        if (reg.sphere) {
          const scale = r / reg.radius
          reg.sphere.scale.set(scale, scale, scale)
        }
        reg.glow.userData.baseSize = r * 4
      }
    }
    graph.refresh()
  }

  function activate(category) {
    const prev = _activeCategory
    _activeCategory = category

    if (category && category !== prev) {
      // Track recent pair for cross-edge
      if (prev && prev !== HUB_ID) {
        _recentPair = [prev, category]
      } else {
        _recentPair = []
      }
    } else if (!category) {
      _recentPair = []
    }

    syncLinks()
  }

  function destroy() {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null }
    if (graph) {
      try { graph._destructor && graph._destructor() } catch {}
      if (_container) _container.innerHTML = ''
      graph = null
    }
    nodeReg.clear()
    glowCache.forEach(tex => tex.dispose && tex.dispose())
    glowCache.clear()
    _gData = null
    _mounted = false
    _activeCategory = null
    _recentPair = []
  }

  return { init, update, activate, destroy }
})()
