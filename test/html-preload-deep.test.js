import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const preload = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')

// ─── HTML document structure ───────────────────────────────────────────────
describe('index.html — document structure', () => {
  it('declares doctype html', () => {
    expect(html).toContain('<!doctype html>')
  })

  it('sets lang="es" for Spanish primary', () => {
    expect(html).toContain('html lang="es"')
  })

  it('sets charset utf-8', () => {
    expect(html).toContain('charset="utf-8"')
  })

  it('title is Director Suite', () => {
    expect(html).toContain('<title>Director Suite</title>')
  })

  it('links styles.css', () => {
    expect(html).toContain('href="styles.css"')
  })

  it('loads renderer.js before mixer-chart.js', () => {
    const rendererIdx = html.indexOf('renderer.js')
    const mixerIdx = html.indexOf('mixer-chart.js')
    expect(rendererIdx).toBeGreaterThan(0)
    expect(mixerIdx).toBeGreaterThan(rendererIdx)
  })

  it('scripts are at end of body', () => {
    const scriptIdx = html.indexOf('<script src="renderer.js">')
    const bodyCloseIdx = html.indexOf('</body>')
    expect(scriptIdx).toBeLessThan(bodyCloseIdx)
  })

  it('contains copyright comment', () => {
    expect(html).toContain('Copyright (c) 2026')
  })

  it('contains AGPL-3.0 license reference', () => {
    expect(html).toContain('AGPL-3.0')
  })
})

// ─── Modals ────────────────────────────────────────────────────────────────
describe('index.html — modal structure', () => {
  it('defines aboutModal with hidden attribute', () => {
    expect(html).toContain('id="aboutModal"')
    expect(html).toContain('aboutModal" class="modal-overlay" hidden')
  })

  it('defines settingsModal with hidden attribute', () => {
    expect(html).toContain('id="settingsModal"')
    expect(html).toContain('settingsModal" class="modal-overlay" hidden')
  })

  it('defines atrilModal with hidden attribute', () => {
    expect(html).toContain('id="atrilModal"')
    expect(html).toContain('atrilModal" class="modal-overlay" hidden')
  })

  it('about modal has close button with aria-label', () => {
    expect(html).toContain('id="closeAbout" class="modal-close" aria-label="Cerrar"')
  })

  it('settings modal has close button with aria-label', () => {
    expect(html).toContain('id="closeSettings" class="modal-close" aria-label="Cerrar"')
  })

  it('about modal shows version 0.0.6', () => {
    expect(html).toContain('v0.0.6')
  })

  it('about modal has credits section', () => {
    expect(html).toContain('about-credits')
    expect(html).toContain('DESIGN & ENGINEERING')
    expect(html).toContain('CONCEPT & ARCHITECTURE')
    expect(html).toContain('AI ORCHESTRATION PROTOCOL')
  })
})

