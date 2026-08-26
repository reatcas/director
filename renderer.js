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

  let _particlesRunning = true

  function draw() {
    if (!_particlesRunning) return
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
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { _particlesRunning = false }
    else { _particlesRunning = true; requestAnimationFrame(draw) }
  })
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
let aiCredits = {}

function formatReset(iso) {
  return iso ? new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso)) : '—'
}
async function loadAiCredits() {
  aiCredits = await window.director.aiCredits() || {}
  const select = $('#aiSelect')
  if (!select) return
  if (aiCredits.selected) select.value = aiCredits.selected
  for (const option of select.options) {
    if (aiCredits[option.value]) option.disabled = false
  }
  updateAiControl()
}
function updateAiControl() {
  const id = $('#aiSelect')?.value
  const credit = aiCredits[id]
  if ($('#aiCreditStatus')) {
    $('#aiCreditStatus').textContent = credit 
      ? `${credit.credits}% credits${credit.resetAt ? ' · resets ' + formatReset(credit.resetAt) : ''}` 
      : 'Select an AI to start'
  }
  
  const modelSelect = $('#modelSelect')
  
  const AI_ICONS = {
    claude: { char: '✣', class: 'anthropic' },
    agy:    { char: '✦', class: 'antigravity' },
    codex:  { char: '❂', class: 'openai' },
    aider:  { char: '⚡', class: 'aider' }
  }
  const icon = AI_ICONS[id] || { char: '✦', class: 'antigravity' }
  
  if ($('#aiIconMain')) {
    $('#aiIconMain').textContent = icon.char
    $('#aiIconMain').className = 'ai-icon ' + icon.class
  }
  if ($('#aiIconModel')) {
    $('#aiIconModel').textContent = icon.char
    $('#aiIconModel').className = 'ai-icon ' + icon.class
  }

  if (modelSelect && credit && credit.models) {
    modelSelect.parentElement.style.display = 'inline-block'
    modelSelect.style.display = 'inline-block'
    const prevModel = modelSelect.value
    modelSelect.innerHTML = credit.models.map(m => `<option value="${m.id}">${m.label}</option>`).join('')
    if (credit.models.some(m => m.id === prevModel)) {
      modelSelect.value = prevModel
    } else {
      modelSelect.value = credit.defaultModel || credit.models[0].id
    }
  } else if (modelSelect) {
    modelSelect.parentElement.style.display = 'none'
  }

  updateTransportButtons()
  checkAiAuth(id)

  if (typeof updateAiUsageDisplay === 'function') {
    updateAiUsageDisplay(credit)
  }
}

async function checkAiAuth(id) {
  if (!id) return
  const dot = $('#aiAuthDot')
  const btn = $('#aiLoginBtn')
  if (!dot) return
  try {
    const status = await window.director.aiAuthStatus(id)
    if (status.loggedIn) {
      dot.className = 'ai-auth-dot connected'
      dot.title = status.email ? `Connected: ${status.email}` : 'Connected'
      if (btn) btn.style.display = 'none'
    } else {
      dot.className = 'ai-auth-dot'
      dot.title = status.note || 'Not connected'
      if (btn) btn.style.display = ''
    }
  } catch {
    dot.className = 'ai-auth-dot'
    dot.title = 'Status unknown'
  }
}

// ─── Orchestra State Tracking ────────────────────────────────────────────────
let orchestraState = 'idle' // idle | started | interpreting | usage_limit | finished

function setOrchestraState(state) {
  orchestraState = state
  if (state === 'idle' || state === 'finished') activateMixerStand(null)
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
  return `<span class="${cls}" style="background:hsl(${hue(p.name)} 45% var(--badge-l, 30%))">${initials(esc(p.name))}</span>`
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
      if ($('#exportBtn')) $('#exportBtn').hidden = true
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

  const agent = $('#aiSelect')?.value
  const credit = aiCredits[agent]
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
    if (playBtn) { playBtn.classList.toggle('disabled', !agent || !credit); playBtn.innerHTML = '▶' }
    if (fineBtn) { fineBtn.classList.add('disabled'); fineBtn.innerHTML = '◼' }
    if (killBtn) { killBtn.classList.add('disabled'); killBtn.innerHTML = '✕' }
  }
}

// ─── Stall Anomaly Detection (F-20) ──────────────────────────────────────────
const _stallTracker = new Map()
const STALL_THRESHOLD_MS = 20 * 60 * 1000

function trackCommit(dir) {
  _stallTracker.set(dir, Date.now())
}

function trackPlay(dir) {
  if (!_stallTracker.has(dir)) _stallTracker.set(dir, Date.now())
}

function getStallMinutes(dir) {
  const last = _stallTracker.get(dir)
  if (!last) return 0
  return Math.floor((Date.now() - last) / 60000)
}

