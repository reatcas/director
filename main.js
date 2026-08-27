// Copyright (c) 2026 René Antonio Casaña Amaya. All rights reserved.
// Licensed under the AGPL-3.0 License. See LICENSE in repository root.

const { app, BrowserWindow, ipcMain, dialog, protocol, net, shell, Notification } = require('electron')
const { spawn, execFile, execFileSync, spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')

protocol.registerSchemesAsPrivileged([
  { scheme: 'local-img', privileges: { standard: false, supportFetchAPI: true, secure: true, stream: true, bypassCSP: true } }
])

const { ResourceScheduler } = require('./resource-scheduler')
const { ContextProtocol }   = require('./context-protocol')
const { CoordinationProtocol } = require('./coordination-protocol')

const scheduler   = new ResourceScheduler()
const contextProto = new ContextProtocol()
const coordinator  = new CoordinationProtocol()

const store     = () => path.join(app.getPath('userData'), 'repertoire.json')
const aiStateFile = () => path.join(app.getPath('userData'), 'ai-credits.json')
let _orchestraSrc = null
const orchestraSrc = () => _orchestraSrc || (_orchestraSrc = path.join(__dirname, 'resources', 'orchestra'))
const procs   = new Map()
const tailers = new Map()
const resumeTimers   = new Map()   // dir → timer for auto-resume
const metricsSamplers = new Map()  // dir → interval for telemetry sampling
let win

// ─── Log tailing ──────────────────────────────────────────────────────────────
function startTailing(dir, logFile) {
  if (tailers.has(dir)) return
  let pos = 0
  let staleCount = 0 // consecutive polls with no growth and no process
  try { pos = fs.statSync(logFile).size } catch {}
  const iv = setInterval(() => {
    try {
      const stat = fs.statSync(logFile)
      if (stat.size > pos) {
        staleCount = 0
        const buf = Buffer.alloc(Math.min(stat.size - pos, 65536))
        const fd = fs.openSync(logFile, 'r')
        fs.readSync(fd, buf, 0, buf.length, pos)
        fs.closeSync(fd)
        pos += buf.length
        const chunk = buf.toString()
        if (chunk.includes('ALTO') || chunk.includes('▸ ◼')) {
          if (chunk.includes('ALTO')) sendAlert('alto', 'ALTO', `${path.basename(dir)} — sesión detenida`)
        }
        if (win && !win.isDestroyed()) win.webContents.send('orchestra:line', { dir, line: chunk })
      } else {
        // Log not growing — check if process is actually alive
        if (!isRunning(dir)) {
          staleCount++
          // After 15 quiet polls (~12s) with no live process → orphan detected
          if (staleCount >= 15) {
            // Double-check: verify PID in file is actually alive, not just a stale file
            const pidFile = path.join(dir, '.claude/ORCHESTRA_PID')
            let pidStillAlive = false
            try {
              fs.statSync(pidFile)
              try {
                const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim())
                pidStillAlive = pid > 0 && pidAlive(pid)
              } catch {}
            } catch {}
            if (pidStillAlive) {
              staleCount = 0
            } else {
              stopTailing(dir)
              stopMetricsSampling(dir)
              persistLifecycleEvent(dir, 'exit', 'FIN', 'Proceso huérfano detectado — orquesta ya no activa')
              if (win && !win.isDestroyed()) win.webContents.send('orchestra:exit', { dir, code: null })
            }
          }
        } else {
          staleCount = 0
        }
      }
    } catch {}
  }, 800)
  tailers.set(dir, iv)
}

function stopTailing(dir) {
  const iv = tailers.get(dir)
  if (iv) { clearInterval(iv); tailers.delete(dir) }
  stopGitWatcher(dir)
}

// ─── Git commit watcher (real-time progress when stdout is buffered) ─────────
const gitWatchers = new Map()
const gitLastHash = new Map()
const gitLastCommitTime = new Map()

const _gitCommitMtimes = new Map()
function pollGitCommits(dir) {
  const lastHash = gitLastHash.get(dir) || ''
  try {
    const _commitMsgFile = path.join(dir, '.git', 'COMMIT_EDITMSG')
    let _curMtime = 0
    try { _curMtime = fs.statSync(_commitMsgFile).mtimeMs } catch {}
    if (_curMtime && _curMtime === _gitCommitMtimes.get(dir)) return
    _gitCommitMtimes.set(dir, _curMtime)
    const currentHash = execFileSync('git', ['log', '-1', '--format=%H'], { cwd: dir, encoding: 'utf8', timeout: 3000 }).trim()
    if (currentHash && currentHash !== lastHash) {
      const logArgs = lastHash ? ['log', '--oneline', lastHash + '..'] : ['log', '--oneline', '-1']
      const newCommits = execFileSync('git', logArgs, { cwd: dir, encoding: 'utf8', timeout: 5000 }).trim().split('\n').filter(Boolean).slice(0, 100)
      gitLastHash.set(dir, currentHash)
      gitLastCommitTime.set(dir, Date.now())
      for (const c of newCommits) {
        const line = `▸ ✔ [commit] ${c}\n`
        if (win && !win.isDestroyed()) {
          win.webContents.send('orchestra:line', { dir, line })
        }
        persistLifecycleEvent(dir, 'commit', 'COMMIT', c)
      }
    } else {
      if (!gitLastCommitTime.has(dir)) gitLastCommitTime.set(dir, Date.now())
      const lastTime = gitLastCommitTime.get(dir)
      if (Date.now() - lastTime > 20 * 60 * 1000) {
        const mins = Math.floor((Date.now() - lastTime) / 60000)
        sendAlert('stall', 'Estancamiento', `${path.basename(dir)} — ${mins}min sin commits`)
      }
    }
  } catch {}
}

function startGitWatcher(dir) {
  if (gitWatchers.has(dir)) return
  try {
    const hash = execFileSync('git', ['log', '-1', '--format=%H'], { cwd: dir, encoding: 'utf8', timeout: 3000 }).trim()
    gitLastHash.set(dir, hash)
  } catch {}
  const iv = setInterval(() => {
    if (!isRunning(dir)) return
    pollGitCommits(dir)
  }, 8000)
  gitWatchers.set(dir, iv)
}
function stopGitWatcher(dir) {
  const iv = gitWatchers.get(dir)
  if (iv) { clearInterval(iv); gitWatchers.delete(dir) }
  gitLastHash.delete(dir)
  gitLastCommitTime.delete(dir)
}

// ─── Desktop notification alerts ─────────────────────────────────────────────
const _alertConfig = { stall: true, alto: true, usageLimit: true }
const _alertCooldown = new Map()

function sendAlert(type, title, body) {
  if (!_alertConfig[type]) return
  const key = `${type}:${title}`
  const now = Date.now()
  if (_alertCooldown.has(key) && now - _alertCooldown.get(key) < 300000) return
  if (_alertCooldown.size >= 100) { const oldest = _alertCooldown.keys().next().value; _alertCooldown.delete(oldest) }
  _alertCooldown.set(key, now)
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: false }).show()
  }
}

ipcMain.handle('alerts:config', (_e, cfg) => {
  if (cfg && typeof cfg === 'object' && !Array.isArray(cfg)) {
    if (typeof cfg.stall === 'boolean') _alertConfig.stall = cfg.stall
    if (typeof cfg.alto === 'boolean') _alertConfig.alto = cfg.alto
    if (typeof cfg.usageLimit === 'boolean') _alertConfig.usageLimit = cfg.usageLimit
  }
  return { ..._alertConfig }
})

ipcMain.handle('alerts:read', () => ({ ..._alertConfig }))

// ─── JSON helpers ─────────────────────────────────────────────────────────────
const readJSON  = (p, fb) => { try { const _r = JSON.parse(fs.readFileSync(p, 'utf8')); return _r !== null && _r !== undefined ? _r : fb } catch { return fb } }
const writeJSON = (p, o) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = p + '.tmp'
  const _wjSerial = JSON.stringify(o, null, 2)
  if (_wjSerial.length > 67_108_864) throw new Error('writeJSON: payload exceeds 64MB cap')
  fs.writeFileSync(tmp, _wjSerial)
  fs.renameSync(tmp, p)
}

// ─── orchestra.json read cache (2s TTL) ──────────────────────────────────────
const _orchJsonCache = new Map()
function readOrchJson(dir, fb = {}) {
  const now = Date.now()
  const hit = _orchJsonCache.get(dir)
  if (hit && now - hit.ts < 2_000) return hit.data
  const p = path.join(dir, '.claude/orchestra.json')
  let data = fb
  try {
    if (fs.statSync(p).size <= 512_000) {
      const _parsed = readJSON(p, null)
      if (_parsed !== null && typeof _parsed === 'object' && !Array.isArray(_parsed)) {
        data = _parsed
        _orchJsonCache.set(dir, { data, ts: now })
      }
    }
  } catch {}
  return data
}
function _invalidateOrchJson(dir) { _orchJsonCache.delete(dir) }

// ─── PID helpers ──────────────────────────────────────────────────────────────
function pidAlive(pid) {
  try { process.kill(pid, 0); return true } catch { return false }
}
const _isRunningCache = new Map()
function _invalidateIsRunning(dir) { _isRunningCache.delete(dir) }

// Kill the entire process group (bash + claude subprocess).
// detached:true makes the child a process group leader, so -pid kills the group.
function killProcessGroup(pid, signal = 'SIGTERM') {
  try { process.kill(-pid, signal) } catch {}          // group kill
  setTimeout(() => {                                     // escalate after 5s
    try { if (pidAlive(pid)) process.kill(-pid, 'SIGKILL') } catch {}
  }, 5000)
}

let _projectsCache = null
function invalidateProjectsCache() { _projectsCache = null }
function cachedProjects() {
  if (_projectsCache) return _projectsCache
  const _rpPath = store()
  let _rpData = []
  try { if (fs.statSync(_rpPath).size <= 512_000) _rpData = readJSON(_rpPath, []) } catch {}
  if (!Array.isArray(_rpData)) _rpData = []
  _rpData = _rpData.filter(p => p && typeof p.path === 'string')
  _projectsCache = _rpData
  return _projectsCache
}

function isKnownProject(dir) {
  if (!dir || typeof dir !== 'string') return false
  return cachedProjects().some(p => p.path === dir)
}

function isRunning(dir) {
  if (procs.has(dir)) return true
  const now = Date.now()
  const _irHit = _isRunningCache.get(dir)
  if (_irHit && now - _irHit.ts < 1_000) return _irHit.val
  const pidFile = path.join(dir, '.claude/ORCHESTRA_PID')
  let pid = 0
  try { const _irStat = fs.statSync(pidFile); if (_irStat.size <= 64) pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10) } catch { _isRunningCache.set(dir, { val: false, ts: now }); return false }
  const _irVal = !!(pid && pidAlive(pid))
  if (!_irVal) { try { fs.unlinkSync(pidFile) } catch {} }
  _isRunningCache.set(dir, { val: _irVal, ts: now })
  return _irVal
}

// ─── Auto-resume after usage limit ───────────────────────────────────────────
// Watches for USAGE_LIMIT signal file; when it disappears (usage resets),
// automatically re-launches the orchestra without user intervention.
const USAGE_LIMIT_SIGNAL = '.claude/USAGE_LIMIT'

function watchForResume(dir) {
  if (resumeTimers.has(dir)) return
  const signalFile = path.join(dir, USAGE_LIMIT_SIGNAL)
  // poll every 5 minutes (run.sh handles the smart wait now)
  const iv = setInterval(() => {
    let _wrSig = false; try { fs.statSync(signalFile); _wrSig = true } catch {}
    if (!_wrSig) {
      // Usage has reset — auto-resume
      clearInterval(iv)
      resumeTimers.delete(dir)
      if (!isRunning(dir)) {
        playOrchestra(dir, aiState().selected || 'claude')
        if (win && !win.isDestroyed()) win.webContents.send('orchestra:resumed', { dir })
      }
    }
  }, 300_000)
  resumeTimers.set(dir, iv)
}

function stopWatchingResume(dir) {
  const iv = resumeTimers.get(dir)
  if (iv) { clearInterval(iv); resumeTimers.delete(dir) }
}

// ─── Logo detection ───────────────────────────────────────────────────────────
const LOGO_CANDIDATES = [
  'logo.png','logo.svg','logo.jpg','logo.webp',
  'icon.png','icon.svg','icon.jpg',
  'favicon.png','favicon.svg','favicon.ico',
  'public/logo.png','public/logo.svg','public/logo.jpg',
  'public/favicon.png','public/favicon.svg','public/favicon.ico',
  'public/icon.png','public/icon.svg',
  'src/assets/logo.png','src/assets/logo.svg','src/assets/logo.jpg',
  'src/assets/icon.png','src/assets/icon.svg',
  'assets/logo.png','assets/logo.svg','assets/icon.png','assets/icon.svg',
  'resources/icon.png','resources/icon.svg','resources/logo.png',
  'app/assets/images/logo.png','app/assets/images/logo.svg',
]

function scanDirForImage(dir, depth = 0) {
  if (depth > 3) return null
  try {
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f)
      if (/\.(png|svg|jpg|webp|ico)$/i.test(f) && fs.statSync(fp).isFile()) return fp
      if (fs.statSync(fp).isDirectory() && !f.startsWith('.') && f !== 'node_modules') {
        const sub = scanDirForImage(fp, depth + 1)
        if (sub) return sub
      }
    }
  } catch {}
  return null
}

function findLogo(dir) {
  // 1. Check explicit candidates
  for (const c of LOGO_CANDIDATES) {
    const full = path.join(dir, c)
    try { fs.statSync(full); return full } catch {}
  }
  // 2. Check package.json icon/logo field
  try {
    const pkgPath = path.join(dir, 'package.json')
    let pkgStat = null; try { pkgStat = fs.statSync(pkgPath) } catch {}
    const pkg = (pkgStat && pkgStat.size <= 512_000) ? readJSON(pkgPath, null) : null
    if (pkg) {
      for (const field of ['icon', 'logo', 'image']) {
        if (pkg[field] && typeof pkg[field] === 'string') {
          const fp = path.join(dir, pkg[field])
          if (fp.startsWith(dir + path.sep)) { try { fs.statSync(fp); return fp } catch {} }
        }
      }
      if (pkg.build && pkg.build.icon) {
        const fp = path.join(dir, pkg.build.icon)
        if (fp.startsWith(dir + path.sep)) { try { fs.statSync(fp); return fp } catch {} }
      }
    }
  } catch {}
  // 3. Check directories named logo/icon/brand/img/images
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      if (/^(logo|icon|brand|img|images|static)s?$/i.test(entry.name)) {
        const ep = path.join(dir, entry.name)
        const found = scanDirForImage(ep)
        if (found) return found
      }
    }
  } catch {}
  // 4. Check .github directory
  try {
    const ghDir = path.join(dir, '.github')
    let _ghStat = null; try { _ghStat = fs.statSync(ghDir) } catch {}
    if (_ghStat && _ghStat.isDirectory()) {
      const found = scanDirForImage(ghDir)
      if (found) return found
    }
  } catch {}
  // 5. Scan root for any image file
  try {
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f)
      let _flSt = null; try { _flSt = fs.statSync(fp) } catch {}
      if (_flSt && /\.(png|svg|jpg|webp|ico)$/i.test(f) && _flSt.isFile() && _flSt.size < 500000) {
        return fp
      }
    }
  } catch {}
  return null
}