// ─── Transport bar DOM ─────────────────────────────────────────────────────
describe('index.html — transport bar', () => {
  it('defines header#transport', () => {
    expect(html).toContain('id="transport"')
  })

  it('defines brand area with logo', () => {
    expect(html).toContain('id="brandArea"')
    expect(html).toContain('id="brandLogo"')
    expect(html).toContain('class="brand-name"')
  })

  it('defines play/fine/kill buttons with aria-labels', () => {
    expect(html).toContain('id="playBtn"')
    expect(html).toContain('aria-label="Iniciar ciclo"')
    expect(html).toContain('id="fineBtn"')
    expect(html).toContain('aria-label="Detener"')
    expect(html).toContain('id="killBtn"')
    expect(html).toContain('aria-label="Cortar"')
  })

  it('all transport control buttons start disabled', () => {
    expect(html).toContain('tp-play disabled')
    expect(html).toContain('tp-fine disabled')
    expect(html).toContain('tp-kill disabled')
  })

  it('defines AI control panel', () => {
    expect(html).toContain('id="aiControl"')
    expect(html).toContain('id="aiSelect"')
    expect(html).toContain('id="modelSelect"')
    expect(html).toContain('id="aiLoginBtn"')
    expect(html).toContain('id="aiAuthDot"')
  })

  it('AI select has 4 provider options', () => {
    const options = html.match(/value="(claude|agy|codex|aider)"/g) || []
    expect(options.length).toBeGreaterThanOrEqual(4)
  })

  it('AI selects have aria-label', () => {
    expect(html).toContain('aria-label="AI provider"')
    expect(html).toContain('aria-label="AI model"')
  })

  it('defines clock area with time and status', () => {
    expect(html).toContain('id="clockTime"')
    expect(html).toContain('id="clockStatus"')
    expect(html).toContain('class="clock-label"')
  })

  it('defines transport info with project name and status', () => {
    expect(html).toContain('id="pname"')
    expect(html).toContain('id="pstatus"')
    expect(html).toContain('id="pbadge"')
  })

  it('defines transport actions', () => {
    expect(html).toContain('id="openFolderBtn"')
    expect(html).toContain('id="installBtn"')
    expect(html).toContain('id="upgradeBtn"')
    expect(html).toContain('id="removeBtn"')
  })

  it('defines transport utilities with theme/settings/about', () => {
    expect(html).toContain('id="themeToggle"')
    expect(html).toContain('id="settingsBtn"')
    expect(html).toContain('id="aboutBtn"')
  })

  it('utility buttons have aria-labels in Spanish', () => {
    expect(html).toContain('aria-label="Cambiar tema"')
    expect(html).toContain('aria-label="Configuración"')
    expect(html).toContain('aria-label="Acerca de"')
  })
})

// ─── Workspace layout ──────────────────────────────────────────────────────
describe('index.html — workspace layout', () => {
  it('defines #workspace as flex container', () => {
    expect(html).toContain('id="workspace"')
  })

  it('defines #rack aside for project list', () => {
    expect(html).toContain('id="rack"')
  })

  it('defines #dropzone for drag-and-drop', () => {
    expect(html).toContain('id="dropzone"')
  })

  it('defines #projects list', () => {
    expect(html).toContain('id="projects"')
  })

  it('defines #stage main element', () => {
    expect(html).toContain('id="stage"')
  })

  it('defines #splitLayout', () => {
    expect(html).toContain('id="splitLayout"')
  })

  it('defines #splitDividerV', () => {
    expect(html).toContain('id="splitDividerV"')
  })
})

