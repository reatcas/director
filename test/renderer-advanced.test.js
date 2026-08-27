import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

// ─── Toast notification system ──────────────────────────────────────────────
describe('showToast notification', () => {
  const body = rendererJs.split('function showToast')[1]?.split('\nfunction ')[0] || ''

  it('creates toast element dynamically', () => {
    expect(body).toContain("createElement('div')")
  })

  it('sets id to director-toast', () => {
    expect(body).toContain("'director-toast'")
  })

  it('positions fixed at bottom center', () => {
    expect(body).toContain('position:fixed')
    expect(body).toContain('bottom:')
  })

  it('uses textContent for XSS safety', () => {
    expect(body).toContain('el.textContent = msg')
  })

  it('fades out after 1800ms', () => {
    expect(body).toContain('1800')
    expect(body).toContain("opacity = '0'")
  })

  it('appends to document.body', () => {
    expect(body).toContain('document.body.appendChild')
  })
})

// ─── Empty state management ─────────────────────────────────────────────────
describe('updateStageView — empty/active state toggle', () => {
  const body = rendererJs.split('function updateStageView')[1]?.split('\nfunction ')[0] || ''

  it('references emptyState element', () => {
    expect(body).toContain("$('#emptyState')")
  })

  it('references consoleSection element', () => {
    expect(body).toContain("$('#consoleSection')")
  })

  it('toggles emptyState on/off class based on current project', () => {
    expect(body).toContain("classList.remove('on')")
    expect(body).toContain("classList.add('on')")
  })

  it('hides openFolderBtn when no project', () => {
    expect(body).toContain("'#openFolderBtn'")
    expect(body).toContain('hidden = true')
  })

  it('shows consoleSection only when project selected', () => {
    expect(body).toContain("display = hasProject ? 'flex' : 'none'")
  })
})

// ─── Transport button state ─────────────────────────────────────────────────
describe('updateTransportButtons — play/stop/kill state', () => {
  const body = rendererJs.split('function updateTransportButtons')[1]?.split('\n// ─')[0] || ''

  it('gets current project state', () => {
    expect(body).toContain('proj()')
  })

  it('checks AI credit availability', () => {
    expect(body).toContain('aiCredits[agent]')
  })

  it('disables all buttons when not installed', () => {
    expect(body).toContain('!p.installed')
  })

  it('enables fine/kill when active', () => {
    expect(body).toContain("fineBtn.classList.remove('disabled')")
    expect(body).toContain("killBtn.classList.remove('disabled')")
  })

  it('uses both PID check and orchestraState', () => {
    expect(body).toContain('p.running')
    expect(body).toContain('orchestraState')
  })

  it('checks for interpreting and started states', () => {
    expect(body).toContain("'interpreting'")
    expect(body).toContain("'started'")
  })
})

// ─── Stall anomaly detection (F-20) ─────────────────────────────────────────
describe('stall anomaly detection (F-20)', () => {
  it('defines STALL_THRESHOLD_MS as 20 minutes', () => {
    expect(rendererJs).toContain('STALL_THRESHOLD_MS')
    expect(rendererJs).toContain('20 * 60 * 1000')
  })

  it('trackCommit updates last-commit timestamp', () => {
    const body = rendererJs.split('function trackCommit')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('_stallTracker.set(dir, Date.now())')
  })

  it('trackPlay initializes tracker if not set', () => {
    const body = rendererJs.split('function trackPlay')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('_stallTracker.has(dir)')
  })

  it('getStallMinutes returns 0 when no tracker', () => {
    const body = rendererJs.split('function getStallMinutes')[1]?.split('\n}')[0] || ''
    expect(body).toContain('return 0')
  })

  it('getStallMinutes calculates minutes from last commit', () => {
    const body = rendererJs.split('function getStallMinutes')[1]?.split('\n}')[0] || ''
    expect(body).toContain('60000')
  })
})