// ─── Logo cache (30s TTL — findLogo does 10+ FS ops per call) ────────────────
const _logoCache = new Map()
function cachedFindLogo(dir) {
  const now = Date.now()
  const hit = _logoCache.get(dir)
  if (hit && now - hit.ts < 30_000) return hit.logo
  const logo = findLogo(dir)
  _logoCache.set(dir, { logo, ts: now })
  return logo
}

// ─── Project info ─────────────────────────────────────────────────────────────
const _piStaticCache = new Map()
function projectInfo(dir) {
  const now = Date.now()
  const _piHit = _piStaticCache.get(dir)
  let installed, version, hasLogs
  if (_piHit && now - _piHit.ts < 30_000) {
    ;({ installed, version, hasLogs } = _piHit)
  } else {
    const _stat = f => { try { fs.statSync(path.join(dir, f)); return true } catch { return false } }
    installed = _stat('run.sh') && _stat('.claude/commands/loop.md')
    const vf = path.join(dir, '.claude/ORCHESTRA_VERSION')
    version = installed ? (() => { try { const st = fs.statSync(vf); return st.size <= 1024 ? (fs.readFileSync(vf, 'utf8').trim() || '1.x') : '1.x' } catch { return '1.x' } })() : null
    hasLogs = _stat('.claude/logs/orchestra-stdout.log') || _stat('.claude/logs/orchestra.log')
    _piStaticCache.set(dir, { installed, version, hasLogs, ts: now })
  }
  const has = f => { try { fs.statSync(path.join(dir, f)); return true } catch { return false } }
  const mixer = readOrchJson(dir, null)
  const running = isRunning(dir)
  const usageLimited = has(USAGE_LIMIT_SIGNAL)
  const alto = has('.claude/ALTO')
  const logo = cachedFindLogo(dir)
  
  const startFile = path.join(dir, '.claude/RUN_STARTED')
  let runStarted = null
  if (running) {
    try {
      const _sfStat = fs.statSync(startFile)
      if (_sfStat.size <= 1024) {
        const startedStr = fs.readFileSync(startFile, 'utf8').trim()
        if (startedStr) runStarted = new Date(startedStr).getTime()
      }
    } catch {}
  }

  return { installed, version: version || (installed ? '1.x' : null), mixer, running, usageLimited, alto, logo, hasLogs, runStarted }
}

// ─── Dir copy ─────────────────────────────────────────────────────────────────
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true })
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name.includes('..') || e.name.includes(path.sep)) continue
    const s = path.join(src, e.name), d = path.join(dst, e.name)
    if (e.isDirectory()) copyDir(s, d)
    else { let _cdEx = false; try { fs.statSync(d); _cdEx = true } catch {}; if (!_cdEx || !['CLAUDE.md', 'settings.json'].includes(e.name)) fs.copyFileSync(s, d) }
    else if (e.name === 'CLAUDE.md') { try { const _cdStat = fs.statSync(s); if (_cdStat.size <= 1_048_576) fs.appendFileSync(d, '\n\n' + fs.readFileSync(s, 'utf8')) } catch {} }
    else if (e.name === 'settings.json') {
      let a = {}, b = {}
      try { if (fs.statSync(d).size <= 512_000) a = readJSON(d, {}) } catch {}
      try { if (fs.statSync(s).size <= 512_000) b = readJSON(s, {}) } catch {}
      a.hooks = a.hooks || {}
      for (const k of Object.keys(b.hooks || {})) a.hooks[k] = [...(a.hooks[k] || []), ...b.hooks[k]]
      const _cdMergeSer = JSON.stringify(a)
      if (_cdMergeSer.length <= 512_000) writeJSON(d, JSON.parse(_cdMergeSer))
    }
  }
}

// ─── Claude API Usage Tracking ──────────────────────────────────────────────
// Tracks cumulative API usage per project session by counting iterations and
// estimating token consumption from iter logs. Resets when a new session starts.
const usageTracker = new Map() // dir → { iterations, tokensEstimated, startedAt, lastCheck }

function getClaudeUsage(dir) {
  let usageLimited = false
  try { fs.statSync(path.join(dir, USAGE_LIMIT_SIGNAL)); usageLimited = true } catch {}
  if (usageLimited) return { percent: 100, status: 'exhausted', iterations: 0, detail: 'Límite alcanzado' }

  const logDir = path.join(dir, '.claude/logs')
  let runStarted = 0
  try { const _rsp = path.join(dir, '.claude/RUN_STARTED'); if (fs.statSync(_rsp).size <= 1024) runStarted = new Date(fs.readFileSync(_rsp, 'utf8').trim()).getTime() } catch {}

  const cached = usageTracker.get(dir)
  const now = Date.now()
  let iterCount, totalBytes

  let _dailyBudget = 1_000_000
  if (cached && cached.runStarted === runStarted && (now - cached.lastScan) < 25_000) {
    iterCount = cached.iterCount
    totalBytes = cached.totalBytes
    _dailyBudget = cached.dailyBudget || 1_000_000
  } else {
    iterCount = 0
    totalBytes = 0
    try {
      const files = fs.readdirSync(logDir, { withFileTypes: true }).filter(e => e.isFile() && e.name.startsWith('iter-') && e.name.endsWith('.log'))
      for (const f of files) {
        try {
          const st = fs.statSync(path.join(logDir, f.name))
          if (runStarted && st.mtimeMs >= runStarted) {
            iterCount++
            totalBytes += st.size
          }
        } catch {}
      }
    } catch {}
    const _guCfg = readOrchJson(dir)
    _dailyBudget = (typeof _guCfg.claudeUsageBudget === 'number' && Number.isFinite(_guCfg.claudeUsageBudget) && _guCfg.claudeUsageBudget > 0) ? _guCfg.claudeUsageBudget : 1_000_000
    usageTracker.set(dir, { runStarted, iterCount, totalBytes, lastScan: now, dailyBudget: _dailyBudget })
  }

  const tokensEstimated = Math.round(totalBytes / 4)
  const dailyBudget = _dailyBudget

  const percent = Math.min(99, Math.round((tokensEstimated / dailyBudget) * 100))
  const status = percent >= 90 ? 'critical' : percent >= 70 ? 'high' : percent >= 40 ? 'mid' : 'normal'
  const estCost = (tokensEstimated * 0.000003).toFixed(3)

  return { percent, status, iterations: iterCount, tokensEstimated, dailyBudget, detail: `${iterCount} iter · ~${tokensEstimated > 999 ? Math.floor(tokensEstimated/1000) + 'K' : tokensEstimated} tok · ~$${estCost}` }
}

// ─── Metrics sampling ────────────────────────────────────────────────────────
function startMetricsSampling(dir) {
  if (metricsSamplers.has(dir)) return
  const iv = setInterval(() => {
    // Sample process resources
    scheduler.sampleProcess(dir)
    // Compute context delta
    const cfg = readOrchJson(dir)
    contextProto.computeDelta(dir, cfg.focus || {})
    // Push metrics to renderer
    if (win) {
      const resourceMetrics = scheduler.getMetrics(dir)
      const contextMetrics  = contextProto.getMetrics(dir)
      if (win && !win.isDestroyed()) {
        const cachedUsage = metricsGet('claude-usage:' + dir)
        win.webContents.send('metrics:update', {
          dir,
          resource: resourceMetrics,
          context:  contextMetrics,
          coordination: coordinator.getStatus(),
          claudeUsage: cachedUsage !== null ? cachedUsage : getClaudeUsage(dir)
        })
      }
    }
  }, 30_000) // Every 30 seconds
  metricsSamplers.set(dir, iv)
}

function stopMetricsSampling(dir) {
  const iv = metricsSamplers.get(dir)
  if (iv) { clearInterval(iv); metricsSamplers.delete(dir) }
  for (const key of _metricsCache.keys()) { if (key.endsWith(':' + dir)) _metricsCache.delete(key) }
}

// ─── Sync protocol files before play ─────────────────────────────────────────
// Always deploy the latest run.sh + protocol files so projects never use stale runners.
// Does NOT touch orchestra.json (user config), state files, or logs.
// Step 1: purge legacy files that could interfere with new directives.
// Step 2: copy fresh protocol files from bundled resources.
const LEGACY_PURGE = [
  // Old skill files that may contain outdated directives
  '.claude/skills/backlog-generator/SKILL.md.bak',
  '.claude/skills/roadmap-sync/SKILL.md.bak',
  '.claude/skills/team-orchestra/SKILL.md.bak',
  '.claude/skills/verification-gate/SKILL.md.bak',
  '.claude/skills/linked-entities/SKILL.md.bak',
  '.claude/skills/ip-protection/SKILL.md.bak',
  '.claude/commands/loop.md.bak',
  'CLAUDE.md.bak',
  'run.sh.bak',
  '.claude/ORCHESTRA_VERSION.bak'
]

function syncProtocol(dir) {
  const src = orchestraSrc()
  // Purge legacy/backup files so old directives never interfere
  for (const f of LEGACY_PURGE) {
    try { fs.unlinkSync(path.join(dir, f)) } catch {}
  }
  // Overwrite all protocol files with the latest version
  for (const f of UPGRADE_FILES) {
    const srcPath = path.join(src, f), dstPath = path.join(dir, f)
    let _ugSrcSt = false; try { fs.statSync(srcPath); _ugSrcSt = true } catch {}
    if (!_ugSrcSt) continue
    try {
      fs.mkdirSync(path.dirname(dstPath), { recursive: true })
      fs.copyFileSync(srcPath, dstPath)
      if (f === 'run.sh') try { fs.chmodSync(dstPath, 0o755) } catch {}
    } catch {}
  }
}

// ─── Hot-reload: watch protocol source and live-sync to running projects ─────
let hotReloadDebounce = null
function startHotReloadWatcher() {
  const src = orchestraSrc()
  try {
    fs.watch(src, { recursive: true }, (eventType, filename) => {
      if (!filename || filename.startsWith('.')) return
      // Debounce — batch rapid changes
      if (hotReloadDebounce) clearTimeout(hotReloadDebounce)
      hotReloadDebounce = setTimeout(() => hotReloadAllProjects(filename), 500)
    })
  } catch {}
}

function hotReloadAllProjects(changedFile) {
  _defaultMixesCache = null
  const projects = cachedProjects()
  let resynced = 0
  for (const p of projects) {
    if (!p.path) continue
    syncProtocol(p.path)
    // Signal running sessions to restart so they pick up the new run.sh
    if (changedFile === 'run.sh' && isRunning(p.path)) {
      try {
        fs.writeFileSync(path.join(p.path, '.claude/HARNESS_RELOAD'), new Date().toISOString())
      } catch {}
    }
    resynced++
  }
  if (resynced > 0 && win && !win.isDestroyed()) {
    win.webContents.send('orchestra:line', { dir: '', line: `[director] Hot-sync: ${resynced} project(s) updated — ${changedFile}\n` })
  }
}