// ─── Console area DOM ──────────────────────────────────────────────────────
describe('index.html — console area', () => {
  it('defines #monitorStatus with idle default', () => {
    expect(html).toContain('id="monitorStatus" class="monitor-status idle"')
  })

  it('defines log filter input with aria-label', () => {
    expect(html).toContain('id="logFilterInput"')
    expect(html).toContain('aria-label="Filtrar logs"')
  })

  it('defines #metricsStrip with 9 metric cells', () => {
    expect(html).toContain('id="metricsStrip"')
    const cells = ['mmAllocVal', 'mmMemVal', 'mmTokensVal', 'mmCompressionVal',
      'mmInstancesVal', 'mmComplianceVal', 'mmRoadmapVal', 'mmBurnVal', 'mmAiUsageVal']
    for (const id of cells) {
      expect(html).toContain(`id="${id}"`)
    }
  })

  it('defines compliance sparkline SVG', () => {
    expect(html).toContain('id="complianceSpark"')
  })

  it('defines burn rate sparkline SVG', () => {
    expect(html).toContain('id="burnSpark"')
  })

  it('defines usage bar with fill element', () => {
    expect(html).toContain('class="usage-bar"')
    expect(html).toContain('id="usageBarFill"')
  })

  it('defines #allocInspector (F-13)', () => {
    expect(html).toContain('id="allocInspector"')
    expect(html).toContain('id="allocToggle"')
  })

  it('defines #compressionPanel (F-21)', () => {
    expect(html).toContain('id="compressionPanel"')
    expect(html).toContain('id="compressionToggle"')
    expect(html).toContain('aria-label="Alternar panel de compresión"')
  })

  it('defines #mixerHistoryPanel (F-17)', () => {
    expect(html).toContain('id="mixerHistoryPanel"')
    expect(html).toContain('id="mixerHistorySvg"')
  })

  it('defines feature strip', () => {
    expect(html).toContain('id="featureStrip"')
    expect(html).toContain('id="currentFeature"')
  })

  it('defines #log container', () => {
    expect(html).toContain('id="log"')
  })

  it('defines raw log overlay', () => {
    expect(html).toContain('id="rawLogOverlay"')
    expect(html).toContain('id="rawLogContent"')
  })

  it('defines #procsPanel', () => {
    expect(html).toContain('id="procsPanel"')
    expect(html).toContain('id="procsList"')
  })

  it('defines lifecycle timeline (F-14)', () => {
    expect(html).toContain('id="sectionLifecycle"')
    expect(html).toContain('id="lifecycleTimeline"')
  })

  it('defines critique/analysis section', () => {
    expect(html).toContain('id="sectionAnalysis"')
    expect(html).toContain('id="analysisOut"')
    expect(html).toContain('id="commitBreakdown"')
  })
})

// ─── Mixer panel DOM ───────────────────────────────────────────────────────
describe('index.html — mixer panel', () => {
  it('defines #mixerDrawer', () => {
    expect(html).toContain('id="mixerDrawer"')
  })

  it('defines 3 mixer tabs (MIX, BLUEPRINT, KNOWLEDGE)', () => {
    expect(html).toContain('data-mtab="mixTab"')
    expect(html).toContain('data-mtab="bpTab"')
    expect(html).toContain('data-mtab="knowledgeTab"')
  })

  it('MIX tab is active by default', () => {
    expect(html).toContain('class="mixer-tab on" data-mtab="mixTab"')
    expect(html).toContain('id="mixTab" class="mixer-tab-pane on"')
  })

  it('defines Smart Mix toggle', () => {
    expect(html).toContain('id="smartMixBar"')
    expect(html).toContain('id="smartMixToggle"')
    expect(html).toContain('id="smartAurora"')
    expect(html).toContain('id="smartKnob"')
  })

  it('defines mixer strips container', () => {
    expect(html).toContain('id="mixerStrips"')
  })

  it('defines mixer footer with save/add/export/import', () => {
    expect(html).toContain('id="saveMixer"')
    expect(html).toContain('id="addAtrilBtn"')
    expect(html).toContain('id="exportMixesBtn"')
    expect(html).toContain('id="importMixesBtn"')
  })

  it('defines saved mixes area', () => {
    expect(html).toContain('id="mixesList"')
    expect(html).toContain('id="mixesEmpty"')
  })
})

// ─── Blueprint tab DOM ─────────────────────────────────────────────────────
describe('index.html — blueprint tab', () => {
  it('defines blueprint phases', () => {
    expect(html).toContain('id="bpPhases"')
  })

  it('defines blueprint chat interface', () => {
    expect(html).toContain('id="bpChat"')
    expect(html).toContain('id="bpMessages"')
    expect(html).toContain('id="bpInput"')
    expect(html).toContain('id="bpSend"')
    expect(html).toContain('id="bpSkip"')
  })

  it('defines blueprint modules editor', () => {
    expect(html).toContain('id="bpModules"')
    expect(html).toContain('id="bpModuleList"')
    expect(html).toContain('id="bpAddModule"')
  })

  it('defines blueprint readiness and generate', () => {
    expect(html).toContain('id="bpGenerate"')
    expect(html).toContain('id="bpNewSession"')
  })
})