// ─── Project list refresh with stall badge ──────────────────────────────────
describe('refresh — project list rendering', () => {
  const body = rendererJs.split('async function refresh')[1]?.split('\nfunction ')[0] || ''

  it('fetches projects from API', () => {
    expect(body).toContain('window.director.list()')
  })

  it('clears project list before rebuild', () => {
    expect(body).toContain("ul.innerHTML = ''")
  })

  it('marks selected project with sel class', () => {
    expect(body).toContain("'sel '")
  })

  it('marks running projects with live class', () => {
    expect(body).toContain("'live'")
  })

  it('shows stall badge when >= 20 minutes', () => {
    expect(body).toContain('stallMin >= 20')
    expect(body).toContain('stall-badge')
  })

  it('escapes stall minutes for XSS safety', () => {
    expect(body).toContain('esc(String(stallMin))')
  })

  it('shows LIVE badge for running projects', () => {
    expect(body).toContain("p.running ? 'LIVE'")
  })

  it('renders LED indicator per project', () => {
    expect(body).toContain("class=\"led\"")
  })

  it('calls paint() when project selected', () => {
    expect(body).toContain('paint()')
  })

  it('calls updateStageView at end', () => {
    expect(body).toContain('updateStageView()')
  })

  it('escapes project name with esc()', () => {
    expect(body).toContain('esc(p.name)')
  })
})

// ─── Debounced mixer save ───────────────────────────────────────────────────
describe('debounced mixer save', () => {
  it('defines saveMixerState async function', () => {
    expect(rendererJs).toContain('async function saveMixerState')
  })

  it('saveMixerState reads all range inputs', () => {
    const body = rendererJs.split('async function saveMixerState')[1]?.split('\nlet ')[0] || ''
    expect(body).toContain("input[type=\"range\"]")
    expect(body).toContain('dataset.k')
  })

  it('debounce uses 500ms delay', () => {
    expect(rendererJs).toContain('setTimeout(() => saveMixerState(), 500)')
  })

  it('clears previous timer before setting new', () => {
    const body = rendererJs.split('function debouncedMixerSave')[1]?.split('\nasync ')[0] || ''
    expect(body).toContain('clearTimeout(_mixerSaveTimer)')
  })
})

// ─── open() function — project switch ───────────────────────────────────────
describe('open() — project switching', () => {
  const body = rendererJs.split('async function open(dir)')[1]?.split('\nasync function ')[0] ||
               rendererJs.split('async function open(dir)')[1]?.split('\nfunction ')[0] || ''

  it('saves mixer state before switching', () => {
    expect(body).toContain('saveMixerState()')
  })

  it('clears pending mixer save timer', () => {
    expect(body).toContain('clearTimeout(_mixerSaveTimer)')
  })

  it('sets current to new dir', () => {
    expect(body).toContain('current = dir')
  })

  it('calls refresh after switching', () => {
    expect(body).toContain('refresh()')
  })
})

// ─── Commit breakdown chart (F-10) ──────────────────────────────────────────
describe('renderCommitBreakdown — stacked bar chart (F-10)', () => {
  const body = rendererJs.split('function renderCommitBreakdown')[1]?.split('\nasync function ')[0] || ''

  it('gets commitBreakdown element', () => {
    expect(body).toContain("$('#commitBreakdown')")
  })

  it('parses By type JSON from report', () => {
    expect(body).toContain('By type:')
    expect(body).toContain('JSON.parse')
  })

  it('hides element when no data', () => {
    expect(body).toContain("display = 'none'")
  })

  it('calculates total across categories', () => {
    expect(body).toContain('reduce((a, b) => a + b, 0)')
  })

  it('sorts categories by count descending', () => {
    expect(body).toContain('sort((a, b) => b[1] - a[1])')
  })

  it('renders color-coded bar segments with percentage width', () => {
    expect(body).toContain('width:${pct}%')
    expect(body).toContain('COMMIT_TYPE_COLORS')
  })

  it('escapes type names with esc()', () => {
    expect(body).toContain('esc(type)')
  })

  it('renders legend below chart', () => {
    expect(body).toContain('border-radius:2px')
    expect(body).toContain('margin-right:3px')
  })

  it('wraps in try-catch', () => {
    expect(body).toContain('catch')
  })
})

// ─── Analysis controls ──────────────────────────────────────────────────────
describe('runAnalysis — orchestra:analyze trigger', () => {
  it('shows loading text before analysis', () => {
    expect(rendererJs).toContain('Componiendo la crítica')
  })

  it('calls window.director.analyze', () => {
    expect(rendererJs).toContain('window.director.analyze(current)')
  })

  it('renders commit breakdown from report', () => {
    expect(rendererJs).toContain('renderCommitBreakdown(res.report)')
  })

  it('shows analysis file path', () => {
    expect(rendererJs).toContain("$('#analysisFile')")
  })

  it('has copy button for analysis output', () => {
    expect(rendererJs).toContain("$('#copyAnalysis')")
    expect(rendererJs).toContain('navigator.clipboard.writeText')
  })
})