// ─── Play orchestra (extracted for reuse in auto-resume) ─────────────────────
function playOrchestra(dir, agent = 'claude') {
  if (isRunning(dir)) return { ok: false, err: 'already running' }
  // Always sync protocol files (run.sh, CLAUDE.md, skills, etc.) before starting
  syncProtocol(dir)
  const alto = path.join(dir, '.claude/ALTO')
  try { fs.unlinkSync(alto) } catch {}
  // Remove usage limit signal if present
  const usageSignal = path.join(dir, USAGE_LIMIT_SIGNAL)
  try { fs.unlinkSync(usageSignal) } catch {}
  // Ensure shared memory directory exists
  const sharedMem = path.join(require('os').homedir(), '.director-suite', 'shared-memory')
  fs.mkdirSync(sharedMem, { recursive: true })

  // ── Resource allocation from mixer weights ──────────────────────────────
  const cfg = readOrchJson(dir)
  const focus = cfg.focus || {}
  const allocation = scheduler.computeAllocation(dir, focus)

  // Initial context delta (baseline snapshot)
  contextProto.computeDelta(dir, focus)

  const logDir = path.join(dir, '.claude/logs')
  fs.mkdirSync(logDir, { recursive: true })
  const outLog = path.join(logDir, 'orchestra-stdout.log')
  const outFd = fs.openSync(outLog, 'a')
  const errFd = fs.openSync(outLog, 'a')
  const child = spawn('bash', ['run.sh'], {
    cwd: dir, env: { ...process.env, DIRECTOR_AI_AGENT: agent }, detached: true,
    stdio: ['ignore', outFd, errFd]
  })
  child._directorFds = [outFd, errFd]
  fs.writeFileSync(path.join(dir, '.claude/ORCHESTRA_PID'), String(child.pid))

  // ── Apply OS-level resource controls ────────────────────────────────────
  scheduler.applyToProcess(child, allocation)

  // ── Register with coordination protocol ─────────────────────────────────
  coordinator.register(dir, child.pid, allocation)

  snapshotMixer(dir, 'play')
  child.unref()
  procs.set(dir, child)
  // Tail both orchestra.log (tee output) and orchestra-stdout.log (spawn fd).
  // Claude buffers print-mode output, so also watch git log for real-time commit detection.
  const masterLog = path.join(logDir, 'orchestra.log')
  startTailing(dir, masterLog)
  startGitWatcher(dir)

  // ── Start periodic metrics sampling ─────────────────────────────────────
  startMetricsSampling(dir)

  // Write allocation metadata for the orchestra to read
  const telDir = path.join(dir, '.claude', 'telemetry')
  fs.mkdirSync(telDir, { recursive: true })
  const _allocSer = JSON.stringify(allocation)
  if (_allocSer.length <= 262_144) writeJSON(path.join(telDir, 'current-allocation.json'), JSON.parse(_allocSer))

  // ── Focus Directive Injection ──────────────────────────────────────────
  const directivePath = path.join(dir, '.claude', 'PRODUCT_DIRECTIVE.md')
  
  // Sort focus weights descending
  const sortedFocus = Object.entries(focus)
    .filter(([_, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])

  if (sortedFocus.length > 0) {
    const topW = sortedFocus[0][1]
    
    // Only inject strong directives if there is meaningful weight (> 20)
    if (topW >= 20) {
      let lines = [
        '# FOCUS DIRECTIVE — injected by Director at play time',
        'Follow these exact priorities for this cycle based on the Director Mixer:',
        ''
      ]

      sortedFocus.forEach(([key, weight]) => {
        if (weight >= 70) {
          lines.push(`- **${key.toUpperCase()} (CRITICAL - ${weight}%):** Must be the primary focus of this cycle. Do not substitute with other tasks.`)
        } else if (weight >= 40) {
          lines.push(`- **${key.toUpperCase()} (HIGH - ${weight}%):** Should be actively addressed and mixed into the execution.`)
        } else if (weight > 0) {
          lines.push(`- **${key.toUpperCase()} (LOW - ${weight}%):** Address only if opportunistic or blocking other work.`)
        }
      })
      
      const productW = (focus.product || 0)
      if (productW >= 50) {
        lines.push('')
        lines.push('## PRODUCT MODE ACTIVE')
        lines.push(`Minimum ${productW}% of units must be product (new migrations, endpoints, UI components).`)
        lines.push('Each product unit must cite a ROADMAP.md item ID and acceptance criteria.')
        lines.push('Do NOT fill product slots with tests, refactors, or coverage.')
      }

      const qualityW = (focus.quality_tests || 0)
      if (qualityW >= 50) {
        lines.push('')
        lines.push('## QUALITY MODE ACTIVE')
        lines.push(`Minimum ${qualityW}% of units must be tests, coverage, and QA verification.`)
      }

      lines.push('')
      lines.push(`Generated: ${new Date().toISOString()}`)
      
      lines.push('')
      lines.push('## CONTINUOUS EXECUTION DIRECTIVE (INFINITE LOOP)')
      lines.push('You MUST NEVER STOP. Continue developing in an infinite loop until all tasks in the project are 100% completed.')
      lines.push('Do not ask for permission to continue. Automatically proceed to the next item when one is finished.')
      lines.push('Your objective is to NEVER stop working. Follow the mix parameters and keep working without stopping, regardless of the project.')

      lines.push('')
      lines.push('## ⚠️ ANTI-HALLUCINATION & AUDIT RULES (MANDATORY)')
      lines.push('YOUR COMMITS ARE VERIFIED EXTERNALLY. The harness checks `git log` before/after your session.')
      lines.push('If HEAD has not changed, your ENTIRE session is marked FAILURE regardless of output.')
      lines.push('1. **NO FAKE COMMITS**: NEVER type/generate a commit hash. Read it from `git log` output after a real `git commit`. Fabricating hashes = immediate detection + backoff penalty.')
      lines.push('2. **NO FAKE TESTS**: Tests MUST verify real logic (200/201 responses, DB persistence). Error-only tests are NOT product work.')
      lines.push('3. **NO FAKE LOGS**: Do NOT print `▸ ✔` or `▸ ◼` lines unless a real tool-executed commit preceded them.')
      lines.push('4. **BLOCKED = IMPROVEMENT MODE**: If all ROADMAP items are blocked, switch to IMPROVEMENT MODE: review existing modules, forms, UI, API handlers, tests, and make real code improvements. Distribute work following the mixer weights. Write new items to ROADMAP.md under ## Improvements.')
      lines.push('5. After ' + '5 consecutive zero-commit sessions, the harness will STOP you permanently and flag PENDING.md.')
      lines.push('6. **NEVER STOP**: If ROADMAP is empty, scan the codebase and find improvements. A senior developer always finds work to do.')
      
      try {
        let existing = ''
        try { const _ds = fs.statSync(directivePath); if (_ds.size > 0 && _ds.size <= 512_000) existing = fs.readFileSync(directivePath, 'utf8') } catch {}
        if (existing.includes('## NEXT ITEM')) {
          const lastIdx = existing.lastIndexOf('## NEXT ITEM')
          lines.push('')
          lines.push(existing.substring(lastIdx))
        }
        fs.writeFileSync(directivePath, lines.join('\n'))
      } catch {}
    } else {
      try {
        let existing = ''
        try { const _ds2 = fs.statSync(directivePath); if (_ds2.size > 0 && _ds2.size <= 512_000) existing = fs.readFileSync(directivePath, 'utf8') } catch {}
        if (existing.includes('## NEXT ITEM')) {
          const lastIdx = existing.lastIndexOf('## NEXT ITEM')
          fs.writeFileSync(directivePath, existing.substring(lastIdx))
        } else {
          fs.unlinkSync(directivePath)
        }
      } catch {}
    }
  } else {
    try {
      let existing = ''
      try { const _ds3 = fs.statSync(directivePath); if (_ds3.size > 0 && _ds3.size <= 512_000) existing = fs.readFileSync(directivePath, 'utf8') } catch {}
      if (existing.includes('## NEXT ITEM')) {
        const lastIdx = existing.lastIndexOf('## NEXT ITEM')
        fs.writeFileSync(directivePath, existing.substring(lastIdx))
      } else {
        fs.unlinkSync(directivePath)
      }
    } catch {}
  }

  child.on('exit', code => {
    if (child._directorFds) {
      for (const fd of child._directorFds) { try { fs.closeSync(fd) } catch {} }
    }
    snapshotMixer(dir, 'exit')
    procs.delete(dir)
    _invalidateIsRunning(dir)
    pollGitCommits(dir)
    stopTailing(dir)
    stopMetricsSampling(dir)

    // Final telemetry persistence
    scheduler.persistTelemetry(dir)
    scheduler.cleanup(dir)
    coordinator.unregister(dir)
    usageTracker.delete(dir)

    try { fs.unlinkSync(path.join(dir, '.claude/ORCHESTRA_PID')) } catch {}
    // Check if exited due to usage limit — start watching for resume
    const usageSig = path.join(dir, USAGE_LIMIT_SIGNAL)
    let _useSigExists = false; try { fs.statSync(usageSig); _useSigExists = true } catch {}
    if (_useSigExists) {
      const state = aiState()
      state[agent].credits = 0
      const nextAgent = nextAvailableAi(state, agent)
      const _aisUsageSer = JSON.stringify(state)
      if (_aisUsageSer.length <= 262_144) { writeJSON(aiStateFile(), JSON.parse(_aisUsageSer)); invalidateAiStateCache() }
      if (nextAgent) {
        try { fs.unlinkSync(usageSig) } catch {}
        persistLifecycleEvent(dir, 'usage_limit', 'SWITCH', `${state[agent].label} sin créditos — cambiando a ${state[nextAgent].label}`)
        setTimeout(() => {
          if (!isRunning(dir)) {
            const cfgPath = path.join(dir, '.claude/orchestra.json')
            try {
              let cfg = {}
              try { if (fs.statSync(cfgPath).size <= 512_000) cfg = readJSON(cfgPath, {}) } catch {}
              cfg.agent = nextAgent
              if (AI_DEFAULTS[nextAgent]?.defaultModel) cfg.model = AI_DEFAULTS[nextAgent].defaultModel
              const _asCfgSer = JSON.stringify(cfg)
              if (_asCfgSer.length <= 512_000) writeJSON(cfgPath, JSON.parse(_asCfgSer))
            } catch {}
            try {
              playOrchestra(dir, nextAgent)
              if (win && !win.isDestroyed()) win.webContents.send('orchestra:resumed', { dir, agent: nextAgent })
            } catch (err) {
              persistLifecycleEvent(dir, 'error', 'CRASH', `Auto-restart falló al cambiar agente: ${err.message}`)
              if (win && !win.isDestroyed()) win.webContents.send('orchestra:exit', { dir, code: 1 })
            }
          }
        }, 500)
      } else {
        persistLifecycleEvent(dir, 'usage_limit', 'PAUSA', 'Sin créditos disponibles — esperando restablecimiento')
        sendAlert('usageLimit', 'Límite de uso', `${path.basename(dir)} — sin créditos disponibles`)
        watchForResume(dir)
        if (win && !win.isDestroyed()) win.webContents.send('orchestra:usage_limit', { dir })
      }
    } else {
      persistLifecycleEvent(dir, 'exit', 'FIN', `Interpretación finalizada (código ${code})`)
      try {
        const roadmapPath = path.join(dir, 'ROADMAP.md')
        let _rmStat = null; try { _rmStat = fs.statSync(roadmapPath) } catch {}
        if (_rmStat && _rmStat.size <= 1_048_576) {
          const lines = fs.readFileSync(roadmapPath, 'utf8').split('\n')
          const nextItem = lines.find(l => l.trim().startsWith('- [ ]'))
          if (nextItem) {
            persistLifecycleEvent(dir, 'directive', 'DIRECTOR', `Siguiente item indicado: ${nextItem}`)
            const directivePath = path.join(dir, '.claude', 'PRODUCT_DIRECTIVE.md')
            let content = ''
            try { const _dse = fs.statSync(directivePath); if (_dse.size > 0 && _dse.size <= 512_000) content = fs.readFileSync(directivePath, 'utf8') } catch {}
            const nextIdx = content.indexOf('## NEXT ITEM')
            if (nextIdx !== -1) content = content.substring(0, nextIdx).trimEnd()
            content += `\n\n## NEXT ITEM\nEl proceso ha parado. Tu siguiente objetivo es:\n${nextItem}\n`
            fs.writeFileSync(directivePath, content)
          }
        }
      } catch (err) {}

      const altoPath = path.join(dir, '.claude', 'ALTO')
      let _altoExists = false; try { fs.statSync(altoPath); _altoExists = true } catch {}
      if (!_altoExists) {
        persistLifecycleEvent(dir, 'auto_resume', 'LOOP', 'Reiniciando orquesta automáticamente (infinite loop)')
        setTimeout(() => {
          if (!isRunning(dir)) {
            try {
              playOrchestra(dir, agent)
              if (win && !win.isDestroyed()) win.webContents.send('orchestra:resumed', { dir, agent })
            } catch (err) {
              persistLifecycleEvent(dir, 'error', 'CRASH', `Auto-restart falló: ${err.message}`)
              if (win && !win.isDestroyed()) win.webContents.send('orchestra:exit', { dir, code: 1 })
            }
          }
        }, 3000)
      }
    }
    if (win && !win.isDestroyed()) win.webContents.send('orchestra:exit', { dir, code })
  })

  return { ok: true, allocation }
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────
ipcMain.handle('repertoire:list', () => {
  return cachedProjects().map(p => ({ ...p, ...projectInfo(p.path) }))
})

ipcMain.handle('repertoire:add', async (_e, droppedPath) => {
  if (droppedPath !== undefined && droppedPath !== null && typeof droppedPath !== 'string') return null
  if (droppedPath && (droppedPath.length > 4096 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(droppedPath) || !path.isAbsolute(droppedPath))) return null
  let dir = droppedPath
  if (!dir) {
    const r = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
    if (r.canceled) return null
    dir = r.filePaths[0]
  }
  try { if (!fs.statSync(dir).isDirectory()) dir = path.dirname(dir) } catch {}
  let projects = []
  try { if (fs.statSync(store()).size <= 512_000) projects = readJSON(store(), []) } catch {}
  if (!projects.find(p => p.path === dir)) {
    projects.push({ id: Date.now().toString(36), name: path.basename(dir), path: dir, added: new Date().toISOString() })
    const _rapSer = JSON.stringify(projects)
    if (_rapSer.length <= 512_000) writeJSON(store(), JSON.parse(_rapSer))
    invalidateProjectsCache()
  }
  return dir
})

ipcMain.handle('repertoire:remove', (_e, dir) => {
  if (typeof dir !== 'string') return false
  let _rrProjects = []
  try { if (fs.statSync(store()).size <= 512_000) _rrProjects = readJSON(store(), []) } catch {}
  const _rrSer = JSON.stringify(_rrProjects.filter(p => p.path !== dir))
  if (_rrSer.length <= 512_000) writeJSON(store(), JSON.parse(_rrSer))
  invalidateProjectsCache()
  stopTailing(dir)
  stopMetricsSampling(dir)
  stopWatchingResume(dir)
  // Evict any cached metrics for removed project
  for (const key of _metricsCache.keys()) { if (key.endsWith(':' + dir)) _metricsCache.delete(key) }
  usageTracker.delete(dir)
  _readinessCache.delete(dir)
  _orchJsonCache.delete(dir)
  _logoCache.delete(dir)
  _piStaticCache.delete(dir)
  _invalidateIsRunning(dir)
  _complianceMtimeCache.delete(dir)
  _worstComplianceCache.delete(dir)
  // Clear lifecycle dir ready flag so mkdirSync runs fresh if re-added
  const lcLogDir = path.join(dir, '.claude', 'logs')
  _lifecycleDirReady.delete(lcLogDir)
  return true
})

ipcMain.handle('repertoire:open', (_e, dir) => {
  let _roDirExists = false; try { fs.statSync(dir); _roDirExists = true } catch {}
  if (isKnownProject(dir) && _roDirExists) {
    shell.openPath(dir)
    return true
  }
  return false
})

const _BLOCKED_FILE_EXT = new Set(['.env', '.key', '.pem', '.cert', '.p12', '.pfx', '.secret', '.db', '.sqlite', '.sqlite3', '.db3'])
const _BLOCKED_FILE_NAME = new Set(['.env', 'id_rsa', 'id_ed25519', 'id_ecdsa', 'id_dsa', '.htpasswd', '.npmrc', '.yarnrc', '.netrc'])
ipcMain.handle('repertoire:readFile', (_e, dir, subpath) => {
  if (!isKnownProject(dir) || typeof subpath !== 'string' || !subpath.trim()) return null
  if (subpath.length > 4096 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(subpath)) return null
  const p = path.resolve(dir, subpath)
  if (!p.startsWith(dir + path.sep) && p !== dir) return null
  const base = path.basename(p)
  const ext = path.extname(p).toLowerCase()
  if (_BLOCKED_FILE_EXT.has(ext) || _BLOCKED_FILE_NAME.has(base)) return null
  try {
    const stat = fs.statSync(p)
    if (!stat.isFile()) return null
    if (stat.size > 2_097_152) return null
    return fs.readFileSync(p, 'utf8')
  } catch {
    return null
  }
})

ipcMain.handle('orchestra:install', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  copyDir(orchestraSrc(), dir)
  try { fs.chmodSync(path.join(dir, 'run.sh'), 0o755) } catch {}
  const hooks = path.join(dir, '.claude/hooks')
  let _hkSt = false; try { fs.statSync(hooks); _hkSt = true } catch {}
  if (_hkSt) for (const f of fs.readdirSync(hooks)) { try { fs.chmodSync(path.join(hooks, f), 0o755) } catch {} }
  _piStaticCache.delete(dir)
  return projectInfo(dir)
})

const AI_DEFAULTS = {
  claude: { label: 'Claude (Anthropic)', credits: 100, resetAt: null, vendor: 'anthropic', models: [{id: 'claude-fable-5', label: 'Claude Fable 5'}, {id: 'claude-opus-5', label: 'Claude Opus 5'}, {id: 'claude-sonnet-5', label: 'Claude Sonnet 5'}, {id: 'claude-opus-4-6', label: 'Claude Opus 4.6'}, {id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6'}, {id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5'}], defaultModel: 'claude-sonnet-4-6' },
  agy: { label: 'Antigravity', credits: 100, resetAt: null, vendor: 'antigravity', models: [{id: 'Gemini 3.1 Pro (High)', label: 'Gemini 3.1 Pro'}, {id: 'Gemini 3.7 Flash (High)', label: 'Gemini 3.7 Flash'}, {id: 'Claude Sonnet 4.6 (Thinking)', label: 'Claude 4.6 via AGY'}], defaultModel: 'Gemini 3.7 Flash (High)' },
  codex: { label: 'Codex (OpenAI)', credits: 100, resetAt: null, vendor: 'openai', models: [{id: 'default', label: 'Codex'}], defaultModel: 'default' },
  aider: { label: 'Aider (Multi)', credits: 100, resetAt: null, vendor: 'aider', models: [{id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6'}, {id: 'gpt-4o', label: 'GPT-4o'}, {id: 'gemini/gemini-2.5-pro', label: 'Gemini 2.5 Pro'}, {id: 'deepseek/deepseek-coder', label: 'DeepSeek Coder'}], defaultModel: 'claude-sonnet-4-6' }
}
function nextAvailableAi(state, currentAgent) {
  const providers = Object.keys(AI_DEFAULTS)
  const idx = providers.indexOf(currentAgent)
  const start = idx >= 0 ? idx : -1
  for (let offset = 1; offset <= providers.length; offset++) {
    const candidate = providers[(start + offset + providers.length) % providers.length]
    if (state[candidate] && state[candidate].credits > 0) return candidate
  }
  return null
}
function nextReset() {
  const time = new Date()
  time.setHours(14, 30, 0, 0)
  if (time <= new Date()) time.setDate(time.getDate() + 1)
  return time.toISOString()
}
let _aiStateCache = null
let _aiStateCacheTs = 0
const _AI_STATE_TTL = 5_000
function invalidateAiStateCache() { _aiStateCache = null; _aiStateCacheTs = 0 }
function aiState() {
  const now = Date.now()
  if (_aiStateCache && now - _aiStateCacheTs < _AI_STATE_TTL) return _aiStateCache
  const _asPath = aiStateFile()
  let state = {}
  try { if (fs.statSync(_asPath).size <= 512_000) state = readJSON(_asPath, {}) } catch {}
  let dirty = false
  for (const [id, defaults] of Object.entries(AI_DEFAULTS)) {
    const existingReset = state[id]?.resetAt
    const newReset = existingReset === undefined ? defaults.resetAt : existingReset
    const prev = JSON.stringify(state[id])
    state[id] = { ...defaults, ...state[id], resetAt: newReset }
    state[id].models = defaults.models
    state[id].defaultModel = defaults.defaultModel
    if (state[id].resetAt && new Date(state[id].resetAt) <= new Date()) {
      state[id].credits = 100
      state[id].resetAt = nextReset()
      dirty = true
    }
    if (!dirty && JSON.stringify(state[id]) !== prev) dirty = true
  }
  if (dirty) { const _aisDirtySer = JSON.stringify(state); if (_aisDirtySer.length <= 262_144) { writeJSON(aiStateFile(), JSON.parse(_aisDirtySer)); invalidateAiStateCache() }; return state }
  _aiStateCache = state
  _aiStateCacheTs = now
  return state
}
ipcMain.handle('ai:credits', () => aiState())
ipcMain.handle('ai:select', (_e, id) => {
  if (typeof id !== 'string' || !Object.keys(AI_DEFAULTS).includes(id)) return { ok: false, error: 'Unknown AI' }
  const state = aiState()
  if (!state[id]) return { ok: false, error: 'Unknown AI' }
  state.selected = id
  const _aiSSer = JSON.stringify(state)
  if (_aiSSer.length <= 262_144) { writeJSON(aiStateFile(), JSON.parse(_aiSSer)); invalidateAiStateCache() }
  return { ok: true }
})

// ─── AI Auth: status check & login ──────────────────────────────────────────

function runCmd(cmd, args, timeout = 5000) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout })
  return (r.stdout || '') + (r.stderr || '')
}

ipcMain.handle('ai:auth-status', (_e, id) => {
  if (typeof id !== 'string' || !Object.keys(AI_DEFAULTS).includes(id)) return { loggedIn: false }
  try {
    if (id === 'claude') {
      const out = runCmd('claude', ['auth', 'status'])
      const logged = out.includes('"loggedIn": true') || out.includes('"loggedIn":true')
      const email = (out.match(/"email":\s*"([^"]+)"/) || [])[1] || null
      return { loggedIn: logged, email }
    }
    if (id === 'codex') {
      const out = runCmd('codex', ['login', 'status'])
      const logged = out.includes('Logged in')
      return { loggedIn: logged }
    }
    if (id === 'agy') {
      try { runCmd('agy', ['--help'], 3000); return { loggedIn: true } } catch { return { loggedIn: false } }
    }
    if (id === 'aider') {
      const hasKey = !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
      return { loggedIn: hasKey, note: hasKey ? 'API key found' : 'Set OPENAI_API_KEY or ANTHROPIC_API_KEY' }
    }
    return { loggedIn: false }
  } catch {
    return { loggedIn: false }
  }
})

ipcMain.handle('ai:login', (_e, id) => {
  if (typeof id !== 'string' || !Object.keys(AI_DEFAULTS).includes(id)) return { ok: false, msg: 'Unknown provider' }
  try {
    if (id === 'claude') {
      execFile('claude', ['auth', 'login'], { timeout: 120000 })
      return { ok: true, msg: 'Claude login opened in browser' }
    }
    if (id === 'codex') {
      execFile('codex', ['login'], { timeout: 120000 })
      return { ok: true, msg: 'Codex login opened in browser' }
    }
    if (id === 'aider') {
      return { ok: false, msg: 'Aider uses API keys. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your shell profile.' }
    }
    if (id === 'agy') {
      execFile('agy', [], { timeout: 120000 })
      return { ok: true, msg: 'Antigravity session started — authenticate in the opened window' }
    }
    return { ok: false, msg: 'Unknown provider' }
  } catch (e) {
    return { ok: false, msg: e.message }
  }
})

ipcMain.handle('orchestra:play', (_e, dir, agent) => {
  if (!isKnownProject(dir)) return { ok: false, err: 'Unknown project' }
  if (typeof agent !== 'string' || !Object.keys(AI_DEFAULTS).includes(agent)) return { ok: false, err: 'Select an AI developer first' }
  const state = aiState()
  if (!state[agent]) return { ok: false, err: 'Select an AI developer first' }
  _metricsCache.delete('claude-usage:' + dir)
  _piStaticCache.delete(dir)
  _invalidateIsRunning(dir)
  persistLifecycleEvent(dir, 'play', 'BATUTA', 'Orden de interpretar')
  const _playResult = playOrchestra(dir, agent)
  if (_playResult.ok) {
    state.selected = agent
    state[agent].credits = Math.max(0, state[agent].credits - 1)
    const _aisPlaySer = JSON.stringify(state)
    if (_aisPlaySer.length <= 262_144) { writeJSON(aiStateFile(), JSON.parse(_aisPlaySer)); invalidateAiStateCache() }
  }
  return _playResult
})

ipcMain.handle('orchestra:fine', (_e, dir) => {
  if (!isKnownProject(dir)) return { ok: false }
  snapshotMixer(dir, 'fine')
  fs.writeFileSync(path.join(dir, '.claude/ALTO'), '')
  _metricsCache.delete('claude-usage:' + dir)
  _invalidateIsRunning(dir)
  stopWatchingResume(dir)
  persistLifecycleEvent(dir, 'fine', 'FINE', 'Cerrando último compás')
  // Safety net: if the process is still alive after 90s, escalate to group kill
  const c = procs.get(dir)
  if (c) {
    setTimeout(() => {
      if (procs.has(dir)) {
        killProcessGroup(c.pid)
        persistLifecycleEvent(dir, 'kill', 'CORTE', 'Timeout FINE 90s — forzando terminación')
      }
    }, 90_000)
  }
  return { ok: true }
})

ipcMain.handle('orchestra:kill', (_e, dir) => {
  if (!isKnownProject(dir)) return { ok: false }
  // Write ALTO first so any surviving subprocess exits cleanly
  try { fs.writeFileSync(path.join(dir, '.claude/ALTO'), '') } catch {}
  const c = procs.get(dir)
  if (c) {
    killProcessGroup(c.pid)
  } else {
    const pidFile = path.join(dir, '.claude/ORCHESTRA_PID')
    try {
      const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10)
      if (pid) killProcessGroup(pid)
    } catch {}
  }
  _metricsCache.delete('claude-usage:' + dir)
  _invalidateIsRunning(dir)
  stopTailing(dir)
  stopWatchingResume(dir)
  stopMetricsSampling(dir)
  scheduler.persistTelemetry(dir)
  scheduler.cleanup(dir)
  coordinator.unregister(dir)
  persistLifecycleEvent(dir, 'kill', 'CORTE', 'Señal de terminación enviada')
  procs.delete(dir)
  try { fs.unlinkSync(path.join(dir, '.claude/ORCHESTRA_PID')) } catch {}
  return { ok: true }
})