// ─── Core UI Logic ────────────────────────────────────────────────────────────
async function refresh() {
  projects = await window.director.list()
  const ul = $('#projects')
  ul.innerHTML = ''
  for (const p of projects) {
    const li = document.createElement('li')
    li.className = (current === p.path ? 'sel ' : '') + (p.running ? 'live' : '')
    const stallMin = p.running ? getStallMinutes(p.path) : 0
    const stallBadge = stallMin >= 20 ? `<span class="stall-badge" title="${esc(String(stallMin))}min sin commits">${esc(String(stallMin))}m</span>` : ''
    li.innerHTML = `<span class="led"></span>
      ${logoHTML(p, true)}
      <span class="pn">${esc(p.name)}</span>
      <span class="pv">${p.running ? 'LIVE' : p.installed ? 'v' + p.version : '—'}${stallBadge}</span>`
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

async function saveMixerState() {
  if (!current) return
  const inputs = document.querySelectorAll('#mixerStrips input[type="range"]')
  if (!inputs.length) return
  const focus = {}
  inputs.forEach(i => { focus[i.dataset.k] = +i.value })
  await window.director.mixerWrite(current, focus)
}

let _mixerSaveTimer = null
function debouncedMixerSave() {
  clearTimeout(_mixerSaveTimer)
  _mixerSaveTimer = setTimeout(() => saveMixerState(), 500)
}

async function open(dir) {
  if (current) {
    clearTimeout(_mixerSaveTimer)
    await saveMixerState()
  }
  if (window.mixerGraph && mixerGraphInited) { window.mixerGraph.destroy(); mixerGraphInited = false }
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
    _batchingLog = true
    for (const l of recent) {
      if (l.trim()) parseLogLine(dir, l)
    }
    _batchingLog = false
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
  loadLifecycleTimeline()
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
      badge.style.background = `hsl(${hue(p.name)} 45% var(--badge-l, 30%))`
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
  if ($('#exportBtn')) $('#exportBtn').hidden = !p.installed
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
if ($('#clearLogBtn')) {
  $('#clearLogBtn').onclick = async () => {
    if (!current) return
    logCache.set(current, '')
    if ($('#log')) $('#log').innerHTML = ''
    await window.director.clearLog(current)
  }
}
if ($('#autoScrollBtn')) {
  $('#autoScrollBtn').onclick = (e) => {
    autoScrollEnabled = !autoScrollEnabled
    e.target.style.color = autoScrollEnabled ? 'var(--hi)' : 'var(--tx-muted)'
  }
}
let _batchingLog = false
function scrollLog() {
  if (_batchingLog) return
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
  if (window.mixerGraph) { window.mixerGraph.destroy(); mixerGraphInited = false }
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
if ($('#exportBtn')) $('#exportBtn').onclick = async () => {
  if (!current) return
  const btn = $('#exportBtn')
  if (btn) { btn.textContent = '…'; btn.disabled = true }
  const r = await window.director.exportSession(current)
  if (btn) { btn.textContent = 'EXPORT'; btn.disabled = false }
  showToast(r.ok ? `Exportado: ${r.path}` : 'Exportación cancelada')
}
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
  const agent = $('#aiSelect')?.value
  const model = $('#modelSelect')?.value
  if (!p || !p.installed || p.running || !agent) return
  
  if (current) {
    const cfg = await window.director.mixerRead(current) || {}
    cfg.agent = agent
    if (model) cfg.model = model
    await window.director.configWrite(current, cfg)
  }

  addActionEntry('play', 'START', `${agent} starts the infinite development cycle — ${esc(p.name)}`)
  setOrchestraState('started')
  if (current) trackPlay(current)
  const result = await window.director.play(current, agent)
  if (!result?.ok) {
    setOrchestraState('idle')
    showToast(result?.err || 'Unable to start')
    return
  }
  await loadAiCredits()
  setTimeout(() => { if (orchestraState === 'started') setOrchestraState('interpreting') }, 3000)
  refresh()
}
if ($('#aiLoginBtn')) $('#aiLoginBtn').onclick = async () => {
  const id = $('#aiSelect')?.value
  if (!id) return
  const result = await window.director.aiLogin(id)
  showToast(result.msg || (result.ok ? 'Login initiated' : 'Login failed'))
  if (result.ok) setTimeout(() => checkAiAuth(id), 5000)
}
if ($('#aiSelect')) $('#aiSelect').onchange = async event => {
  const agentId = event.target.value
  if (!agentId) return updateAiControl()
  const result = await window.director.aiSelect(agentId)
  if (!result.ok) { event.target.value = ''; showToast(result.error) }
  await loadAiCredits()
  
  if (current) {
    const cfg = await window.director.mixerRead(current) || {}
    cfg.agent = agentId
    const aiData = aiCredits[agentId]
    if (aiData && aiData.defaultModel) {
      cfg.model = aiData.defaultModel
      if ($('#modelSelect')) $('#modelSelect').value = cfg.model
    }
    await window.director.configWrite(current, cfg)
  }
}
if ($('#modelSelect')) $('#modelSelect').onchange = async event => {
  if (current) {
    const cfg = await window.director.mixerRead(current) || {}
    cfg.model = event.target.value
    await window.director.configWrite(current, cfg)
  }
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
const COMMIT_TYPE_COLORS = {
  feat: '#40c840', fix: '#e8631a', test: '#00aaff', refactor: '#8844ff',
  chore: '#686a76', security: '#e03030', sec: '#e03030', perf: '#ddba00',
  docs: '#00d4d4', style: '#c090ff', i18n: '#4488ff', other: '#484a56'
}

function renderCommitBreakdown(report) {
  const el = $('#commitBreakdown')
  if (!el) return
  const m = report.match(/By type: (\{[^}]+\})/)
  if (!m) { el.style.display = 'none'; return }
  try {
    const cat = JSON.parse(m[1])
    const total = Object.values(cat).reduce((a, b) => a + b, 0)
    if (total === 0) { el.style.display = 'none'; return }
    const sorted = Object.entries(cat).sort((a, b) => b[1] - a[1])
    let html = '<div style="display:flex;height:16px;border-radius:3px;overflow:hidden;margin-bottom:6px">'
    for (const [type, count] of sorted) {
      const pct = (count / total * 100).toFixed(1)
      const color = COMMIT_TYPE_COLORS[type] || '#484a56'
      html += `<div style="width:${pct}%;background:${color};min-width:2px" title="${esc(type)}: ${count} (${pct}%)"></div>`
    }
    html += '</div><div style="display:flex;gap:10px;flex-wrap:wrap;font:9px var(--mono);color:var(--dim)">'
    for (const [type, count] of sorted) {
      const color = COMMIT_TYPE_COLORS[type] || '#484a56'
      html += `<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};margin-right:3px"></span>${esc(type)} ${count}</span>`
    }
    html += '</div>'
    el.innerHTML = html
    el.style.display = ''
  } catch { el.style.display = 'none' }
}

async function runAnalysis() {
  if ($('#analysisOut')) $('#analysisOut').value = 'Componiendo la crítica…'
  if ($('#analysisFile')) $('#analysisFile').textContent = ''
  if ($('#commitBreakdown')) $('#commitBreakdown').style.display = 'none'
  const res = await window.director.analyze(current)
  if (res) {
    if ($('#analysisOut')) $('#analysisOut').value = res.report
    if ($('#analysisFile')) $('#analysisFile').textContent = res.file
    renderCommitBreakdown(res.report)
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
  const cfg = await window.director.mixerRead(current) || {}
  
  if ($('#aiSelect')) {
    if (cfg.agent && aiCredits[cfg.agent]) {
      $('#aiSelect').value = cfg.agent
    } else if (aiCredits.selected) {
      $('#aiSelect').value = aiCredits.selected
    }
  }
  updateAiControl()
  if (cfg.model && $('#modelSelect')) {
    $('#modelSelect').value = cfg.model
  }

  updateSmartMixIndicator(!!cfg.smartMix)
  updateSmartModelToggle(!!cfg.smartModel)

  const focus = (cfg && cfg.focus) || {}
  const box = $('#mixerStrips')
  if (!box) return
  box.innerHTML = ''

  const allSections = getAllSections()
  // Normalize focus values so they sum to 100%
  const normalizedFocus = normalizeMixerValues(focus, allSections)

  // Build strips in predefined order (no sorting)
  const stripData = allSections.map(([k, label, color, svg]) => {
    const v = normalizedFocus[k] ?? 0
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
  <div class="strip-h-val">${v}%</div>
`
    box.appendChild(strip)

    const inp = strip.querySelector('input[type="range"]')
    const fill = strip.querySelector('.strip-bar-fill-h')
    const valEl = strip.querySelector('.strip-h-val')

    inp.addEventListener('input', () => {
      const newVal = parseInt(inp.value, 10)
      rebalanceMixer(k, newVal)
      updateSmartAuroraColors()
      debouncedMixerSave()
      updateMixerGraph()
    })
    inp.addEventListener('change', () => {
      const newVal = parseInt(inp.value, 10)
      rebalanceMixer(k, newVal)
      updateSmartAuroraColors()
      debouncedMixerSave()
      updateMixerGraph()
    })
  }
  // Update aurora colors from the freshly built strips
  setTimeout(updateSmartAuroraColors, 50)

  // Mixer node graph — always visible, init once per project
  const graphContainer = $('#mixerGraphCanvas')
  if (graphContainer && window.mixerGraph) {
    if (!mixerGraphInited) {
      // Defer 1 frame so the container has final dimensions
      setTimeout(() => {
        window.mixerGraph.init(graphContainer, allSections)
        mixerGraphInited = true
        window.mixerGraph.update(normalizedFocus)
      }, 80)
    } else {
      window.mixerGraph.update(normalizedFocus)
    }
  }
}

// ─── Mixer Stand Glow: activate when AI works on a category ─────────────────
let activeStand = null
let standSparkInterval = null
let mixerGraphInited = false

function activateMixerStand(category) {
  // Clear previous
  document.querySelectorAll('#mixerStrips .strip-h.stand-active').forEach(el => {
    el.classList.remove('stand-active')
    el.querySelectorAll('.stand-spark').forEach(s => s.remove())
  })
  if (standSparkInterval) { clearInterval(standSparkInterval); standSparkInterval = null }
  activeStand = null
  if (window.mixerGraph) window.mixerGraph.activate(category || null)
  if (!category) return

  const strip = document.querySelector(`#mixerStrips .strip-h[data-key="${category}"]`)
  if (!strip || strip.classList.contains('off')) return

  strip.classList.add('stand-active')
  activeStand = category

  // Emit spark particles periodically
  standSparkInterval = setInterval(() => {
    if (!strip.isConnected) { clearInterval(standSparkInterval); standSparkInterval = null; return }
    const bar = strip.querySelector('.strip-bar-h')
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const stripRect = strip.getBoundingClientRect()
    for (let i = 0; i < 2; i++) {
      const spark = document.createElement('span')
      spark.className = 'stand-spark'
      const x = Math.random() * rect.width
      const sx = (Math.random() - .5) * 20 + 'px'
      const sy = -(Math.random() * 14 + 4) + 'px'
      spark.style.setProperty('--strip-color', getComputedStyle(strip).getPropertyValue('--strip-color').trim())
      spark.style.setProperty('--sx', sx)
      spark.style.setProperty('--sy', sy)
      spark.style.left = (rect.left - stripRect.left + x) + 'px'
      spark.style.top = (rect.top - stripRect.top) + 'px'
      strip.appendChild(spark)
      setTimeout(() => spark.remove(), 1200)
    }
  }, 600)
}

// Update graph node sizes from current slider state
function updateMixerGraph() {
  if (!window.mixerGraph || !mixerGraphInited) return
  const focus = {}
  document.querySelectorAll('#mixerStrips .strip-h').forEach(s => {
    const k = s.dataset.key
    const v = s.querySelector('.strip-h-val')
    if (k && v) focus[k] = parseInt(v.textContent, 10) || 0
  })
  window.mixerGraph.update(focus)
}

// ─── Mixer Equalizer: all stands always sum to 100% ────────────────────────
function normalizeMixerValues(focus, sections) {
  const keys = sections.map(s => s[0])
  let total = 0
  for (const k of keys) total += (focus[k] ?? 0)
  if (total === 0) {
    // Distribute equally among all sections
    const each = Math.floor(100 / keys.length)
    const result = {}
    keys.forEach((k, i) => { result[k] = i === 0 ? 100 - each * (keys.length - 1) : each })
    return result
  }
  // Scale proportionally to sum to 100
  const result = {}
  let assigned = 0
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      result[k] = 100 - assigned
    } else {
      result[k] = Math.round(((focus[k] ?? 0) / total) * 100)
      assigned += result[k]
    }
  })
  return result
}

function rebalanceMixer(changedKey, newVal) {
  const strips = document.querySelectorAll('#mixerStrips .strip-h')
  if (!strips.length) return

  // Clamp to 100
  newVal = Math.min(100, Math.max(0, newVal))
  const remaining = 100 - newVal

  // Get current values of OTHER strips
  const others = []
  let othersTotal = 0
  strips.forEach(s => {
    const inp = s.querySelector('input[type="range"]')
    const k = inp.dataset.k
    if (k !== changedKey) {
      const cur = parseInt(inp.value, 10)
      others.push({ strip: s, inp, k, cur })
      othersTotal += cur
    }
  })

  // Distribute remaining among others proportionally
  let assigned = 0
  others.forEach((o, i) => {
    let share
    if (i === others.length - 1) {
      share = remaining - assigned
    } else if (othersTotal > 0) {
      share = Math.round((o.cur / othersTotal) * remaining)
    } else {
      // All others were 0 — distribute equally
      share = Math.round(remaining / others.length)
    }
    share = Math.max(0, share)
    assigned += share

    o.inp.value = share
    const fill = o.strip.querySelector('.strip-bar-fill-h')
    const valEl = o.strip.querySelector('.strip-h-val')
    if (fill) fill.style.width = share + '%'
    if (valEl) valEl.textContent = share + '%'
    o.strip.classList.toggle('on', share > 0)
    o.strip.classList.toggle('off', share === 0)
  })

  // Update the changed strip itself
  strips.forEach(s => {
    const inp = s.querySelector('input[type="range"]')
    if (inp.dataset.k === changedKey) {
      inp.value = newVal
      const fill = s.querySelector('.strip-bar-fill-h')
      const valEl = s.querySelector('.strip-h-val')
      if (fill) fill.style.width = newVal + '%'
      if (valEl) valEl.textContent = newVal + '%'
      s.classList.toggle('on', newVal > 0)
      s.classList.toggle('off', newVal === 0)
    }
  })
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

// ─── Smart Mix Toggle (aurora mesh gradient) ────────────────────────────────
function updateSmartMixIndicator(active) {
  const bar = $('#smartMixBar')
  if (!bar) return
  bar.classList.toggle('active', active)
  if (active) updateSmartAuroraColors()
}

function updateSmartAuroraColors() {
  // Read the top 4 active stand colors and inject them into the aurora gradient
  const aurora = $('#smartAurora')
  if (!aurora) return
  const strips = document.querySelectorAll('#mixerStrips .strip-h.on')
  const colors = []
  strips.forEach(s => {
    const color = getComputedStyle(s).getPropertyValue('--strip-color').trim()
    if (color && colors.length < 4) colors.push(color)
  })
  // Pad to 4 colors
  const defaults = ['#e8631a', '#3d78e8', '#9955ee', '#28a828']
  while (colors.length < 4) colors.push(defaults[colors.length])
  aurora.style.setProperty('--aurora-c1', colors[0])
  aurora.style.setProperty('--aurora-c2', colors[1])
  aurora.style.setProperty('--aurora-c3', colors[2])
  aurora.style.setProperty('--aurora-c4', colors[3])
}

if ($('#smartMixToggle')) $('#smartMixToggle').onclick = async () => {
  if (!current) return
  const cfg = await window.director.mixerRead(current) || {}
  const newState = !cfg.smartMix
  cfg.smartMix = newState
  await window.director.configWrite(current, cfg)
  updateSmartMixIndicator(newState)
  showToast(newState ? 'Smart Mix activated — stands will self-regulate' : 'Smart Mix disabled')
}

// ─── Smart Model Toggle ──────────────────────────────────────────────────────
function updateSmartModelToggle(active) {
  const btn = $('#smartModelToggle')
  const manualWrap = $('#manualModelWrap')
  if (!btn) return
  btn.classList.toggle('active', active)
  if (manualWrap) {
    manualWrap.classList.toggle('hidden', active)
  }
  if (active) {
    btn.title = 'Smart Model ON — auto-selects models by task complexity (click to disable)'
  } else {
    btn.title = 'Smart Model OFF — using single model (click to enable)'
  }
  updateTransportButtons()
}

if ($('#smartModelToggle')) $('#smartModelToggle').onclick = async () => {
  if (!current) return
  const cfg = await window.director.mixerRead(current) || {}
  const newState = !cfg.smartModel
  cfg.smartModel = newState
  if (newState && !cfg.modelComplex) {
    cfg.modelComplex = 'claude-opus-4-6'
  }
  if (newState && !cfg.modelFast) {
    cfg.modelFast = 'claude-haiku-4-5'
  }
  if (newState && !cfg.architectInterval) {
    cfg.architectInterval = 5
  }
  await window.director.configWrite(current, cfg)
  updateSmartModelToggle(newState)
  showToast(newState ? 'Smart Model ON — auto-routing by task complexity' : 'Smart Model OFF — single model')
}

// ─── Export All Mixes ───────────────────────────────────────────────────────
if ($('#exportMixesBtn')) $('#exportMixesBtn').onclick = async () => {
  if (!current) return
  const mixes = await window.director.mixerSavedList(current)
  if (!mixes || !mixes.length) { showToast('No mixes to export'); return }
  const json = JSON.stringify({ version: 1, exported: new Date().toISOString(), mixes }, null, 2)
  await navigator.clipboard.writeText(json)
  showToast(`${mixes.length} mixes copied to clipboard as JSON`)
}

// ─── Import Mixes Library ───────────────────────────────────────────────────
if ($('#importMixesBtn')) $('#importMixesBtn').onclick = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async e => {
    const file = e.target.files[0]
    if (!file || !current) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      const mixes = data.mixes || (Array.isArray(data) ? data : [data])
      let imported = 0
      for (const m of mixes) {
        if (m.focus) {
          const normalized = normalizeMixerValues(m.focus, getAllSections())
          await window.director.mixerSavedSave(current, m.name || 'Imported', normalized)
          imported++
        }
      }
      showToast(`${imported} mix${imported !== 1 ? 'es' : ''} imported`)
      loadMixes()
    } catch { showToast('Invalid JSON file') }
  }
  input.click()
}

// ─── Import Mix ──────────────────────────────────────────────────────────────
if ($('#mixImportBtn')) $('#mixImportBtn').onclick = async () => {
  if (!current) return
  const input = $('#mixImportInput')
  if (!input || !input.value.trim()) return
  try {
    const data = JSON.parse(input.value.trim())
    if (data.focus) {
      const normalized = normalizeMixerValues(data.focus, getAllSections())
      await window.director.mixerSavedSave(current, data.name || 'Imported', normalized)
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
      const normalized = normalizeMixerValues(m.focus, getAllSections())
      await window.director.mixerWrite(current, normalized)
      // Enable/disable smart mix based on preset flag
      if (current) {
        const cfg = await window.director.mixerRead(current) || {}
        cfg.smartMix = !!m.smart
        await window.director.configWrite(current, cfg)
      }
      loadMixer()
      showToast(m.smart ? 'Smart Mix activated — self-regulating' : 'Mix "' + m.name + '" loaded')
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
    <span class="le-badge">${esc(label)}</span>
    <span class="le-msg">${esc(message)}</span>
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
    <span class="le-msg" style="color:${catColor}cc"><strong>${esc(unit)}</strong>${goal ? ' — ' + esc(goal) : ''}</span>
  `
  logEl.appendChild(el)

  // Activate mixer stand glow for this category
  if (category) activateMixerStand(category)

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
    <span class="le-msg">${esc(text)}</span>
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
    <span class="le-msg">${esc(text)}</span>
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
    <span class="le-msg" style="color:#c4b5e0">${esc(text)}</span>
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
    <span class="le-msg" style="color:${color}cc;white-space:normal;line-height:1.5">${esc(text)}${hasIssues ? '<br><span style="color:#ff8888;font-size:10px">⚠ ' + esc(issues.join(' · ')) + '</span>' : ''}</span>
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
      <span class="le-msg" style="color:#666;font-size:10px">${esc(preview)}</span>
      <span class="le-group-expand">▾</span>
    </div>
    <div class="le-group-body">${esc(text)}\n</div>
  `
  logEl.appendChild(grp)
  currentGroup = grp
  trimLog()
  scrollLog()
}

function trimLog() {
  const logEl = $('#log')
  if (logEl && logEl.childElementCount > 300) logEl.removeChild(logEl.firstChild)
  if (rawLogBuffer.length > 2000) rawLogBuffer.splice(0, rawLogBuffer.length - 2000)
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
  let _filterTimer = null
  filterInput.addEventListener('input', (e) => {
    clearTimeout(_filterTimer)
    _filterTimer = setTimeout(() => {
      const q = e.target.value.toLowerCase()
      const logEl = $('#log')
      const countEl = $('#logFilterCount')
      if (!logEl) return
      if (!q) {
        logEl.classList.remove('filtering')
        if (countEl) countEl.style.display = 'none'
      } else {
        logEl.classList.add('filtering')
        let matchCount = 0
        const entries = logEl.querySelectorAll('.le, .le-group')
        for (const el of entries) {
          if (el.textContent.toLowerCase().includes(q)) {
            el.classList.add('match')
            matchCount++
          } else {
            el.classList.remove('match')
          }
        }
        if (countEl) {
          countEl.textContent = matchCount + ' resultado' + (matchCount !== 1 ? 's' : '')
          countEl.style.display = ''
        }
      }
    }, 150)
  })

  const logObserver = new MutationObserver((mutations) => {
    const q = filterInput.value.toLowerCase()
    if (!q) return
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue
        if (node.classList.contains('le') || node.classList.contains('le-group')) {
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

  // Extract model tag like [sonnet:executor] or [opus:architect]
  const modelMatch = dateStr.match(/\[([^\]]+)\]/)
  const modelTag = modelMatch ? modelMatch[1] : null
  const cleanDate = dateStr.replace(/\[[^\]]+\]\s*—?\s*/, '').trim()

  // Color model tag by role
  let modelColor = '#00aaff'
  let modelBg = 'rgba(0,170,255,.12)'
  if (modelTag) {
    if (modelTag.includes('architect')) { modelColor = '#aa77ff'; modelBg = 'rgba(170,119,255,.12)' }
    else if (modelTag.includes('haiku') || modelTag.includes('fast')) { modelColor = '#00c8a0'; modelBg = 'rgba(0,200,160,.12)' }
    else if (modelTag.includes('opus')) { modelColor = '#ff88aa'; modelBg = 'rgba(255,136,170,.12)' }
  }
  const modelBadge = modelTag
    ? `<span class="le-badge" style="background:${modelBg};color:${modelColor};border:1px solid ${modelColor}40">${esc(modelTag)}</span>`
    : ''

  const el = document.createElement('div')
  el.className = 'le le-iteration le-iter-start'
  el.innerHTML = `
    <span class="le-icon" style="background:rgba(0,170,255,0.15);color:#00aaff;text-shadow:0 0 4px #00aaff">⟳</span>
    <span class="le-time">${time}</span>
    <span class="le-badge" style="background:rgba(0,170,255,.12);color:#00aaff;border:1px solid rgba(0,170,255,.25)">CYCLE ${num}</span>
    ${modelBadge}
    <span class="le-msg" style="color:#7ab8e0">${esc(cleanDate)}</span>
  `
  logEl.appendChild(el)
  currentGroup = null
  trimLog()
  scrollLog()
  return el
}

// Iteration end entry
function addIterationEndEntry(num, exitCode) {
  activateMixerStand(null)
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
    <span class="le-msg" style="color:${ok ? '#a5d6a5' : '#ddba77'}">${ok ? 'Completed successfully' : `Finished with restart (code ${esc(exitCode)})`}</span>
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
    <span class="le-msg le-summary-text">${esc(text)}</span>
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

  // Audit lines — show per-stand breakdown
  if (cl.includes('[audit]')) {
    const m = cl.match(/commits=(\d+).*claimed=(\d+).*product_commits=(\d+).*quality_commits=(\d+)/)
    if (m) {
      const [, commits, claimed, prod, qual] = m
      const parts = []
      if (+prod > 0) parts.push(`product:${prod}`)
      if (+qual > 0) parts.push(`quality:${qual}`)
      const other = +commits - +prod - +qual
      if (other > 0) parts.push(`other:${other}`)
      const drift = +commits !== +claimed ? ` (claimed ${claimed})` : ''
      addSummaryEntry(`AUDIT — ${commits} commits verified [${parts.join(' ')}]${drift}`)
    } else {
      addSummaryEntry(cl.replace(/\[orchestra[^\]]*\]\s*/, ''))
    }
    return
  }

  // Hot-reload lines
  if (cl.includes('[director]') || cl.includes('Hot-reload')) {
    addActionEntry('reload', 'RELOAD', cl.replace(/\[director\]\s*/, ''))
    return
  }

  // ANTI-LAZY / BLOCKED lines — show as warnings
  if (cl.includes('ANTI-LAZY') || cl.includes('BLOCKED-RETRY') || cl.includes('BLOCKED-LIMIT')) {
    addErrorEntry(cl.replace(/\[orchestra[^\]]*\]\s*/, ''))
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
      // Persist feature starts so they survive app restarts
      if (current) window.director.lifecycleAdd(current, 'feature', 'FEATURE', cl.replace(/^▸\s*▶?\s*/, ''))
    } else if (cl.includes('✔')) {
      // Extract category from commit line ▸ ✔ [category] — light up briefly then deactivate
      const commitCatMatch = cl.match(/✔\s*\[(\w+)\]/)
      if (commitCatMatch) {
        activateMixerStand(commitCatMatch[1])
        setTimeout(() => activateMixerStand(null), 3000)
      }
      addCycleEntry(cl)
      if (current) trackCommit(current)
      if (current) window.director.lifecycleAdd(current, 'commit', 'COMMIT', cl.replace(/^▸\s*✔?\s*/, ''))
    } else {
      // Detect machine-readable COMPLIANCE line from cycle close
      if (cl.includes('COMPLIANCE')) {
        updateComplianceFromLog(cl)
        if (current) window.director.lifecycleAdd(current, 'cycle_close', 'CYCLE', cl.replace(/^▸\s*◼?\s*/, ''))
      }
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

  // Show last 80 events as compact entries
  const recent = events.slice(-80)
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
      'commit':      { icon: '✔', color: '#40c840' },
      'feature':     { icon: '▶', color: '#e8631a' },
      'cycle_close': { icon: '◼', color: '#9955ee' },
      'hot_reload':  { icon: '↻', color: '#00ffee' },
      'auto_resume': { icon: '⟳', color: '#00aaff' },
      'directive':   { icon: '→', color: '#ddba00' },
    }
    const s = HISTORY_STYLES[ev.type] || { icon: '·', color: '#666' }

    const el = document.createElement('div')
    el.className = 'le le-action le-history'
    el.style.setProperty('--le-color', s.color)
    el.style.background = `color-mix(in srgb, ${s.color} 4%, transparent)`
    el.style.opacity = '0.7'
    el.innerHTML = `
      <span class="le-icon">${s.icon}</span>
      <span class="le-time" title="${esc(ev.ts)}">${date} ${time}</span>
      <span class="le-badge">${esc(ev.label)}</span>
      <span class="le-msg">${esc(ev.message)}</span>
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
    updateAllocInspector(a)
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
    updateAllocInspector(null)
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
  updateCompressionPanel(data.context || null)

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

  // Token burn rate (F-19)
  updateBurnRate(data.claudeUsage || null)

  // Claude API Usage
  if (data.claudeUsage) {
    const id = $('#aiSelect')?.value
    updateAiUsageDisplay(aiCredits[id], data.claudeUsage)
  }
}

let lastTelemetryUsage = null;

function updateAiUsageDisplay(creditData, telemetryUsage) {
  if (telemetryUsage !== undefined) lastTelemetryUsage = telemetryUsage;
  
  const valEl  = $('#mmAiUsageVal')
  const barEl  = $('#usageBarFill')
  if (!valEl) return

  if (!creditData) {
    valEl.textContent = '—'; valEl.className = 'mm-val'
    if (barEl) { barEl.style.width = '0%'; barEl.className = 'usage-bar-fill' }
    return
  }

  const id = $('#aiSelect')?.value
  let pct = 0
  let isExhausted = creditData.credits <= 0
  
  if (isExhausted) {
    pct = 100
  } else if (id === 'claude' && lastTelemetryUsage) {
    pct = lastTelemetryUsage.percent || 0
  } else {
    pct = 0 // unlimited or unknown
  }

  valEl.textContent = isExhausted ? 'LIMIT' : pct + '%'
  if (creditData.resetAt) valEl.title = `Resets at ${formatReset(creditData.resetAt)}`
  else valEl.title = 'Unlimited usage'

  if (isExhausted) {
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
    barEl.style.width = Math.min(100, Math.max(0, pct)) + '%'
    barEl.className = 'usage-bar-fill'
    if (isExhausted) barEl.classList.add('exhausted')
    else if (pct >= 90) barEl.classList.add('bad')
    else if (pct >= 70) barEl.classList.add('warn')
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

// ─── Mixer Drawer toggle ───────────────────────────────────────────────────────
;(function initMixerDrawer() {
  const toggleBtn = $('#mixerDrawerToggle')
  const closeBtn = $('#mixerDrawerClose')
  const drawer = $('#mixerDrawer')
  const overlay = $('#mixerDrawerOverlay')
  if (!drawer) return

  function openDrawer() {
    drawer.classList.add('open')
    if (overlay) overlay.classList.add('visible')
  }
  function closeDrawer() {
    drawer.classList.remove('open')
    if (overlay) overlay.classList.remove('visible')
  }

  if (toggleBtn) toggleBtn.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer()
  })
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer)
  if (overlay) overlay.addEventListener('click', closeDrawer)
})()

// ─── Resource Allocation Inspector (F-13) ─────────────────────────────────────
;(function initAllocInspector() {
  const btn = $('#allocToggle')
  if (!btn) return
  btn.addEventListener('click', () => {
    const body = $('#allocBody')
    if (!body) return
    const open = body.style.display !== 'none'
    body.style.display = open ? 'none' : ''
    btn.textContent = (open ? '▸' : '▾') + ' ASIGNACIÓN DE RECURSOS'
    btn.classList.toggle('open', !open)
  })
})()

function updateAllocInspector(allocation) {
  const panel = $('#allocInspector')
  if (!panel) return
  if (!allocation) { panel.style.display = 'none'; return }

  panel.style.display = ''
  const sumEl = $('#allocSummary')
  const catEl = $('#allocCategories')
  if (!sumEl || !catEl) return

  const tokK = allocation.tokenBudget > 999 ? Math.floor(allocation.tokenBudget / 1000) + 'K' : allocation.tokenBudget
  sumEl.innerHTML = [
    `<span class="as-item">nice <span class="as-val">${esc(String(allocation.nice))}</span></span>`,
    `<span class="as-item">memoria <span class="as-val">${esc(String(allocation.memBudgetMB))}MB</span></span>`,
    `<span class="as-item">tokens <span class="as-val">${esc(String(tokK))}</span></span>`,
    `<span class="as-item">intensidad <span class="as-val">${esc(String(Math.round(allocation.avgIntensity)))}</span></span>`,
    `<span class="as-item">peso total <span class="as-val">${esc(String(allocation.totalWeight))}</span></span>`
  ].join('')

  const cats = allocation.categoryBudgets || {}
  const keys = Object.keys(cats).sort((a, b) => (cats[b].weight || 0) - (cats[a].weight || 0))
  if (keys.length === 0) { catEl.innerHTML = ''; return }

  catEl.innerHTML = keys.map(k => {
    const c = cats[k]
    const pct = Math.round((c.normalizedShare || 0) * 100)
    const ret = Math.round((c.contextRetentionFactor || 0) * 100)
    const hot = c.hotPath ? ' <span class="ac-hot">HOT</span>' : ''
    return `<span class="alloc-cat"><span class="ac-name">${esc(k)}</span><span class="ac-val">${esc(String(c.weight))}% · ${esc(String(pct))}% share · ${esc(String(ret))}% ret</span>${hot}</span>`
  }).join('')
}

// ─── Token Burn Rate (F-19) ───────────────────────────────────────────────────
const _burnHistory = []
let _prevBurnTokens = 0

function updateBurnRate(usage) {
  const valEl = $('#mmBurnVal')
  const sparkEl = $('#burnSpark')
  if (!valEl) return

  if (!usage || !usage.tokensEstimated) {
    valEl.textContent = '—'
    valEl.className = 'mm-val'
    if (sparkEl) sparkEl.style.display = 'none'
    return
  }

  const tokens = usage.tokensEstimated
  const delta = _prevBurnTokens > 0 ? tokens - _prevBurnTokens : 0
  _prevBurnTokens = tokens

  if (delta > 0) _burnHistory.push(delta)
  if (_burnHistory.length > 30) _burnHistory.shift()

  if (_burnHistory.length > 0) {
    const avg = Math.round(_burnHistory.reduce((s, v) => s + v, 0) / _burnHistory.length)
    const avgK = avg > 999 ? Math.floor(avg / 1000) + 'K' : String(avg)
    valEl.textContent = avgK + '/iter'
    const trend = _burnHistory.length >= 3 && _burnHistory[_burnHistory.length - 1] > avg * 1.3 ? ' warn' : ' active'
    valEl.className = 'mm-val' + trend
  } else {
    valEl.textContent = '—'
    valEl.className = 'mm-val'
  }

  renderSparkline(sparkEl, _burnHistory.length >= 2 ? _burnHistory : null)
}

// ─── Context Compression Panel (F-21) ─────────────────────────────────────────
;(function initCompressionPanel() {
  const btn = $('#compressionToggle')
  if (!btn) return
  btn.addEventListener('click', () => {
    const body = $('#compressionBody')
    if (!body) return
    const open = body.style.display !== 'none'
    body.style.display = open ? 'none' : ''
    btn.textContent = (open ? '▸' : '▾') + ' COMPRESIÓN DE CONTEXTO'
    btn.classList.toggle('open', !open)
  })
})()

function updateCompressionPanel(contextData) {
  const panel = $('#compressionPanel')
  if (!panel) return
  if (!contextData) { panel.style.display = 'none'; return }

  const agg = contextData.aggregated
  const last = contextData.lastDelta ? contextData.lastDelta.metrics : null
  if (!agg && !last) { panel.style.display = 'none'; return }

  panel.style.display = ''
  const statsEl = $('#compressionStats')
  const histEl = $('#compressionHistory')
  if (!statsEl) return

  const items = []
  if (agg) {
    const savedK = agg.totalTokensSaved > 999 ? Math.floor(agg.totalTokensSaved / 1000) + 'K' : String(agg.totalTokensSaved)
    const processedK = agg.totalTokensProcessed > 999 ? Math.floor(agg.totalTokensProcessed / 1000) + 'K' : String(agg.totalTokensProcessed)
    items.push(
      `<span class="as-item">ciclos <span class="as-val">${esc(String(agg.cycles))}</span></span>`,
      `<span class="as-item">tokens ahorrados <span class="as-val">${esc(savedK)}</span></span>`,
      `<span class="as-item">tokens procesados <span class="as-val">${esc(processedK)}</span></span>`,
      `<span class="as-item">compresión <span class="as-val">${esc(String(agg.cumulativeCompression))}%</span></span>`,
      `<span class="as-item">ahorro/ciclo <span class="as-val">${esc(String(agg.avgSavedPerCycle))}</span></span>`
    )
  }
  if (last) {
    items.push(
      `<span class="as-item">archivos <span class="as-val">${esc(String(last.filesAnalyzed))}</span></span>`,
      `<span class="as-item">cambios <span class="as-val">${esc(String(last.filesChanged))}</span></span>`,
      `<span class="as-item">sin cambios <span class="as-val">${esc(String(last.filesUnchanged))}</span></span>`,
      `<span class="as-item">secciones <span class="as-val">${esc(String(last.sectionsTotal))} (${esc(String(last.sectionsUnchanged))} =)</span></span>`
    )
  }
  statsEl.innerHTML = items.join('')

  if (histEl && contextData.historySize !== undefined) {
    histEl.textContent = esc(String(contextData.historySize)) + ' snapshots'
  }
}

// ─── Compliance Display ───────────────────────────────────────────────────────
function renderSparkline(svgEl, scores) {
  if (!svgEl || !scores || scores.length < 2) { if (svgEl) svgEl.style.display = 'none'; return }
  const w = 60, h = 16, pad = 1
  const min = Math.min(...scores), max = Math.max(...scores)
  const range = max - min || 1
  const points = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (w - 2 * pad)
    const y = h - pad - ((s - min) / range) * (h - 2 * pad)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const lastScore = scores[scores.length - 1]
  const color = lastScore >= 90 ? '#40c840' : lastScore >= 70 ? '#ddba00' : '#e03030'
  svgEl.innerHTML = `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
  svgEl.style.display = ''
}

function updateComplianceDisplay(data) {
  const el = $('#mmComplianceVal')
  if (!el) return
  if (!data || data.last === null) {
    el.textContent = '—'; el.className = 'mm-val'
    renderSparkline($('#complianceSpark'), null)
    return
  }
  const score = data.last ? data.last.score : data.avgScore
  if (score === null) { el.textContent = '—'; el.className = 'mm-val'; renderSparkline($('#complianceSpark'), null); return }
  el.textContent = score + '%' + (data.cycles > 1 ? ` (${data.cycles}c)` : '')
  el.className = 'mm-val ' + (score >= 90 ? 'ok' : score >= 70 ? 'warn' : 'bad')
  renderSparkline($('#complianceSpark'), data.history)
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

window.director.onResumed(async ({ dir, agent }) => {
  if (dir === current) {
    await loadAiCredits()
    if (agent && $('#aiSelect')) $('#aiSelect').value = agent
    showUsageBanner(false)
    setStatus('PLAY')
    startClock()
    setOrchestraState('interpreting')
    updateClaudeUsageDisplay({ percent: 0, status: 'normal', detail: 'Créditos restaurados' })
    usageEntry = null
    addActionEntry('resume', 'RESUME', agent ? `${agent} continues the development cycle` : 'Credits restored — cycle resumed')
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

  const totalCpu = procs.reduce((s, p) => s + (parseFloat(p.cpu) || 0), 0)
  const totalMem = procs.reduce((s, p) => s + (parseFloat(p.mem) || 0), 0)
  const gaugeEl = document.createElement('div')
  gaugeEl.className = 'proc-gauge'
  const cpuColor = totalCpu > 80 ? '#e03030' : totalCpu > 40 ? '#ddba00' : '#40c840'
  const memColor = totalMem > 50 ? '#e03030' : totalMem > 25 ? '#ddba00' : '#40c840'
  gaugeEl.innerHTML = `<span class="pg-item">CPU <span class="pg-val" style="color:${cpuColor}">${totalCpu.toFixed(1)}%</span></span><span class="pg-item">MEM <span class="pg-val" style="color:${memColor}">${totalMem.toFixed(1)}%</span></span><span class="pg-item">${procs.length} proc${procs.length > 1 ? 's' : ''}</span>`
  list.appendChild(gaugeEl)

  for (const p of procs) {
    const s = PROC_TYPE_STYLE[p.type] || PROC_TYPE_STYLE.claude
    const row = document.createElement('div')
    row.className = 'proc-row'
    row.innerHTML = `
      <span class="proc-type" style="color:${s.color};border-color:${s.color}40;background:${s.color}12">${s.label}</span>
      <span class="proc-pid mono">${p.pid}</span>
      <span class="proc-stats mono">${p.cpu}% CPU · ${p.mem}% MEM · ${p.time}</span>
      <span class="proc-cmd mono">${esc(p.cmd)}</span>
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

loadProcs()
setInterval(() => {
  if (document.visibilityState === 'hidden') return
  loadProcs()
}, 5000)

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
  loadBpReadiness()
}

async function loadBpReadiness() {
  if (!current) return
  const el = $('#bpReadiness')
  if (!el) return
  const r = await window.director.blueprintReadiness(current)
  if (!r || !r.hasBlueprint) { el.style.display = 'none'; return }
  const pct = r.completeness || 0
  const color = r.ready ? '#40c840' : pct >= 50 ? '#ddba00' : '#e03030'
  const parts = [`${r.answeredFields} campos`, `${r.modules} módulos`, `${r.sessions} sesiones`]
  el.innerHTML = `<span style="color:${color}">● ${pct}%</span> <span style="color:var(--dim)">${parts.join(' · ')}</span>`
  if (!r.ready && r.missing.length) el.title = 'Faltan: ' + r.missing.join(', ')
  el.style.display = ''
}

const LC_ICONS = {
  play: '▶', started: '⚡', fine: '◼', kill: '✕', exit: '■',
  usage_limit: '⏸', resume: '↻', commit: '✔', feature: '▶',
  cycle_close: '◼', hot_reload: '↻', auto_resume: '⟳',
  directive: '→', error: '⚠'
}

async function loadLifecycleTimeline() {
  if (!current) return
  const el = $('#lifecycleTimeline')
  const countEl = $('#lifecycleCount')
  if (!el) return

  const events = await window.director.lifecycleList(current)
  if (!events || events.length === 0) {
    el.innerHTML = '<div style="padding:8px;color:var(--dim);font:9px var(--mono)">Sin eventos</div>'
    if (countEl) countEl.textContent = '0'
    return
  }

  const recent = events.slice(-50)
  if (countEl) countEl.textContent = String(events.length)

  el.innerHTML = recent.map(ev => {
    const d = new Date(ev.ts)
    const ts = d.toLocaleTimeString('es', { hour12: false }) + ' ' + d.toLocaleDateString('es', { day: '2-digit', month: 'short' })
    const icon = LC_ICONS[ev.type] || '·'
    return `<div class="lc-event" data-type="${esc(ev.type)}"><span class="lc-ts">${esc(ts)}</span><span class="lc-icon">${icon}</span><span class="lc-label">${esc(ev.label)}</span><span class="lc-msg" title="${esc(ev.message)}">${esc(ev.message)}</span></div>`
  }).join('')
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
    if (t.dataset.mtab === 'notesTab') loadNotes()
  })
})

async function loadKnowledge(file, btnId) {
  if (!current) return

  if (btnId) {
    document.querySelectorAll('#knowledgeTab .tp-action').forEach(b => b.classList.remove('warn'))
    document.getElementById(btnId).classList.add('warn')
  }

  const el = document.getElementById('knowledgeContent')
  if (el) el.textContent = 'Cargando…'
  try {
    const content = await window.director.readFile(current, file)
    if (el) el.textContent = content || `[Archivo no encontrado: ${file}]`
  } catch {
    if (el) el.textContent = `[Error al cargar: ${file}]`
  }
}

if (document.getElementById('knBtnRoadmap')) document.getElementById('knBtnRoadmap').onclick = () => loadKnowledge('ROADMAP.md', 'knBtnRoadmap')
if (document.getElementById('knBtnReport')) document.getElementById('knBtnReport').onclick = () => loadKnowledge('.claude/ORCHESTRA_REPORT.md', 'knBtnReport')
if (document.getElementById('knBtnDb')) document.getElementById('knBtnDb').onclick = () => loadKnowledge('.claude/DB_SCHEMA.md', 'knBtnDb')
if (document.getElementById('knBtnPlan')) document.getElementById('knBtnPlan').onclick = () => loadKnowledge('PLAN.md', 'knBtnPlan')
if (document.getElementById('knBtnDecisions')) document.getElementById('knBtnDecisions').onclick = () => loadKnowledge('DECISIONS.md', 'knBtnDecisions')
if (document.getElementById('knBtnPending')) document.getElementById('knBtnPending').onclick = () => loadKnowledge('PENDING.md', 'knBtnPending')
if (document.getElementById('knBtnLearnings')) document.getElementById('knBtnLearnings').onclick = () => loadKnowledge('CYCLE_LEARNINGS.md', 'knBtnLearnings')
if (document.getElementById('knBtnBlueprint')) document.getElementById('knBtnBlueprint').onclick = () => loadKnowledge('.claude/BLUEPRINT.md', 'knBtnBlueprint')

// ─── Operator Notes (F-25) ──────────────────────────────────────────────────
async function loadNotes() {
  if (!current) return
  const area = $('#notesArea')
  if (!area) return
  area.value = await window.director.notesRead(current) || ''
}

let _notesSaveTimer = null
if ($('#notesArea')) {
  $('#notesArea').addEventListener('input', () => {
    clearTimeout(_notesSaveTimer)
    _notesSaveTimer = setTimeout(async () => {
      if (current) await window.director.notesWrite(current, $('#notesArea').value)
    }, 1000)
  })
}

// ─── Theme & Settings ───────────────────────────────────────────────────────
function getStoredTheme() { return localStorage.getItem('director-theme') || 'auto' }
function applyTheme(mode) {
  const html = document.documentElement
  html.classList.remove('light')
  if (mode === 'light') {
    html.classList.add('light')
  } else if (mode === 'auto') {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) html.classList.add('light')
  }
  localStorage.setItem('director-theme', mode)
  // Update toggle group
  document.querySelectorAll('#themeGroup .stg-btn').forEach(b => {
    b.classList.toggle('on', b.dataset.theme === mode)
  })
}
if ($('#themeToggle')) {
  $('#themeToggle').onclick = () => {
    const modes = ['dark', 'auto', 'light']
    const cur = getStoredTheme()
    const next = modes[(modes.indexOf(cur) + 1) % modes.length]
    applyTheme(next)
  }
}
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (getStoredTheme() === 'auto') applyTheme('auto')
})
if ($('#themeGroup')) {
  document.querySelectorAll('#themeGroup .stg-btn').forEach(b => {
    b.onclick = () => applyTheme(b.dataset.theme)
  })
}
applyTheme(getStoredTheme())

// Settings modal
if ($('#settingsBtn')) $('#settingsBtn').onclick = () => { $('#settingsModal').hidden = false; loadSettings() }
if ($('#closeSettings')) $('#closeSettings').onclick = () => { $('#settingsModal').hidden = true }
if ($('#settingsModal')) $('#settingsModal').onclick = e => { if (e.target === $('#settingsModal')) $('#settingsModal').hidden = true }

async function loadSettings() {
  if (!current) return
  const cfg = await window.director.mixerRead(current) || {}
  if ($('#stgCaveman')) $('#stgCaveman').checked = cfg.caveman !== false
  if ($('#stgCompactAt')) $('#stgCompactAt').value = cfg.compactAt || 50
  if ($('#stgRunMode')) $('#stgRunMode').value = cfg.mode || 'perpetual'
  if ($('#stgMaxIter')) $('#stgMaxIter').value = cfg.maxIterations || 0
  if ($('#stgDefaultAi')) $('#stgDefaultAi').value = cfg.agent || 'claude'
  if ($('#stgAutoSwitch')) $('#stgAutoSwitch').checked = cfg.autoSwitch !== false
  if ($('#stgKeepLogs')) $('#stgKeepLogs').value = cfg.keepLogs || 50
  if ($('#stgAutoScroll')) $('#stgAutoScroll').checked = autoScrollEnabled
  if ($('#stgMaxHallStreak')) $('#stgMaxHallStreak').value = cfg.maxHallucinationStreak || 5
  try {
    const alerts = await window.director.alertsRead()
    if ($('#stgAlertStall')) $('#stgAlertStall').checked = alerts.stall !== false
    if ($('#stgAlertAlto')) $('#stgAlertAlto').checked = alerts.alto !== false
    if ($('#stgAlertUsage')) $('#stgAlertUsage').checked = alerts.usageLimit !== false
  } catch {}
}

async function saveSettings() {
  if (!current) return
  const cfg = await window.director.mixerRead(current) || {}
  cfg.caveman = $('#stgCaveman')?.checked ?? true
  cfg.compactAt = parseInt($('#stgCompactAt')?.value) || 50
  cfg.mode = $('#stgRunMode')?.value || 'perpetual'
  cfg.maxIterations = parseInt($('#stgMaxIter')?.value) || 0
  cfg.agent = $('#stgDefaultAi')?.value || 'claude'
  cfg.autoSwitch = $('#stgAutoSwitch')?.checked ?? true
  cfg.keepLogs = parseInt($('#stgKeepLogs')?.value) || 50
  cfg.maxHallucinationStreak = parseInt($('#stgMaxHallStreak')?.value) || 5
  await window.director.configWrite(current, cfg)
  if ($('#aiSelect')) { $('#aiSelect').value = cfg.agent; updateAiControl() }
  try {
    await window.director.alertsConfig({
      stall: $('#stgAlertStall')?.checked ?? true,
      alto: $('#stgAlertAlto')?.checked ?? true,
      usageLimit: $('#stgAlertUsage')?.checked ?? true
    })
  } catch {}
}
// Auto-save settings on change
document.querySelectorAll('#settingsModal input, #settingsModal select').forEach(el => {
  el.addEventListener('change', saveSettings)
})

// About & settings buttons
if ($('#aboutBtn')) $('#aboutBtn').onclick = () => { $('#aboutModal').hidden = false }

// ─── Init ─────────────────────────────────────────────────────────────────────
// On boot, auto-detect running projects and restore state
;(async function initBoot() {
  await loadAiCredits()
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

// brandArea click removed — about is now via settings gear
if ($('#closeAbout')) $('#closeAbout').onclick = () => { $('#aboutModal').hidden = true }

if ($('#aboutModal')) $('#aboutModal').onclick = (e) => {
  if (e.target === $('#aboutModal')) $('#aboutModal').hidden = true
}

// ─── Keyboard shortcuts (F-24) ──────────────────────────────────────────────
if ($('#closeShortcuts')) $('#closeShortcuts').onclick = () => { $('#shortcutsModal').hidden = true }
if ($('#shortcutsModal')) $('#shortcutsModal').onclick = e => { if (e.target === $('#shortcutsModal')) $('#shortcutsModal').hidden = true }
if ($('#cmdPalette')) $('#cmdPalette').onclick = e => { if (e.target === $('#cmdPalette')) closeCmdPalette() }

function closeCmdPalette() {
  if ($('#cmdPalette')) $('#cmdPalette').hidden = true
  if ($('#cmdInput')) $('#cmdInput').value = ''
  if ($('#cmdResults')) $('#cmdResults').innerHTML = ''
}

async function openCmdPalette() {
  if (!$('#cmdPalette')) return
  $('#cmdPalette').hidden = false
  const inp = $('#cmdInput')
  if (inp) { inp.value = ''; inp.focus() }
  await renderCmdResults('')
}

async function renderCmdResults(q) {
  const res = $('#cmdResults')
  if (!res) return
  const projects = await window.director.list()
  const items = projects.map(p => ({ type: 'PROJECT', label: p.name || p.path, path: p.path, running: p.running }))
  items.push({ type: 'ACTION', label: 'Play / Stop', action: 'toggle' })
  items.push({ type: 'ACTION', label: 'Kill', action: 'kill' })
  items.push({ type: 'ACTION', label: 'Export', action: 'export' })
  const filtered = q ? items.filter(i => i.label.toLowerCase().includes(q.toLowerCase())) : items
  res.innerHTML = filtered.slice(0, 10).map((it, i) =>
    `<div class="cmd-item${i === 0 ? ' active' : ''}" data-idx="${i}"><span class="cmd-type">${esc(it.type)}</span><span>${esc(it.label)}${it.running ? ' ●' : ''}</span></div>`
  ).join('')
  res.querySelectorAll('.cmd-item').forEach((el, i) => {
    el.onclick = () => { executeCmdItem(filtered[i]); closeCmdPalette() }
  })
}

function executeCmdItem(item) {
  if (!item) return
  if (item.type === 'PROJECT') {
    const cards = document.querySelectorAll('.rack-item')
    for (const c of cards) { if (c.dataset.dir === item.path) { c.click(); return } }
  }
  if (item.action === 'toggle' && current) { const b = $('#playBtn'); if (b) b.click() }
  if (item.action === 'kill' && current) { const b = $('#killBtn'); if (b) b.click() }
  if (item.action === 'export' && current) { const b = $('#exportBtn'); if (b) b.click() }
}

if ($('#cmdInput')) {
  $('#cmdInput').addEventListener('input', e => renderCmdResults(e.target.value))
  $('#cmdInput').addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCmdPalette(); e.stopPropagation() }
    if (e.key === 'Enter') {
      const active = document.querySelector('#cmdResults .cmd-item.active')
      if (active) active.click()
      closeCmdPalette()
    }
  })
}

function switchTab(tabId) {
  document.querySelectorAll('.mixer-tab').forEach(x => x.classList.remove('on'))
  document.querySelectorAll('.mixer-tab-pane').forEach(x => x.classList.remove('on'))
  const tab = document.querySelector(`.mixer-tab[data-mtab="${tabId}"]`)
  const pane = document.getElementById(tabId)
  if (tab) tab.classList.add('on')
  if (pane) pane.classList.add('on')
  if (tabId === 'bpTab') bpLoad()
  if (tabId === 'knowledgeTab') loadKnowledge('ROADMAP.md', 'knBtnRoadmap')
  if (tabId === 'notesTab') loadNotes()
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if ($('#cmdPalette') && !$('#cmdPalette').hidden) { closeCmdPalette(); return }
    if ($('#shortcutsModal') && !$('#shortcutsModal').hidden) { $('#shortcutsModal').hidden = true; return }
    if ($('#settingsModal') && !$('#settingsModal').hidden) { $('#settingsModal').hidden = true; return }
    if ($('#aboutModal') && !$('#aboutModal').hidden) { $('#aboutModal').hidden = true; return }
    return
  }
  const tag = (e.target.tagName || '').toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (e.metaKey && e.shiftKey && e.key === 'p') { e.preventDefault(); openCmdPalette(); return }
  if (e.key === '?') { if ($('#shortcutsModal')) $('#shortcutsModal').hidden = false; return }
  if (e.key === ' ') { e.preventDefault(); const b = $('#playBtn'); if (b && current) b.click(); return }
  if (e.key === 'k' || e.key === 'K') { const b = $('#killBtn'); if (b && current) b.click(); return }
  if (e.key === 'e' || e.key === 'E') { const b = $('#exportBtn'); if (b && current) b.click(); return }
  if (e.key === 'm' || e.key === 'M') { switchTab('mixTab'); return }
  if (e.key === 'b' || e.key === 'B') { switchTab('bpTab'); return }
  if (e.key === 'n' || e.key === 'N') { switchTab('notesTab'); return }
  if (e.key === 'l' || e.key === 'L') { switchTab('knowledgeTab'); return }
  if (e.key >= '1' && e.key <= '9') {
    const cards = document.querySelectorAll('.rack-item')
    const idx = parseInt(e.key) - 1
    if (cards[idx]) cards[idx].click()
  }
})

// Vertical split divider drag — resizes node graph vs console sections
;(function initSplitDivider() {
  const divider = $('#splitDividerV')
  const top = $('#nodeGraphSection')
  const bottom = $('#consoleSection')
  if (!divider || !top || !bottom) return
  const saved = parseFloat(localStorage.getItem('director:splitVPct'))
  if (saved > 15 && saved < 80) {
    top.style.flex = 'none'
    top.style.height = saved + '%'
  }
  let dragging = false
  divider.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault() })
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return
    const parent = divider.parentElement
    const rect = parent.getBoundingClientRect()
    const pct = ((e.clientY - rect.top) / rect.height) * 100
    if (pct > 15 && pct < 80) {
      top.style.flex = 'none'
      top.style.height = pct + '%'
      if (window.mixerGraph && mixerGraphInited) window.mixerGraph.resize()
    }
  })
  document.addEventListener('mouseup', () => {
    if (dragging) {
      const h = parseFloat(top.style.height)
      if (h) localStorage.setItem('director:splitVPct', h.toFixed(1))
    }
    dragging = false
  })
})()