// ─── Smart Mix aurora effect ────────────────────────────────────────────────
describe('updateSmartAuroraColors', () => {
  const body = rendererJs.split('function updateSmartAuroraColors')[1]?.split('\nif ')[0] || ''

  it('reads top 4 active strip colors', () => {
    expect(body).toContain("querySelectorAll('#mixerStrips .strip-h.on')")
    expect(body).toContain('colors.length < 4')
  })

  it('gets color from computed style', () => {
    expect(body).toContain('getComputedStyle')
    expect(body).toContain('--strip-color')
  })

  it('pads to 4 colors with defaults', () => {
    expect(body).toContain("defaults = ['#e8631a'")
    expect(body).toContain('colors.length < 4')
  })

  it('sets 4 CSS aurora color variables', () => {
    expect(body).toContain('--aurora-c1')
    expect(body).toContain('--aurora-c2')
    expect(body).toContain('--aurora-c3')
    expect(body).toContain('--aurora-c4')
  })
})

describe('updateSmartMixIndicator', () => {
  const body = rendererJs.split('function updateSmartMixIndicator')[1]?.split('\nfunction ')[0] || ''

  it('toggles active class on smartMixBar', () => {
    expect(body).toContain("$('#smartMixBar')")
    expect(body).toContain("classList.toggle('active'")
  })

  it('updates aurora colors when active', () => {
    expect(body).toContain('updateSmartAuroraColors()')
  })
})

// ─── Smart Mix toggle ───────────────────────────────────────────────────────
describe('Smart Mix toggle', () => {
  it('reads current config on toggle', () => {
    expect(rendererJs).toContain("$('#smartMixToggle')")
    expect(rendererJs).toContain('!cfg.smartMix')
  })

  it('writes config via configWrite', () => {
    expect(rendererJs).toContain('window.director.configWrite')
  })

  it('shows activation toast in English', () => {
    expect(rendererJs).toContain('Smart Mix activated')
    expect(rendererJs).toContain('Smart Mix disabled')
  })
})

// ─── Export/Import mixes ────────────────────────────────────────────────────
describe('mix export/import', () => {
  it('export copies mixes as JSON to clipboard', () => {
    expect(rendererJs).toContain("$('#exportMixesBtn')")
    expect(rendererJs).toContain('navigator.clipboard.writeText(json)')
  })

  it('export includes version and timestamp', () => {
    expect(rendererJs).toContain("version: 1")
    expect(rendererJs).toContain('exported:')
    expect(rendererJs).toContain('toISOString()')
  })

  it('import uses file input with .json accept', () => {
    expect(rendererJs).toContain("input.type = 'file'")
    expect(rendererJs).toContain("input.accept = '.json'")
  })

  it('import normalizes mixer values', () => {
    expect(rendererJs).toContain('normalizeMixerValues(m.focus')
  })

  it('import handles array or object format', () => {
    expect(rendererJs).toContain('data.mixes || (Array.isArray(data)')
  })

  it('shows import count toast', () => {
    expect(rendererJs).toContain('imported}')
  })

  it('JSON import from text input', () => {
    expect(rendererJs).toContain("$('#mixImportBtn')")
    expect(rendererJs).toContain("$('#mixImportInput')")
  })
})

// ─── Mix ribbon signature ───────────────────────────────────────────────────
describe('buildMixRibbon', () => {
  const body = rendererJs.split('function buildMixRibbon')[1]?.split('\nasync function ')[0] || ''

  it('returns empty for null focus', () => {
    expect(body).toContain("if (!focus) return ''")
  })

  it('uses getAllSections for color mapping', () => {
    expect(body).toContain('getAllSections()')
  })
})

// ─── Lifecycle history rendering ────────────────────────────────────────────
describe('loadLifecycleHistory — event stream display', () => {
  const body = rendererJs.split('async function loadLifecycleHistory')[1]?.split('\n// ─')[0] || ''

  it('fetches events from lifecycleList API', () => {
    expect(body).toContain('window.director.lifecycleList')
  })

  it('shows last 80 events', () => {
    expect(body).toContain('slice(-80)')
  })

  it('defines styles for 10+ event types', () => {
    const types = ['play', 'started', 'fine', 'kill', 'exit', 'usage_limit', 'resume', 'commit', 'cycle_close', 'hot_reload']
    for (const t of types) {
      expect(body).toContain(`'${t}'`)
    }
  })

  it('uses 24h time format', () => {
    expect(body).toContain('hour12: false')
  })

  it('escapes event data with esc()', () => {
    expect(body).toContain('esc(ev.ts)')
    expect(body).toContain('esc(ev.label)')
    expect(body).toContain('esc(ev.message)')
  })

  it('adds current session separator', () => {
    expect(body).toContain('CURRENT SESSION')
  })

  it('pushes events to rawLogBuffer', () => {
    expect(body).toContain('rawLogBuffer.push')
  })
})