ipcMain.handle('orchestra:hotReload', (_e) => {
  hotReloadAllProjects('manual-trigger')
  return { ok: true }
})

ipcMain.handle('orchestra:clearLog', (_e, dir) => {
  if (!isKnownProject(dir)) return
  const stdoutLog = path.join(dir, '.claude/logs/orchestra-stdout.log')
  const masterLog = path.join(dir, '.claude/logs/orchestra.log')
  try { fs.writeFileSync(stdoutLog, '') } catch {}
  try { fs.writeFileSync(masterLog, '') } catch {}
  // Prune analysis-*.txt files: keep only the 5 most recent
  try {
    const claudeDir = path.join(dir, '.claude')
    const files = fs.readdirSync(claudeDir).filter(f => f.startsWith('analysis-') && f.endsWith('.txt'))
    if (files.length > 5) {
      files.sort()
      files.slice(0, files.length - 5).forEach(f => { try { fs.unlinkSync(path.join(claudeDir, f)) } catch {} })
    }
  } catch {}
  // Prune lifecycle events older than 90 days
  try {
    const lcFile = path.join(dir, '.claude', 'logs', 'lifecycle-events.json')
    const _lcClearCutoffISO = _lcCutoff()
    let events = []
    try { if (fs.statSync(lcFile).size <= 2_097_152) events = readJSON(lcFile, []) } catch {}
    let pruned = events.filter(e => typeof e.ts === 'string' && e.ts >= _lcClearCutoffISO)
    if (pruned.length > 300) pruned = pruned.slice(-300)
    const _prSer = JSON.stringify(pruned)
    if (pruned.length < events.length && _prSer.length <= 2_097_152) writeJSON(lcFile, pruned)
  } catch {}
  // Prune iter-*.log files: keep only newest 200
  try {
    const logDir = path.join(dir, '.claude', 'logs')
    const iterLogs = fs.readdirSync(logDir).filter(f => f.startsWith('iter-') && f.endsWith('.log'))
    if (iterLogs.length > 200) {
      iterLogs.sort()
      iterLogs.slice(0, iterLogs.length - 200).forEach(f => { try { fs.unlinkSync(path.join(logDir, f)) } catch {} })
    }
  } catch {}
  // Cap context-metrics telemetry at 300 entries (matches context-protocol.js cap)
  try {
    const ctxFile = path.join(dir, '.claude', 'telemetry', 'context-metrics.json')
    let hist = []
    try { if (fs.statSync(ctxFile).size <= 1_048_576) hist = readJSON(ctxFile, []) } catch {}
    if (hist.length > 300) { const _ctxTrimSer = JSON.stringify(hist.slice(-300)); if (_ctxTrimSer.length <= 1_048_576) writeJSON(ctxFile, JSON.parse(_ctxTrimSer)) }
  } catch {}
  // Cap coordination-metrics telemetry at 100 entries on log clear
  try {
    const coordFile = path.join(dir, '.claude', 'telemetry', 'coordination-metrics.json')
    let coordHist = []
    try { if (fs.statSync(coordFile).size <= 1_048_576) coordHist = readJSON(coordFile, []) } catch {}
    if (Array.isArray(coordHist) && coordHist.length > 100) { const _coTrimSer = JSON.stringify(coordHist.slice(-100)); if (_coTrimSer.length <= 1_048_576) writeJSON(coordFile, JSON.parse(_coTrimSer)) }
  } catch {}
})

ipcMain.handle('orchestra:tail', (_e, dir, lines) => {
  if (!isKnownProject(dir)) return ''
  const _tailLines = Number.isInteger(lines) && lines > 0 && lines <= 1000 ? lines : 400
  const log = path.join(dir, '.claude/logs/orchestra.log')
  try {
    const stat = fs.statSync(log)
    if (stat.size > 10_485_760) return ''
    const readSize = Math.min(stat.size, _tailLines * 200)
    const buf = Buffer.alloc(readSize)
    const fd = fs.openSync(log, 'r')
    fs.readSync(fd, buf, 0, readSize, stat.size - readSize)
    fs.closeSync(fd)
    const s = buf.toString('utf8')
    const nl = s.indexOf('\n')
    const trimmed = stat.size > readSize && nl >= 0 ? s.slice(nl + 1) : s
    return trimmed.split('\n').map(l => l.length > 4096 ? l.slice(0, 4096) : l).slice(-_tailLines).join('\n')
  } catch { return '' }
})

