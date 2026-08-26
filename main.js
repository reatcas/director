// Copyright (c) 2026 René Antonio Casaña Amaya. All rights reserved.
// Licensed under the AGPL-3.0 License. See LICENSE in repository root.

const { app, BrowserWindow, ipcMain, dialog, protocol, net, shell } = require('electron')
const { spawn, execFile } = require('child_process')
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
const orchestraSrc = () => path.join(__dirname, 'resources', 'orchestra')
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
        if (win && !win.isDestroyed()) win.webContents.send('orchestra:line', { dir, line: buf.toString() })
      } else {
        // Log not growing — check if process is actually alive
        if (!isRunning(dir)) {
          staleCount++
          // After 15 quiet polls (~12s) with no live process → orphan detected
          if (staleCount >= 15) {
            // Double-check: verify PID in file is actually alive, not just a stale file
            const pidFile = path.join(dir, '.claude/ORCHESTRA_PID')
            let pidStillAlive = false
            if (fs.existsSync(pidFile)) {
              try {
                const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim())
                pidStillAlive = pid > 0 && pidAlive(pid)
              } catch {}
            }
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

function pollGitCommits(dir) {
  const lastHash = gitLastHash.get(dir) || ''
  try {
    const currentHash = require('child_process').execSync('git log -1 --format=%H', { cwd: dir, encoding: 'utf8', timeout: 3000 }).trim()
    if (currentHash && currentHash !== lastHash) {
      const newCommits = require('child_process').execSync(
        `git log --oneline ${lastHash ? lastHash + '..' : '-1'}`,
        { cwd: dir, encoding: 'utf8', timeout: 5000 }
      ).trim().split('\n').filter(Boolean)
      gitLastHash.set(dir, currentHash)
      for (const c of newCommits) {
        const line = `▸ ✔ [commit] ${c}\n`
        if (win && !win.isDestroyed()) {
          win.webContents.send('orchestra:line', { dir, line })
        }
        persistLifecycleEvent(dir, 'commit', 'COMMIT', c)
      }
    }
  } catch {}
}

function startGitWatcher(dir) {
  if (gitWatchers.has(dir)) return
  try {
    const hash = require('child_process').execSync('git log -1 --format=%H', { cwd: dir, encoding: 'utf8', timeout: 3000 }).trim()
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
}

// ─── JSON helpers ─────────────────────────────────────────────────────────────
const readJSON  = (p, fb) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return fb } }
const writeJSON = (p, o) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = p + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(o, null, 2))
  fs.renameSync(tmp, p)
}

// ─── PID helpers ──────────────────────────────────────────────────────────────
function pidAlive(pid) {
  try { process.kill(pid, 0); return true } catch { return false }
}

// Kill the entire process group (bash + claude subprocess).
// detached:true makes the child a process group leader, so -pid kills the group.
function killProcessGroup(pid, signal = 'SIGTERM') {
  try { process.kill(-pid, signal) } catch {}          // group kill
  setTimeout(() => {                                     // escalate after 5s
    try { if (pidAlive(pid)) process.kill(-pid, 'SIGKILL') } catch {}
  }, 5000)
}

function isRunning(dir) {
  if (procs.has(dir)) return true
  const pidFile = path.join(dir, '.claude/ORCHESTRA_PID')
  if (!fs.existsSync(pidFile)) return false
  const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10)
  if (!pid || !pidAlive(pid)) { try { fs.unlinkSync(pidFile) } catch {}; return false }
  return true
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
    if (!fs.existsSync(signalFile)) {
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
    if (fs.existsSync(full)) return full
  }
  // 2. Check package.json icon/logo field
  try {
    const pkg = readJSON(path.join(dir, 'package.json'), null)
    if (pkg) {
      for (const field of ['icon', 'logo', 'image']) {
        if (pkg[field] && typeof pkg[field] === 'string') {
          const fp = path.join(dir, pkg[field])
          if (fs.existsSync(fp)) return fp
        }
      }
      if (pkg.build && pkg.build.icon) {
        const fp = path.join(dir, pkg.build.icon)
        if (fs.existsSync(fp)) return fp
      }
    }
  } catch {}
  // 3. Check directories named logo/icon/brand/img/images
  try {
    for (const entry of fs.readdirSync(dir)) {
      const ep = path.join(dir, entry)
      if (!fs.statSync(ep).isDirectory()) continue
      if (/^(logo|icon|brand|img|images|static)s?$/i.test(entry)) {
        const found = scanDirForImage(ep)
        if (found) return found
      }
    }
  } catch {}
  // 4. Check .github directory
  try {
    const ghDir = path.join(dir, '.github')
    if (fs.existsSync(ghDir) && fs.statSync(ghDir).isDirectory()) {
      const found = scanDirForImage(ghDir)
      if (found) return found
    }
  } catch {}
  // 5. Scan root for any image file
  try {
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f)
      if (/\.(png|svg|jpg|webp|ico)$/i.test(f) && fs.statSync(fp).isFile() && fs.statSync(fp).size < 500000) {
        return fp
      }
    }
  } catch {}
  return null
}