// ─── Knowledge tab DOM ─────────────────────────────────────────────────────
describe('index.html — knowledge tab', () => {
  it('defines 8 knowledge file buttons', () => {
    const buttons = ['knBtnRoadmap', 'knBtnReport', 'knBtnDb', 'knBtnPlan',
      'knBtnDecisions', 'knBtnPending', 'knBtnLearnings', 'knBtnBlueprint']
    for (const id of buttons) {
      expect(html).toContain(`id="${id}"`)
    }
  })

  it('defines knowledge content area', () => {
    expect(html).toContain('id="knowledgeContent"')
  })

  it('ROADMAP button is active by default', () => {
    expect(html).toContain('id="knBtnRoadmap" class="tp-action kn-btn on"')
  })
})

// ─── Settings modal DOM ────────────────────────────────────────────────────
describe('index.html — settings modal', () => {
  it('defines appearance section with theme toggle', () => {
    expect(html).toContain('id="themeGroup"')
    expect(html).toContain('data-theme="dark"')
    expect(html).toContain('data-theme="auto"')
    expect(html).toContain('data-theme="light"')
  })

  it('defines orchestra settings', () => {
    expect(html).toContain('id="stgCaveman"')
    expect(html).toContain('id="stgCompactAt"')
    expect(html).toContain('id="stgMaxHallStreak"')
    expect(html).toContain('id="stgRunMode"')
    expect(html).toContain('id="stgMaxIter"')
  })

  it('defines AI defaults settings', () => {
    expect(html).toContain('id="stgDefaultAi"')
    expect(html).toContain('id="stgAutoSwitch"')
  })

  it('defines log settings', () => {
    expect(html).toContain('id="stgKeepLogs"')
    expect(html).toContain('id="stgAutoScroll"')
  })
})

// ─── Empty state ───────────────────────────────────────────────────────────
describe('index.html — empty state', () => {
  it('defines #emptyState with on class', () => {
    expect(html).toContain('id="emptyState" class="empty-state on"')
  })

  it('shows treble clef glyph', () => {
    expect(html).toContain('class="empty-glyph"')
    expect(html).toContain('𝄞')
  })

  it('shows keyboard shortcuts', () => {
    expect(html).toContain('<kbd>+</kbd>')
    expect(html).toContain('<kbd>⇧</kbd>')
  })
})

// ─── Usage banner ──────────────────────────────────────────────────────────
describe('index.html — usage banner', () => {
  it('defines #usageBanner', () => {
    expect(html).toContain('id="usageBanner"')
  })

  it('contains usage limit text', () => {
    expect(html).toContain('Usage limit active')
  })
})

// ─── Preload.js — bridge method inventory ──────────────────────────────────
describe('preload.js — IPC bridge methods', () => {
  const invokeChannels = [
    'repertoire:list', 'repertoire:add', 'repertoire:remove', 'repertoire:open', 'repertoire:readFile',
    'orchestra:install', 'orchestra:play', 'orchestra:fine', 'orchestra:kill', 'orchestra:tail',
    'orchestra:clearLog', 'orchestra:analyze', 'orchestra:readIterLog', 'orchestra:writeConfig',
    'orchestra:version-check', 'orchestra:upgrade',
    'mixer:read', 'mixer:write', 'mixer:saved:list', 'mixer:saved:save', 'mixer:saved:delete', 'mixer:saved:export',
    'mixer:history', 'metrics:session-summary',
    'lifecycle:list', 'lifecycle:add',
    'metrics:resource', 'metrics:context', 'metrics:coordination', 'metrics:snapshot', 'metrics:allocation',
    'metrics:claude-usage', 'metrics:compliance', 'metrics:roadmap-freshness',
    'system:claude-procs', 'system:kill-proc',
    'blueprint:load', 'blueprint:save', 'blueprint:generate-brief', 'blueprint:readiness',
    'atriles:list', 'atriles:save',
    'ai:credits', 'ai:select', 'ai:login', 'ai:auth-status',
  ]

  for (const ch of invokeChannels) {
    it(`exposes invoke channel: ${ch}`, () => {
      expect(preload).toContain(`'${ch}'`)
    })
  }
})

