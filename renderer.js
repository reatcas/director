// Copyright (c) 2026 René Antonio Casaña Amaya. All rights reserved.
// Licensed under the AGPL-3.0 License. See LICENSE in repository root.

// ─── Neural Particle System ───────────────────────────────────────────────────
;(function initParticles() {
  const canvas = document.getElementById('particleCanvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const COLORS = ['#00aaff', '#8844ff', '#00ffee', '#ff44aa', '#4488ff', '#aa55ff']
  const MAX_DIST = 140
  const N = 55

  function resize() {
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resize)
  resize()

  const particles = Array.from({ length: N }, () => ({
    x:   Math.random() * window.innerWidth,
    y:   Math.random() * window.innerHeight,
    vx:  (Math.random() - .5) * .35,
    vy:  (Math.random() - .5) * .35,
    r:   Math.random() * 1.6 + .6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    pulse: Math.random() * Math.PI * 2
  }))

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.pulse += .025
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1
    }
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const d  = Math.sqrt(dx * dx + dy * dy)
        if (d > MAX_DIST) continue
        const alpha = (1 - d / MAX_DIST) * .18
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = particles[i].color + Math.round(alpha * 255).toString(16).padStart(2, '0')
        ctx.lineWidth = .5
        ctx.stroke()
      }
    }
    for (const p of particles) {
      const pulse = (Math.sin(p.pulse) + 1) / 2
      const r = p.r + pulse * .8
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5)
      grd.addColorStop(0, p.color + '55')
      grd.addColorStop(1, p.color + '00')
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 5, 0, Math.PI * 2)
      ctx.fillStyle = grd; ctx.fill()
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fillStyle = p.color + 'cc'; ctx.fill()
    }
    requestAnimationFrame(draw)
  }
  requestAnimationFrame(draw)
})()

const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)