// ─── Mixer snapshot ───────────────────────────────────────────────────────────
let _smCutoffISO = '', _smCutoffAt = 0
function _smCutoff() {
  const now = Date.now()
  if (now - _smCutoffAt > 60_000) { _smCutoffISO = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(); _smCutoffAt = now }
  return _smCutoffISO
}
function snapshotMixer(dir, event) {
  if (!dir) return
  const cfg = readOrchJson(dir, null)
  if (!cfg || !cfg.focus) return
  const histFile = path.join(dir, '.claude/mixer-history.json')
  const cutoffISO = _smCutoff()
  let hist = []
  try { if (fs.statSync(histFile).size <= 512_000) hist = readJSON(histFile, []) } catch {}
  if (!Array.isArray(hist)) hist = []
  hist = hist.filter(h => typeof h.ts === 'string' && h.ts >= cutoffISO)
  const _ssEvent = typeof event === 'string' ? event.slice(0, 64) : 'unknown'
  const _ssFocus = Object.fromEntries(Object.entries(cfg.focus).filter(([, v]) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100))
  const _ssLast = hist.length > 0 ? hist[hist.length - 1] : null
  const _sortedJson = o => JSON.stringify(Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]])))
  if (_ssLast && _ssLast.event === _ssEvent && _sortedJson(_ssLast.focus) === _sortedJson(_ssFocus)) return
  hist.push({ ts: new Date().toISOString(), event: _ssEvent, focus: _ssFocus })
  if (hist.length > 100) hist.splice(0, hist.length - 100)
  const _mhSer = JSON.stringify(hist)
  if (_mhSer.length <= 512_000) writeJSON(histFile, hist)
}

ipcMain.handle('mixer:read',  (_e, dir) => {
  if (!isKnownProject(dir)) return null
  let cfg = readOrchJson(dir, null)
  if (cfg && cfg.focus && typeof cfg.focus === 'object') {
    const _mrFocus = {}
    for (const k of Object.keys(cfg.focus)) { if (_VALID_CATS.has(k) && Number.isFinite(cfg.focus[k])) _mrFocus[k] = cfg.focus[k] }
    cfg = { ...cfg, focus: _mrFocus }
  }
  return cfg
})
const _VALID_CATS = new Set(['product','backend','frontend','business_logic','security','quality_tests','devops_infra','performance','data_db','i18n','ux_accessibility'])
ipcMain.handle('mixer:write', (_e, dir, focus) => {
  if (!isKnownProject(dir)) return false
  if (!focus || typeof focus !== 'object' || Array.isArray(focus)) return false
  if (Object.keys(focus).some(k => !_VALID_CATS.has(k))) return false
  if (Object.values(focus).some(v => typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 100)) return false
  const p = path.join(dir, '.claude/orchestra.json')
  let cfg = { version: '2.0.0' }
  try { if (fs.statSync(p).size <= 512_000) cfg = readJSON(p, { version: '2.0.0' }) } catch {}
  cfg.focus = focus
  const _mwSer = JSON.stringify(cfg)
  if (_mwSer.length <= 512_000) writeJSON(p, JSON.parse(_mwSer))
  coordinator.invalidateConflictCache()
  _metricsCache.delete('allocation:' + dir)
  _metricsCache.delete('resource:' + dir)
  _invalidateOrchJson(dir)
  return true
})

ipcMain.handle('orchestra:writeConfig', (_e, dir, cfg) => {
  if (!isKnownProject(dir)) return false
  if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) return false
  const _allowedKeys = new Set(['version', 'focus', 'agent', 'model', 'claudeUsageBudget', 'nice', 'mode', 'maxIterations', 'caveman', 'modelComplex', 'compactAt', 'quietFlags', 'smartMix', 'smartModel', 'modelFast', 'architectInterval', 'autoSwitch', 'keepLogs', 'maxHallucinationStreak'])
  if (!Object.keys(cfg).every(k => _allowedKeys.has(k))) return false
  if (cfg.version !== undefined && (typeof cfg.version !== 'string' || cfg.version.length > 64 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(cfg.version))) return false
  if (cfg.agent !== undefined && !Object.keys(AI_DEFAULTS).includes(cfg.agent)) return false
  if (cfg.model !== undefined && (typeof cfg.model !== 'string' || cfg.model.length > 256 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(cfg.model))) return false
  if (cfg.nice !== undefined && (!Number.isInteger(cfg.nice) || cfg.nice < -20 || cfg.nice > 19)) return false
  if (cfg.claudeUsageBudget !== undefined && (typeof cfg.claudeUsageBudget !== 'number' || !Number.isFinite(cfg.claudeUsageBudget) || cfg.claudeUsageBudget < 0 || cfg.claudeUsageBudget > 100_000_000_000)) return false
  if (cfg.mode !== undefined && (typeof cfg.mode !== 'string' || !['improvement', 'product', 'auto', 'perpetual'].includes(cfg.mode))) return false
  if (cfg.maxIterations !== undefined && (!Number.isInteger(cfg.maxIterations) || cfg.maxIterations < 0 || cfg.maxIterations > 10000)) return false
  if (cfg.caveman !== undefined && typeof cfg.caveman !== 'boolean') return false
  if (cfg.modelComplex !== undefined && (typeof cfg.modelComplex !== 'string' || cfg.modelComplex.length > 256 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(cfg.modelComplex))) return false
  if (cfg.compactAt !== undefined && (typeof cfg.compactAt !== 'number' || !Number.isFinite(cfg.compactAt) || cfg.compactAt < 0 || cfg.compactAt > 100)) return false
  if (cfg.quietFlags !== undefined && (typeof cfg.quietFlags !== 'string' || cfg.quietFlags.length > 256 || /[^-a-zA-Z0-9 =./]/.test(cfg.quietFlags))) return false
  if (cfg.smartMix !== undefined && typeof cfg.smartMix !== 'boolean') return false
  if (cfg.smartModel !== undefined && (typeof cfg.smartModel !== 'string' || cfg.smartModel.length > 256 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(cfg.smartModel))) return false
  if (cfg.modelFast !== undefined && (typeof cfg.modelFast !== 'string' || cfg.modelFast.length > 256 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(cfg.modelFast))) return false
  if (cfg.architectInterval !== undefined && (!Number.isInteger(cfg.architectInterval) || cfg.architectInterval < 1 || cfg.architectInterval > 1000)) return false
  if (cfg.autoSwitch !== undefined && typeof cfg.autoSwitch !== 'boolean') return false
  if (cfg.keepLogs !== undefined && (!Number.isInteger(cfg.keepLogs) || cfg.keepLogs < 0 || cfg.keepLogs > 500)) return false
  if (cfg.maxHallucinationStreak !== undefined && (!Number.isInteger(cfg.maxHallucinationStreak) || cfg.maxHallucinationStreak < 1 || cfg.maxHallucinationStreak > 100)) return false
  const serialized = JSON.stringify(cfg)
  if (serialized.length > 65_536) return false
  if (cfg.focus && typeof cfg.focus === 'object') {
    if (Object.keys(cfg.focus).some(k => !_VALID_CATS.has(k))) return false
    const weights = Object.values(cfg.focus)
    if (!weights.every(w => typeof w === 'number' && w >= 0 && w <= 100)) return false
  }
  const p = path.join(dir, '.claude/orchestra.json')
  writeJSON(p, JSON.parse(serialized))
  _invalidateOrchJson(dir)
  if (cfg.focus) { _metricsCache.delete('allocation:' + dir); _metricsCache.delete('resource:' + dir) }
  return true
})

// ─── Saved mixes (named snapshots) ───────────────────────────────────────────
let _defaultMixesCache = null
ipcMain.handle('mixer:saved:list', (_e, dir) => {
  if (!isKnownProject(dir)) return []
  const p = path.join(dir, '.claude/saved-mixes.json')
  let userMixes = []
  try { if (fs.statSync(p).size <= 512_000) userMixes = readJSON(p, []) } catch {}
  if (!Array.isArray(userMixes)) userMixes = []
  userMixes = userMixes.filter(m => m && typeof m === 'object' && !Array.isArray(m) && typeof m.name === 'string' && m.name.length > 0 && m.name.length <= 256 && typeof m.id === 'string' && m.id.length > 0 && m.focus && typeof m.focus === 'object')
  if (!_defaultMixesCache) {
    const _dmPath = path.join(orchestraSrc(), '.claude/default-mixes.json')
    _defaultMixesCache = []
    try { if (fs.statSync(_dmPath).size <= 512_000) _defaultMixesCache = readJSON(_dmPath, []) } catch {}
  }
  const existingIds = new Set(userMixes.map(m => m.id))
  const validDefaults = _defaultMixesCache.filter(p => p && typeof p === 'object' && !Array.isArray(p) && typeof p.id === 'string' && /^[0-9a-z_\-]+$/.test(p.id) && p.id.length <= 64 && typeof p.name === 'string' && p.name.length > 0 && p.name.length <= 256 && p.focus && typeof p.focus === 'object' && !Array.isArray(p.focus))
  const merged = [...validDefaults.filter(p => !existingIds.has(p.id)), ...userMixes]
  return merged.slice(0, 200)
})

ipcMain.handle('mixer:saved:save', (_e, dir, name, focus) => {
  if (!isKnownProject(dir)) return false
  if (typeof name !== 'string' || name.length === 0 || name.length > 256) return false
  if (name.trim().length === 0) return false
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(name)) return false
  if (!focus || typeof focus !== 'object' || Array.isArray(focus)) return false
  if (Object.keys(focus).some(k => !_VALID_CATS.has(k))) return false
  if (Object.values(focus).some(v => typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 100)) return false
  const p = path.join(dir, '.claude/saved-mixes.json')
  let mixes = []
  try { if (fs.statSync(p).size <= 512_000) mixes = readJSON(p, []) } catch {}
  if (!Array.isArray(mixes)) mixes = []
  mixes = mixes.filter(m => m && typeof m === 'object' && !Array.isArray(m) && typeof m.name === 'string' && m.name.length > 0 && m.name.length <= 256 && typeof m.id === 'string' && m.id.length > 0 && m.focus && typeof m.focus === 'object')
  if (mixes.length >= 100) return false
  mixes.push({ id: Date.now().toString(36), name: name.trim(), ts: new Date().toISOString(), focus })
  const _msSer = JSON.stringify(mixes)
  if (_msSer.length > 512_000) return false
  writeJSON(p, JSON.parse(_msSer))
  return true
})

ipcMain.handle('mixer:saved:delete', (_e, dir, id) => {
  if (!isKnownProject(dir)) return false
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) return false
  if (!/^[0-9a-z]+$/.test(id)) return false
  const p = path.join(dir, '.claude/saved-mixes.json')
  let mixes = []
  try { if (fs.statSync(p).size <= 512_000) mixes = readJSON(p, []) } catch {}
  if (!Array.isArray(mixes)) mixes = []
  mixes = mixes.filter(m => m && typeof m === 'object' && !Array.isArray(m) && typeof m.id === 'string' && m.id !== id)
  const _msdSer = JSON.stringify(mixes)
  if (_msdSer.length <= 512_000) writeJSON(p, JSON.parse(_msdSer))
  return true
})

ipcMain.handle('mixer:saved:export', (_e, dir, id) => {
  if (!isKnownProject(dir)) return null
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) return null
  if (!/^[0-9a-z]+$/.test(id)) return null
  const p = path.join(dir, '.claude/saved-mixes.json')
  let mixes = []
  try { if (fs.statSync(p).size <= 512_000) mixes = readJSON(p, []) } catch {}
  const mix = mixes.find(m => m.id === id)
  if (!mix) return null
  return JSON.stringify(mix, null, 2)
})

// ─── Mixer history (F-17) ───────────────────────────────────────────────────
ipcMain.handle('mixer:history', (_e, dir, limit) => {
  if (!isKnownProject(dir)) return []
  const p = path.join(dir, '.claude/mixer-history.json')
  let hist = []
  try { if (fs.statSync(p).size <= 512_000) hist = readJSON(p, []) } catch {}
  hist = Array.isArray(hist) ? hist.filter(h => h && typeof h === 'object' && typeof h.ts === 'string' && typeof h.event === 'string' && h.focus && typeof h.focus === 'object') : []
  const n = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 50
  return hist.slice(-n)
})

// ─── Cross-project session summary (F-18) ───────────────────────────────────
ipcMain.handle('metrics:session-summary', () => {
  const _ssHit = metricsGet('session-summary')
  if (_ssHit !== null) return _ssHit
  const projects = cachedProjects()
  let active = 0, idle = 0, totalTokens = 0, worstCompliance = null
  for (const p of projects) {
    if (!p.path) continue
    try {
      if (isRunning(p.path)) active++; else idle++
      try {
        const ctx = contextProto.getMetrics(p.path)
        if (ctx && ctx.aggregated) totalTokens += Number.isFinite(ctx.aggregated.totalTokensProcessed) ? ctx.aggregated.totalTokensProcessed : 0
      } catch {}
      try {
        const reportPath = path.join(p.path, 'ORCHESTRA_REPORT.md')
        const _ssSt = fs.statSync(reportPath)
        if (_ssSt.size > 1_048_576) continue
        let _ssLast = null
        if (_complianceMtimeCache.get(p.path) !== _ssSt.mtimeMs) {
          const lines = fs.readFileSync(reportPath, 'utf8').split('\n').filter(l => l.includes('COMPLIANCE'))
          if (lines.length) {
            _ssLast = parseComplianceLine(lines[lines.length - 1])
            if (_ssLast) _worstComplianceCache.set(p.path, _ssLast)
            _complianceMtimeCache.set(p.path, _ssSt.mtimeMs)
          }
        } else {
          _ssLast = _worstComplianceCache.get(p.path) || null
        }
        if (_ssLast && (worstCompliance === null || _ssLast.score < worstCompliance.score)) {
          worstCompliance = { dir: p.path, name: p.name, ..._ssLast }
        }
      } catch {}
    } catch {}
  }
  const aiCredits = aiState()
  const creditsRemaining = Object.values(aiCredits).filter(v => typeof v === 'object' && v !== null && 'credits' in v).reduce((sum, ai) => sum + (ai.credits || 0), 0)
  return metricsSet('session-summary', { active, idle, total: projects.length, totalTokens, worstCompliance, creditsRemaining }, _SLOW_METRICS_TTL)
})

// ─── Read iteration log summary ──────────────────────────────────────────────
ipcMain.handle('orchestra:readIterLog', (_e, dir, logPath) => {
  if (!isKnownProject(dir) || typeof logPath !== 'string' || !logPath.trim()) return ''
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(logPath)) return ''
  if (!/^\.claude\/logs\/iter-[\w\-.]+\.log$/.test(logPath.trim())) return ''
  const fullPath = path.resolve(dir, logPath)
  if (!fullPath.startsWith(dir + path.sep) && fullPath !== dir) return ''
  try {
    const stat = fs.statSync(fullPath)
    if (stat.size > 1_048_576) return ''
    const content = fs.readFileSync(fullPath, 'utf8').trim()
    if (!content) return ''
    const lines = content.split('\n').filter(l => l.trim())
    return lines.slice(-8).join('\n')
  } catch {
    return ''
  }
})

// ─── Operator notes (F-25) ────────────────────────────────────────────────────
ipcMain.handle('notes:read', (_e, dir) => {
  if (!isKnownProject(dir)) return ''
  const p = path.join(dir, '.claude/OPERATOR_NOTES.md')
  try {
    const st = fs.statSync(p)
    if (st.size > 102_400) return ''
    return fs.readFileSync(p, 'utf8')
  } catch { return '' }
})