// ─── Preload.js — event channels ──────────────────────────────────────────
describe('preload.js — event listeners', () => {
  const eventChannels = [
    'orchestra:line', 'orchestra:exit', 'orchestra:resumed', 'orchestra:usage_limit', 'metrics:update',
  ]

  for (const ch of eventChannels) {
    it(`listens to event: ${ch}`, () => {
      expect(preload).toContain(`'${ch}'`)
    })
  }
})

// ─── Preload.js — security ────────────────────────────────────────────────
describe('preload.js — security invariants', () => {
  it('uses contextBridge.exposeInMainWorld', () => {
    expect(preload).toContain('contextBridge.exposeInMainWorld')
  })

  it('does not expose ipcRenderer.send', () => {
    expect(preload).not.toContain('ipcRenderer.send(')
  })

  it('does not expose ipcRenderer.sendSync', () => {
    expect(preload).not.toContain('ipcRenderer.sendSync')
  })

  it('does not expose require', () => {
    const lines = preload.split('\n').filter(l => !l.startsWith('const'))
    expect(lines.join('\n')).not.toContain("require('")
  })

  it('systemKill validates pid is positive integer', () => {
    expect(preload).toContain('Number.isInteger(pid)')
    expect(preload).toContain('pid <= 0')
  })

  it('systemKill validates signal is SIGTERM or SIGKILL only', () => {
    expect(preload).toContain("'SIGTERM'")
    expect(preload).toContain("'SIGKILL'")
    expect(preload).toContain('.includes(sig)')
  })

  it('systemKill returns false on invalid input', () => {
    expect(preload).toContain('Promise.resolve(false)')
  })
})

// ─── Preload.js — method names match renderer usage ───────────────────────
describe('preload.js — method names', () => {
  const methods = [
    'list', 'add', 'remove', 'openDir', 'readFile', 'install', 'play',
    'fine', 'kill', 'tail', 'clearLog', 'mixerRead', 'mixerWrite',
    'configWrite', 'analyze', 'readIterLog',
    'mixerSavedList', 'mixerSavedSave', 'mixerSavedDelete', 'mixerSavedExport',
    'mixerHistory', 'sessionSummary',
    'lifecycleList', 'lifecycleAdd',
    'metricsResource', 'metricsContext', 'metricsCoordination',
    'metricsSnapshot', 'metricsAllocation', 'claudeUsage',
    'systemProcs', 'systemKill',
    'complianceMetrics', 'roadmapFreshness',
    'orchestraVersionCheck', 'orchestraUpgrade',
    'blueprintLoad', 'blueprintSave', 'blueprintGenerate', 'blueprintReadiness',
    'atrilesList', 'atrilesSave',
    'aiCredits', 'aiSelect', 'aiLogin', 'aiAuthStatus',
    'onLine', 'onExit', 'onResumed', 'onUsageLimit', 'onMetrics',
  ]

  for (const m of methods) {
    it(`exposes method: ${m}`, () => {
      expect(preload).toContain(`${m}:`)
    })
  }
})

// ─── Atril modal DOM ───────────────────────────────────────────────────────
describe('index.html — atril modal', () => {
  it('defines color picker grid', () => {
    expect(html).toContain('id="atrilColors"')
  })

  it('defines icon picker grid', () => {
    expect(html).toContain('id="atrilIcons"')
  })

  it('defines name and description inputs', () => {
    expect(html).toContain('id="atrilName"')
    expect(html).toContain('id="atrilDesc"')
  })

  it('defines save button', () => {
    expect(html).toContain('id="atrilSaveBtn"')
  })
})
