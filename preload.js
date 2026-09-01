// Copyright (c) 2026 René Antonio Casaña Amaya. All rights reserved.
// Licensed under the AGPL-3.0 License. See LICENSE in repository root.

const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('director', {
  list:    ()      => ipcRenderer.invoke('repertoire:list'),
  add:     p       => ipcRenderer.invoke('repertoire:add', p),
  remove:  p       => ipcRenderer.invoke('repertoire:remove', p),
  openDir: p       => ipcRenderer.invoke('repertoire:open', p),
  readFile: (p, s) => ipcRenderer.invoke('repertoire:readFile', p, s),
  install: p       => ipcRenderer.invoke('orchestra:install', p),
  play:    (p, a)  => {
    if (typeof a !== 'string' || a.length === 0 || a.length > 64) return Promise.resolve({ ok: false, err: 'invalid agent' })
    return ipcRenderer.invoke('orchestra:play', p, a)
  },
  aiCredits: ()     => ipcRenderer.invoke('ai:credits'),
  aiSelect:  id     => {
    if (typeof id !== 'string' || id.length === 0 || id.length > 64) return Promise.resolve({ ok: false, error: 'Unknown AI' })
    return ipcRenderer.invoke('ai:select', id)
  },
  aiLogin:   id     => {
    if (typeof id !== 'string' || id.length === 0 || id.length > 64) return Promise.resolve({ ok: false, msg: 'Unknown provider' })
    return ipcRenderer.invoke('ai:login', id)
  },
  aiAuthStatus: id  => {
    if (typeof id !== 'string' || id.length === 0 || id.length > 64) return Promise.resolve({ loggedIn: false })
    return ipcRenderer.invoke('ai:auth-status', id)
  },
  fine:    p       => ipcRenderer.invoke('orchestra:fine', p),
  kill:    p       => ipcRenderer.invoke('orchestra:kill', p),
  tail:    (p, lines) => ipcRenderer.invoke('orchestra:tail', p, Number.isInteger(lines) && lines > 0 && lines <= 1000 ? lines : 400),
  clearLog: p      => ipcRenderer.invoke('orchestra:clearLog', p),
  mixerRead:  p       => ipcRenderer.invoke('mixer:read', p),
  mixerWrite: (p, f)  => {
    if (!f || typeof f !== 'object' || Array.isArray(f)) return Promise.resolve(false)
    return ipcRenderer.invoke('mixer:write', p, f)
  },
  configWrite: (p, c) => {
    if (!c || typeof c !== 'object' || Array.isArray(c)) return Promise.resolve(false)
    return ipcRenderer.invoke('orchestra:writeConfig', p, c)
  },
  analyze:    p       => ipcRenderer.invoke('orchestra:analyze', p),
  readIterLog: (p, l)  => {
    if (typeof l !== 'string' || !l.trim()) return Promise.resolve('')
    return ipcRenderer.invoke('orchestra:readIterLog', p, l)
  },
  // Saved mixes
  mixerSavedList:   p           => ipcRenderer.invoke('mixer:saved:list', p),
  mixerSavedSave:   (p, n, f)   => {
    if (typeof n !== 'string' || n.length === 0 || n.length > 256) return Promise.resolve(false)
    if (!f || typeof f !== 'object' || Array.isArray(f)) return Promise.resolve(false)
    return ipcRenderer.invoke('mixer:saved:save', p, n, f)
  },
  mixerSavedDelete: (p, id)     => {
    if (typeof id !== 'string' || id.length === 0 || id.length > 64 || !/^[0-9a-z]+$/.test(id)) return Promise.resolve(false)
    return ipcRenderer.invoke('mixer:saved:delete', p, id)
  },
  mixerSavedExport: (p, id)     => {
    if (typeof id !== 'string' || id.length === 0 || id.length > 64 || !/^[0-9a-z]+$/.test(id)) return Promise.resolve(null)
    return ipcRenderer.invoke('mixer:saved:export', p, id)
  },
  // Mixer history (F-17) + Session summary (F-18)
  mixerHistory:    (p, n) => ipcRenderer.invoke('mixer:history', p, Number.isInteger(n) && n > 0 && n <= 100 ? n : undefined),
  sessionSummary:  ()     => ipcRenderer.invoke('metrics:session-summary'),
  // Lifecycle events
  lifecycleList:       (p, limit, typeFilter, before)  => {
    const _llLimit = Number.isInteger(limit) && limit > 0 && limit <= 500 ? limit : undefined
    const _llType = typeof typeFilter === 'string' && typeFilter.length > 0 && typeFilter.length <= 64 && /^[\w\-]+$/.test(typeFilter) ? typeFilter : undefined
    const _llBefore = typeof before === 'string' && before.length <= 64 && /^\d{4}-\d{2}-\d{2}T/.test(before) ? before : undefined
    return ipcRenderer.invoke('lifecycle:list', p, _llLimit, _llType, _llBefore)
  },
  lifecycleAdd:        (p, t, l, m) => {
    if (typeof t !== 'string' || t.length > 64) return Promise.resolve(false)
    if (typeof l !== 'string' || l.length > 128 || l.trim().length === 0) return Promise.resolve(false)
    if (typeof m !== 'string' || m.length > 1024) return Promise.resolve(false)
    return ipcRenderer.invoke('lifecycle:add', p, t, l, m)
  },
  // Telemetry / Metrics
  metricsResource:     p       => ipcRenderer.invoke('metrics:resource', p),
  metricsContext:      p       => ipcRenderer.invoke('metrics:context', p),
  metricsCoordination: ()      => ipcRenderer.invoke('metrics:coordination'),
  metricsSnapshot:     p       => ipcRenderer.invoke('metrics:snapshot', p),
  metricsAllocation:   p       => ipcRenderer.invoke('metrics:allocation', p),
  claudeUsage:         p       => ipcRenderer.invoke('metrics:claude-usage', p),
  // System process monitor
  systemProcs:   ()        => ipcRenderer.invoke('system:claude-procs'),
  systemKill:    (pid, sig) => {
    if (!Number.isInteger(pid) || pid <= 0) return Promise.resolve(false)
    if (typeof sig !== 'string' || !['SIGTERM', 'SIGKILL'].includes(sig)) return Promise.resolve(false)
    return ipcRenderer.invoke('system:kill-proc', pid, sig)
  },
  // Compliance & health metrics
  complianceMetrics:   p  => ipcRenderer.invoke('metrics:compliance', p),
  roadmapFreshness:    p  => ipcRenderer.invoke('metrics:roadmap-freshness', p),
  // Orchestra version management
  orchestraVersionCheck: p  => { if (typeof p !== 'string' || !p) return Promise.resolve(null); return ipcRenderer.invoke('orchestra:version-check', p) },
  orchestraUpgrade:      p  => { if (typeof p !== 'string' || !p) return Promise.resolve({ ok: false }); return ipcRenderer.invoke('orchestra:upgrade', p) },
  // Blueprint / Discovery
  blueprintLoad:      p        => ipcRenderer.invoke('blueprint:load', p),
  blueprintSave:      (p, d)   => {
    if (!d || typeof d !== 'object' || Array.isArray(d)) return Promise.resolve(false)
    try { if (JSON.stringify(d).length > 524288) return Promise.resolve(false) } catch { return Promise.resolve(false) }
    return ipcRenderer.invoke('blueprint:save', p, d)
  },
  blueprintGenerate:  p        => ipcRenderer.invoke('blueprint:generate-brief', p),
  blueprintReadiness: p        => ipcRenderer.invoke('blueprint:readiness', p),
  // Custom Atriles (app-wide)
  atrilesList:        ()       => ipcRenderer.invoke('atriles:list'),
  atrilesSave:        a        => {
    if (!a || typeof a !== 'object' || !Array.isArray(a)) return Promise.resolve(false)
    return ipcRenderer.invoke('atriles:save', a)
  },
  // Alert notifications (F-22)
  alertsConfig:       cfg      => {
    if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) return Promise.resolve(null)
    const allowed = new Set(['stall', 'alto', 'usageLimit'])
    if (Object.keys(cfg).some(k => !allowed.has(k))) return Promise.resolve(null)
    if (Object.values(cfg).some(v => typeof v !== 'boolean')) return Promise.resolve(null)
    return ipcRenderer.invoke('alerts:config', cfg)
  },
  alertsRead:         ()       => ipcRenderer.invoke('alerts:read'),
  // Session export (F-23)
  exportSession:      dir      => ipcRenderer.invoke('export:session', dir),
  // Operator notes (F-25)
  notesRead:          dir      => ipcRenderer.invoke('notes:read', dir),
  notesWrite:         (dir, c) => {
    if (typeof c !== 'string' || c.length > 50000) return Promise.resolve(false)
    return ipcRenderer.invoke('notes:write', dir, c)
  },
  // Events
  onLine:        cb => ipcRenderer.on('orchestra:line',        (_e, d) => cb(d)),
  onExit:        cb => ipcRenderer.on('orchestra:exit',        (_e, d) => cb(d)),
  onResumed:     cb => ipcRenderer.on('orchestra:resumed',     (_e, d) => cb(d)),
  onUsageLimit:  cb => ipcRenderer.on('orchestra:usage_limit', (_e, d) => cb(d)),
  onMetrics:     cb => ipcRenderer.on('metrics:update',        (_e, d) => cb(d)),
})