function esc(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

const SECTIONS = [
  ['product',        'Product',     '#e8631a', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'],
  ['backend',        'Backend',     '#3d78e8', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6" y2="6"></line><line x1="6" y1="18" x2="6" y2="18"></line></svg>'],
  ['frontend',       'Frontend',    '#9955ee', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>'],
  ['business_logic', 'Logic',       '#e03080', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'],
  ['security',       'Security',    '#e03030', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'],
  ['quality_tests',  'Tests',       '#28a828', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'],
  ['devops_infra',   'DevOps',      '#00b8b8', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'],
  ['performance',    'Perf',        '#ddba00', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'],
  ['ux_accessibility','UX',         '#e060a0', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'],
  ['data_db',        'Data',        '#4488cc', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>'],
  ['documentation',  'Docs',        '#777788', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'],
  ['i18n',           'i18n',        '#88aa88', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'],
  ['refactoring',    'Refactor',    '#8899aa', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zM15 6l6 6m-3-3l-4 4"></path></svg>'],
  ['architecture',   'Arch',        '#cc6633', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M4 10h16M10 4v16"></path></svg>'],
  ['api_integrations','APIs',       '#55aadd', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M6 8H5a4 4 0 0 0 0 8h1M8 12h8"></path></svg>'],
  ['error_handling', 'Errors',      '#ff6644', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>']
]

const ICON_LIBRARY = [
  ['star',     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'],
  ['heart',    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>'],
  ['zap',      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'],
  ['target',   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>'],
  ['flag',     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>'],
  ['cpu',      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>'],
  ['tool',     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>'],
  ['box',      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>'],
  ['compass',  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>'],
  ['eye',      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'],
  ['cloud',    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>'],
  ['lock',     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'],
]

const COLOR_PALETTE = [
  '#e8631a','#3d78e8','#9955ee','#e03080','#e03030','#28a828','#00b8b8','#ddba00',
  '#e060a0','#4488cc','#777788','#88aa88','#8899aa','#cc6633','#55aadd','#ff6644',
  '#ff8800','#00cc88','#aa44cc','#44aaff','#ff4488','#88cc44','#cc8844','#4466cc',
]

let customAtriles = []

async function loadCustomAtriles() {
  customAtriles = await window.director.atrilesList() || []
}

function getAllSections() {
  // Merge built-in SECTIONS with custom atriles
  const all = [...SECTIONS]
  for (const a of customAtriles) {
    if (!all.find(s => s[0] === a.id)) {
      const iconEntry = ICON_LIBRARY.find(i => i[0] === a.icon)
      const svg = iconEntry ? iconEntry[1] : ICON_LIBRARY[0][1]
      all.push([a.id, a.name, a.color, svg, a.description || ''])
    }
  }
  return all
}

let current = null
let projects = []
const logCache = new Map()

// ─── Orchestra State Tracking ────────────────────────────────────────────────
let orchestraState = 'idle' // idle | started | interpreting | usage_limit | finished

function setOrchestraState(state) {
  orchestraState = state
  updateMonitorStatus()
  updateTransportButtons()
}

function updateMonitorStatus() {
  const el = $('#monitorStatus')
  if (!el) return

  const STATES = {
    idle:         { icon: '◇', label: 'SILENT',     cls: 'idle' },
    started:      { icon: '▶', label: 'ORCHESTRA STARTED', cls: 'started' },
    interpreting: { icon: 'waveform', label: 'INTERPRETING…',  cls: 'interpreting' },
    usage_limit:  { icon: '⏸', label: 'SCORE EXHAUSTED — WAITING FOR CREDITS', cls: 'usage' },
    finished:     { icon: '✓', label: 'INTERPRETATION FINISHED', cls: 'finished' }
  }

  const s = STATES[orchestraState] || STATES.idle
  el.className = 'monitor-status ' + s.cls

  let iconHTML
  if (s.icon === 'waveform') {
    iconHTML = '<span class="ms-icon"><span class="waveform-bar"></span><span class="waveform-bar"></span><span class="waveform-bar"></span><span class="waveform-bar"></span><span class="waveform-bar"></span></span>'
  } else {
    iconHTML = `<span class="ms-icon">${s.icon}</span>`
  }

  el.innerHTML = `
    <div class="ms-indicator">
      <div class="ms-icon-wrap">${iconHTML}</div>
      <span class="ms-label">${s.label}</span>
    </div>
  `
}

// ─── Clock ───────────────────────────────────────────────────────────────────
let clockStart = null
let clockIv = null

function clockTick() {
  const el = $('#clockTime')
  if (!el) return
  if (!clockStart) {
    el.textContent = '00:00:00'
    return
  }
  const s = Math.floor((Date.now() - clockStart) / 1000)
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  el.textContent = `${h}:${m}:${ss}`
}

function startClock(startTime) {
  if (clockIv) clearInterval(clockIv)
  clockStart = startTime || Date.now()
  clockIv = setInterval(clockTick, 1000)
  clockTick()
}

function stopClock() {
  if (clockIv) clearInterval(clockIv)
  clockIv = null
  clockStart = null
  clockTick()
}

function setStatus(text) {
  const el = $('#clockStatus')
  if (el) el.textContent = text
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = n => n.replace(/[^a-zA-Z0-9 ]/g, '').split(/[\s_-]+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '♪'
const hue = s => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360

function logoHTML(p, sm) {
  if (p.logo) {
    const src = 'local-img://' + encodeURIComponent(p.logo)
    return `<img class="badge${sm ? ' sm' : ''}" src="${src}" alt="${esc(p.name)}">`
  }
  const cls = sm ? 'badge sm' : 'badge'
  return `<span class="${cls}" style="background:hsl(${hue(p.name)} 45% 30%)">${initials(esc(p.name))}</span>`
}

function showToast(msg) {
  let el = document.getElementById('director-toast')
  if (!el) {
    el = document.createElement('div')
    el.id = 'director-toast'
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#222230;color:#aaa;border:1px solid #333;border-radius:5px;padding:7px 18px;font:11px var(--mono, monospace);z-index:9999;pointer-events:none;opacity:0;transition:opacity .2s'
    document.body.appendChild(el)
  }
  el.textContent = msg
  el.style.opacity = '1'
  setTimeout(() => { el.style.opacity = '0' }, 1800)
}

// ─── Empty State / Tabs visibility ───────────────────────────────────────────
function updateStageView() {
  const emptyState = $('#emptyState')
  const unified = $('#splitLayout')
  const hasProject = !!current

  if (emptyState) {
    if (hasProject) {
      emptyState.classList.remove('on')
    } else {
      emptyState.classList.add('on')
      if ($('#openFolderBtn')) $('#openFolderBtn').hidden = true
    }
  }
  if (unified) {
    unified.style.display = hasProject ? 'flex' : 'none'
  }
}

// ─── Transport Button State ──────────────────────────────────────────────────
function updateTransportButtons() {
  const p = proj()
  const playBtn = $('#playBtn')
  const fineBtn = $('#fineBtn')
  const killBtn = $('#killBtn')

  if (!p || !p.installed) {
    if (playBtn) { playBtn.classList.add('disabled'); playBtn.innerHTML = '▶' }
    if (fineBtn) { fineBtn.classList.add('disabled'); fineBtn.innerHTML = '◼' }
    if (killBtn) { killBtn.classList.add('disabled'); killBtn.innerHTML = '✕' }
    return
  }

  // Use both p.running (PID check) and orchestraState to determine if active
  const isActive = p.running || orchestraState === 'interpreting' || orchestraState === 'started'

  if (isActive) {
    if (playBtn) { playBtn.classList.add('disabled'); playBtn.innerHTML = '▶' }
    if (fineBtn) { fineBtn.classList.remove('disabled'); fineBtn.innerHTML = '◼' }
    if (killBtn) { killBtn.classList.remove('disabled'); killBtn.innerHTML = '✕' }
  } else {
    if (playBtn) { playBtn.classList.remove('disabled'); playBtn.innerHTML = '▶' }
    if (fineBtn) { fineBtn.classList.add('disabled'); fineBtn.innerHTML = '◼' }
    if (killBtn) { killBtn.classList.add('disabled'); killBtn.innerHTML = '✕' }
  }
}

// ─── Core UI Logic ────────────────────────────────────────────────────────────
async function refresh() {
  projects = await window.director.list()
  const ul = $('#projects')
  ul.innerHTML = ''
  for (const p of projects) {
    const li = document.createElement('li')
    li.className = (current === p.path ? 'sel ' : '') + (p.running ? 'live' : '')
    li.innerHTML = `<span class="led"></span>
      ${logoHTML(p, true)}
      <span class="pn">${esc(p.name)}</span>
      <span class="pv">${p.running ? 'LIVE' : p.installed ? 'v' + p.version : '—'}</span>`
    li.onclick = () => open(p.path)
    ul.appendChild(li)
  }
  if (current) {
    paint()
  } else {
    updateTransportButtons()
  }
  updateStageView()
}

function proj() { return projects.find(p => p.path === current) }

function saveMixerState() {
  if (!current) return
  const inputs = document.querySelectorAll('#mixerStrips input[type="range"]')
  if (!inputs.length) return
  const focus = {}
  inputs.forEach(i => { focus[i.dataset.k] = +i.value })
  window.director.mixerWrite(current, focus)
}

async function open(dir) {
  if (current) {
    saveMixerState()
  }
  current = dir
  await refresh()

  const logEl = $('#log')
  if (logEl) logEl.innerHTML = ''
  currentGroup = null
  usageEntry = null
  retryCount = 0
  rawLogBuffer.length = 0

  // Determine orchestra state for this project — must match real process state
  const p = proj()
  if (p && p.running) {
    setOrchestraState('interpreting')
    startClock(p.runStarted)
    setStatus('PLAY')
  } else if (p && p.usageLimited) {
    setOrchestraState('usage_limit')
    stopClock()
    setStatus('PAUSE')
  } else if (p && p.installed) {
    setOrchestraState('idle')
    stopClock()
    setStatus('STOP')
  } else {
    setOrchestraState('idle')
    stopClock()
    setStatus('IDLE')
  }
  updateTransportButtons()

  let rawLog = ''
  if (logCache.has(dir)) {
    rawLog = logCache.get(dir)
  } else {
    rawLog = await window.director.tail(dir)
    logCache.set(dir, rawLog)
  }

  if (rawLog && logEl) {
    const lines = rawLog.split('\n')
    const recent = lines.slice(-200)
    for (const l of recent) {
      if (l.trim()) parseLogLine(dir, l)
    }
  }

  // Load persisted lifecycle history first, then tail log
  await loadLifecycleHistory()
  scrollLog()
  await loadCustomAtriles()
  await loadMixer()
  await loadMixes()
  await loadMetrics()
  await loadCompliance()
  loadRoadmapFreshness()
  checkVersionUpgrade()

  const out = $('#analysisOut')
  if (out) out.value = p && p.critique ? p.critique : ''
  const analysisSec = $('#sectionAnalysis')
  if (analysisSec) analysisSec.hidden = !(p && p.hasLogs)
}

function paint() {
  const p = proj(); if (!p) return
  const pname = $('#pname'); if(pname) pname.textContent = p.name
  const ppath = $('#ppath'); if(ppath) ppath.textContent = p.path
  const badge = $('#pbadge')
  if (badge) {
    if (p.logo) {
      badge.innerHTML = ''
      badge.style.background = 'transparent'
      const img = document.createElement('img')
      img.src = 'local-img://' + encodeURIComponent(p.logo)
      img.alt = p.name
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:inherit'
      badge.appendChild(img)
    } else {
      badge.innerHTML = `<span id="pbadgeText">${initials(esc(p.name))}</span>`
      badge.style.background = `hsl(${hue(p.name)} 45% 30%)`
    }
  }

  const statusEl = $('#pstatus')
  if (statusEl) {
    statusEl.textContent = p.running
      ? '● INTERPRETING — v' + p.version
      : p.installed ? 'SILENT — v' + p.version : 'NO ORCHESTRA'
    statusEl.className = 'tp-status' + (p.running ? ' live' : '')
  }

  if ($('#installBtn')) $('#installBtn').hidden = p.installed
  if ($('#openFolderBtn')) $('#openFolderBtn').hidden = false
  if ($('#sectionAnalysis')) $('#sectionAnalysis').hidden = !p.hasLogs

  updateTransportButtons()

  if (p.running) {
    startClock(p.runStarted)
    setStatus('PLAY')
    setOrchestraState('interpreting')
  } else if (p.usageLimited) {
    stopClock()
    setStatus('PAUSE')
    setOrchestraState('usage_limit')
  } else {
    stopClock()
    setStatus(p.installed ? 'STOP' : 'IDLE')
    setOrchestraState('idle')
  }
}

let autoScrollEnabled = true
if ($('#autoScrollBtn')) {
  $('#autoScrollBtn').onclick = (e) => {
    autoScrollEnabled = !autoScrollEnabled
    e.target.style.color = autoScrollEnabled ? 'var(--hi)' : 'var(--tx-muted)'
  }
}
function scrollLog() {
  const l = $('#log')
  if(l && autoScrollEnabled) l.scrollTop = l.scrollHeight
}

// ─── Button handlers ──────────────────────────────────────────────────────────
if ($('#addBtn')) $('#addBtn').onclick = async () => {
  const d = await window.director.add(null)
  if (d) { await refresh(); open(d) }
}
if ($('#removeBtn')) $('#removeBtn').onclick = async () => {
  if (!current) return
  await window.director.remove(current)
  current = null
  stopClock()
  setStatus('IDLE')
  setOrchestraState('idle')
  if ($('#log')) $('#log').innerHTML = ''
  if ($('#mixerStrips')) $('#mixerStrips').innerHTML = ''
  if ($('#mixesList')) $('#mixesList').innerHTML = ''
  if ($('#pname')) $('#pname').textContent = '—'
  if ($('#pstatus')) {
    $('#pstatus').textContent = 'no project'
    $('#pstatus').className = 'tp-status'
  }
  if ($('#pbadge')) { $('#pbadge').innerHTML = ''; $('#pbadge').style.background = '' }
  refresh()
}
if ($('#installBtn')) $('#installBtn').onclick = async () => { await window.director.install(current); refresh() }
if ($('#openFolderBtn')) $('#openFolderBtn').onclick = () => window.director.openDir(current)
if ($('#upgradeBtn')) $('#upgradeBtn').onclick = async () => {
  const btn = $('#upgradeBtn')
  if (btn) { btn.textContent = '…'; btn.disabled = true }
  const result = await window.director.orchestraUpgrade(current)
  if (result && result.ok) {
    if (btn) { btn.hidden = true; btn.disabled = false; btn.textContent = 'UPDATE' }
    const vVer = $('#upgradeVer'); if (vVer) vVer.style.display = 'none'
    addCycleEntry(`▸ Orchestra updated — ${result.upgraded.length} files`)
  } else {
    if (btn) { btn.textContent = 'ERROR'; btn.disabled = false }
    if (result && result.errors) addErrorEntry(result.errors.join(', '))
  }
}
if ($('#playBtn')) $('#playBtn').onclick = async () => {
  const p = proj()
  if (!p || !p.installed || p.running) return
  addActionEntry('play', 'CONDUCT', `Order to interpret — project: ${esc(p.name)}`)
  setOrchestraState('started')
  await window.director.play(current)
  setTimeout(() => { if (orchestraState === 'started') setOrchestraState('interpreting') }, 3000)
  refresh()
}
if ($('#fineBtn')) $('#fineBtn').onclick = async () => {
  const p = proj()
  if (!p || !p.running) return
  addActionEntry('fine', 'FINE', 'Closing last measure… the orchestra will finish the current cycle')
  await window.director.fine(current)
  if ($('#pstatus')) {
    $('#pstatus').textContent = 'CLOSING LAST MEASURE…'
    $('#pstatus').className = 'tp-status'
  }
  setStatus('FINE')
}
if ($('#killBtn')) $('#killBtn').onclick = async () => {
  const p = proj()
  if (!p || !p.running) return
  addActionEntry('kill', 'CUT', 'Termination signal sent — immediate cut')
  await window.director.kill(current)
  setOrchestraState('finished')
  refresh()
}

// Note: lifecycle events are persisted server-side in main.js IPC handlers
// (orchestra:play, orchestra:fine, orchestra:kill, exit callback, usage_limit)

// ─── Analysis ─────────────────────────────────────────────────────────────────
async function runAnalysis() {
  if ($('#analysisOut')) $('#analysisOut').value = 'Composing the critique…'
  if ($('#analysisFile')) $('#analysisFile').textContent = ''
  const res = await window.director.analyze(current)
  if (res) {
    if ($('#analysisOut')) $('#analysisOut').value = res.report
    if ($('#analysisFile')) $('#analysisFile').textContent = res.file
  }
}
if ($('#refreshAnalysis')) $('#refreshAnalysis').onclick = runAnalysis
if ($('#copyAnalysis')) $('#copyAnalysis').onclick = () => navigator.clipboard.writeText($('#analysisOut').value)

// ─── Mixer ───────────────────────────────────────────────────────────────────
function sortMixerStrips() {
  // no-op: strips stay in predefined SECTIONS order
}

async function loadMixer() {
  if (!current) return
  const cfg = await window.director.mixerRead(current)
  const focus = (cfg && cfg.focus) || {}
  const box = $('#mixerStrips')
  if (!box) return
  box.innerHTML = ''

  const allSections = getAllSections()
  // Build strips in predefined order (no sorting)
  const stripData = allSections.map(([k, label, color, svg]) => {
    const v = focus[k] ?? 20
    return { k, label, color, svg, v }
  })

  for (const { k, label, color, svg, v } of stripData) {
    const strip = document.createElement('div')
    strip.className = 'strip-h ' + (v > 0 ? 'on' : 'off')
    strip.style.setProperty('--strip-color', color)
    strip.dataset.key = k
    strip.innerHTML = `
  <div class="strip-h-icon">${svg}</div>
  <div class="strip-h-label">${label}</div>
  <div class="strip-bar-h">
    <div class="strip-bar-fill-h" style="width:${v}%"></div>
    <input type="range" min="0" max="100" value="${v}" data-k="${k}">
  </div>
  <div class="strip-h-val">${v}</div>
`
    box.appendChild(strip)

    const inp = strip.querySelector('input[type="range"]')
    const fill = strip.querySelector('.strip-bar-fill-h')
    const valEl = strip.querySelector('.strip-h-val')

    inp.addEventListener('input', () => {
      const val = parseInt(inp.value, 10)
      fill.style.width = val + '%'
      valEl.textContent = val
      strip.classList.toggle('on', val > 0)
      strip.classList.toggle('off', val === 0)
    })
    inp.addEventListener('change', () => {
      const val = parseInt(inp.value, 10)
      fill.style.width = val + '%'
      valEl.textContent = val
      strip.classList.toggle('on', val > 0)
      strip.classList.toggle('off', val === 0)
    })
  }
}

// ─── Save Mix ────────────────────────────────────────────────────────────────
if ($('#saveMixer')) $('#saveMixer').onclick = async () => {
  if (!current) return
  const nameInput = $('#mixNameInput')
  let name = nameInput ? nameInput.value.trim() : ''
  if (!name) name = `Mix ${new Date().toLocaleDateString('en-US')} ${new Date().toLocaleTimeString('en-US', { hour12: false })}`

  const focus = {}
  document.querySelectorAll('#mixerStrips input[type="range"]').forEach(i => {
    focus[i.dataset.k] = +i.value
  })

  if (Object.keys(focus).length === 0) {
    showToast('No stands loaded')
    return
  }

  await window.director.mixerWrite(current, focus)
  await window.director.mixerSavedSave(current, name, focus)

  if (nameInput) nameInput.value = ''

  showToast('Mix "' + name + '" saved ✓')
  loadMixes()
}

// ─── Import Mix ──────────────────────────────────────────────────────────────
if ($('#mixImportBtn')) $('#mixImportBtn').onclick = async () => {
  if (!current) return
  const input = $('#mixImportInput')
  if (!input || !input.value.trim()) return
  try {
    const data = JSON.parse(input.value.trim())
    if (data.focus) {
      await window.director.mixerSavedSave(current, data.name || 'Imported', data.focus)
      input.value = ''
      showToast('Mix imported ✓')
      loadMixes()
    }
  } catch {
    showToast('Invalid JSON')
  }
}

// ─── Saved Mixes List ────────────────────────────────────────────────────────
function buildMixRibbon(focus) {
  // Build a color ribbon signature from stand percentages
  if (!focus) return ''
  const allSecs = getAllSections()
  const segments = []
  let total = 0
  for (const [k, , color] of allSecs) {
    const v = focus[k] || 0
    if (v > 0) {
      segments.push({ color, value: v })
      total += v
    }
  }
  if (total === 0) return '<div class="mix-ribbon"><div class="mix-ribbon-seg" style="width:100%;background:var(--dim2)"></div></div>'
  const html = segments.map(s => {
    const pct = Math.max(2, Math.round(s.value / total * 100))
    return `<div class="mix-ribbon-seg" style="width:${pct}%;background:${s.color}"></div>`
  }).join('')
  return `<div class="mix-ribbon">${html}</div>`
}

async function loadMixes() {
  if (!current) return
  const container = $('#mixesList')
  const empty = $('#mixesEmpty')
  if (!container || !empty) return
  container.innerHTML = ''

  const mixes = await window.director.mixerSavedList(current)
  if (!mixes || mixes.length === 0) {
    empty.hidden = false
    return
  }

  empty.hidden = true
  mixes.forEach(m => {
    const card = document.createElement('div')
    card.className = 'mix-card'
    const date = new Date(m.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    const ribbon = buildMixRibbon(m.focus)

    card.innerHTML = `
      <div class="mix-card-info">
        <div class="mix-card-name">${esc(m.name)}</div>
        ${ribbon}
        <div class="mix-card-meta">${date}</div>
      </div>
      <div class="mix-card-actions">
        <button class="mix-btn load" title="Load">▶</button>
        <button class="mix-btn share" title="Copy JSON">⎘</button>
        <button class="mix-btn del" title="Delete">✕</button>
      </div>`

    card.querySelector('.load').onclick = async e => {
      e.stopPropagation()
      await window.director.mixerWrite(current, m.focus)
      loadMixer()
      showToast('Mix "' + m.name + '" loaded')
    }
    card.querySelector('.share').onclick = async e => {
      e.stopPropagation()
      const json = await window.director.mixerSavedExport(current, m.id)
      if (json) { navigator.clipboard.writeText(json); showToast('JSON copied to clipboard') }
    }
    card.querySelector('.del').onclick = async e => {
      e.stopPropagation()
      await window.director.mixerSavedDelete(current, m.id)
      loadMixes()
      showToast('Mix deleted')
    }
    card.addEventListener('click', () => card.querySelector('.load').click())
    container.appendChild(card)
  })
}

// ─── Compact Log Entry System ─────────────────────────────────────────────────
// Raw log buffer for copy
const rawLogBuffer = []

function showUsageBanner(show) {
  const b = $('#usageBanner')
  if (b) b.classList.toggle('show', show)
}

function timeStamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

// Add a lifecycle action entry (play, fine, kill, exit, resume)
function addActionEntry(type, label, message) {
  const logEl = $('#log')
  if (!logEl) return null

  const ACTIONS = {
    'play':    { icon: '▶', color: '#40c840', bg: 'rgba(64,200,64,0.05)' },
    'fine':    { icon: '◼', color: '#ddba00', bg: 'rgba(221,186,0,0.05)' },
    'kill':    { icon: '✕', color: '#e03030', bg: 'rgba(224,48,48,0.05)' },
    'started': { icon: '⚡', color: '#40c840', bg: 'rgba(64,200,64,0.04)' },
    'exit':    { icon: '■', color: '#4488ff', bg: 'rgba(68,136,255,0.04)' },
    'resume':  { icon: '↻', color: '#00ffee', bg: 'rgba(0,255,238,0.04)' },
  }
  const a = ACTIONS[type] || ACTIONS.started
  const time = timeStamp()
  rawLogBuffer.push(`[${time}] [${label}] ${message}`)

  const el = document.createElement('div')
  el.className = `le le-action le-action-${type}`
  el.style.setProperty('--le-color', a.color)
  el.style.setProperty('--le-bg', a.bg)
  el.style.background = a.bg
  el.innerHTML = `
    <span class="le-icon">${a.icon}</span>
    <span class="le-time">${time}</span>
    <span class="le-badge">${label}</span>
    <span class="le-msg">${message}</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Add interpreting state (animated waveform entry)
function addInterpretingEntry() {
  const logEl = $('#log')
  if (!logEl) return null
  const time = timeStamp()
  rawLogBuffer.push(`[${time}] [INTERPRETING] Orchestra running...`)

  const el = document.createElement('div')
  el.className = 'le le-interpreting'
  el.id = 'le-interpreting-live'
  el.innerHTML = `
    <span class="le-icon">
      <span class="le-waveform">
        <span class="waveform-bar" style="height:5px;animation-delay:0s"></span>
        <span class="waveform-bar" style="height:10px;animation-delay:.12s"></span>
        <span class="waveform-bar" style="height:4px;animation-delay:.24s"></span>
        <span class="waveform-bar" style="height:8px;animation-delay:.08s"></span>
        <span class="waveform-bar" style="height:6px;animation-delay:.2s"></span>
      </span>
    </span>
    <span class="le-time">${time}</span>
    <span class="le-badge" style="background:rgba(64,200,64,.15);color:#40c840;border:1px solid rgba(64,200,64,.25)">INTERPRETING</span>
    <span class="le-msg" style="color:#a5d6a5">Orchestra running…</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  scrollLog()
  return el
}

// Add a usage limit entry (collapsible retries)
let usageEntry = null
let retryCount = 0

function addUsageEntry(message) {
  const logEl = $('#log')
  if (!logEl) return null

  if (usageEntry && usageEntry.parentNode) {
    retryCount++
    const retryEl = usageEntry.querySelector('.le-retry')
    if (retryEl) retryEl.textContent = `(attempt #${retryCount})`
    rawLogBuffer.push(`[${timeStamp()}] [PAUSE] Retry #${retryCount}`)
    return usageEntry
  }

  retryCount = 1
  const time = timeStamp()
  rawLogBuffer.push(`[${time}] [PAUSE] ${message}`)

  const el = document.createElement('div')
  el.className = 'le le-usage'
  el.innerHTML = `
    <span class="le-icon">⏸</span>
    <span class="le-time">${time}</span>
    <span class="le-badge">PAUSE</span>
    <span class="le-msg">${message} <span class="le-retry">(attempt #1)</span></span>
  `
  logEl.appendChild(el)
  usageEntry = el
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Add a feature-start entry (▸ ▶ unit — goal)
function addFeatureEntry(text) {
  const logEl = $('#log')
  if (!logEl) return null
  const time = timeStamp()
  rawLogBuffer.push(`[${time}] ${text}`)

  // Extract category tag, unit name, and goal
  const match = text.match(/▶\s*(?:\[(\w+)\]\s*)?(.+?)\s*—\s*(.+)/) || text.match(/▶\s*(?:\[(\w+)\]\s*)?(.+)/)
  const category = match && match[1] ? match[1] : ''
  const unit = match ? match[2].trim() : text
  const goal = match && match[3] ? match[3].trim() : ''

  // Map category to its mixer color
  const catSection = category ? SECTIONS.find(s => s[0] === category) : null
  const catColor = catSection ? catSection[2] : '#e8631a'
  const catLabel = catSection ? catSection[1].toUpperCase() : 'FEATURE'

  const el = document.createElement('div')
  el.className = 'le le-feature'
  el.style.borderLeftColor = catColor
  el.innerHTML = `
    <span class="le-icon" style="background:${catColor}22;color:${catColor};text-shadow:0 0 4px ${catColor}">▶</span>
    <span class="le-time">${time}</span>
    <span class="le-badge" style="background:${catColor}1a;color:${catColor};border:1px solid ${catColor}40">${catLabel}</span>
    <span class="le-msg" style="color:${catColor}cc"><strong>${unit}</strong>${goal ? ' — ' + goal : ''}</span>
  `
  logEl.appendChild(el)

  // Update the current-feature indicator in monitor status
  const featureEl = $('#currentFeature')
  if (featureEl) featureEl.textContent = unit + (goal ? ' — ' + goal : '')

  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Add a cycle status line (▸ prefixed digests)
function addCycleEntry(text) {
  const logEl = $('#log')
  if (!logEl) return null
  const time = timeStamp()
  rawLogBuffer.push(`[${time}] ${text}`)

  const el = document.createElement('div')
  el.className = 'le le-cycle'
  el.innerHTML = `
    <span class="le-icon">▸</span>
    <span class="le-time">${time}</span>
    <span class="le-msg">${text}</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Add an error entry
function addErrorEntry(text) {
  const logEl = $('#log')
  if (!logEl) return null
  const time = timeStamp()
  rawLogBuffer.push(`[${time}] [ERROR] ${text}`)

  const el = document.createElement('div')
  el.className = 'le le-error'
  el.innerHTML = `
    <span class="le-icon">✕</span>
    <span class="le-time">${time}</span>
    <span class="le-badge" style="background:rgba(224,48,48,.15);color:#e03030;border:1px solid rgba(224,48,48,.25)">ERROR</span>
    <span class="le-msg">${text}</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Add a Claude prose/milestone message entry
function addClaudeMessageEntry(text) {
  const logEl = $('#log')
  if (!logEl) return null
  const time = timeStamp()
  rawLogBuffer.push(`[${time}] [CLAUDE] ${text}`)

  const el = document.createElement('div')
  el.className = 'le le-claude-msg'
  el.innerHTML = `
    <span class="le-icon" style="background:rgba(136,68,255,0.12);color:#8844ff;text-shadow:0 0 6px #8844ff">◈</span>
    <span class="le-time">${time}</span>
    <span class="le-badge" style="background:rgba(136,68,255,.10);color:#aa77ff;border:1px solid rgba(136,68,255,.20)">MILESTONE</span>
    <span class="le-msg" style="color:#c4b5e0">${text}</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Add a conclusion/summary entry with error detection
function addConclusionEntry(text, issues) {
  const logEl = $('#log')
  if (!logEl) return null
  const time = timeStamp()
  rawLogBuffer.push(`[${time}] [CONCLUSION] ${text}`)

  const hasIssues = issues && issues.length > 0
  const color = hasIssues ? '#ddba00' : '#40c840'
  const icon = hasIssues ? '⚠' : '✓'

  const el = document.createElement('div')
  el.className = 'le le-conclusion'
  el.innerHTML = `
    <span class="le-icon" style="background:${color}1a;color:${color};text-shadow:0 0 6px ${color}">${icon}</span>
    <span class="le-time">${time}</span>
    <span class="le-badge" style="background:${color}15;color:${color};border:1px solid ${color}30">CONCLUSION</span>
    <span class="le-msg" style="color:${color}cc;white-space:normal;line-height:1.5">${text}${hasIssues ? '<br><span style="color:#ff8888;font-size:10px">⚠ ' + issues.join(' · ') + '</span>' : ''}</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Add normal log lines — grouped into collapsible blocks
let currentGroup = null

function addNormalLine(text) {
  const logEl = $('#log')
  if (!logEl) return
  rawLogBuffer.push(text)

  // Append to existing group
  if (currentGroup && currentGroup.parentNode) {
    const body = currentGroup.querySelector('.le-group-body')
    const countEl = currentGroup.querySelector('.le-group-count')
    if (body && countEl) {
      body.textContent += text + '\n'
      const n = parseInt(countEl.textContent || '1', 10) + 1
      countEl.textContent = n
      scrollLog()
      return
    }
  }

  // Create new group — show first line as preview
  const time = timeStamp()
  const preview = text.length > 80 ? text.slice(0, 77) + '…' : text
  const grp = document.createElement('div')
  grp.className = 'le-group'
  grp.innerHTML = `
    <div class="le-group-header" onclick="this.parentElement.classList.toggle('expanded')">
      <span class="le-icon" style="color:#666;background:rgba(255,255,255,.04)">·</span>
      <span class="le-time">${time}</span>
      <span class="le-group-count">1</span>
      <span class="le-msg" style="color:#666;font-size:10px">${preview}</span>
      <span class="le-group-expand">▾</span>
    </div>
    <div class="le-group-body">${text}\n</div>
  `
  logEl.appendChild(grp)
  currentGroup = grp
  trimLog()
  scrollLog()
}

function trimLog() {
  const logEl = $('#log')
  if (logEl && logEl.childElementCount > 300) logEl.removeChild(logEl.firstChild)
}

// Copy full log
if ($('#copyLogBtn')) $('#copyLogBtn').onclick = () => {
  navigator.clipboard.writeText(rawLogBuffer.join('\n'))
  showToast('Full log copied to clipboard')
}

// Raw log overlay toggle
if ($('#toggleRawBtn')) $('#toggleRawBtn').onclick = () => {
  const overlay = $('#rawLogOverlay')
  if (!overlay) return
  const rawPre = $('#rawLogContent')
  if (rawPre) rawPre.textContent = rawLogBuffer.join('\n')
  overlay.classList.add('on')
}
if ($('#closeRawBtn')) $('#closeRawBtn').onclick = () => {
  const overlay = $('#rawLogOverlay')
  if (overlay) overlay.classList.remove('on')
}
if ($('#copyRawBtn')) $('#copyRawBtn').onclick = () => {
  navigator.clipboard.writeText(rawLogBuffer.join('\n'))
  showToast('Full log copied to clipboard')
}
if ($('#selectAllRawBtn')) $('#selectAllRawBtn').onclick = () => {
  const rawPre = $('#rawLogContent')
  if (!rawPre) return
  const range = document.createRange()
  range.selectNodeContents(rawPre)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

if ($('#logFilterInput')) {
  const filterInput = $('#logFilterInput')
  filterInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase()
    const logEl = $('#log')
    if (!logEl) return
    if (!q) {
      logEl.classList.remove('filtering')
    } else {
      logEl.classList.add('filtering')
      const entries = logEl.querySelectorAll('.le')
      for (const el of entries) {
        if (el.textContent.toLowerCase().includes(q)) {
          el.classList.add('match')
        } else {
          el.classList.remove('match')
        }
      }
    }
  })

  const logObserver = new MutationObserver((mutations) => {
    const q = filterInput.value.toLowerCase()
    if (!q) return
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1 && node.classList.contains('le')) {
          if (node.textContent.toLowerCase().includes(q)) {
            node.classList.add('match')
          }
        }
      }
    }
  })
  if ($('#log')) {
    logObserver.observe($('#log'), { childList: true })
  }
}

// ─── New Entry Types ─────────────────────────────────────────────────────────

// Iteration start entry
function addIterationStartEntry(num, dateStr) {
  const logEl = $('#log')
  if (!logEl) return null
  const time = timeStamp()
  rawLogBuffer.push(`[${time}] [CYCLE ${num}] Start — ${dateStr}`)

  const el = document.createElement('div')
  el.className = 'le le-iteration le-iter-start'
  el.innerHTML = `
    <span class="le-icon" style="background:rgba(0,170,255,0.15);color:#00aaff;text-shadow:0 0 4px #00aaff">⟳</span>
    <span class="le-time">${time}</span>
    <span class="le-badge" style="background:rgba(0,170,255,.12);color:#00aaff;border:1px solid rgba(0,170,255,.25)">CYCLE ${num}</span>
    <span class="le-msg" style="color:#7ab8e0">${dateStr}</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Iteration end entry
function addIterationEndEntry(num, exitCode) {
  const logEl = $('#log')
  if (!logEl) return null
  const time = timeStamp()
  const ok = exitCode === '0'
  rawLogBuffer.push(`[${time}] [CYCLE ${num}] Finished (code ${exitCode})`)

  const el = document.createElement('div')
  el.className = 'le le-iteration le-iter-end'
  const color = ok ? '#40c840' : '#ddba00'
  const bg = ok ? '64,200,64' : '221,186,0'
  el.innerHTML = `
    <span class="le-icon" style="background:rgba(${bg},0.15);color:${color};text-shadow:0 0 4px ${color}">${ok ? '✓' : '↺'}</span>
    <span class="le-time">${time}</span>
    <span class="le-badge" style="background:rgba(${bg},.12);color:${color};border:1px solid rgba(${bg},.25)">CYCLE ${num}</span>
    <span class="le-msg" style="color:${ok ? '#a5d6a5' : '#ddba77'}">${ok ? 'Completed successfully' : `Finished with restart (code ${exitCode})`}</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Sleep/backoff entry
function addSleepEntry(seconds, backoff) {
  const logEl = $('#log')
  if (!logEl) return null
  const time = timeStamp()
  const s = parseInt(seconds, 10)
  const mins = Math.floor(s / 60)
  const secs = s % 60
  const durStr = mins > 0 ? `${mins}m${secs > 0 ? ' ' + secs + 's' : ''}` : `${s}s`
  rawLogBuffer.push(`[${time}] [WAIT] ${durStr} (backoff ${backoff})`)

  const el = document.createElement('div')
  el.className = 'le le-sleep'
  el.innerHTML = `
    <span class="le-icon">⏳</span>
    <span class="le-time">${time}</span>
    <span class="le-msg">Waiting ${durStr} before next cycle (level ${backoff})</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Summary entry — shows what an iteration accomplished
function addSummaryEntry(text) {
  const logEl = $('#log')
  if (!logEl) return null
  const time = timeStamp()
  rawLogBuffer.push(`[${time}] [RESULT] ${text.replace(/<br>/g, ' | ')}`)

  const el = document.createElement('div')
  el.className = 'le le-summary'
  el.innerHTML = `
    <span class="le-icon">◆</span>
    <span class="le-time">${time}</span>
    <span class="le-badge">RESULT</span>
    <span class="le-msg le-summary-text">${text}</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Fetch iteration log and display summary
async function fetchIterSummary(logPath) {
  if (!current) return
  try {
    const content = await window.director.readIterLog(current, logPath)
    if (!content || !content.trim()) return

    const lines = content.trim().split('\n').filter(l => l.trim())

    // Filter out usage limit lines and warnings
    const meaningful = lines.filter(l => {
      const lo = l.toLowerCase()
      return !lo.includes("you're out of") && !lo.includes('out of extra usage')
        && !(lo.includes('resets') && (lo.includes('am') || lo.includes('pm')))
        && !lo.includes('usage limit')
        && !lo.startsWith('warning:')
    })

    if (meaningful.length === 0) return

    // Show last meaningful lines as summary
    const summary = meaningful.slice(-3).map(l =>
      l.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
    ).join('<br>')
    addSummaryEntry(summary)
  } catch {}
}

// ─── Log Line Parser ─────────────────────────────────────────────────────────
function parseLogLine(dir, line) {
  if (dir !== current) return
  let cl = line.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
  if (!cl) return

  // Rate limit / quota / usage exhaustion
  const lower = cl.toLowerCase()
  const isRateLimit = lower.includes('rate limit') || lower.includes('quota')
    || cl.includes('Waiting ') || cl.includes('Retrying')
    || lower.includes("you're out of") || lower.includes('out of extra usage')
    || lower.includes('usage limit') || (lower.includes('resets') && lower.includes('am'))
    || (lower.includes('resets') && lower.includes('pm'))
  if (isRateLimit) {
    // Extract reset time if present
    const resetMatch = cl.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i)
    const resetTime = resetMatch ? resetMatch[1] : null
    const msg = resetTime
      ? `Usage limit reached — waiting until ${resetTime} to resume`
      : 'Usage limit reached — waiting for reset'
    addUsageEntry(msg)
    return
  }

  // ── [orchestra] line parsing (supports v1 and v2 formats) ───────────────

  // Perpetual loop started (v1: "perpetual loop started", v2: "DOWNBEAT")
  if (cl.includes('perpetual loop started') || cl.includes('DOWNBEAT')) {
    const dateMatch = cl.match(/started (.+?)\./) || cl.match(/DOWNBEAT.*started\.?\s*(.*)/)
    const dateStr = dateMatch ? dateMatch[1] : ''
    addActionEntry('started', 'START', `Perpetual loop started${dateStr ? ' — ' + dateStr : ''}`)
    setOrchestraState('interpreting')
    const oldInterp = $('#le-interpreting-live')
    if (oldInterp) oldInterp.remove()
    addInterpretingEntry()
    usageEntry = null
    retryCount = 0
    return
  }

  // ALTO detected / FINE (v2: "FINE — ALTO detected")
  if (cl.includes('ALTO detected') || (cl.includes('[orchestra') && cl.includes('FINE'))) {
    addActionEntry('fine', 'FINE', cl.replace(/\[orchestra[^\]]*\]\s*/, ''))
    setOrchestraState('finished')
    const liveInterp = $('#le-interpreting-live')
    if (liveInterp) liveInterp.remove()
    return
  }

  // Iteration/movement exited (v1: "iteration N exited", v2: "movement N exited")
  if ((cl.includes('iteration') || cl.includes('movement')) && cl.includes('exited')) {
    const iterMatch = cl.match(/(?:iteration|movement) (\d+) exited \((\d+)\)/)
    const logMatch = cl.match(/Log:\s*(.+)/)
    if (iterMatch) {
      addIterationEndEntry(iterMatch[1], iterMatch[2])
      if (logMatch && current) {
        fetchIterSummary(logMatch[1].trim())
      }
    } else {
      addCycleEntry(cl.replace(/\[orchestra[^\]]*\]\s*/, ''))
    }
    return
  }

  // Iteration/movement started (v1: "iteration N —", v2: "movement N —")
  if ((cl.includes('iteration') || cl.includes('movement')) && cl.includes('—')) {
    const match = cl.match(/(?:iteration|movement) (\d+)\s*—\s*(.+)/)
    if (match) {
      addIterationStartEntry(match[1], match[2].trim())
      return
    }
  }

  // Usage limit wait (v3: "USAGE LIMIT — esperando")
  if (cl.includes('USAGE LIMIT')) {
    const msg = cl.replace(/\[orchestra[^\]]*\]\s*/, '')
    addUsageEntry(msg)
    return
  }

  // Sleeping / backoff (v1: "sleeping Ns", v2: "backoff Ns")
  if (cl.includes('sleeping') || cl.includes('backoff')) {
    const match = cl.match(/(?:sleeping|backoff) (\d+)s \((?:backoff index|idx) (\d+)\)/)
    if (match) {
      addSleepEntry(match[1], match[2])
    } else {
      addCycleEntry(cl.replace(/\[orchestra[^\]]*\]\s*/, ''))
    }
    return
  }

  // Other [orchestra] prefixed lines
  if (cl.includes('[orchestra')) {
    addCycleEntry(cl.replace(/\[orchestra[^\]]*\]\s*/, ''))
    return
  }

  // Orchestra started / Model (legacy detection)
  if (cl.includes('Orchestra started') || cl.includes('Model:')) {
    addActionEntry('started', 'START', cl)
    setOrchestraState('interpreting')
    const oldInterp = $('#le-interpreting-live')
    if (oldInterp) oldInterp.remove()
    addInterpretingEntry()
    return
  }

  // Cycle status digest (▸ prefixed lines) — with sub-type detection
  if (cl.startsWith('▸') || cl.startsWith('▸')) {
    if (cl.includes('✕') || cl.includes('✕')) {
      addErrorEntry(cl.replace(/^▸\s*/, ''))
    } else if (cl.includes('▶') || cl.includes('▶')) {
      addFeatureEntry(cl)
    } else {
      // Detect machine-readable COMPLIANCE line from cycle close
      if (cl.includes('COMPLIANCE')) updateComplianceFromLog(cl)
      addCycleEntry(cl)
    }
    return
  }

  // Summary lines from run.sh
  if (cl.includes('[orchestra') && cl.includes('summary:')) {
    const summary = cl.replace(/\[orchestra[^\]]*\]\s*summary:\s*/, '')
    if (summary.trim()) addSummaryEntry(summary.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    return
  }

  // Error (but not warnings)
  if ((lower.includes('error') && !lower.startsWith('warning')) || lower.includes('exception')) {
    addErrorEntry(cl)
    return
  }

  // Claude milestone/completion messages (multi-sentence prose output)
  const isMilestone = (
    (lower.includes('all green') || lower.includes('all tests pass') || lower.includes('completed')
      || lower.includes('pushed') || lower.includes('synced') || lower.includes('merged')
      || lower.includes('implemented') || lower.includes('deployed') || lower.includes('all.*pass'))
    && cl.length > 30 && /[.!…]$/.test(cl)
    && !lower.includes('error') && !lower.includes('warning') && !lower.includes('failed')
  )
  if (isMilestone) {
    addClaudeMessageEntry(cl)
    return
  }

  // Claude prose output (natural language, not tool output)
  const isClaudeMessage = !cl.startsWith('[') && !cl.startsWith('{') && !cl.startsWith(' ')
    && cl.length > 60 && /[.!…]$/.test(cl)
    && !lower.includes('error') && !lower.includes('warning')
    && !/^\d/.test(cl) && !cl.startsWith('/')
  if (isClaudeMessage) {
    addClaudeMessageEntry(cl)
    return
  }

  // Normal log line — group it
  addNormalLine(cl)
}

// ─── Lifecycle History (persisted across sessions) ───────────────────────────
async function loadLifecycleHistory() {
  if (!current) return
  const events = await window.director.lifecycleList(current)
  if (!events || events.length === 0) return

  // Show last 30 events as compact entries
  const recent = events.slice(-30)
  for (const ev of recent) {
    const time = new Date(ev.ts).toLocaleTimeString('en-US', { hour12: false })
    const date = new Date(ev.ts).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
    rawLogBuffer.push(`[${ev.ts}] [${ev.label}] ${ev.message}`)

    // Render as a compact history entry
    const logEl = $('#log')
    if (!logEl) continue

    const HISTORY_STYLES = {
      'play':        { icon: '▶', color: '#40c840' },
      'started':     { icon: '⚡', color: '#40c840' },
      'fine':        { icon: '◼', color: '#ddba00' },
      'kill':        { icon: '✕', color: '#e03030' },
      'exit':        { icon: '■', color: '#4488ff' },
      'usage_limit': { icon: '⏸', color: '#ddba00' },
      'resume':      { icon: '↻', color: '#00ffee' },
    }
    const s = HISTORY_STYLES[ev.type] || { icon: '·', color: '#666' }

    const el = document.createElement('div')
    el.className = 'le le-action le-history'
    el.style.setProperty('--le-color', s.color)
    el.style.background = `color-mix(in srgb, ${s.color} 4%, transparent)`
    el.style.opacity = '0.7'
    el.innerHTML = `
      <span class="le-icon">${s.icon}</span>
      <span class="le-time" title="${ev.ts}">${date} ${time}</span>
      <span class="le-badge">${ev.label}</span>
      <span class="le-msg">${ev.message}</span>
    `
    logEl.appendChild(el)
  }

  // Add separator between history and live
  const logEl = $('#log')
  if (logEl && recent.length > 0) {
    const sep = document.createElement('div')
    sep.style.cssText = 'text-align:center;padding:6px;font:700 8px var(--sans);letter-spacing:2px;color:var(--dim2);border-top:1px solid rgba(255,255,255,0.04);margin:4px 0'
    sep.textContent = '— CURRENT SESSION —'
    logEl.appendChild(sep)
  }
}

// ─── Telemetry Metrics Display ───────────────────────────────────────────────
function updateMetricsDisplay(data) {
  if (!data) return

  const allocEl   = $('#mmAllocVal')
  const memEl     = $('#mmMemVal')
  const tokensEl  = $('#mmTokensVal')
  const comprEl   = $('#mmCompressionVal')
  const instEl    = $('#mmInstancesVal')

  // Resource allocation
  if (data.resource && data.resource.allocation) {
    const a = data.resource.allocation
    if (allocEl) {
      allocEl.textContent = `nice ${a.nice} · ${a.tokenBudget > 999 ? Math.floor(a.tokenBudget/1000) + 'K' : a.tokenBudget} tok`
      allocEl.className = 'mm-val active'
    }
    if (memEl && data.resource.lastSample) {
      const s = data.resource.lastSample
      memEl.textContent = `${s.rssMB}MB / ${s.memoryBudgetMB}MB (${s.memUtilization}%)`
      memEl.className = 'mm-val' + (s.memUtilization > 80 ? ' warn' : ' active')
    } else if (memEl) {
      memEl.textContent = `${a.memBudgetMB}MB budget`
      memEl.className = 'mm-val active'
    }
  } else {
    if (allocEl) { allocEl.textContent = '—'; allocEl.className = 'mm-val' }
    if (memEl) { memEl.textContent = '—'; memEl.className = 'mm-val' }
  }

  // Context protocol
  if (data.context && data.context.lastDelta) {
    const m = data.context.lastDelta.metrics
    if (tokensEl) {
      const saved = m.totalTokensSaved
      tokensEl.textContent = saved > 999 ? Math.floor(saved/1000) + 'K' : saved
      tokensEl.className = 'mm-val hot'
    }
    if (comprEl) {
      comprEl.textContent = m.compressionRatio + '%'
      comprEl.className = 'mm-val' + (m.compressionRatio > 20 ? ' hot' : ' active')
    }
  } else if (data.context && data.context.aggregated) {
    const ag = data.context.aggregated
    if (tokensEl) {
      tokensEl.textContent = ag.totalTokensSaved > 999 ? Math.floor(ag.totalTokensSaved/1000) + 'K cum.' : ag.totalTokensSaved
      tokensEl.className = 'mm-val active'
    }
    if (comprEl) {
      comprEl.textContent = ag.cumulativeCompression + '% cum.'
      comprEl.className = 'mm-val active'
    }
  } else {
    if (tokensEl) { tokensEl.textContent = '—'; tokensEl.className = 'mm-val' }
    if (comprEl) { comprEl.textContent = '—'; comprEl.className = 'mm-val' }
  }

  // Coordination
  if (data.coordination) {
    if (instEl) {
      const n = data.coordination.activeInstances || 0
      const conflicts = (data.coordination.conflicts || []).length
      instEl.textContent = n + (conflicts > 0 ? ` · ${conflicts} conflict${conflicts > 1 ? 's' : ''}` : '')
      instEl.className = 'mm-val' + (conflicts > 0 ? ' warn' : n > 0 ? ' active' : '')
    }
  } else {
    if (instEl) { instEl.textContent = '—'; instEl.className = 'mm-val' }
  }

  // Claude API Usage
  if (data.claudeUsage) updateClaudeUsageDisplay(data.claudeUsage)
}

function updateClaudeUsageDisplay(usage) {
  const valEl  = $('#mmClaudeUsageVal')
  const barEl  = $('#usageBarFill')
  if (!valEl) return

  if (!usage || usage.percent === undefined) {
    valEl.textContent = '—'; valEl.className = 'mm-val'
    if (barEl) { barEl.style.width = '0%'; barEl.className = 'usage-bar-fill' }
    return
  }

  const pct = usage.percent
  valEl.textContent = usage.status === 'exhausted' ? 'LIMIT' : pct + '%'
  if (usage.detail) valEl.title = usage.detail

  if (usage.status === 'exhausted') {
    valEl.className = 'mm-val exhausted'
  } else if (pct >= 90) {
    valEl.className = 'mm-val bad'
  } else if (pct >= 70) {
    valEl.className = 'mm-val warn'
  } else if (pct > 0) {
    valEl.className = 'mm-val active'
  } else {
    valEl.className = 'mm-val'
  }

  if (barEl) {
    barEl.style.width = (usage.status === 'exhausted' ? 100 : pct) + '%'
    barEl.className = 'usage-bar-fill' + (
      usage.status === 'exhausted' || usage.status === 'critical' ? ' critical' :
      usage.status === 'high' ? ' high' :
      usage.status === 'mid' ? ' mid' : ''
    )
  }
}

// Listen for periodic metrics updates from main process
window.director.onMetrics((data) => {
  if (data.dir === current) {
    updateMetricsDisplay(data)
  }
})

// Load metrics on project open
async function loadMetrics() {
  if (!current) return
  const [resource, context, coordination, claudeUsage] = await Promise.all([
    window.director.metricsResource(current),
    window.director.metricsContext(current),
    window.director.metricsCoordination(),
    window.director.claudeUsage(current)
  ])
  updateMetricsDisplay({ resource, context, coordination, claudeUsage })
}

// ─── Compliance Display ───────────────────────────────────────────────────────
function updateComplianceDisplay(data) {
  const el = $('#mmComplianceVal')
  if (!el) return
  if (!data || data.last === null) {
    el.textContent = '—'; el.className = 'mm-val'; return
  }
  const score = data.last ? data.last.score : data.avgScore
  if (score === null) { el.textContent = '—'; el.className = 'mm-val'; return }
  el.textContent = score + '%' + (data.cycles > 1 ? ` (${data.cycles}c)` : '')
  el.className = 'mm-val ' + (score >= 90 ? 'ok' : score >= 70 ? 'warn' : 'bad')
}

function updateComplianceFromLog(line) {
  // Parse inline COMPLIANCE line emitted at cycle close
  const m = line.match(/COMPLIANCE\s+(.+?)(?:\s+DRIFT:(.*))?$/)
  if (!m) return
  const pairs = m[1].trim().split(/\s+/)
  const drift = m[2] ? m[2].trim() : 'none'
  let totalPlanned = 0, totalActual = 0
  for (const p of pairs) {
    const pm = p.match(/([^:]+):(\d+)\/(\d+)/)
    if (pm) {
      const actual = parseInt(pm[2], 10), planned = parseInt(pm[3], 10)
      totalPlanned += planned; totalActual += Math.min(actual, planned)
    }
  }
  const score = totalPlanned > 0 ? Math.round(totalActual / totalPlanned * 100) : null
  updateComplianceDisplay({ last: { score, drift }, avgScore: score, cycles: 1 })
}

async function loadCompliance() {
  if (!current) return
  const data = await window.director.complianceMetrics(current)
  updateComplianceDisplay(data)
}

async function loadRoadmapFreshness() {
  if (!current) return
  const el = $('#mmRoadmapVal')
  if (!el) return
  const data = await window.director.roadmapFreshness(current)
  const fsEl = $('#featureStrip')
  if (!data || !data.exists) {
    el.textContent = 'absent'; el.className = 'mm-val bad'
    return
  }
  if (data.isStale) {
    el.textContent = `${data.staleHours}h untouched`
    el.className = 'mm-val bad'
    if (fsEl) { fsEl.style.background = 'linear-gradient(90deg, rgba(224,48,48,0.10), transparent 60%)'; fsEl.style.borderBottom = '1px solid rgba(224,48,48,0.18)' }
    const fsLabel = $('#currentFeature')
    if (fsLabel && fsLabel.textContent === '—') fsLabel.textContent = 'GHOST ROADMAP — run roadmap-sync'
  } else {
    el.textContent = 'ok'
    el.className = 'mm-val ok'
    if (fsEl) { fsEl.style.background = ''; fsEl.style.borderBottom = '' }
  }
}

async function checkVersionUpgrade() {
  if (!current) return
  const vBtn = $('#upgradeBtn'), vVer = $('#upgradeVer')
  if (!vBtn) return
  const data = await window.director.orchestraVersionCheck(current)
  if (data && data.needsUpgrade) {
    vBtn.hidden = false
    if (vVer) { vVer.textContent = `v${data.project}→v${data.bundled}`; vVer.style.display = '' }
  } else {
    vBtn.hidden = true
    if (vVer) { vVer.style.display = 'none' }
  }
}

// ─── IPC Event Handlers ─────────────────────────────────────────────────────
window.director.onUsageLimit(({ dir }) => {
  if (dir === current) {
    showUsageBanner(true)
    setStatus('PAUSE')
    stopClock()
    setOrchestraState('usage_limit')
    updateClaudeUsageDisplay({ percent: 100, status: 'exhausted', detail: 'Límite alcanzado' })
    // Remove live interpreting indicator
    const liveInterp = $('#le-interpreting-live')
    if (liveInterp) liveInterp.remove()
    addUsageEntry('Score exhausted — AI credits consumed. Waiting for automatic resume…')
    usageEntry = null
    retryCount = 0
    refresh()
  }
})

window.director.onResumed(({ dir }) => {
  if (dir === current) {
    showUsageBanner(false)
    setStatus('PLAY')
    startClock()
    setOrchestraState('interpreting')
    updateClaudeUsageDisplay({ percent: 0, status: 'normal', detail: 'Créditos restaurados' })
    usageEntry = null
    addActionEntry('resume', 'RESUME', 'Quota restored — orchestra resuming interpretation')
    addInterpretingEntry()
    refresh()
    showToast('Orchestra resumed automatically ✓')
  }
})

window.director.onLine(({ dir, line }) => {
  if (dir === current) {
    // If we're receiving new log data but state says finished, we're clearly still running
    if (orchestraState === 'finished') {
      setOrchestraState('interpreting')
      refresh()
    }
    // Tailing sends chunks that may contain multiple lines
    const lines = line.split('\n')
    for (const l of lines) {
      if (l.trim()) parseLogLine(dir, l)
    }
  } else {
    const prev = logCache.get(dir) || ''
    const updated = prev + line + '\n'
    logCache.set(dir, updated.length > 200000 ? updated.slice(-150000) : updated)
  }
})

window.director.onExit(({ dir, code }) => {
  logCache.delete(dir)
  if (dir === current) {
    stopClock()
    setStatus('STOP')
    setOrchestraState('finished')
    // Remove live interpreting indicator
    const liveInterp = $('#le-interpreting-live')
    if (liveInterp) liveInterp.remove()
    const exitMsg = code === 0
      ? 'Interpretation finished successfully'
      : `Process terminated with code ${code}`
    addActionEntry('exit', 'END', exitMsg)
    refresh()
  }
})

// ─── Drag & drop ──────────────────────────────────────────────────────────────
const dz = $('#dropzone')
;['dragover', 'dragenter'].forEach(ev => document.addEventListener(ev, e => {
  e.preventDefault();
  if (dz) dz.classList.add('hot')
}))
;['dragleave', 'drop'].forEach(ev => document.addEventListener(ev, e => {
  e.preventDefault();
  if (dz) dz.classList.remove('hot')
}))
document.addEventListener('drop', async e => {
  const f = e.dataTransfer.files[0]
  if (!f) return
  const dir = await window.director.add(f.path)
  if (dir) {
    await refresh()
    await open(dir)
    if (!proj().installed) { await window.director.install(dir); refresh() }
  }
})

// ─── System Process Monitor ──────────────────────────────────────────────────
let procsRefreshIv = null

const PROC_TYPE_STYLE = {
  orchestra: { color: '#40c840', label: 'ORCHESTRA' },
  claude:    { color: '#00aaff', label: 'CLAUDE' },
  wrapper:   { color: '#ddba00', label: 'WRAPPER' },
  monitor:   { color: '#8844ff', label: 'MONITOR' },
  mcp:       { color: '#00ffee', label: 'MCP' },
  director:  { color: '#e8631a', label: 'DIRECTOR' },
}

async function loadProcs() {
  const list = $('#procsList')
  const countEl = $('#procsCount')
  if (!list) return
  const procs = await window.director.systemProcs()
  list.innerHTML = ''
  if (!procs || procs.length === 0) {
    list.innerHTML = '<div style="padding:24px;color:var(--dim);font:11px var(--mono);text-align:center">No active Claude processes</div>'
    if (countEl) countEl.textContent = '0 processes'
    return
  }
  if (countEl) countEl.textContent = `${procs.length} process${procs.length > 1 ? 'es' : ''}`
  const myPid = window.director.systemProcs._myPid // not exposed, skip
  for (const p of procs) {
    const s = PROC_TYPE_STYLE[p.type] || PROC_TYPE_STYLE.claude
    const row = document.createElement('div')
    row.className = 'proc-row'
    row.innerHTML = `
      <span class="proc-type" style="color:${s.color};border-color:${s.color}40;background:${s.color}12">${s.label}</span>
      <span class="proc-pid mono">${p.pid}</span>
      <span class="proc-stats mono">${p.cpu}% CPU · ${p.mem}% MEM · ${p.time}</span>
      <span class="proc-cmd mono">${p.cmd.replace(/</g,'&lt;')}</span>
      <div class="proc-actions">
        <button class="proc-kill-btn" data-pid="${p.pid}" data-sig="SIGTERM" title="Terminate (SIGTERM)">◼ TERM</button>
        <button class="proc-kill-btn danger" data-pid="${p.pid}" data-sig="SIGKILL" title="Kill (SIGKILL)">✕ KILL</button>
      </div>
    `
    list.appendChild(row)
  }
  list.querySelectorAll('.proc-kill-btn').forEach(btn => {
    btn.onclick = async () => {
      const pid = parseInt(btn.dataset.pid, 10)
      const sig = btn.dataset.sig
      btn.disabled = true
      btn.textContent = '...'
      const r = await window.director.systemKill(pid, sig)
      showToast(r.ok ? `Signal ${sig} sent to PID ${pid}` : `Error: ${r.err}`)
      setTimeout(loadProcs, 1200)
    }
  })
}

if ($('#procsRefresh')) $('#procsRefresh').onclick = loadProcs

// Auto-refresh procesos every 5 seconds since panel is always visible
loadProcs()
setInterval(loadProcs, 5000)

// ─── Blueprint / Discovery Interview Engine ─────────────────────────────────
const BP_PHASES = [
  { id: 'identity',    name: 'IDENTITY',      icon: '◈', color: '#00aaff' },
  { id: 'scope',       name: 'SCOPE',         icon: '◎', color: '#e8631a' },
  { id: 'users',       name: 'USERS',         icon: '◉', color: '#9955ee' },
  { id: 'platform',    name: 'PLATFORM',      icon: '⬡', color: '#00b8b8' },
  { id: 'security',    name: 'SECURITY',      icon: '◆', color: '#e03030' },
  { id: 'data',        name: 'DATA',          icon: '◇', color: '#4488cc' },
  { id: 'design',      name: 'DESIGN',        icon: '◐', color: '#e060a0' },
  { id: 'performance', name: 'PERFORMANCE',   icon: '◌', color: '#ddba00' },
  { id: 'business',    name: 'BUSINESS',      icon: '◍', color: '#40c840' },
]

const BP_QUESTIONS = [
  // Phase: identity
  { phase: 'identity', key: 'projectName',  q: 'What is the project called?', hint: 'Short and descriptive name' },
  { phase: 'identity', key: 'description',  q: 'What does this project do? Describe it in 2-3 sentences.', hint: 'Main purpose, problem it solves' },
  { phase: 'identity', key: 'projectType',  q: 'What type of project is it?', hint: 'webapp, API, mobile app, CLI tool, SaaS, e-commerce, CMS, IoT, desktop app, library, etc.' },
  { phase: 'identity', key: 'stack',        q: 'What tech stack do you prefer or have already decided on?', hint: 'E.g.: React+Node, Vue+Django, Flutter, Next.js+Supabase, etc.' },

  // Phase: scope
  { phase: 'scope', key: 'magnitude',  q: 'What is the project magnitude?', hint: 'micro (days), small (weeks), medium (months), large (quarters), enterprise (years)' },
  { phase: 'scope', key: 'timeline',   q: 'Is there a defined timeline or deadline?', hint: 'Specific date, or "flexible", "ASAP", etc.' },
  { phase: 'scope', key: 'teamSize',   q: 'How many people will work on this?', hint: 'Just me, 2-3, team of 5+, etc.' },
  { phase: 'scope', key: 'mvpScope',   q: 'What minimum features does the MVP need to be usable?', hint: 'List the 3-5 essential features' },
  { phase: 'scope', key: 'budget',     q: 'Are there budget constraints for infrastructure or services?', hint: 'Free tier only, $X/month, no limit, etc.' },

  // Phase: users
  { phase: 'users', key: 'primaryUsers',   q: 'Who are the primary users?', hint: 'Developers, businesses, consumers, internal, administrators…' },
  { phase: 'users', key: 'userScale',      q: 'How many users do you expect initially and in the future?', hint: '10 internal, 1K first months, 100K+ in a year, etc.' },
  { phase: 'users', key: 'countries',      q: 'In which countries or regions will it operate?', hint: 'USA, LATAM, global, EU only, etc.' },
  { phase: 'users', key: 'languages',      q: 'What languages should the interface support?', hint: 'English, Spanish, both, full multi-language' },
  { phase: 'users', key: 'accessibility',  q: 'Are there special accessibility requirements?', hint: 'WCAG AA, screen reader, high contrast, etc.' },

  // Phase: platform
  { phase: 'platform', key: 'platforms', q: 'What platforms will it run on?', hint: 'Web, iOS, Android, desktop (Win/Mac/Linux), all' },
  { phase: 'platform', key: 'os',       q: 'Any specific operating system or runtime?', hint: 'Node 20+, Python 3.11+, Docker, any' },
  { phase: 'platform', key: 'hosting',  q: 'Where will it be hosted?', hint: 'Vercel, AWS, GCP, self-hosted, Railway, Fly.io, etc.' },
  { phase: 'platform', key: 'cicd',     q: 'Do you have a preferred or already configured CI/CD?', hint: 'GitHub Actions, GitLab CI, none yet' },
  { phase: 'platform', key: 'domain',   q: 'Do you have a domain or DNS already configured?', hint: 'mydomain.com, not yet, subdomain of X' },

  // Phase: security
  { phase: 'security', key: 'auth',           q: 'What type of authentication does it need?', hint: 'Email/password, OAuth (Google/GitHub), SSO, API keys, none' },
  { phase: 'security', key: 'securityLevel',  q: 'What security level does it require?', hint: 'basic (blog), standard (SaaS), high (fintech), critical (health/government)' },
  { phase: 'security', key: 'dataSensitivity',q: 'How sensitive is the data it will handle?', hint: 'public, internal, personal (PII), financial, medical' },
  { phase: 'security', key: 'regulations',    q: 'Are there regulations it must comply with?', hint: 'GDPR, HIPAA, PCI-DSS, SOC2, none' },
  { phase: 'security', key: 'legal',          q: 'Are there specific legal restrictions?', hint: 'Terms of service, content policies, age restrictions, export controls' },
  { phase: 'security', key: 'privacyPolicy',  q: 'Does it need a privacy policy and terms of use?', hint: 'yes (mandatory for public apps), no (internal tool)' },

  // Phase: data
  { phase: 'data', key: 'database',      q: 'What database will you use or prefer?', hint: 'PostgreSQL, MongoDB, SQLite, Supabase, Firebase, MySQL, etc.' },
  { phase: 'data', key: 'externalApis',  q: 'Will it integrate with external APIs or services?', hint: 'Stripe, Twilio, OpenAI, Mapbox, none, etc.' },
  { phase: 'data', key: 'fileStorage',   q: 'Does it need file/image storage?', hint: 'S3, Cloudinary, local, no' },
  { phase: 'data', key: 'realtime',      q: 'Does it need real-time functionality?', hint: 'WebSockets, SSE, push notifications, no' },
  { phase: 'data', key: 'dataMigration', q: 'Is there existing data to migrate?', hint: 'CSV, another DB, API, spreadsheets, no' },

  // Phase: design
  { phase: 'design', key: 'designTheme', q: 'What visual style/theme should it have?', hint: 'minimalist, dark dashboard, colorful, corporate, Material, etc.' },
  { phase: 'design', key: 'branding',    q: 'Do you have defined branding (colors, logo, typography)?', hint: 'yes (attach/describe), no, I want it generated' },
  { phase: 'design', key: 'references',  q: 'Are there reference sites or apps whose look you like?', hint: 'URLs or names of similar apps' },
  { phase: 'design', key: 'mobileFirst', q: 'Is the primary experience mobile or desktop?', hint: 'mobile-first, desktop-first, both equally' },

  // Phase: performance
  { phase: 'performance', key: 'concurrentUsers', q: 'How many concurrent users do you expect at peak?', hint: '10, 100, 1K, 10K+' },
  { phase: 'performance', key: 'sla',             q: 'Are there uptime or SLA requirements?', hint: '99.9%, best effort, 24/7, business hours only' },
  { phase: 'performance', key: 'caching',         q: 'Does it need a specific caching strategy?', hint: 'Redis, CDN, service worker, default' },
  { phase: 'performance', key: 'cdn',             q: 'Does it need a CDN for static assets?', hint: 'yes, no, Cloudflare, etc.' },

  // Phase: business
  { phase: 'business', key: 'businessLogic',  q: 'What are the main business rules?', hint: 'Approval flows, calculations, special validations, etc.' },
  { phase: 'business', key: 'workflows',      q: 'Are there workflows or processes to automate?', hint: 'Onboarding, billing, notifications, reports, etc.' },
  { phase: 'business', key: 'monetization',   q: 'How is it monetized (if applicable)?', hint: 'SaaS subscription, freemium, license, ads, not applicable' },
  { phase: 'business', key: 'roles',          q: 'What user roles will exist?', hint: 'admin, user, moderator, guest, custom…' },
  { phase: 'business', key: 'additionalNotes',q: 'Anything else the orchestra should know before starting?', hint: 'Any detail, constraint, or additional preference' },
]

let bpState = {
  answers: {},
  modules: [],
  sessions: [],
  currentQuestion: 0,
  currentPhase: 0,
  completeness: 0,
  sessionActive: false
}

function bpPhaseIndex() {
  return BP_PHASES.findIndex(p => p.id === BP_QUESTIONS[bpState.currentQuestion]?.phase) || 0
}

function renderBpPhases() {
  const el = $('#bpPhases')
  if (!el) return
  el.innerHTML = ''
  for (const phase of BP_PHASES) {
    const questions = BP_QUESTIONS.filter(q => q.phase === phase.id)
    const answered = questions.filter(q => bpState.answers[q.key] && bpState.answers[q.key].trim()).length
    const total = questions.length
    const pct = total > 0 ? Math.round(answered / total * 100) : 0
    const isCurrent = BP_QUESTIONS[bpState.currentQuestion]?.phase === phase.id
    const pill = document.createElement('div')
    pill.className = 'bp-phase-pill' + (isCurrent ? ' active' : '') + (pct === 100 ? ' done' : '')
    pill.style.setProperty('--phase-color', phase.color)
    pill.innerHTML = `
      <span class="bp-phase-icon">${phase.icon}</span>
      <span class="bp-phase-name">${phase.name}</span>
      <span class="bp-phase-pct">${pct}%</span>
      <div class="bp-phase-bar"><div class="bp-phase-fill" style="width:${pct}%"></div></div>
    `
    pill.onclick = () => {
      const firstQ = BP_QUESTIONS.findIndex(q => q.phase === phase.id)
      if (firstQ >= 0) {
        bpState.currentQuestion = firstQ
        bpAskCurrent()
        renderBpPhases()
      }
    }
    el.appendChild(pill)
  }
}

function bpAddMessage(from, text, cls) {
  const el = $('#bpMessages')
  if (!el) return
  const msg = document.createElement('div')
  msg.className = 'bp-msg bp-msg-' + from + (cls ? ' ' + cls : '')
  msg.innerHTML = text
  el.appendChild(msg)
  el.scrollTop = el.scrollHeight
}

function bpAskCurrent() {
  const q = BP_QUESTIONS[bpState.currentQuestion]
  if (!q) {
    bpAddMessage('agent', 'Interview completed! All phases covered. You can <strong>GENERATE BRIEF</strong> for the orchestra to begin.', 'bp-complete')
    bpState.sessionActive = false
    const genBtn = $('#bpGenerate')
    if (genBtn) genBtn.disabled = false
    bpSave()
    return
  }
  const phase = BP_PHASES.find(p => p.id === q.phase)
  const existing = bpState.answers[q.key]
  let prompt = `<span class="bp-q-phase" style="color:${phase?.color || '#888'}">[${phase?.name || ''}]</span> ${q.q}`
  if (q.hint) prompt += `<br><span class="bp-q-hint">${q.hint}</span>`
  if (existing) prompt += `<br><span class="bp-q-prev">Previous answer: ${existing}</span>`
  bpAddMessage('agent', prompt)
  renderBpPhases()
  const inp = $('#bpInput')
  if (inp) { inp.value = existing || ''; inp.focus() }
}

function bpAnswer(text) {
  const q = BP_QUESTIONS[bpState.currentQuestion]
  if (!q) return
  bpAddMessage('user', esc(text))
  bpState.answers[q.key] = text
  bpUpdateCompleteness()
  bpState.currentQuestion++
  bpSave()
  setTimeout(() => bpAskCurrent(), 300)
}

function bpSkip() {
  const q = BP_QUESTIONS[bpState.currentQuestion]
  if (!q) return
  bpAddMessage('user', '<em>(skipped)</em>', 'bp-skipped')
  bpState.currentQuestion++
  bpSave()
  setTimeout(() => bpAskCurrent(), 200)
}

function bpUpdateCompleteness() {
  const total = BP_QUESTIONS.length
  const answered = BP_QUESTIONS.filter(q => bpState.answers[q.key] && bpState.answers[q.key].trim()).length
  bpState.completeness = Math.round(answered / total * 100)
  const badge = $('#bpReadiness')
  if (badge) badge.textContent = `${bpState.completeness}%`
  const genBtn = $('#bpGenerate')
  if (genBtn) genBtn.disabled = bpState.completeness < 15
}

async function bpSave() {
  if (!current) return
  await window.director.blueprintSave(current, bpState)
}

async function bpLoad() {
  if (!current) return
  const data = await window.director.blueprintLoad(current)
  if (data) {
    bpState = { ...bpState, ...data }
    if (!bpState.answers) bpState.answers = {}
    if (!bpState.modules) bpState.modules = []
    if (!bpState.sessions) bpState.sessions = []
  } else {
    bpState = { answers: {}, modules: [], sessions: [], currentQuestion: 0, completeness: 0, sessionActive: false }
  }
  bpUpdateCompleteness()
  renderBpPhases()
  renderBpModules()
}

function bpStartSession() {
  const msgs = $('#bpMessages')
  if (msgs) msgs.innerHTML = ''
  bpState.sessionActive = true
  bpState.sessions.push({ started: new Date().toISOString() })

  // Find first unanswered question, or start from beginning
  const firstUnanswered = BP_QUESTIONS.findIndex(q => !bpState.answers[q.key] || !bpState.answers[q.key].trim())
  bpState.currentQuestion = firstUnanswered >= 0 ? firstUnanswered : 0

  bpAddMessage('agent', `<strong>Discovery session #${bpState.sessions.length}</strong> — I will ask you questions about your project to prepare the brief for the first interpretation. Answer what you know, skip what you don't.`, 'bp-session-start')
  setTimeout(() => bpAskCurrent(), 500)
  bpSave()
}

async function bpGenerateBrief() {
  if (!current) return
  bpAddMessage('agent', 'Generating brief and ROADMAP from your answers…', 'bp-generating')
  const result = await window.director.blueprintGenerate(current)
  if (result) {
    bpAddMessage('agent', `Brief generated at <code>${result.briefPath}</code>. The orchestra will use this file as primary context in Cycle 0.`, 'bp-complete')
    showToast('Blueprint generated — ready to interpret')
  }
}

// Module editor
function renderBpModules() {
  const list = $('#bpModuleList')
  if (!list) return
  list.innerHTML = ''
  if (bpState.modules.length === 0) {
    list.innerHTML = '<div style="padding:8px 12px;color:var(--dim);font:9px var(--mono)">No modules defined. Add the main project components.</div>'
    return
  }
  for (let i = 0; i < bpState.modules.length; i++) {
    const mod = bpState.modules[i]
    const card = document.createElement('div')
    card.className = 'bp-mod-card'
    card.innerHTML = `
      <div class="bp-mod-header">
        <input class="bp-mod-name mono" value="${esc(mod.name || '')}" placeholder="Module name" data-i="${i}" data-field="name">
        <button class="bp-mod-del" data-i="${i}" title="Delete">✕</button>
      </div>
      <textarea class="bp-mod-desc mono" rows="2" placeholder="Description — what it does, responsibilities…" data-i="${i}" data-field="description">${esc(mod.description || '')}</textarea>
      <input class="bp-mod-features mono" value="${esc((mod.features || []).join(', '))}" placeholder="Features: feat1, feat2, feat3…" data-i="${i}" data-field="features">
      <input class="bp-mod-deps mono" value="${esc((mod.dependencies || []).join(', '))}" placeholder="Depends on: module1, module2…" data-i="${i}" data-field="dependencies">
    `
    list.appendChild(card)
  }
  // Bind events
  list.querySelectorAll('.bp-mod-name, .bp-mod-desc, .bp-mod-features, .bp-mod-deps').forEach(inp => {
    inp.addEventListener('change', () => {
      const i = parseInt(inp.dataset.i, 10)
      const field = inp.dataset.field
      if (field === 'features' || field === 'dependencies') {
        bpState.modules[i][field] = inp.value.split(',').map(s => s.trim()).filter(Boolean)
      } else {
        bpState.modules[i][field] = inp.value
      }
      bpSave()
    })
  })
  list.querySelectorAll('.bp-mod-del').forEach(btn => {
    btn.onclick = () => {
      bpState.modules.splice(parseInt(btn.dataset.i, 10), 1)
      renderBpModules()
      bpSave()
    }
  })
}

function bpAddModule() {
  bpState.modules.push({ name: '', description: '', features: [], dependencies: [], notes: '' })
  renderBpModules()
  bpSave()
  // Focus the new module name
  const names = document.querySelectorAll('.bp-mod-name')
  if (names.length) names[names.length - 1].focus()
}

// Blueprint section event bindings
if ($('#bpNewSession')) $('#bpNewSession').onclick = bpStartSession
if ($('#bpGenerate')) $('#bpGenerate').onclick = bpGenerateBrief
if ($('#bpAddModule')) $('#bpAddModule').onclick = bpAddModule
if ($('#bpSend')) $('#bpSend').onclick = () => {
  const inp = $('#bpInput')
  if (!inp || !inp.value.trim()) return
  bpAnswer(inp.value.trim())
  inp.value = ''
}
if ($('#bpSkip')) $('#bpSkip').onclick = bpSkip
if ($('#bpInput')) $('#bpInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    const inp = $('#bpInput')
    if (inp.value.trim()) { bpAnswer(inp.value.trim()); inp.value = '' }
  }
})

// Blueprint loads via mixer tab click handler

// ─── Atril Modal ─────────────────────────────────────────────────────────────
let selectedAtrilColor = COLOR_PALETTE[0]
let selectedAtrilIcon = ICON_LIBRARY[0][0]

function openAtrilModal() {
  const modal = $('#atrilModal')
  if (!modal) return
  modal.hidden = false

  // Render color grid
  const colorGrid = $('#atrilColors')
  if (colorGrid) {
    colorGrid.innerHTML = ''
    for (const c of COLOR_PALETTE) {
      const swatch = document.createElement('div')
      swatch.className = 'atril-color-swatch' + (c === selectedAtrilColor ? ' selected' : '')
      swatch.style.background = c
      swatch.onclick = () => {
        selectedAtrilColor = c
        colorGrid.querySelectorAll('.atril-color-swatch').forEach(s => s.classList.remove('selected'))
        swatch.classList.add('selected')
      }
      colorGrid.appendChild(swatch)
    }
  }

  // Render icon grid
  const iconGrid = $('#atrilIcons')
  if (iconGrid) {
    iconGrid.innerHTML = ''
    for (const [name, svg] of ICON_LIBRARY) {
      const opt = document.createElement('div')
      opt.className = 'atril-icon-opt' + (name === selectedAtrilIcon ? ' selected' : '')
      opt.innerHTML = svg
      opt.onclick = () => {
        selectedAtrilIcon = name
        iconGrid.querySelectorAll('.atril-icon-opt').forEach(o => o.classList.remove('selected'))
        opt.classList.add('selected')
      }
      iconGrid.appendChild(opt)
    }
  }
}

if ($('#addAtrilBtn')) $('#addAtrilBtn').onclick = openAtrilModal
if ($('#closeAtrilModal')) $('#closeAtrilModal').onclick = () => { $('#atrilModal').hidden = true }
if ($('#atrilModal')) $('#atrilModal').onclick = (e) => { if (e.target === $('#atrilModal')) $('#atrilModal').hidden = true }

if ($('#atrilSaveBtn')) $('#atrilSaveBtn').onclick = async () => {
  const name = $('#atrilName')?.value.trim()
  if (!name) { showToast('Name required'); return }
  const desc = $('#atrilDesc')?.value.trim() || ''
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_')

  customAtriles.push({ id, name, color: selectedAtrilColor, icon: selectedAtrilIcon, description: desc })
  await window.director.atrilesSave(customAtriles)

  $('#atrilModal').hidden = true
  $('#atrilName').value = ''
  $('#atrilDesc').value = ''
  showToast('Stand "' + name + '" created')
  loadMixer()
}

// ─── Mixer Tab Switching ─────────────────────────────────────────────────────
document.querySelectorAll('.mixer-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.mixer-tab').forEach(x => x.classList.remove('on'))
    document.querySelectorAll('.mixer-tab-pane').forEach(x => x.classList.remove('on'))
    t.classList.add('on')
    const pane = document.getElementById(t.dataset.mtab)
    if (pane) pane.classList.add('on')
    if (t.dataset.mtab === 'bpTab') bpLoad()
    if (t.dataset.mtab === 'knowledgeTab') loadKnowledge('ROADMAP.md', 'knBtnRoadmap')
  })
})

async function loadKnowledge(file, btnId) {
  if (!current) return
  
  if (btnId) {
    document.querySelectorAll('#knowledgeTab .tp-action').forEach(b => b.classList.remove('warn'))
    document.getElementById(btnId).classList.add('warn')
  }

  const content = await window.director.readFile(current, file)
  const el = document.getElementById('knowledgeContent')
  if (el) {
    el.textContent = content || `[File not found: ${file}]`
  }
}

if (document.getElementById('knBtnRoadmap')) document.getElementById('knBtnRoadmap').onclick = () => loadKnowledge('ROADMAP.md', 'knBtnRoadmap')
if (document.getElementById('knBtnReport')) document.getElementById('knBtnReport').onclick = () => loadKnowledge('.claude/ORCHESTRA_REPORT.md', 'knBtnReport')
if (document.getElementById('knBtnDb')) document.getElementById('knBtnDb').onclick = () => loadKnowledge('.claude/DB_SCHEMA.md', 'knBtnDb')
if (document.getElementById('knBtnPlan')) document.getElementById('knBtnPlan').onclick = () => loadKnowledge('PLAN.md', 'knBtnPlan')
if (document.getElementById('knBtnDecisions')) document.getElementById('knBtnDecisions').onclick = () => loadKnowledge('DECISIONS.md', 'knBtnDecisions')
if (document.getElementById('knBtnBlueprint')) document.getElementById('knBtnBlueprint').onclick = () => loadKnowledge('.claude/BLUEPRINT.md', 'knBtnBlueprint')

// ─── Init ─────────────────────────────────────────────────────────────────────
// On boot, auto-detect running projects and restore state
;(async function initBoot() {
  await refresh()
  // If no project is selected but there's a running one, auto-select it
  if (!current) {
    const running = projects.find(p => p.running)
    if (running) {
      await open(running.path)
    }
  }
  // Periodic state sync — keeps buttons and status aligned with real process state
  setInterval(refresh, 10000)
})()

if ($('#brandArea')) $('#brandArea').onclick = () => { $('#aboutModal').hidden = false }
if ($('#closeAbout')) $('#closeAbout').onclick = () => { $('#aboutModal').hidden = true }

if ($('#aboutModal')) $('#aboutModal').onclick = (e) => {
  if (e.target === $('#aboutModal')) $('#aboutModal').hidden = true
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $('#aboutModal') && !$('#aboutModal').hidden) {
    $('#aboutModal').hidden = true
  }
})

// Split divider drag
;(function initSplitDivider() {
  const divider = $('#splitDivider')
  const left = document.querySelector('.split-console')
  const right = document.querySelector('.mixer-panel')
  if (!divider || !left || !right) return
  let dragging = false
  divider.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault() })
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return
    const parent = left.parentElement
    const rect = parent.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    if (pct > 30 && pct < 85) {
      left.style.flex = 'none'
      left.style.width = pct + '%'
      right.style.flex = '1'
    }
  })
  document.addEventListener('mouseup', () => { dragging = false })
})()