ipcMain.handle('notes:write', (_e, dir, content) => {
  if (!isKnownProject(dir) || typeof content !== 'string') return false
  if (content.length > 50000) return false
  if (Buffer.byteLength(content, 'utf8') > 102_400) return false
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content)) return false
  const p = path.join(dir, '.claude/OPERATOR_NOTES.md')
  const tmp = p + '.tmp'
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(tmp, content)
    fs.renameSync(tmp, p)
  } catch { return false }
  persistLifecycleEvent(dir, 'note', 'NOTA', content.split('\n')[0].slice(0, 80))
  return true
})

// ─── Session export (F-23) ────────────────────────────────────────────────────
let _exportSessionBusy = false
ipcMain.handle('export:session', async (_e, dir) => {
  if (!isKnownProject(dir)) return { ok: false }
  if (_exportSessionBusy) return { ok: false, err: 'Export in progress' }
  _exportSessionBusy = true
  try {
  const read = f => { try { const p = path.join(dir, f); if (fs.statSync(p).size > 1_048_576) return ''; return fs.readFileSync(p, 'utf8') } catch { return '' } }
  const snapshot = {
    exportedAt: new Date().toISOString(),
    project: path.basename(dir),
    projectPath: dir,
    orchestraVersion: read('.claude/ORCHESTRA_VERSION').trim() || 'unknown',
    runStarted: read('.claude/RUN_STARTED').trim() || null,
    lifecycle: (() => { const p = path.join(dir, '.claude/logs/lifecycle-events.json'); let d = []; try { if (fs.statSync(p).size <= 2_097_152) d = readJSON(p, []) } catch {}; return Array.isArray(d) ? d.filter(e => e && typeof e === 'object' && typeof e.type === 'string' && typeof e.ts === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(e.ts) && typeof e.label === 'string' && typeof e.message === 'string') : [] })(),
    mixerConfig: (() => { const p = path.join(dir, '.claude/orchestra.json'); let d = {}; try { if (fs.statSync(p).size <= 512_000) d = readJSON(p, {}) } catch {}; return (d && typeof d === 'object' && !Array.isArray(d)) ? d : {} })(),
    mixerHistory: (() => { const p = path.join(dir, '.claude/mixer-history.json'); let d = []; try { if (fs.statSync(p).size <= 512_000) d = readJSON(p, []) } catch {}; return Array.isArray(d) ? d.filter(e => e && typeof e === 'object' && typeof e.ts === 'string' && typeof e.event === 'string' && e.focus && typeof e.focus === 'object') : [] })(),
    claudeUsage: getClaudeUsage(dir),
    compliance: read('ORCHESTRA_REPORT.md').split('\n').filter(l => l.includes('COMPLIANCE')).slice(-50),
    roadmap: read('ROADMAP.md'),
    plan: read('PLAN.md'),
    pending: read('PENDING.md')
  }
  const serialized = JSON.stringify(snapshot, null, 2)
  if (serialized.length > 10_485_760) return { ok: false, err: 'Export too large (>10MB)' }
  const result = await dialog.showSaveDialog(win, {
    defaultPath: path.join(app.getPath('documents'), `director-session-${snapshot.project}-${Date.now()}.json`),
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })
  if (result.canceled) return { ok: false }
  fs.writeFileSync(result.filePath, serialized)
  return { ok: true, path: result.filePath }
  } finally { _exportSessionBusy = false }
})

// ─── Analysis ─────────────────────────────────────────────────────────────────
ipcMain.handle('orchestra:analyze', (_e, dir) => {
  if (!isKnownProject(dir)) return Promise.resolve({ report: 'No project selected', file: null })
  return new Promise(resolve => {
    const read = f => { try { const p = path.join(dir, f); if (fs.statSync(p).size > 1_048_576) return ''; return fs.readFileSync(p, 'utf8') } catch { return '' } }
    const started = read('.claude/RUN_STARTED').trim().slice(0, 64)
    execFile('git', ['-C', dir, 'log', '--oneline', '--since', started || '30 days ago'], { timeout: 8000 }, (gitErr, gitOut) => {
      const commits = gitErr ? [] : (gitOut || '').trim().split('\n').filter(Boolean)
      const cat = {}
      for (const c of commits) {
        const m = c.match(/ (feat|fix|test|refactor|chore|security|sec|perf|docs|style|i18n)[:(]/)
        const k = m ? m[1] : 'other'
        cat[k] = (cat[k] || 0) + 1
      }
      // Fetch local metrics
      const usage = getClaudeUsage(dir)
      const _orchestraReport = read('ORCHESTRA_REPORT.md')

      const report = [
        `=== ORCHESTRA ANALYSIS — ${new Date().toISOString()} ===`,
        `Project: ${dir}`,
        `Orchestra version: ${read('.claude/ORCHESTRA_VERSION').trim() || 'unknown'}`,
        `Run started: ${started || 'unknown'}`,
        `Commits since start: ${commits.length}`,
        `By type: ${JSON.stringify(cat)}`,
        `Usage / Iterations: ${usage ? usage.iterations : 0}`,
        `Tokens Estimated: ${usage ? (usage.tokensEstimated / 1000).toFixed(1) + 'k' : 'unknown'}`,
        ``,
        `--- ORCHESTRA_REPORT.md (last 150 lines) ---`,
        _orchestraReport.split('\n').slice(-150).join('\n'),
        ``,
        `--- ROADMAP.md ---`, read('ROADMAP.md') || '(missing)',
        ``,
        `--- PENDING.md ---`, read('PENDING.md') || '(missing)',
        ``,
        `--- PLAN.md (last 80 lines) ---`,
        read('PLAN.md').split('\n').slice(-80).join('\n'),
        ``,
        `--- orchestra.log (last 60 lines) ---`,
        read('.claude/logs/orchestra.log').split('\n').slice(-60).join('\n'),
        ``,
        `--- mixer-history.json ---`,
        read('.claude/mixer-history.json') || '(no history)'
      ].join('\n')
      const outFile = path.join(dir, '.claude', `analysis-${Date.now()}.txt`)
      const _reportCapped = report.length > 4_194_304 ? report.slice(0, 4_194_304) : report
      try { fs.writeFileSync(outFile, _reportCapped) } catch {}
      resolve({ report: _reportCapped, file: outFile })
    })
  })
})

// ─── Lifecycle events persistence ─────────────────────────────────────────────
const _lifecycleDirReady = new Set()
let _lcCutoffISO = '', _lcCutoffAt = 0
function _lcCutoff() {
  const now = Date.now()
  if (now - _lcCutoffAt > 60_000) { _lcCutoffISO = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString(); _lcCutoffAt = now }
  return _lcCutoffISO
}
function persistLifecycleEvent(dir, type, label, message) {
  if (!dir) return
  try {
    const logDir = path.join(dir, '.claude', 'logs')
    if (!_lifecycleDirReady.has(logDir)) { fs.mkdirSync(logDir, { recursive: true }); _lifecycleDirReady.add(logDir) }
    const file = path.join(logDir, 'lifecycle-events.json')
    let events = []
    try { if (fs.statSync(file).size <= 2_097_152) events = readJSON(file, []) } catch {}
    const cutoffISO = _lcCutoff()
    const pruned = events.filter(e => typeof e.ts === 'string' && e.ts >= cutoffISO)
    const _evType = typeof type === 'string' ? type.slice(0, 64) : 'unknown'
    const _evLabel = typeof label === 'string' ? label.slice(0, 128) : String(label).slice(0, 128)
    const _evMsgRaw = typeof message === 'string' ? message : String(message)
    const _evMsg = Buffer.byteLength(_evMsgRaw, 'utf8') > 4096 ? Buffer.from(_evMsgRaw, 'utf8').slice(0, 4096).toString('utf8') : _evMsgRaw
    pruned.push({ ts: new Date().toISOString(), type: _evType, label: _evLabel, message: _evMsg })
    if (pruned.length > 300) pruned.splice(0, pruned.length - 300)
    let _lcSer = JSON.stringify(pruned)
    if (_lcSer.length > 2_097_152) {
      pruned.splice(0, pruned.length - 100)
      _lcSer = JSON.stringify(pruned)
    }
    if (_lcSer.length <= 2_097_152) writeJSON(file, pruned)
  } catch {}
}

ipcMain.handle('lifecycle:list', (_e, dir, limit, typeFilter, before) => {
  if (!isKnownProject(dir)) return []
  const _llLimit = Number.isInteger(limit) && limit > 0 && limit <= 500 ? limit : 200
  const _llType = typeof typeFilter === 'string' && typeFilter.length <= 64 && /^[\w\-]+$/.test(typeFilter) ? typeFilter : null
  const _llBefore = typeof before === 'string' && before.length <= 64 && /^\d{4}-\d{2}-\d{2}T/.test(before) ? before : null
  const p = path.join(dir, '.claude', 'logs', 'lifecycle-events.json')
  let events = []
  try { if (fs.statSync(p).size <= 2_097_152) events = readJSON(p, []) } catch {}
  if (!Array.isArray(events)) events = []
  events = events.filter(e => e && typeof e === 'object' && typeof e.type === 'string' && typeof e.ts === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(e.ts) && typeof e.label === 'string' && typeof e.message === 'string')
  const _llUnfilteredTotal = events.length
  if (_llBefore) events = events.filter(e => e.ts < _llBefore)
  if (_llType) events = events.filter(e => e.type === _llType)
  return { events: events.slice(-_llLimit), total: events.length, unfilteredTotal: _llUnfilteredTotal }
})

const _LC_TYPES = new Set(['play', 'fine', 'kill', 'commit', 'exit', 'usage_limit', 'directive', 'auto_resume', 'error', 'note', 'cycle_close', 'feature'])
ipcMain.handle('lifecycle:add', (_e, dir, type, label, message) => {
  if (!isKnownProject(dir)) return false
  if (typeof type !== 'string' || typeof label !== 'string' || typeof message !== 'string') return false
  if (type.length > 64 || label.length > 128 || message.length > 1024) return false
  if (label.trim().length === 0) return false
  if (!_LC_TYPES.has(type)) return false
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(label) || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(message)) return false
  persistLifecycleEvent(dir, type, label, message)
  return true
})

// ─── Telemetry / Metrics IPC ──────────────────────────────────────────────────
const _metricsCache = new Map()
const _METRICS_TTL = 2_000
const _METRICS_EVICT_AGE = 30_000
function metricsGet(key) {
  const c = _metricsCache.get(key); return c && Date.now() - c.ts < (c.ttl || _METRICS_TTL) ? c.val : null
}
function metricsSet(key, val, ttl = _METRICS_TTL) { _metricsCache.set(key, { ts: Date.now(), val, ttl }); return val }
setInterval(() => {
  const now = Date.now()
  const cutoff = now - _METRICS_EVICT_AGE
  for (const [k, v] of _metricsCache) { if (v.ts < cutoff) _metricsCache.delete(k) }
  for (const [k, v] of _orchJsonCache) { if (now - v.ts > 10_000) _orchJsonCache.delete(k) }
  for (const [k, v] of _logoCache) { if (now - v.ts > 60_000) _logoCache.delete(k) }
  for (const [k, v] of _piStaticCache) { if (now - v.ts > 30_000) _piStaticCache.delete(k) }
  for (const [k, v] of _isRunningCache) { if (now - v.ts > 1_000) _isRunningCache.delete(k) }
  for (const [k, v] of _readinessCache) { if (now - v.ts > 10_000) _readinessCache.delete(k) }
}, _METRICS_EVICT_AGE).unref()

ipcMain.handle('metrics:resource', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  const hit = metricsGet('resource:' + dir)
  if (hit !== null) return hit
  const live = scheduler.getMetrics(dir)
  if (live && live.allocation) return metricsSet('resource:' + dir, live)
  // Compute allocation from current mixer weights on demand
  const cfg = readOrchJson(dir)
  if (cfg.focus) {
    const alloc = scheduler.computeAllocation(dir, cfg.focus)
    return metricsSet('resource:' + dir, { allocation: alloc, baseline: null, lastSample: null, efficiency: null, sampleCount: 0 }, _SLOW_METRICS_TTL)
  }
  return live
})

ipcMain.handle('metrics:context', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  const hit = metricsGet('context:' + dir)
  if (hit !== null) return hit
  const live = contextProto.getMetrics(dir)
  if (live && live.lastDelta) return metricsSet('context:' + dir, live)
  // Read persisted telemetry if no live data
  const file = path.join(dir, '.claude', 'telemetry', 'context-metrics.json')
  let hist = []
  try { if (fs.statSync(file).size <= 1_048_576) hist = readJSON(file, []) } catch {}
  hist = hist.filter(h => h && typeof h === 'object' && (h.ts === undefined || typeof h.ts === 'string'))
  const _mcHist = hist.length > 500 ? hist.slice(-500) : hist
  if (_mcHist.length > 0) {
    const last = hist[hist.length - 1]
    let totalProcessed = 0, totalSaved = 0
    for (const m of hist) { totalProcessed += (Number.isFinite(m.totalTokens) ? m.totalTokens : 0); totalSaved += (Number.isFinite(m.totalTokensSaved) ? m.totalTokensSaved : 0) }
    return metricsSet('context:' + dir, {
      lastDelta: { metrics: last },
      aggregated: {
        cycles: hist.length,
        totalTokensProcessed: totalProcessed,
        totalTokensSaved: totalSaved,
        cumulativeCompression: totalProcessed > 0 ? Math.round((totalSaved/totalProcessed)*1000)/10 : 0,
        avgSavedPerCycle: hist.length > 0 ? Math.floor(totalSaved/hist.length) : 0
      },
      historySize: hist.length
    }, _SLOW_METRICS_TTL)
  }
  return live
})

ipcMain.handle('metrics:coordination', () => {
  return coordinator.getStatus()
})

ipcMain.handle('metrics:snapshot', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  return contextProto.computeDelta(dir, readOrchJson(dir).focus || {})
})

ipcMain.handle('metrics:allocation', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  const hit = metricsGet('allocation:' + dir)
  if (hit !== null) return hit
  const cfg = readOrchJson(dir)
  const _maFocus = cfg.focus && typeof cfg.focus === 'object' ? Object.fromEntries(Object.entries(cfg.focus).filter(([, v]) => typeof v === 'number' && Number.isFinite(v) && v >= 0)) : {}
  return metricsSet('allocation:' + dir, scheduler.computeAllocation(dir, _maFocus))
})

ipcMain.handle('metrics:claude-usage', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  const hit = metricsGet('claude-usage:' + dir)
  if (hit !== null) return hit
  return metricsSet('claude-usage:' + dir, getClaudeUsage(dir))
})