// ─── Project info ─────────────────────────────────────────────────────────────
function projectInfo(dir) {
  const has = f => fs.existsSync(path.join(dir, f))
  const installed = has('run.sh') && has('.claude/commands/loop.md')
  const vf = path.join(dir, '.claude/ORCHESTRA_VERSION')
  const version = installed ? (fs.existsSync(vf) ? (fs.readFileSync(vf, 'utf8').trim() || '1.x') : '1.x') : null
  const mixer = readJSON(path.join(dir, '.claude/orchestra.json'), null)
  const running = isRunning(dir)
  const usageLimited = has(USAGE_LIMIT_SIGNAL)
  const alto = has('.claude/ALTO')
  const logo = findLogo(dir)
  const hasLogs = has('.claude/logs/orchestra-stdout.log') || has('.claude/logs/orchestra.log')
  
  const startFile = path.join(dir, '.claude/RUN_STARTED')
  let runStarted = null
  if (running && fs.existsSync(startFile)) {
    const startedStr = fs.readFileSync(startFile, 'utf8').trim()
    if (startedStr) runStarted = new Date(startedStr).getTime()
  }

  return { installed, version: version || (installed ? '1.x' : null), mixer, running, usageLimited, alto, logo, hasLogs, runStarted }
}

// ─── Dir copy ─────────────────────────────────────────────────────────────────
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true })
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name)
    if (e.isDirectory()) copyDir(s, d)
    else if (!fs.existsSync(d) || !['CLAUDE.md', 'settings.json'].includes(e.name)) fs.copyFileSync(s, d)
    else if (e.name === 'CLAUDE.md') fs.appendFileSync(d, '\n\n' + fs.readFileSync(s, 'utf8'))
    else if (e.name === 'settings.json') {
      const a = readJSON(d, {}), b = readJSON(s, {})
      a.hooks = a.hooks || {}
      for (const k of Object.keys(b.hooks || {})) a.hooks[k] = [...(a.hooks[k] || []), ...b.hooks[k]]
      writeJSON(d, a)
    }
  }
}

// ─── Claude API Usage Tracking ──────────────────────────────────────────────
// Tracks cumulative API usage per project session by counting iterations and
// estimating token consumption from iter logs. Resets when a new session starts.
const usageTracker = new Map() // dir → { iterations, tokensEstimated, startedAt, lastCheck }

function getClaudeUsage(dir) {
  const usageLimited = fs.existsSync(path.join(dir, USAGE_LIMIT_SIGNAL))
  if (usageLimited) return { percent: 100, status: 'exhausted', iterations: 0, detail: 'Límite alcanzado' }

  const logDir = path.join(dir, '.claude/logs')
  let runStarted = 0
  try { runStarted = new Date(fs.readFileSync(path.join(dir, '.claude/RUN_STARTED'), 'utf8').trim()).getTime() } catch {}

  const cached = usageTracker.get(dir)
  const now = Date.now()
  let iterCount, totalBytes

  if (cached && cached.runStarted === runStarted && (now - cached.lastScan) < 25_000) {
    iterCount = cached.iterCount
    totalBytes = cached.totalBytes
  } else {
    iterCount = 0
    totalBytes = 0
    try {
      const files = fs.readdirSync(logDir).filter(f => f.startsWith('iter-') && f.endsWith('.log'))
      for (const f of files) {
        const st = fs.statSync(path.join(logDir, f))
        if (runStarted && st.mtimeMs >= runStarted) {
          iterCount++
          totalBytes += st.size
        }
      }
    } catch {}
    usageTracker.set(dir, { runStarted, iterCount, totalBytes, lastScan: now })
  }

  const tokensEstimated = Math.round(totalBytes / 4)
  const cfg = readJSON(path.join(dir, '.claude/orchestra.json'), {})
  const dailyBudget = cfg.claudeUsageBudget || 1_000_000

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
    const cfg = readJSON(path.join(dir, '.claude/orchestra.json'), {})
    contextProto.computeDelta(dir, cfg.focus || {})
    // Push metrics to renderer
    if (win) {
      const resourceMetrics = scheduler.getMetrics(dir)
      const contextMetrics  = contextProto.getMetrics(dir)
      if (win && !win.isDestroyed()) {
        win.webContents.send('metrics:update', {
          dir,
          resource: resourceMetrics,
          context:  contextMetrics,
          coordination: coordinator.getStatus(),
          claudeUsage: getClaudeUsage(dir)
        })
      }
    }
  }, 30_000) // Every 30 seconds
  metricsSamplers.set(dir, iv)
}

