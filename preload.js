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
  play:    (p, a)  => ipcRenderer.invoke('orchestra:play', p, a),
  aiCredits: ()     => ipcRenderer.invoke('ai:credits'),
  aiSelect:  id     => ipcRenderer.invoke('ai:select', id),
  aiLogin:   id     => ipcRenderer.invoke('ai:login', id),
  aiAuthStatus: id  => ipcRenderer.invoke('ai:auth-status', id),
  fine:    p       => ipcRenderer.invoke('orchestra:fine', p),
  kill:    p       => ipcRenderer.invoke('orchestra:kill', p),
  tail:    (p, lines) => ipcRenderer.invoke('orchestra:tail', p, lines),
  clearLog: p      => ipcRenderer.invoke('orchestra:clearLog', p),
  mixerRead:  p       => ipcRenderer.invoke('mixer:read', p),
  mixerWrite: (p, f)  => ipcRenderer.invoke('mixer:write', p, f),
  configWrite: (p, c) => ipcRenderer.invoke('orchestra:writeConfig', p, c),
  analyze:    p       => ipcRenderer.invoke('orchestra:analyze', p),
  readIterLog: (p, l)  => ipcRenderer.invoke('orchestra:readIterLog', p, l),
  // Saved mixes
  mixerSavedList:   p           => ipcRenderer.invoke('mixer:saved:list', p),
  mixerSavedSave:   (p, n, f)   => ipcRenderer.invoke('mixer:saved:save', p, n, f),
  mixerSavedDelete: (p, id)     => ipcRenderer.invoke('mixer:saved:delete', p, id),
  mixerSavedExport: (p, id)     => ipcRenderer.invoke('mixer:saved:export', p, id),
  // Mixer history (F-17) + Session summary (F-18)
  mixerHistory:    (p, n) => ipcRenderer.invoke('mixer:history', p, n),
  sessionSummary:  ()     => ipcRenderer.invoke('metrics:session-summary'),
  // Lifecycle events
  lifecycleList:       (p, limit)  => ipcRenderer.invoke('lifecycle:list', p, limit),
  lifecycleAdd:        (p, t, l, m) => ipcRenderer.invoke('lifecycle:add', p, t, l, m),
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
  orchestraVersionCheck: p  => ipcRenderer.invoke('orchestra:version-check', p),
  orchestraUpgrade:      p  => ipcRenderer.invoke('orchestra:upgrade', p),
  // Blueprint / Discovery
  blueprintLoad:      p        => ipcRenderer.invoke('blueprint:load', p),
  blueprintSave:      (p, d)   => ipcRenderer.invoke('blueprint:save', p, d),
  blueprintGenerate:  p        => ipcRenderer.invoke('blueprint:generate-brief', p),
  blueprintReadiness: p        => ipcRenderer.invoke('blueprint:readiness', p),
  // Custom Atriles (app-wide)
  atrilesList:        ()       => ipcRenderer.invoke('atriles:list'),
  atrilesSave:        a        => ipcRenderer.invoke('atriles:save', a),
  // Alert notifications (F-22)
  alertsConfig:       cfg      => ipcRenderer.invoke('alerts:config', cfg),
  alertsRead:         ()       => ipcRenderer.invoke('alerts:read'),
  // Session export (F-23)
  exportSession:      dir      => ipcRenderer.invoke('export:session', dir),
  // Operator notes (F-25)
  notesRead:          dir      => ipcRenderer.invoke('notes:read', dir),
  notesWrite:         (dir, c) => ipcRenderer.invoke('notes:write', dir, c),
  // Events
  onLine:        cb => ipcRenderer.on('orchestra:line',        (_e, d) => cb(d)),
  onExit:        cb => ipcRenderer.on('orchestra:exit',        (_e, d) => cb(d)),
  onResumed:     cb => ipcRenderer.on('orchestra:resumed',     (_e, d) => cb(d)),
  onUsageLimit:  cb => ipcRenderer.on('orchestra:usage_limit', (_e, d) => cb(d)),
  onMetrics:     cb => ipcRenderer.on('metrics:update',        (_e, d) => cb(d)),
})