// ─── Compliance Metrics ───────────────────────────────────────────────────────
function parseComplianceLine(line) {
  if (typeof line !== 'string' || !line.includes('COMPLIANCE')) return null
  const m = line.match(/COMPLIANCE\s+(.+?)(?:\s+DRIFT:(.*?))?(?:\s+TESTS:(\w+))?$/)
  if (!m) return null
  const pairs = m[1].trim().split(/\s+/)
  const drift = m[2] ? m[2].trim().slice(0, 128) : 'none'
  const tests = m[3] || 'unknown'
  let totalPlanned = 0, totalActual = 0
  const categories = {}
  for (const p of pairs) {
    if (Object.keys(categories).length >= 20) break
    const pm = p.match(/([^:]+):(\d+)\/(\d+)/)
    if (!pm) continue
    const actual = parseInt(pm[2], 10), planned = parseInt(pm[3], 10)
    categories[pm[1].slice(0, 64)] = { actual, planned }
    totalPlanned += planned
    totalActual += Math.min(actual, planned)
  }
  const score = totalPlanned > 0 ? Math.round(totalActual / totalPlanned * 100) : null
  return { categories, drift, tests, score, totalPlanned, totalActual }
}

const _SLOW_METRICS_TTL = 30_000
const _complianceMtimeCache = new Map()
const _worstComplianceCache = new Map()  // dir → last parsed compliance line
ipcMain.handle('metrics:compliance', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  const hit = metricsGet('compliance:' + dir)
  const reportPath = path.join(dir, 'ORCHESTRA_REPORT.md')
  try {
    const st = fs.statSync(reportPath)
    if (st.size > 1_048_576) return metricsSet('compliance:' + dir, null, _SLOW_METRICS_TTL)
    const lastMtime = _complianceMtimeCache.get(dir)
    if (hit !== null && lastMtime === st.mtimeMs) return hit
    const lines = fs.readFileSync(reportPath, 'utf8').split('\n').filter(l => l.includes('COMPLIANCE'))
    if (!lines.length) { _complianceMtimeCache.set(dir, st.mtimeMs); return metricsSet('compliance:' + dir, null, _SLOW_METRICS_TTL) }
    const recent = lines.slice(-10)
    const scores = recent.map(l => parseComplianceLine(l)).filter(Boolean).map(c => c.score).filter(s => s !== null)
    const last = parseComplianceLine(recent[recent.length - 1])
    const _rawAvg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
    const avg = Number.isFinite(_rawAvg) ? _rawAvg : null
    _complianceMtimeCache.set(dir, st.mtimeMs)
    if (last) _worstComplianceCache.set(dir, last)
    return metricsSet('compliance:' + dir, { last, avgScore: avg, cycles: scores.length, history: scores }, _SLOW_METRICS_TTL)
  } catch { return null }
})

ipcMain.handle('metrics:roadmap-freshness', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  const hit = metricsGet('freshness:' + dir)
  if (hit !== null) return hit
  const roadmapPath = path.join(dir, 'ROADMAP.md')
  let mtime
  try { mtime = fs.statSync(roadmapPath).mtimeMs } catch { return { exists: false } }
  return new Promise(resolve => {
    execFile('git', ['-C', dir, 'log', '-1', '--format=%ct'], (err, stdout) => {
      if (err || !stdout.trim()) return resolve(metricsSet('freshness:' + dir, { exists: true, mtime, isStale: false }, _SLOW_METRICS_TTL))
      const lastCommitMs = parseInt(stdout.trim(), 10) * 1000
      const staleHours = Math.round((lastCommitMs - mtime) / 3_600_000)
      resolve(metricsSet('freshness:' + dir, { exists: true, mtime, lastCommit: lastCommitMs, staleHours, isStale: Number.isFinite(staleHours) && staleHours > 24 && lastCommitMs > mtime }, _SLOW_METRICS_TTL))
    })
  })
})

// ─── Orchestra version check & selective upgrade ──────────────────────────────
const UPGRADE_FILES = [
  'CLAUDE.md', 'run.sh',
  '.claude/commands/loop.md',
  '.claude/skills/backlog-generator/SKILL.md',
  '.claude/skills/team-orchestra/SKILL.md',
  '.claude/skills/linked-entities/SKILL.md',
  '.claude/skills/ip-protection/SKILL.md',
  '.claude/skills/roadmap-sync/SKILL.md',
  '.claude/skills/verification-gate/SKILL.md',
  '.claude/skills/verification-gate/run-tests.sh',
  '.claude/skills/browser-vision/SKILL.md',
  '.claude/skills/browser-vision/a11y.js',
  '.claude/skills/db-vision/SKILL.md',
  '.claude/skills/db-vision/db-extract.sh',
  '.claude/skills/cycle-audit/SKILL.md',
  '.claude/default-mixes.json',
  '.claude/ORCHESTRA_VERSION',
]

ipcMain.handle('orchestra:version-check', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  const bundled = (() => { try { const p = path.join(orchestraSrc(), '.claude/ORCHESTRA_VERSION'); return fs.statSync(p).size <= 1024 ? fs.readFileSync(p, 'utf8').trim() : null } catch { return null } })()
  const project = (() => { try { const p = path.join(dir, '.claude/ORCHESTRA_VERSION'); return fs.statSync(p).size <= 1024 ? fs.readFileSync(p, 'utf8').trim() : null } catch { return null } })()
  return { bundled, project, needsUpgrade: !!(bundled && project && bundled !== project) }
})

ipcMain.handle('orchestra:upgrade', (_e, dir) => {
  if (!isKnownProject(dir)) return { ok: false, err: 'No project' }
  const src = orchestraSrc()
  // Purge legacy files before upgrading
  for (const f of LEGACY_PURGE) {
    try { fs.unlinkSync(path.join(dir, f)) } catch {}
  }
  const upgraded = [], errors = []
  for (const f of UPGRADE_FILES) {
    const srcPath = path.join(src, f), dstPath = path.join(dir, f)
    let _upSrcSt = null; try { _upSrcSt = fs.statSync(srcPath) } catch {}
    if (!_upSrcSt) continue
    try {
      try { fs.copyFileSync(dstPath, dstPath + '.bak') } catch {}
      fs.mkdirSync(path.dirname(dstPath), { recursive: true })
      fs.copyFileSync(srcPath, dstPath)
      if (f === 'run.sh') try { fs.chmodSync(dstPath, 0o755) } catch {}
      upgraded.push(f)
    } catch (e) { errors.push(`${f}: ${e.message}`) }
  }
  // Clean up stale .bak files — keep only the newest per upgraded file
  for (const f of upgraded) {
    try { fs.unlinkSync(path.join(dir, f) + '.bak') } catch {}
  }
  return { ok: errors.length === 0, upgraded, errors }
})

// ─── System process monitor ───────────────────────────────────────────────────
const { execFile: execFileAsync } = require('child_process')
ipcMain.handle('system:claude-procs', () => {
  return new Promise(resolve => {
    execFile('ps', ['aux'], (err, stdout) => {
      if (err) return resolve([])
      const lines = stdout.split('\n').slice(1)
      const procs = []
      for (const line of lines) {
        if (!line.trim()) continue
        if (!line.includes('claude') && !line.includes('run.sh')) continue
        // Skip noise: grep itself, chrome native host helper
        if (line.includes('grep') || line.includes('chrome-native-host')) continue
        const cols = line.trim().split(/\s+/)
        const pid = parseInt(cols[1], 10)
        const cpu = cols[2]
        const mem = cols[3]
        const started = cols[8]
        const time = cols[9]
        const cmd = cols.slice(10).join(' ')
        // Determine project dir from cmd path if possible
        let project = null
        const cwdMatch = cmd.match(/--cwd[= ]([^ ]+)/)
        if (cwdMatch) project = cwdMatch[1]
        // Classify process type
        let type = 'claude'
        if (cmd.includes('run.sh')) type = 'orchestra'
        else if (cmd.includes('auto-retry') || cmd.includes('launcher.js')) type = 'wrapper'
        else if (cmd.includes('monitor.js')) type = 'monitor'
        else if (cmd.includes('mcp')) type = 'mcp'
        else if (cmd.includes('Electron') || cmd.includes('director')) type = 'director'
        procs.push({ pid, cpu, mem, started, time, cmd: cmd.slice(0, 120), type, project })
      }
      resolve(procs)
    })
  })
})

ipcMain.handle('system:kill-proc', (_e, pid, signal = 'SIGTERM') => {
  if (typeof pid !== 'number' || !Number.isInteger(pid) || pid < 2 || pid > 4_194_304 || pid === process.pid) return { ok: false, err: 'invalid pid' }
  const allowed = ['SIGTERM', 'SIGKILL']
  if (!allowed.includes(signal)) return { ok: false, err: 'signal not allowed' }
  try {
    process.kill(pid, signal)
    return { ok: true }
  } catch (e) {
    return { ok: false, err: e.message }
  }
})

// ─── Custom Atriles (app-wide) ───────────────────────────────────────────────
const customAtrilesFile = () => path.join(app.getPath('userData'), 'custom-atriles.json')

let _atrilesCache = null
ipcMain.handle('atriles:list', () => {
  if (_atrilesCache) return _atrilesCache
  const p = customAtrilesFile()
  let data = []
  try { if (fs.statSync(p).size <= 512_000) data = readJSON(p, []) } catch {}
  if (!Array.isArray(data)) data = []
  data = data.filter(a => a && typeof a === 'object' && typeof a.name === 'string' && a.name.length > 0 && a.name.length <= 256 && !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(a.name) && typeof a.path === 'string' && a.path.length > 0 && a.path.length <= 4096 && !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(a.path))
  _atrilesCache = data
  return _atrilesCache
})

ipcMain.handle('atriles:save', (_e, atriles) => {
  if (!Array.isArray(atriles) || atriles.length > 200) return false
  const valid = atriles.every(a =>
    a && typeof a === 'object' &&
    typeof a.name === 'string' && a.name.length > 0 && a.name.length <= 256 &&
    typeof a.path === 'string' && a.path.length > 0 && a.path.length <= 4096 &&
    (a.description === undefined || a.description === null || (typeof a.description === 'string' && a.description.length <= 1024)) &&
    (a.id === undefined || (typeof a.id === 'string' && a.id.length <= 64 && /^[\w\-]+$/.test(a.id))) &&
    (a.icon === undefined || (typeof a.icon === 'string' && a.icon.length <= 64)) &&
    (a.color === undefined || (typeof a.color === 'string' && a.color.length <= 64 && /^[a-zA-Z0-9#(),. %]+$/.test(a.color)))
  )
  if (!valid) return false
  if (atriles.some(a => !path.isAbsolute(a.path))) return false
  if (atriles.some(a => /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(a.name) || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(a.path))) return false
  if (atriles.some(a => typeof a.description === 'string' && /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(a.description))) return false
  if (atriles.some(a => typeof a.icon === 'string' && /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(a.icon))) return false
  const _asPaths = atriles.map(a => a.path)
  if (new Set(_asPaths).size !== _asPaths.length) return false
  const _asSer = JSON.stringify(atriles)
  if (_asSer.length > 512_000) return false
  writeJSON(customAtrilesFile(), JSON.parse(_asSer))
  _atrilesCache = JSON.parse(_asSer)
  return true
})

// ─── Blueprint / Discovery Interview ─────────────────────────────────────────
const blueprintFile = (dir) => path.join(dir, '.claude', 'blueprint.json')

ipcMain.handle('blueprint:load', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  const bpPath = blueprintFile(dir)
  try { if (fs.statSync(bpPath).size > 512_000) return null } catch {}
  return readJSON(bpPath, null)
})

ipcMain.handle('blueprint:save', (_e, dir, data) => {
  if (!isKnownProject(dir)) return false
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  if (data.answers && typeof data.answers === 'object') {
    if (Object.keys(data.answers).length > 200) return false
    if (Object.keys(data.answers).some(k => k.length > 64 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(k))) return false
    const _bsAnswerVals = Object.values(data.answers)
    if (_bsAnswerVals.some(v => v !== null && typeof v !== 'string')) return false
    if (_bsAnswerVals.some(v => typeof v === 'string' && v.length > 2000)) return false
    if (_bsAnswerVals.some(v => typeof v === 'string' && /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(v))) return false
  }
  if (data.modules && Array.isArray(data.modules)) {
    if (data.modules.length > 100) return false
    if (data.modules.some(m => !m || typeof m !== 'object' || typeof m.name !== 'string' || m.name.length > 256 || Object.keys(m).length > 20)) return false
    if (data.modules.some(m => /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(m.name))) return false
    if (data.modules.some(m => m.description !== undefined && (typeof m.description !== 'string' || m.description.length > 2000))) return false
    if (data.modules.some(m => m.description !== undefined && typeof m.description === 'string' && /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(m.description))) return false
    if (data.modules.some(m => m.notes !== undefined && (typeof m.notes !== 'string' || m.notes.length > 2000))) return false
    if (data.modules.some(m => m.notes !== undefined && typeof m.notes === 'string' && /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(m.notes))) return false
    if (data.modules.some(m => m.features !== undefined && (!Array.isArray(m.features) || m.features.length > 50 || m.features.some(f => typeof f !== 'string' || f.length > 512)))) return false
    if (data.modules.some(m => m.features !== undefined && Array.isArray(m.features) && m.features.some(f => /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(f)))) return false
    if (data.modules.some(m => m.dependencies !== undefined && (!Array.isArray(m.dependencies) || m.dependencies.length > 50 || m.dependencies.some(d => typeof d !== 'string' || d.length > 256)))) return false
    if (data.modules.some(m => m.dependencies !== undefined && Array.isArray(m.dependencies) && m.dependencies.some(d => /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(d)))) return false
  }
  if (data.completeness !== undefined && (typeof data.completeness !== 'number' || !Number.isFinite(data.completeness) || data.completeness < 0 || data.completeness > 100)) return false
  if (data.currentPhase !== undefined && (!Number.isInteger(data.currentPhase) || data.currentPhase < 0)) return false
  if (data.currentQuestion !== undefined && (!Number.isInteger(data.currentQuestion) || data.currentQuestion < 0)) return false
  if (data.sessionActive !== undefined && typeof data.sessionActive !== 'boolean') return false
  if (data.sessions !== undefined && !Array.isArray(data.sessions)) return false
  if (Array.isArray(data.sessions) && data.sessions.length > 500) return false
  if (Array.isArray(data.sessions) && data.sessions.some(s => !s || typeof s !== 'object' || Array.isArray(s) || Object.keys(s).length > 20)) return false
  if (Array.isArray(data.sessions) && data.sessions.some(s => s.started !== undefined && (typeof s.started !== 'string' || s.started.length > 64 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s.started) || !/^\d{4}-\d{2}-\d{2}T/.test(s.started)))) return false
  if (Array.isArray(data.sessions) && data.sessions.some(s => s.label !== undefined && (typeof s.label !== 'string' || s.label.length > 128 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s.label)))) return false
  if (Array.isArray(data.sessions) && data.sessions.some(s => s.duration !== undefined && (typeof s.duration !== 'number' || !Number.isFinite(s.duration) || s.duration < 0))) return false
  if (Array.isArray(data.sessions) && data.sessions.some(s => s.commits !== undefined && (!Number.isInteger(s.commits) || s.commits < 0))) return false
  if (Array.isArray(data.sessions) && data.sessions.some(s => s.ended !== undefined && (typeof s.ended !== 'string' || s.ended.length > 64 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s.ended) || !/^\d{4}-\d{2}-\d{2}T/.test(s.ended)))) return false
  if (Array.isArray(data.sessions) && data.sessions.some(s => s.agent !== undefined && (typeof s.agent !== 'string' || s.agent.length > 64 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s.agent)))) return false
  if (Array.isArray(data.sessions) && data.sessions.some(s => s.model !== undefined && (typeof s.model !== 'string' || s.model.length > 256 || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s.model)))) return false
  const serialized = JSON.stringify(data)
  if (serialized.length > 512_000) return false
  const p = blueprintFile(dir)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  writeJSON(p, JSON.parse(serialized))
  _readinessCache.delete(dir)
  return true
})