// ─── Metrics display ────────────────────────────────────────────────────────
describe('updateMetricsDisplay — telemetry dashboard', () => {
  const body = rendererJs.split('function updateMetricsDisplay')[1]?.split('\nfunction ')[0] || ''

  it('guards against null data', () => {
    expect(body).toContain('if (!data) return')
  })

  it('updates allocation display with nice + tokens', () => {
    expect(body).toContain('nice')
    expect(body).toContain('tokenBudget')
  })

  it('formats tokens with K suffix', () => {
    expect(body).toContain("'K'")
  })

  it('shows memory utilization as percentage', () => {
    expect(body).toContain('memUtilization')
  })

  it('adds warn class above 80% memory', () => {
    expect(body).toContain('memUtilization > 80')
    expect(body).toContain("' warn'")
  })

  it('shows dash for missing resource data', () => {
    expect(body).toContain("'—'")
  })
})

// ─── Atril modal ────────────────────────────────────────────────────────────
describe('openAtrilModal — custom stand creation', () => {
  const body = rendererJs.split('function openAtrilModal')[1]?.split('\nif ')[0] || ''

  it('shows modal by setting hidden=false', () => {
    expect(body).toContain("modal.hidden = false")
  })

  it('renders color palette grid', () => {
    expect(body).toContain('COLOR_PALETTE')
    expect(body).toContain('atril-color-swatch')
  })

  it('renders icon library grid', () => {
    expect(body).toContain('ICON_LIBRARY')
    expect(body).toContain('atril-icon-opt')
  })

  it('marks selected color swatch', () => {
    expect(body).toContain("' selected'")
  })

  it('click selects new color', () => {
    expect(body).toContain('selectedAtrilColor = c')
  })

  it('click selects new icon', () => {
    expect(body).toContain('selectedAtrilIcon = name')
  })
})

describe('atril save flow', () => {
  it('validates name is required', () => {
    expect(rendererJs).toContain("showToast('Name required')")
  })

  it('generates id from name with sanitization', () => {
    expect(rendererJs).toContain("toLowerCase().replace(/[^a-z0-9]+/g, '_')")
  })

  it('saves via atrilesSave API', () => {
    expect(rendererJs).toContain('window.director.atrilesSave')
  })

  it('reloads mixer after atril save', () => {
    const saveBlock = rendererJs.split('atrilesSave(customAtriles)')[1]?.split('\n// ')[0] || ''
    expect(saveBlock).toContain('loadMixer')
  })
})

describe('atril modal close mechanisms', () => {
  it('close button hides modal', () => {
    expect(rendererJs).toContain("$('#closeAtrilModal')")
  })

  it('backdrop click closes modal', () => {
    expect(rendererJs).toContain("if (e.target === $('#atrilModal'))")
  })
})

// ─── Mixer tab switching ────────────────────────────────────────────────────
describe('mixer tab switching', () => {
  it('uses mixer-tab class for tab buttons', () => {
    expect(rendererJs).toContain("querySelectorAll('.mixer-tab')")
  })

  it('toggles on class on tab and pane', () => {
    expect(rendererJs).toContain("classList.remove('on')")
    expect(rendererJs).toContain("classList.add('on')")
  })

  it('loads blueprint on bpTab click', () => {
    expect(rendererJs).toContain("'bpTab'")
    expect(rendererJs).toContain('bpLoad()')
  })

  it('loads knowledge on knowledgeTab click', () => {
    expect(rendererJs).toContain("'knowledgeTab'")
    expect(rendererJs).toContain("loadKnowledge('ROADMAP.md'")
  })
})