function stopMetricsSampling(dir) {
  const iv = metricsSamplers.get(dir)
  if (iv) { clearInterval(iv); metricsSamplers.delete(dir) }
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
    if (!fs.existsSync(srcPath)) continue
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
  const projects = readJSON(store(), [])
  let resynced = 0
  for (const p of projects) {
    if (!p.path) continue
    // Sync protocol files to every registered project (non-destructive)
    syncProtocol(p.path)
    resynced++
    // Do NOT restart running processes — run.sh picks up new files at next iteration.
    // Restarting kills Claude mid-work and wastes cycles.
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
  if (fs.existsSync(alto)) fs.unlinkSync(alto)
  // Remove usage limit signal if present
  const usageSignal = path.join(dir, USAGE_LIMIT_SIGNAL)
  if (fs.existsSync(usageSignal)) try { fs.unlinkSync(usageSignal) } catch {}
  // Ensure shared memory directory exists
  const sharedMem = path.join(require('os').homedir(), '.director-suite', 'shared-memory')
  fs.mkdirSync(sharedMem, { recursive: true })

  // ── Resource allocation from mixer weights ──────────────────────────────
  const cfg = readJSON(path.join(dir, '.claude/orchestra.json'), {})
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
  writeJSON(path.join(telDir, 'current-allocation.json'), allocation)

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
        let existing = fs.existsSync(directivePath) ? fs.readFileSync(directivePath, 'utf8') : ''
        if (existing.includes('## NEXT ITEM')) {
          const nextItemContent = existing.substring(existing.indexOf('## NEXT ITEM'))
          lines.push('')
          lines.push(nextItemContent)
        }
        fs.writeFileSync(directivePath, lines.join('\n'))
      } catch {}
    } else {
      try { 
        let existing = fs.existsSync(directivePath) ? fs.readFileSync(directivePath, 'utf8') : ''
        if (existing.includes('## NEXT ITEM')) {
          const nextItemContent = existing.substring(existing.indexOf('## NEXT ITEM'))
          fs.writeFileSync(directivePath, nextItemContent)
        } else {
          fs.unlinkSync(directivePath)
        }
      } catch {}
    }
  } else {
    try { 
      let existing = fs.existsSync(directivePath) ? fs.readFileSync(directivePath, 'utf8') : ''
      if (existing.includes('## NEXT ITEM')) {
        const nextItemContent = existing.substring(existing.indexOf('## NEXT ITEM'))
        fs.writeFileSync(directivePath, nextItemContent)
      } else {
        fs.unlinkSync(directivePath)
      }
    } catch {}
  }

  child.on('exit', code => {
    snapshotMixer(dir, 'exit')
    procs.delete(dir)
    pollGitCommits(dir)
    stopTailing(dir)
    stopMetricsSampling(dir)

    // Final telemetry persistence
    scheduler.persistTelemetry(dir)
    scheduler.cleanup(dir)
    coordinator.unregister(dir)

    try { fs.unlinkSync(path.join(dir, '.claude/ORCHESTRA_PID')) } catch {}
    // Check if exited due to usage limit — start watching for resume
    const usageSig = path.join(dir, USAGE_LIMIT_SIGNAL)
    if (fs.existsSync(usageSig)) {
      const state = aiState()
      state[agent].credits = 0
      const nextAgent = nextAvailableAi(state, agent)
      writeJSON(aiStateFile(), state)
      if (nextAgent) {
        try { fs.unlinkSync(usageSig) } catch {}
        persistLifecycleEvent(dir, 'usage_limit', 'SWITCH', `${state[agent].label} sin créditos — cambiando a ${state[nextAgent].label}`)
        setTimeout(() => {
          if (!isRunning(dir)) {
            const cfgPath = path.join(dir, '.claude/orchestra.json')
            try {
              const cfg = readJSON(cfgPath, {})
              cfg.agent = nextAgent
              if (AI_DEFAULTS[nextAgent]?.defaultModel) cfg.model = AI_DEFAULTS[nextAgent].defaultModel
              writeJSON(cfgPath, cfg)
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
        watchForResume(dir)
        if (win && !win.isDestroyed()) win.webContents.send('orchestra:usage_limit', { dir })
      }
    } else {
      persistLifecycleEvent(dir, 'exit', 'FIN', `Interpretación finalizada (código ${code})`)
      try {
        const roadmapPath = path.join(dir, 'ROADMAP.md')
        if (fs.existsSync(roadmapPath)) {
          const lines = fs.readFileSync(roadmapPath, 'utf8').split('\n')
          const nextItem = lines.find(l => l.trim().startsWith('- [ ]'))
          if (nextItem) {
            persistLifecycleEvent(dir, 'directive', 'DIRECTOR', `Siguiente item indicado: ${nextItem}`)
            const directivePath = path.join(dir, '.claude', 'PRODUCT_DIRECTIVE.md')
            let content = fs.existsSync(directivePath) ? fs.readFileSync(directivePath, 'utf8') : ''
            const nextIdx = content.indexOf('## NEXT ITEM')
            if (nextIdx !== -1) content = content.substring(0, nextIdx).trimEnd()
            content += `\n\n## NEXT ITEM\nEl proceso ha parado. Tu siguiente objetivo es:\n${nextItem}\n`
            fs.writeFileSync(directivePath, content)
          }
        }
      } catch (err) {}

      const altoPath = path.join(dir, '.claude', 'ALTO')
      if (!fs.existsSync(altoPath)) {
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
  const projects = readJSON(store(), [])
  return projects.map(p => ({ ...p, ...projectInfo(p.path) }))
})

ipcMain.handle('repertoire:add', async (_e, droppedPath) => {
  let dir = droppedPath
  if (!dir) {
    const r = await dialog.showOpenDialog(win, { properties: ['openDirectory'] })
    if (r.canceled) return null
    dir = r.filePaths[0]
  }
  if (fs.existsSync(dir) && !fs.statSync(dir).isDirectory()) dir = path.dirname(dir)
  const projects = readJSON(store(), [])
  if (!projects.find(p => p.path === dir)) {
    projects.push({ id: Date.now().toString(36), name: path.basename(dir), path: dir, added: new Date().toISOString() })
    writeJSON(store(), projects)
  }
  return dir
})

ipcMain.handle('repertoire:remove', (_e, dir) => {
  writeJSON(store(), readJSON(store(), []).filter(p => p.path !== dir))
  stopWatchingResume(dir)
  return true
})

ipcMain.handle('repertoire:open', (_e, dir) => {
  if (dir && fs.existsSync(dir)) {
    shell.openPath(dir)
    return true
  }
  return false
})

ipcMain.handle('repertoire:readFile', (_e, dir, subpath) => {
  if (!dir || typeof subpath !== 'string' || !subpath.trim()) return null
  const p = path.join(dir, subpath)
  if (!p.startsWith(dir)) return null
  try {
    return fs.readFileSync(p, 'utf8')
  } catch {
    return null
  }
})

ipcMain.handle('orchestra:install', (_e, dir) => {
  copyDir(orchestraSrc(), dir)
  try { fs.chmodSync(path.join(dir, 'run.sh'), 0o755) } catch {}
  const hooks = path.join(dir, '.claude/hooks')
  if (fs.existsSync(hooks)) for (const f of fs.readdirSync(hooks)) { try { fs.chmodSync(path.join(hooks, f), 0o755) } catch {} }
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
  const start = Math.max(0, providers.indexOf(currentAgent))
  for (let offset = 1; offset < providers.length; offset++) {
    const candidate = providers[(start + offset) % providers.length]
    if (state[candidate].credits > 0) return candidate
  }
  return null
}
function nextReset() {
  const time = new Date()
  time.setHours(14, 30, 0, 0)
  if (time <= new Date()) time.setDate(time.getDate() + 1)
  return time.toISOString()
}
function aiState() {
  const state = readJSON(aiStateFile(), {})
  for (const [id, defaults] of Object.entries(AI_DEFAULTS)) {
    const existingReset = state[id]?.resetAt
    const newReset = existingReset === undefined ? defaults.resetAt : existingReset
    state[id] = { ...defaults, ...state[id], resetAt: newReset }
    state[id].models = defaults.models
    state[id].defaultModel = defaults.defaultModel
    if (state[id].resetAt && new Date(state[id].resetAt) <= new Date()) {
      state[id].credits = 100
      state[id].resetAt = nextReset()
    }
  }
  writeJSON(aiStateFile(), state)
  return state
}
ipcMain.handle('ai:credits', () => aiState())
ipcMain.handle('ai:select', (_e, id) => {
  const state = aiState()
  if (!state[id]) return { ok: false, error: 'Unknown AI' }
  state.selected = id
  writeJSON(aiStateFile(), state)
  return { ok: true }
})

// ─── AI Auth: status check & login ──────────────────────────────────────────
const { execSync, exec } = require('child_process')

ipcMain.handle('ai:auth-status', (_e, id) => {
  try {
    if (id === 'claude') {
      const out = execSync('claude auth status 2>&1', { encoding: 'utf8', timeout: 5000 })
      const logged = out.includes('"loggedIn": true') || out.includes('"loggedIn":true')
      const email = (out.match(/"email":\s*"([^"]+)"/) || [])[1] || null
      return { loggedIn: logged, email }
    }
    if (id === 'codex') {
      const out = execSync('codex login status 2>&1', { encoding: 'utf8', timeout: 5000 })
      const logged = out.includes('Logged in')
      return { loggedIn: logged }
    }
    if (id === 'agy') {
      // agy uses browser-based auth, check if it can run
      try { execSync('agy --help', { encoding: 'utf8', timeout: 3000 }); return { loggedIn: true } } catch { return { loggedIn: false } }
    }
    if (id === 'aider') {
      // aider uses API keys from env
      const hasKey = !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
      return { loggedIn: hasKey, note: hasKey ? 'API key found' : 'Set OPENAI_API_KEY or ANTHROPIC_API_KEY' }
    }
    return { loggedIn: false }
  } catch {
    return { loggedIn: false }
  }
})

ipcMain.handle('ai:login', (_e, id) => {
  try {
    if (id === 'claude') {
      exec('claude auth login', { timeout: 120000 })
      return { ok: true, msg: 'Claude login opened in browser' }
    }
    if (id === 'codex') {
      exec('codex login', { timeout: 120000 })
      return { ok: true, msg: 'Codex login opened in browser' }
    }
    if (id === 'aider') {
      return { ok: false, msg: 'Aider uses API keys. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your shell profile.' }
    }
    if (id === 'agy') {
      exec('agy', { timeout: 120000 })
      return { ok: true, msg: 'Antigravity session started — authenticate in the opened window' }
    }
    return { ok: false, msg: 'Unknown provider' }
  } catch (e) {
    return { ok: false, msg: e.message }
  }
})

ipcMain.handle('orchestra:play', (_e, dir, agent) => {
  const state = aiState()
  if (!agent || !state[agent]) return { ok: false, err: 'Select an AI developer first' }
  state.selected = agent
  state[agent].credits = Math.max(0, state[agent].credits - 1)
  writeJSON(aiStateFile(), state)
  persistLifecycleEvent(dir, 'play', 'BATUTA', 'Orden de interpretar')
  return playOrchestra(dir, agent)
})

ipcMain.handle('orchestra:fine', (_e, dir) => {
  snapshotMixer(dir, 'fine')
  fs.writeFileSync(path.join(dir, '.claude/ALTO'), '')
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
  if (!dir) return
  const stdoutLog = path.join(dir, '.claude/logs/orchestra-stdout.log')
  const masterLog = path.join(dir, '.claude/logs/orchestra.log')
  try { if (fs.existsSync(stdoutLog)) fs.writeFileSync(stdoutLog, '') } catch {}
  try { if (fs.existsSync(masterLog)) fs.writeFileSync(masterLog, '') } catch {}
})

ipcMain.handle('orchestra:tail', (_e, dir) => {
  if (!dir) return ''
  const masterLog = path.join(dir, '.claude/logs/orchestra.log')
  const log = masterLog
  if (!fs.existsSync(log)) return ''
  const s = fs.readFileSync(log, 'utf8')
  return s.split('\n').slice(-400).join('\n')
})

// ─── Mixer snapshot ───────────────────────────────────────────────────────────
function snapshotMixer(dir, event) {
  if (!dir) return
  const cfg = readJSON(path.join(dir, '.claude/orchestra.json'), null)
  if (!cfg || !cfg.focus) return
  const histFile = path.join(dir, '.claude/mixer-history.json')
  const hist = readJSON(histFile, [])
  hist.push({ ts: new Date().toISOString(), event, focus: { ...cfg.focus } })
  writeJSON(histFile, hist)
}

ipcMain.handle('mixer:read',  (_e, dir) => {
  if (!dir) return null
  return readJSON(path.join(dir, '.claude/orchestra.json'), null)
})
ipcMain.handle('mixer:write', (_e, dir, focus) => {
  if (!dir) return false
  const p = path.join(dir, '.claude/orchestra.json')
  const cfg = readJSON(p, { version: '2.0.0' })
  cfg.focus = focus
  writeJSON(p, cfg)
  return true
})

ipcMain.handle('orchestra:writeConfig', (_e, dir, cfg) => {
  if (!dir) return false
  const p = path.join(dir, '.claude/orchestra.json')
  writeJSON(p, cfg)
  return true
})

// ─── Saved mixes (named snapshots) ───────────────────────────────────────────
ipcMain.handle('mixer:saved:list', (_e, dir) => {
  if (!dir) return []
  const p = path.join(dir, '.claude/saved-mixes.json')
  const userMixes = readJSON(p, [])
  // Load preset mixes from Director's shipped defaults
  const presetsFile = path.join(orchestraSrc(), '.claude/default-mixes.json')
  const presets = readJSON(presetsFile, [])
  // Merge: presets first (if not already in user list), then user mixes
  const existingIds = new Set(userMixes.map(m => m.id))
  const merged = [...presets.filter(p => !existingIds.has(p.id)), ...userMixes]
  return merged
})

ipcMain.handle('mixer:saved:save', (_e, dir, name, focus) => {
  if (!dir) return false
  const p = path.join(dir, '.claude/saved-mixes.json')
  const mixes = readJSON(p, [])
  mixes.push({ id: Date.now().toString(36), name, ts: new Date().toISOString(), focus })
  writeJSON(p, mixes)
  return true
})

ipcMain.handle('mixer:saved:delete', (_e, dir, id) => {
  if (!dir) return false
  const p = path.join(dir, '.claude/saved-mixes.json')
  const mixes = readJSON(p, []).filter(m => m.id !== id)
  writeJSON(p, mixes)
  return true
})

ipcMain.handle('mixer:saved:export', (_e, dir, id) => {
  if (!dir) return null
  const mixes = readJSON(path.join(dir, '.claude/saved-mixes.json'), [])
  const mix = mixes.find(m => m.id === id)
  if (!mix) return null
  return JSON.stringify(mix, null, 2)
})

// ─── Mixer history (F-17) ───────────────────────────────────────────────────
ipcMain.handle('mixer:history', (_e, dir, limit) => {
  if (!dir) return []
  const hist = readJSON(path.join(dir, '.claude/mixer-history.json'), [])
  const n = typeof limit === 'number' && limit > 0 ? limit : 50
  return hist.slice(-n)
})

// ─── Cross-project session summary (F-18) ───────────────────────────────────
ipcMain.handle('metrics:session-summary', () => {
  const projects = readJSON(store(), [])
  let active = 0, idle = 0, totalTokens = 0, worstCompliance = null
  for (const p of projects) {
    if (!p.path) continue
    if (isRunning(p.path)) active++; else idle++
    try {
      const ctx = contextProto.getMetrics(p.path)
      if (ctx && ctx.aggregated) totalTokens += ctx.aggregated.totalTokensProcessed || 0
    } catch {}
    try {
      const reportPath = path.join(p.path, 'ORCHESTRA_REPORT.md')
      const lines = fs.readFileSync(reportPath, 'utf8').split('\n').filter(l => l.includes('COMPLIANCE'))
      if (lines.length) {
        const last = parseComplianceLine(lines[lines.length - 1])
        if (last && (worstCompliance === null || last.score < worstCompliance.score)) {
          worstCompliance = { dir: p.path, name: p.name, ...last }
        }
      }
    } catch {}
  }
  return { active, idle, total: projects.length, totalTokens, worstCompliance }
})

// ─── Read iteration log summary ──────────────────────────────────────────────
ipcMain.handle('orchestra:readIterLog', (_e, dir, logPath) => {
  if (!dir || typeof logPath !== 'string' || !logPath.trim()) return ''
  const fullPath = path.isAbsolute(logPath) ? logPath : path.join(dir, logPath)
  if (!fullPath.startsWith(dir)) return ''
  try {
    const content = fs.readFileSync(fullPath, 'utf8').trim()
    if (!content) return ''
    const lines = content.split('\n').filter(l => l.trim())
    return lines.slice(-8).join('\n')
  } catch {
    return ''
  }
})

// ─── Analysis ─────────────────────────────────────────────────────────────────
ipcMain.handle('orchestra:analyze', (_e, dir) => {
  if (!dir) return Promise.resolve({ report: 'No project selected', file: null })
  return new Promise(resolve => {
    const read = f => { try { return fs.readFileSync(path.join(dir, f), 'utf8') } catch { return '' } }
    const started = read('.claude/RUN_STARTED').trim()
    execFile('git', ['-C', dir, 'log', '--oneline', '--since', started || '30 days ago'], (gitErr, gitOut) => {
      const commits = gitErr ? [] : (gitOut || '').trim().split('\n').filter(Boolean)
      const cat = {}
      for (const c of commits) {
        const m = c.match(/ (feat|fix|test|refactor|chore|security|sec|perf|docs|style|i18n)[:(]/)
        const k = m ? m[1] : 'other'
        cat[k] = (cat[k] || 0) + 1
      }
      // Fetch local metrics
      const usage = getClaudeUsage(dir)
      const complianceLines = read('ORCHESTRA_REPORT.md').split('\n').filter(l => l.includes('COMPLIANCE'))
      const avgCompliance = complianceLines.length ? 'Calculated from log' : 'N/A'

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
        read('ORCHESTRA_REPORT.md').split('\n').slice(-150).join('\n'),
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
      try { fs.writeFileSync(outFile, report) } catch {}
      resolve({ report, file: outFile })
    })
  })
})

// ─── Lifecycle events persistence ─────────────────────────────────────────────
function persistLifecycleEvent(dir, type, label, message) {
  if (!dir) return
  try {
    const logDir = path.join(dir, '.claude', 'logs')
    fs.mkdirSync(logDir, { recursive: true })
    const file = path.join(logDir, 'lifecycle-events.json')
    const events = readJSON(file, [])
    events.push({ ts: new Date().toISOString(), type, label, message })
    if (events.length > 500) events.splice(0, events.length - 500)
    writeJSON(file, events)
  } catch {}
}

ipcMain.handle('lifecycle:list', (_e, dir) => {
  if (!dir) return []
  return readJSON(path.join(dir, '.claude', 'logs', 'lifecycle-events.json'), [])
})

ipcMain.handle('lifecycle:add', (_e, dir, type, label, message) => {
  persistLifecycleEvent(dir, type, label, message)
  return true
})

// ─── Telemetry / Metrics IPC ──────────────────────────────────────────────────
ipcMain.handle('metrics:resource', (_e, dir) => {
  if (!dir) return null
  const live = scheduler.getMetrics(dir)
  if (live && live.allocation) return live
  // Compute allocation from current mixer weights on demand
  const cfg = readJSON(path.join(dir, '.claude/orchestra.json'), {})
  if (cfg.focus) {
    const alloc = scheduler.computeAllocation(dir, cfg.focus)
    return { allocation: alloc, baseline: null, lastSample: null, efficiency: null, sampleCount: 0 }
  }
  return live
})

ipcMain.handle('metrics:context', (_e, dir) => {
  if (!dir) return null
  const live = contextProto.getMetrics(dir)
  if (live && live.lastDelta) return live
  // Read persisted telemetry if no live data
  const file = path.join(dir, '.claude', 'telemetry', 'context-metrics.json')
  const hist = readJSON(file, [])
  if (hist.length > 0) {
    const last = hist[hist.length - 1]
    let totalProcessed = 0, totalSaved = 0
    for (const m of hist) { totalProcessed += m.totalTokens || 0; totalSaved += m.totalTokensSaved || 0 }
    return {
      lastDelta: { metrics: last },
      aggregated: {
        cycles: hist.length,
        totalTokensProcessed: totalProcessed,
        totalTokensSaved: totalSaved,
        cumulativeCompression: totalProcessed > 0 ? Math.round((totalSaved/totalProcessed)*1000)/10 : 0,
        avgSavedPerCycle: hist.length > 0 ? Math.floor(totalSaved/hist.length) : 0
      },
      historySize: hist.length
    }
  }
  return live
})

ipcMain.handle('metrics:coordination', () => {
  return coordinator.getStatus()
})

ipcMain.handle('metrics:snapshot', (_e, dir) => {
  if (!dir) return null
  const cfg = readJSON(path.join(dir, '.claude/orchestra.json'), {})
  return contextProto.computeDelta(dir, cfg.focus || {})
})

ipcMain.handle('metrics:allocation', (_e, dir) => {
  if (!dir) return null
  const cfg = readJSON(path.join(dir, '.claude/orchestra.json'), {})
  return scheduler.computeAllocation(dir, cfg.focus || {})
})

ipcMain.handle('metrics:claude-usage', (_e, dir) => {
  if (!dir) return null
  return getClaudeUsage(dir)
})

// ─── Compliance Metrics ───────────────────────────────────────────────────────
function parseComplianceLine(line) {
  const m = line.match(/COMPLIANCE\s+(.+?)(?:\s+DRIFT:(.*?))?(?:\s+TESTS:(\w+))?$/)
  if (!m) return null
  const pairs = m[1].trim().split(/\s+/)
  const drift = m[2] ? m[2].trim() : 'none'
  const tests = m[3] || 'unknown'
  let totalPlanned = 0, totalActual = 0
  const categories = {}
  for (const p of pairs) {
    const pm = p.match(/([^:]+):(\d+)\/(\d+)/)
    if (!pm) continue
    const actual = parseInt(pm[2], 10), planned = parseInt(pm[3], 10)
    categories[pm[1]] = { actual, planned }
    totalPlanned += planned
    totalActual += Math.min(actual, planned)
  }
  const score = totalPlanned > 0 ? Math.round(totalActual / totalPlanned * 100) : null
  return { categories, drift, tests, score, totalPlanned, totalActual }
}

ipcMain.handle('metrics:compliance', (_e, dir) => {
  if (!dir) return null
  const reportPath = path.join(dir, 'ORCHESTRA_REPORT.md')
  try {
    const lines = fs.readFileSync(reportPath, 'utf8').split('\n').filter(l => l.includes('COMPLIANCE'))
    if (!lines.length) return null
    const recent = lines.slice(-10)
    const scores = recent.map(l => parseComplianceLine(l)).filter(Boolean).map(c => c.score)
    const last = parseComplianceLine(recent[recent.length - 1])
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
    return { last, avgScore: avg, cycles: scores.length, history: scores }
  } catch { return null }
})

ipcMain.handle('metrics:roadmap-freshness', (_e, dir) => {
  if (!dir) return null
  const roadmapPath = path.join(dir, 'ROADMAP.md')
  if (!fs.existsSync(roadmapPath)) return { exists: false }
  const mtime = fs.statSync(roadmapPath).mtimeMs
  return new Promise(resolve => {
    execFile('git', ['-C', dir, 'log', '-1', '--format=%ct'], (err, stdout) => {
      if (err || !stdout.trim()) return resolve({ exists: true, mtime, isStale: false })
      const lastCommitMs = parseInt(stdout.trim(), 10) * 1000
      const staleHours = Math.round((lastCommitMs - mtime) / 3_600_000)
      resolve({ exists: true, mtime, lastCommit: lastCommitMs, staleHours, isStale: staleHours > 24 && lastCommitMs > mtime })
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
  if (!dir) return null
  const bundled = (() => { try { return fs.readFileSync(path.join(orchestraSrc(), '.claude/ORCHESTRA_VERSION'), 'utf8').trim() } catch { return null } })()
  const project = (() => { try { return fs.readFileSync(path.join(dir, '.claude/ORCHESTRA_VERSION'), 'utf8').trim() } catch { return null } })()
  return { bundled, project, needsUpgrade: !!(bundled && project && bundled !== project) }
})

ipcMain.handle('orchestra:upgrade', (_e, dir) => {
  if (!dir) return { ok: false, err: 'No project' }
  const src = orchestraSrc()
  // Purge legacy files before upgrading
  for (const f of LEGACY_PURGE) {
    try { fs.unlinkSync(path.join(dir, f)) } catch {}
  }
  const upgraded = [], errors = []
  for (const f of UPGRADE_FILES) {
    const srcPath = path.join(src, f), dstPath = path.join(dir, f)
    if (!fs.existsSync(srcPath)) continue
    try {
      if (fs.existsSync(dstPath)) fs.copyFileSync(dstPath, dstPath + '.bak')
      fs.mkdirSync(path.dirname(dstPath), { recursive: true })
      fs.copyFileSync(srcPath, dstPath)
      if (f === 'run.sh') try { fs.chmodSync(dstPath, 0o755) } catch {}
      upgraded.push(f)
    } catch (e) { errors.push(`${f}: ${e.message}`) }
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
  if (!pid || pid === process.pid) return { ok: false, err: 'invalid pid' }
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

ipcMain.handle('atriles:list', () => {
  return readJSON(customAtrilesFile(), [])
})

ipcMain.handle('atriles:save', (_e, atriles) => {
  if (!Array.isArray(atriles) || atriles.length > 200) return false
  const valid = atriles.every(a => a && typeof a === 'object' && typeof a.name === 'string' && typeof a.path === 'string')
  if (!valid) return false
  writeJSON(customAtrilesFile(), atriles)
  return true
})

// ─── Blueprint / Discovery Interview ─────────────────────────────────────────
const blueprintFile = (dir) => path.join(dir, '.claude', 'blueprint.json')

ipcMain.handle('blueprint:load', (_e, dir) => {
  if (!dir) return null
  return readJSON(blueprintFile(dir), null)
})

ipcMain.handle('blueprint:save', (_e, dir, data) => {
  if (!dir) return false
  const p = blueprintFile(dir)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  writeJSON(p, data)
  return true
})

ipcMain.handle('blueprint:generate-brief', (_e, dir) => {
  if (!dir) return null
  const bp = readJSON(blueprintFile(dir), null)
  if (!bp || !bp.answers) return null

  const a = bp.answers
  const modules = bp.modules || []
  const sessions = bp.sessions || []
  const ts = new Date().toISOString()

  // Generate comprehensive brief for the orchestra's first cycle
  const lines = [
    `# PROJECT BLUEPRINT — Generated ${ts}`,
    `# This file was produced by Director Suite's Discovery Agent.`,
    `# The orchestra will use this as its primary context for Phase 0.`,
    '',
    '## PROJECT IDENTITY',
    `- **Name:** ${a.projectName || '(unnamed)'}`,
    `- **Description:** ${a.description || '(none)'}`,
    `- **Type:** ${a.projectType || '(unspecified)'}`,
    `- **Primary language/stack:** ${a.stack || '(unspecified)'}`,
    '',
    '## SCOPE & MAGNITUDE',
    `- **Size estimate:** ${a.magnitude || '(unknown)'}`,
    `- **Timeline:** ${a.timeline || '(open-ended)'}`,
    `- **Team size:** ${a.teamSize || '(solo)'}`,
    `- **MVP scope:** ${a.mvpScope || '(undefined)'}`,
    `- **Budget constraints:** ${a.budget || '(none stated)'}`,
    '',
    '## TARGET USERS & AUDIENCE',
    `- **Primary users:** ${a.primaryUsers || '(unspecified)'}`,
    `- **Expected user count:** ${a.userScale || '(unknown)'}`,
    `- **Countries/regions:** ${a.countries || '(global)'}`,
    `- **Languages required:** ${a.languages || 'es'}`,
    `- **Accessibility requirements:** ${a.accessibility || '(standard)'}`,
    '',
    '## PLATFORM & DEPLOYMENT',
    `- **Target platforms:** ${a.platforms || '(unspecified)'}`,
    `- **OS/runtime:** ${a.os || '(any)'}`,
    `- **Hosting/cloud:** ${a.hosting || '(undecided)'}`,
    `- **CI/CD:** ${a.cicd || '(none yet)'}`,
    `- **Domain/DNS:** ${a.domain || '(none)'}`,
    '',
    '## SECURITY & COMPLIANCE',
    `- **Auth method:** ${a.auth || '(undecided)'}`,
    `- **Security level:** ${a.securityLevel || 'standard'}`,
    `- **Data sensitivity:** ${a.dataSensitivity || '(low)'}`,
    `- **Regulations:** ${a.regulations || '(none)'}`,
    `- **Legal constraints:** ${a.legal || '(none)'}`,
    `- **Privacy policy needed:** ${a.privacyPolicy || 'no'}`,
    '',
    '## DATA & INTEGRATIONS',
    `- **Primary database:** ${a.database || '(undecided)'}`,
    `- **External APIs:** ${a.externalApis || '(none)'}`,
    `- **File storage:** ${a.fileStorage || '(local)'}`,
    `- **Real-time requirements:** ${a.realtime || '(none)'}`,
    `- **Data migration needs:** ${a.dataMigration || '(none)'}`,
    '',
    '## UX & DESIGN',
    `- **Design style/theme:** ${a.designTheme || '(modern default)'}`,
    `- **Branding:** ${a.branding || '(none yet)'}`,
    `- **Reference sites/apps:** ${a.references || '(none)'}`,
    `- **Mobile-first:** ${a.mobileFirst || 'no'}`,
    '',
    '## PERFORMANCE & SCALE',
    `- **Expected concurrent users:** ${a.concurrentUsers || '(low)'}`,
    `- **SLA requirements:** ${a.sla || '(none)'}`,
    `- **Caching strategy:** ${a.caching || '(default)'}`,
    `- **CDN needed:** ${a.cdn || 'no'}`,
    '',
    '## BUSINESS RULES',
    `- **Core business logic:** ${a.businessLogic || '(to be defined)'}`,
    `- **Workflows:** ${a.workflows || '(none)'}`,
    `- **Monetization:** ${a.monetization || '(none)'}`,
    `- **Roles/permissions:** ${a.roles || '(single role)'}`,
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
  const brief = lines.join('\n')
  const briefPath = path.join(dir, '.claude', 'BLUEPRINT.md')
  try {
    fs.writeFileSync(briefPath, brief)
  } catch {}

  // Also generate initial ROADMAP.md from modules if none exists
  const roadmapPath = path.join(dir, 'ROADMAP.md')
  if (!fs.existsSync(roadmapPath) && modules.length > 0) {
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
    try { fs.writeFileSync(roadmapPath, roadmapLines.join('\n')) } catch {}
  }

  return { brief, briefPath, roadmapGenerated: !fs.existsSync(roadmapPath) }
})

ipcMain.handle('blueprint:readiness', (_e, dir) => {
  if (!dir) return { ready: false, missing: ['project'] }
  const bp = readJSON(blueprintFile(dir), null)
  if (!bp || !bp.answers) return { ready: false, missing: ['blueprint'], hasBlueprint: false }

  const a = bp.answers
  const missing = []
  if (!a.projectName) missing.push('nombre del proyecto')
  if (!a.description) missing.push('descripción')
  if (!a.stack) missing.push('stack tecnológico')
  if (!a.projectType) missing.push('tipo de proyecto')
  if ((!bp.modules || bp.modules.length === 0) && !a.description) missing.push('módulos o descripción')

  return {
    ready: missing.length === 0,
    missing,
    hasBlueprint: true,
    completeness: bp.completeness || 0,
    sessions: (bp.sessions || []).length,
    modules: (bp.modules || []).length,
    answeredFields: Object.keys(a).filter(k => a[k] && a[k].trim()).length
  }
})

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  protocol.handle('local-img', req => {
    try {
      const raw = req.url.replace('local-img://', '')
      const fp = decodeURIComponent(raw)
      const filePath = path.resolve(fp.startsWith('/') ? fp : '/' + fp)
      const allowedDirs = readJSON(store(), []).map(p => p.path).filter(Boolean)
      allowedDirs.push(path.join(app.getPath('userData')))
      if (!allowedDirs.some(d => filePath.startsWith(d + path.sep) || filePath.startsWith(d + '/'))) {
        return new Response('', { status: 403 })
      }
      const data = fs.readFileSync(filePath)
      const ext = path.extname(filePath).toLowerCase()
      const mimeMap = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp', '.ico':'image/x-icon', '.gif':'image/gif' }
      return new Response(data, { headers: { 'Content-Type': mimeMap[ext] || 'image/png' } })
    } catch {
      return new Response('', { status: 404 })
    }
  })
  win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 940, minHeight: 620,
    backgroundColor: '#0d0d12',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 17 },
    icon: path.join(__dirname, 'logo.svg'),
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  })
  win.loadFile('index.html')

  // Start hot-reload watcher for protocol files
  startHotReloadWatcher()

  // Re-attach tailers for any already-running projects + cleanup stale signals
  const projects = readJSON(store(), [])
  for (const p of projects) {
    if (!p.path) continue
    if (isRunning(p.path) && !procs.has(p.path)) {
      const logFile = path.join(p.path, '.claude/logs/orchestra.log')
      if (fs.existsSync(logFile)) startTailing(p.path, logFile)
    }
    const usageSig = path.join(p.path, USAGE_LIMIT_SIGNAL)
    if (fs.existsSync(usageSig) && !isRunning(p.path)) {
      const pidFile = path.join(p.path, '.claude/ORCHESTRA_PID')
      let pidStillAlive = false
      if (fs.existsSync(pidFile)) {
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
