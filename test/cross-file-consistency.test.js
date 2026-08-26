import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')
const preload = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

// ─── preload ↔ main.js IPC channel alignment ──────────────────────────────
describe('preload ↔ main.js — every preload invoke channel has a handler', () => {
  const preloadChannels = [...preload.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map(m => m[1])

  for (const ch of preloadChannels) {
    it(`main.js handles: ${ch}`, () => {
      expect(mainJs).toContain(`ipcMain.handle('${ch}'`)
    })
  }
})

describe('preload ↔ main.js — every main.js handler has a preload channel', () => {
  const mainChannels = [...mainJs.matchAll(/ipcMain\.handle\('([^']+)'/g)].map(m => m[1])
  // orchestra:hotReload is internal-only, not exposed to renderer
  const internal = ['orchestra:hotReload']

  for (const ch of mainChannels) {
    if (internal.includes(ch)) continue
    it(`preload exposes: ${ch}`, () => {
      expect(preload).toContain(`'${ch}'`)
    })
  }
})

// ─── preload ↔ renderer — method usage ─────────────────────────────────────
describe('renderer ↔ preload — renderer calls only exist in preload bridge', () => {
  const rendererCalls = [...rendererJs.matchAll(/window\.director\.(\w+)/g)].map(m => m[1])
  const uniqueCalls = [...new Set(rendererCalls)]

  for (const method of uniqueCalls) {
    it(`preload defines: ${method}`, () => {
      expect(preload).toContain(`${method}:`)
    })
  }
})

// ─── preload event listeners ↔ main.js webContents.send ────────────────────
describe('event channels — main.js sends match preload listeners', () => {
  const preloadEvents = [...preload.matchAll(/ipcRenderer\.on\('([^']+)'/g)].map(m => m[1])

  for (const ev of preloadEvents) {
    it(`main.js sends event: ${ev}`, () => {
      expect(mainJs).toContain(`'${ev}'`)
    })
  }
})

// ─── index.html DOM IDs ↔ renderer $ selectors ────────────────────────────
describe('index.html ↔ renderer — critical DOM IDs exist in HTML', () => {
  const criticalIds = [
    'playBtn', 'fineBtn', 'killBtn', 'removeBtn',
    'installBtn', 'openFolderBtn', 'upgradeBtn',
    'aboutBtn', 'settingsBtn', 'themeToggle',
    'pname', 'ppath', 'pstatus', 'pbadge',
    'clockTime', 'clockStatus',
    'monitorStatus', 'log', 'logFilterInput',
    'metricsStrip', 'mmAllocVal', 'mmMemVal', 'mmTokensVal',
    'mmComplianceVal', 'mmRoadmapVal', 'mmBurnVal', 'mmAiUsageVal',
    'usageBarFill', 'complianceSpark', 'burnSpark',
    'allocInspector', 'allocToggle', 'allocBody',
    'compressionPanel', 'compressionToggle',
    'mixerHistoryPanel', 'mixerHistoryToggle',
    'featureStrip', 'currentFeature',
    'rawLogOverlay', 'rawLogContent',
    'procsPanel', 'procsList',
    'sectionLifecycle', 'lifecycleTimeline',
    'sectionAnalysis', 'analysisOut', 'commitBreakdown',
    'mixerPanel', 'mixerStrips',
    'smartMixBar', 'smartMixToggle', 'smartAurora', 'smartKnob',
    'mixesList', 'mixNameInput', 'saveMixer',
    'addAtrilBtn', 'exportMixesBtn', 'importMixesBtn',
    'aiSelect', 'modelSelect', 'aiLoginBtn', 'aiAuthDot', 'aiCreditStatus',
    'bpPhases', 'bpMessages', 'bpInput', 'bpSend', 'bpSkip',
    'bpModuleList', 'bpAddModule', 'bpGenerate', 'bpNewSession',
    'knowledgeContent',
    'aboutModal', 'settingsModal', 'atrilModal',
    'closeAbout', 'closeSettings', 'closeAtrilModal',
    'emptyState', 'usageBanner',
    'splitLayout', 'splitDivider',
    'dropzone', 'projects',
    'atrilName', 'atrilDesc', 'atrilColors', 'atrilIcons', 'atrilSaveBtn',
  ]

  for (const id of criticalIds) {
    it(`HTML defines id="${id}"`, () => {
      expect(html).toContain(`id="${id}"`)
    })
  }
})

describe('renderer ↔ index.html — renderer $ selectors reference real IDs', () => {
  const selectorMatches = [...rendererJs.matchAll(/\$\('#(\w+)'\)/g)].map(m => m[1])
  const uniqueIds = [...new Set(selectorMatches)]
  // Some IDs are dynamically created (not in static HTML)
  const dynamic = ['le-interpreting-live']

  for (const id of uniqueIds) {
    if (dynamic.includes(id)) continue
    it(`HTML contains id="${id}" (used by renderer)`, () => {
      expect(html).toContain(`id="${id}"`)
    })
  }
})

// ─── CSS classes ↔ HTML classes ────────────────────────────────────────────
describe('index.html ↔ CSS — critical CSS classes exist in stylesheet', () => {
  const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

  const criticalClasses = [
    'modal-overlay', 'modal-card', 'modal-close', 'modal-title', 'modal-subtitle', 'modal-body', 'modal-footer',
    'about-card', 'about-hero', 'about-logo', 'about-credits',
    'settings-section', 'settings-label', 'settings-row', 'settings-key',
    'stg-btn', 'stg-switch', 'stg-slider',
    'tp-btn', 'tp-action', 'tp-play', 'tp-fine', 'tp-kill',
    'ai-control', 'ai-icon', 'ai-auth-dot', 'ai-credit-status',
    'clock-seg', 'clock-label', 'clock-block',
    'monitor-status', 'metrics-strip', 'mm-cell', 'mm-label', 'mm-val',
    'usage-bar', 'usage-bar-fill',
    'alloc-inspector', 'alloc-toggle', 'alloc-body', 'alloc-summary', 'alloc-categories',
    'feature-strip', 'fs-label', 'fs-val',
    'split-layout', 'split-divider',
    'mixer-panel', 'mixer-tabs', 'mixer-tab', 'mixer-tab-pane',
    'mixer-strips-v', 'strip-h',
    'smart-mix-bar', 'smart-toggle', 'smart-toggle-aurora', 'smart-toggle-glass', 'smart-toggle-knob', 'smart-label',
    'mix-card', 'mix-import-field', 'mix-ribbon',
    'bp-phases', 'bp-phase-pill', 'bp-chat', 'bp-messages', 'bp-input', 'bp-send', 'bp-skip',
    'bp-modules', 'bp-module-list', 'bp-mod-card',
    'kn-pane', 'kn-btn',
    'procs-panel', 'procs-bar',
    'console-collapsible', 'collapsible-header', 'collapsible-body',
    'empty-state', 'empty-ring', 'empty-glyph', 'empty-title',
  ]

  for (const cls of criticalClasses) {
    it(`CSS defines .${cls}`, () => {
      expect(css).toContain(`.${cls}`)
    })
  }
})

// ─── main.js ↔ renderer event push alignment ──────────────────────────────
describe('main.js → renderer — webContents.send channels have preload listeners', () => {
  const sendMatches = [...mainJs.matchAll(/webContents\.send\('([^']+)'/g)].map(m => m[1])
  const unique = [...new Set(sendMatches)]

  for (const ch of unique) {
    it(`preload listens to: ${ch}`, () => {
      expect(preload).toContain(`'${ch}'`)
    })
  }
})

// ─── Script loading order ──────────────────────────────────────────────────
describe('index.html — script loading', () => {
  it('renderer.js loads before mixer-chart.js', () => {
    expect(html.indexOf('renderer.js')).toBeLessThan(html.indexOf('mixer-chart.js'))
  })

  it('no inline scripts in HTML', () => {
    const scriptTags = html.match(/<script(?![\s]+src)/g) || []
    expect(scriptTags.length).toBe(0)
  })
})