// ─── Knowledge tab (F-09) ───────────────────────────────────────────────────
describe('loadKnowledge — state file viewer', () => {
  const body = rendererJs.split('async function loadKnowledge')[1]?.split('\nif ')[0] || ''

  it('reads file via readFile API', () => {
    expect(body).toContain('window.director.readFile')
  })

  it('shows file not found message', () => {
    expect(body).toContain('Archivo no encontrado')
  })

  it('highlights active button with warn class', () => {
    expect(body).toContain("classList.add('warn')")
    expect(body).toContain("classList.remove('warn')")
  })

  it('supports 8 knowledge files', () => {
    const knowledgeFiles = ['ROADMAP.md', 'ORCHESTRA_REPORT.md', 'DB_SCHEMA.md',
      'PLAN.md', 'DECISIONS.md', 'PENDING.md', 'CYCLE_LEARNINGS.md', 'BLUEPRINT.md']
    for (const f of knowledgeFiles) {
      expect(rendererJs).toContain(f)
    }
  })
})

// ─── Theme management ───────────────────────────────────────────────────────
describe('theme management — detailed', () => {
  it('stores theme in localStorage as director-theme', () => {
    expect(rendererJs).toContain("localStorage.getItem('director-theme')")
    expect(rendererJs).toContain("localStorage.setItem('director-theme'")
  })

  it('defaults to auto mode', () => {
    expect(rendererJs).toContain("|| 'auto'")
  })

  it('cycles through dark/auto/light modes', () => {
    expect(rendererJs).toContain("['dark', 'auto', 'light']")
  })

  it('applyTheme updates toggle group button state', () => {
    expect(rendererJs).toContain("'#themeGroup .stg-btn'")
    expect(rendererJs).toContain('dataset.theme')
  })

  it('listens for system theme changes', () => {
    expect(rendererJs).toContain("matchMedia('(prefers-color-scheme: light)').addEventListener")
  })

  it('applies theme on initial load', () => {
    expect(rendererJs).toContain('applyTheme(getStoredTheme())')
  })
})

// ─── Settings modal ─────────────────────────────────────────────────────────
describe('settings modal — config persistence', () => {
  const body = rendererJs.split('async function loadSettings')[1]?.split('\nasync function ')[0] || ''

  it('loads config from mixerRead', () => {
    expect(body).toContain('window.director.mixerRead')
  })

  it('populates caveman toggle', () => {
    expect(body).toContain('stgCaveman')
    expect(body).toContain('cfg.caveman')
  })

  it('populates compactAt value', () => {
    expect(body).toContain('stgCompactAt')
    expect(body).toContain('cfg.compactAt')
  })

  it('populates run mode selector', () => {
    expect(body).toContain('stgRunMode')
    expect(body).toContain("cfg.mode || 'perpetual'")
  })

  it('populates max iterations', () => {
    expect(body).toContain('stgMaxIter')
    expect(body).toContain('cfg.maxIterations')
  })

  it('populates max hallucination streak', () => {
    expect(body).toContain('stgMaxHallStreak')
    expect(body).toContain('maxHallucinationStreak')
  })

  it('settings modal opens on settingsBtn click', () => {
    expect(rendererJs).toContain("$('#settingsBtn')")
    expect(rendererJs).toContain("$('#settingsModal').hidden = false")
  })

  it('settings modal has close and backdrop handlers', () => {
    expect(rendererJs).toContain("$('#closeSettings')")
    expect(rendererJs).toContain("$('#settingsModal').hidden = true")
  })
})

// ─── Sparkline rendering ────────────────────────────────────────────────────
describe('renderSparkline — SVG mini chart', () => {
  const body = rendererJs.split('function renderSparkline')[1]?.split('\nfunction ')[0] || ''

  it('accepts svgEl and scores array', () => {
    expect(rendererJs).toContain('function renderSparkline(svgEl, scores)')
  })

  it('generates SVG polyline points', () => {
    expect(body).toContain('points')
  })
})

// ─── Usage banner ───────────────────────────────────────────────────────────
describe('showUsageBanner', () => {
  const body = rendererJs.split('function showUsageBanner')[1]?.split('\n// ')[0] || ''

  it('toggles usage banner visibility', () => {
    expect(body).toContain('usageBanner')
  })
})

// ─── Process monitor ────────────────────────────────────────────────────────
describe('loadProcs — system process display', () => {
  const body = rendererJs.split('async function loadProcs')[1]?.split('\nfunction ')[0] || ''

  it('fetches processes from systemProcs API', () => {
    expect(body).toContain('window.director.systemProcs')
  })
})

// ─── Monitor status ─────────────────────────────────────────────────────────
describe('updateMonitorStatus', () => {
  const body = rendererJs.split('function updateMonitorStatus')[1]?.split('\nfunction ')[0] || ''

  it('updates monitor status element', () => {
    expect(body).toContain("$('#monitorStatus')")
  })
})