ipcMain.handle('blueprint:generate-brief', (_e, dir) => {
  if (!isKnownProject(dir)) return null
  const bpPath = blueprintFile(dir)
  let bp = null
  try { if (fs.statSync(bpPath).size <= 512_000) bp = readJSON(bpPath, null) } catch {}
  if (!bp || !bp.answers) return null

  const a = bp.answers
  const modules = bp.modules || []
  const sessions = bp.sessions || []
  const ts = new Date().toISOString()
  const _bpInline = s => typeof s === 'string' ? s.replace(/[\r\n]+/g, ' ').slice(0, 200) : ''

  // Generate comprehensive brief for the orchestra's first cycle
  const lines = [
    `# PROJECT BLUEPRINT — Generated ${ts}`,
    `# This file was produced by Director Suite's Discovery Agent.`,
    `# The orchestra will use this as its primary context for Phase 0.`,
    '',
    '## PROJECT IDENTITY',
    `- **Name:** ${_bpInline(a.projectName) || '(unnamed)'}`,
    `- **Description:** ${_bpInline(a.description) || '(none)'}`,
    `- **Type:** ${_bpInline(a.projectType) || '(unspecified)'}`,
    `- **Primary language/stack:** ${_bpInline(a.stack) || '(unspecified)'}`,
    '',
    '## SCOPE & MAGNITUDE',
    `- **Size estimate:** ${_bpInline(a.magnitude) || '(unknown)'}`,
    `- **Timeline:** ${_bpInline(a.timeline) || '(open-ended)'}`,
    `- **Team size:** ${_bpInline(a.teamSize) || '(solo)'}`,
    `- **MVP scope:** ${_bpInline(a.mvpScope) || '(undefined)'}`,
    `- **Budget constraints:** ${_bpInline(a.budget) || '(none stated)'}`,
    '',
    '## TARGET USERS & AUDIENCE',
    `- **Primary users:** ${_bpInline(a.primaryUsers) || '(unspecified)'}`,
    `- **Expected user count:** ${_bpInline(a.userScale) || '(unknown)'}`,
    `- **Countries/regions:** ${_bpInline(a.countries) || '(global)'}`,
    `- **Languages required:** ${_bpInline(a.languages) || 'es'}`,
    `- **Accessibility requirements:** ${_bpInline(a.accessibility) || '(standard)'}`,
    '',
    '## PLATFORM & DEPLOYMENT',
    `- **Target platforms:** ${_bpInline(a.platforms) || '(unspecified)'}`,
    `- **OS/runtime:** ${_bpInline(a.os) || '(any)'}`,
    `- **Hosting/cloud:** ${_bpInline(a.hosting) || '(undecided)'}`,
    `- **CI/CD:** ${_bpInline(a.cicd) || '(none yet)'}`,
    `- **Domain/DNS:** ${_bpInline(a.domain) || '(none)'}`,
    '',
    '## SECURITY & COMPLIANCE',
    `- **Auth method:** ${_bpInline(a.auth) || '(undecided)'}`,
    `- **Security level:** ${_bpInline(a.securityLevel) || 'standard'}`,
    `- **Data sensitivity:** ${_bpInline(a.dataSensitivity) || '(low)'}`,
    `- **Regulations:** ${_bpInline(a.regulations) || '(none)'}`,
    `- **Legal constraints:** ${_bpInline(a.legal) || '(none)'}`,
    `- **Privacy policy needed:** ${_bpInline(a.privacyPolicy) || 'no'}`,
    '',
    '## DATA & INTEGRATIONS',
    `- **Primary database:** ${_bpInline(a.database) || '(undecided)'}`,
    `- **External APIs:** ${_bpInline(a.externalApis) || '(none)'}`,
    `- **File storage:** ${_bpInline(a.fileStorage) || '(local)'}`,
    `- **Real-time requirements:** ${_bpInline(a.realtime) || '(none)'}`,
    `- **Data migration needs:** ${_bpInline(a.dataMigration) || '(none)'}`,
    '',
    '## UX & DESIGN',
    `- **Design style/theme:** ${_bpInline(a.designTheme) || '(modern default)'}`,
    `- **Branding:** ${_bpInline(a.branding) || '(none yet)'}`,
    `- **Reference sites/apps:** ${_bpInline(a.references) || '(none)'}`,
    `- **Mobile-first:** ${_bpInline(a.mobileFirst) || 'no'}`,
    '',
    '## PERFORMANCE & SCALE',
    `- **Expected concurrent users:** ${_bpInline(a.concurrentUsers) || '(low)'}`,
    `- **SLA requirements:** ${_bpInline(a.sla) || '(none)'}`,
    `- **Caching strategy:** ${_bpInline(a.caching) || '(default)'}`,
    `- **CDN needed:** ${_bpInline(a.cdn) || 'no'}`,
    '',
    '## BUSINESS RULES',
    `- **Core business logic:** ${_bpInline(a.businessLogic) || '(to be defined)'}`,
    `- **Workflows:** ${_bpInline(a.workflows) || '(none)'}`,
    `- **Monetization:** ${_bpInline(a.monetization) || '(none)'}`,
    `- **Roles/permissions:** ${_bpInline(a.roles) || '(single role)'}`,
    '',
  ]

  if (modules.length > 0) {
    lines.push('## MODULES')
    for (const mod of modules) {
      lines.push(`### ${mod.name}`)
      if (mod.description) lines.push(`${mod.description}`)
      if (mod.features && mod.features.length) {
        lines.push('Features:')
        for (const f of mod.features) lines.push(`- ${f}`)
      }
      if (mod.dependencies && mod.dependencies.length) {
        lines.push(`Dependencies: ${mod.dependencies.join(', ')}`)
      }
      if (mod.notes) lines.push(`Notes: ${mod.notes}`)
      lines.push('')
    }
  }

  if (a.additionalNotes) {
    lines.push('## ADDITIONAL NOTES')
    lines.push(a.additionalNotes)
    lines.push('')
  }

  // Write the brief to the project
  const brief = lines.join('\n').slice(0, 512_000)
  const briefPath = path.join(dir, '.claude', 'BLUEPRINT.md')
  try {
    fs.writeFileSync(briefPath, brief)
  } catch {}

  // Also generate initial ROADMAP.md from modules if none exists
  const roadmapPath = path.join(dir, 'ROADMAP.md')
  let _gbRmExists = false; try { fs.statSync(roadmapPath); _gbRmExists = true } catch {}
  if (!_gbRmExists && modules.length > 0) {
    const roadmapLines = [
      '# ROADMAP',
      `> Auto-generated from Blueprint — ${ts}`,
      '',
      '## P0 — MVP',
    ]
    let fid = 1
    for (const mod of modules) {
      if (mod.features) {
        for (const f of mod.features) {
          roadmapLines.push(`- [ ] F-${String(fid).padStart(2, '0')}: [${mod.name}] ${f}`)
          fid++
        }
      } else {
        roadmapLines.push(`- [ ] F-${String(fid).padStart(2, '0')}: Implementar módulo ${mod.name}`)
        fid++
      }
    }
    roadmapLines.push('', '## P1 — Post-MVP', '(to be defined after P0)')
    try { const _rmSer = roadmapLines.join('\n'); fs.writeFileSync(roadmapPath, _rmSer.length > 512_000 ? _rmSer.slice(0, 512_000) : _rmSer) } catch {}
  }

  let _gbRmExists2 = false; try { fs.statSync(roadmapPath); _gbRmExists2 = true } catch {}
  return { brief, briefPath, roadmapGenerated: !_gbRmExists2 }
})

const _readinessCache = new Map()
ipcMain.handle('blueprint:readiness', (_e, dir) => {
  if (!isKnownProject(dir)) return { ready: false, missing: ['project'] }
  const now = Date.now()
  const cached = _readinessCache.get(dir)
  if (cached && now - cached.ts < 10_000) return cached.val
  const bpPath = blueprintFile(dir)
  let bp = null
  try { if (fs.statSync(bpPath).size <= 512_000) bp = readJSON(bpPath, null) } catch {}
  if (!bp || !bp.answers) return { ready: false, missing: ['blueprint'], hasBlueprint: false }

  const a = bp.answers
  const missing = []
  if (!a.projectName) missing.push('nombre del proyecto')
  if (!a.description) missing.push('descripción')
  if (!a.stack) missing.push('stack tecnológico')
  if (!a.projectType) missing.push('tipo de proyecto')
  if ((!bp.modules || bp.modules.length === 0) && !a.description) missing.push('módulos o descripción')

  const val = {
    ready: missing.length === 0,
    missing,
    hasBlueprint: true,
    completeness: Number.isFinite(bp.completeness) ? Math.min(100, Math.max(0, bp.completeness)) : 0,
    sessions: (bp.sessions || []).length,
    modules: (bp.modules || []).length,
    answeredFields: Object.keys(a).filter(k => typeof a[k] === 'string' && a[k].trim()).length
  }
  _readinessCache.set(dir, { ts: now, val })
  return val
})

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    const { nativeImage } = require('electron')
    const dockIcon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'))
    if (!dockIcon.isEmpty()) app.dock.setIcon(dockIcon)
  }
  protocol.handle('local-img', req => {
    try {
      const raw = req.url.replace('local-img://', '')
      const fp = decodeURIComponent(raw)
      const filePath = path.resolve(fp.startsWith('/') ? fp : '/' + fp)
      const allowedDirs = cachedProjects().map(p => p.path).filter(Boolean)
      allowedDirs.push(path.join(app.getPath('userData')))
      if (!allowedDirs.some(d => filePath.startsWith(d + path.sep) || filePath.startsWith(d + '/'))) {
        return new Response('', { status: 403 })
      }
      const ext = path.extname(filePath).toLowerCase()
      const mimeMap = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp', '.ico':'image/x-icon', '.gif':'image/gif' }
      if (!mimeMap[ext]) return new Response('', { status: 415 })
      const imgStat = fs.statSync(filePath)
      if (imgStat.size > 10_485_760) return new Response('', { status: 413 })
      const data = fs.readFileSync(filePath)
      return new Response(data, { headers: { 'Content-Type': mimeMap[ext] } })
    } catch {
      return new Response('', { status: 404 })
    }
  })
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 940, minHeight: 620,
    backgroundColor: '#0d0d12',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 17 },
    icon: path.join(__dirname, process.platform === 'darwin' ? 'icon.icns' : 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true
    }
  })
  win.loadFile('index.html')

  // Block external navigation — renderer must stay on local index.html
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) e.preventDefault()
  })
  // Block new windows from renderer
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  // Start hot-reload watcher for protocol files
  startHotReloadWatcher()

  // Re-attach tailers for any already-running projects + cleanup stale signals
  let projects = []
  try { if (fs.statSync(store()).size <= 512_000) projects = readJSON(store(), []) } catch {}
  for (const p of projects) {
    if (!p.path) continue
    if (isRunning(p.path) && !procs.has(p.path)) {
      const logFile = path.join(p.path, '.claude/logs/orchestra.log')
      let _lfSt = false; try { fs.statSync(logFile); _lfSt = true } catch {}
      if (_lfSt) startTailing(p.path, logFile)
    }
    const usageSig = path.join(p.path, USAGE_LIMIT_SIGNAL)
    let _usSt = false; try { fs.statSync(usageSig); _usSt = true } catch {}
    if (_usSt && !isRunning(p.path)) {
      const pidFile = path.join(p.path, '.claude/ORCHESTRA_PID')
      let pidStillAlive = false
      let _pidSt = false; try { fs.statSync(pidFile); _pidSt = true } catch {}
      if (_pidSt) {
        try {
          const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim())
          pidStillAlive = pid > 0 && pidAlive(pid)
        } catch {}
      }
      if (pidStillAlive) {
        watchForResume(p.path)
      } else {
        try { fs.unlinkSync(usageSig) } catch {}
        try { fs.unlinkSync(pidFile) } catch {}
      }
    }
  }
})
// ─── Renderer security: block new windows and external navigation globally ───
app.on('web-contents-created', (_e, wc) => {
  wc.on('will-navigate', (evt, url) => { if (!url.startsWith('file://')) evt.preventDefault() })
  wc.setWindowOpenHandler(() => ({ action: 'deny' }))
})

// ─── Graceful shutdown: stop all orchestras when Director closes ─────────────
app.on('before-quit', () => {
  // Stop tracked processes — kill entire process group (bash + claude)
  for (const [dir, child] of procs) {
    try { fs.writeFileSync(path.join(dir, '.claude/ALTO'), '') } catch {}
    killProcessGroup(child.pid)
    stopTailing(dir)
    stopWatchingResume(dir)
    stopMetricsSampling(dir)
    persistLifecycleEvent(dir, 'kill', 'CORTE', 'Director cerrado — orquesta detenida')
    try { scheduler.persistTelemetry(dir) } catch {}
    try { scheduler.cleanup(dir) } catch {}
    try { coordinator.unregister(dir) } catch {}
  }
  procs.clear()

  // NOTE: Processes started in previous Director sessions (tracked only via PID files)
  // are intentionally left running on quit. They were started independently and will
  // be re-attached via tailing on next Director launch. Only processes started in
  // THIS session (in the `procs` Map) are stopped here.
})

app.on('window-all-closed', () => app.quit())
