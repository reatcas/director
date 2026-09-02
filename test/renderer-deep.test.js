import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── getAllSections — custom atril merge ─────────────────────────────────────
describe('getAllSections — merge built-in + custom atriles', () => {
  const body = rendererJs.split('function getAllSections')[1]?.split('\nlet ')[0] || ''

  it('spreads built-in SECTIONS', () => {
    expect(body).toContain('[...SECTIONS]')
  })

  it('skips duplicates by id', () => {
    expect(body).toContain("all.find(s => s[0] === a.id)")
  })

  it('looks up icon from ICON_LIBRARY', () => {
    expect(body).toContain("ICON_LIBRARY.find(i => i[0] === a.icon)")
  })

  it('falls back to first icon if custom icon not found', () => {
    expect(body).toContain('ICON_LIBRARY[0][1]')
  })

  it('pushes 5-element tuple for custom atriles', () => {
    expect(body).toContain('all.push([a.id, a.name, a.color, svg')
  })
})

// ─── logoHTML — project badge rendering ──────────────────────────────────────
describe('logoHTML — logo/initials badge', () => {
  const body = rendererJs.split('function logoHTML')[1]?.split('\nfunction ')[0] || ''

  it('uses local-img:// protocol for logo images', () => {
    expect(body).toContain('local-img://')
  })

  it('URL-encodes logo path', () => {
    expect(body).toContain('encodeURIComponent(p.logo)')
  })

  it('adds sm class for small badges', () => {
    expect(body).toContain("sm ? ' sm' : ''")
  })

  it('escapes project name in alt attribute', () => {
    expect(body).toContain('esc(p.name)')
  })

  it('generates initials for projects without logo', () => {
    expect(body).toContain('initials(')
  })

  it('uses HSL hue derived from project name', () => {
    expect(body).toContain('hue(p.name)')
  })
})

// ─── normalizeMixerValues ───────────────────────────────────────────────────
describe('normalizeMixerValues — weight normalization', () => {
  const body = rendererJs.split('function normalizeMixerValues')[1]?.split('\nfunction ')[0] || ''

  it('extracts keys from sections', () => {
    expect(body).toContain('for (const [k] of sections)')
  })

  it('distributes equally when all weights are zero', () => {
    expect(body).toContain('total === 0')
    expect(body).toContain('Math.floor(100 / sections.length)')
  })

  it('gives first key the remainder for equal distribution', () => {
    expect(body).toContain('100 - each * (sections.length - 1)')
  })

  it('scales proportionally to sum to 100', () => {
    expect(body).toContain('/ total) * 100')
    expect(body).toContain('Math.round')
  })

  it('assigns remainder to last key to ensure exactly 100', () => {
    expect(body).toContain('100 - assigned')
  })

  it('uses Number.isFinite guard for missing/NaN weights', () => {
    expect(body).toContain('Number.isFinite(focus[k])')
  })
})

// ─── rebalanceMixer — proportional slider redistribution ────────────────────
describe('rebalanceMixer — proportional redistribution', () => {
  const body = rendererJs.split('function rebalanceMixer')[1]?.split('\n// ─')[0] || ''

  it('clamps value to 0-100 range', () => {
    expect(body).toContain('Math.min(100, Math.max(0, newVal))')
  })

  it('calculates remaining budget', () => {
    expect(body).toContain('100 - newVal')
  })

  it('collects other strips with current values', () => {
    expect(body).toContain("k !== changedKey")
    expect(body).toContain("parseInt(inp.value, 10)")
  })

  it('distributes proportionally based on current values', () => {
    expect(body).toContain('(o.cur / othersTotal) * remaining')
  })

  it('distributes equally when all others are zero', () => {
    expect(body).toContain('remaining / others.length')
  })

  it('assigns remainder to last strip', () => {
    expect(body).toContain('remaining - assigned')
  })

  it('ensures non-negative shares', () => {
    expect(body).toContain('Math.max(0, share)')
  })

  it('updates bar fill width', () => {
    expect(body).toContain("fill.style.width = share + '%'")
  })

  it('updates value display', () => {
    expect(body).toContain("valEl.textContent = share + '%'")
  })

  it('toggles on/off classes based on value', () => {
    expect(body).toContain("classList.toggle('on'")
    expect(body).toContain("classList.toggle('off'")
  })
})

// ─── updateAllocInspector (F-13) ────────────────────────────────────────────
describe('updateAllocInspector — resource allocation display (F-13)', () => {
  const body = rendererJs.split('function updateAllocInspector')[1]?.split('\n// ─')[0] || ''

  it('hides panel when no allocation', () => {
    expect(body).toContain("panel.style.display = 'none'")
  })

  it('displays nice level', () => {
    expect(body).toContain('allocation.nice')
  })

  it('displays memory budget in MB', () => {
    expect(body).toContain('allocation.memBudgetMB')
  })

  it('formats tokens with K suffix', () => {
    expect(body).toContain('allocation.tokenBudget > 999')
  })

  it('displays intensity and total weight', () => {
    expect(body).toContain('avgIntensity')
    expect(body).toContain('totalWeight')
  })

  it('escapes all values with esc()', () => {
    const escCount = (body.match(/esc\(String\(/g) || []).length
    expect(escCount).toBeGreaterThanOrEqual(5)
  })

  it('renders category budgets sorted by weight', () => {
    expect(body).toContain('categoryBudgets')
    expect(body).toContain('sort(([, a], [, b])')
  })

  it('shows normalized share, retention, and HOT badge', () => {
    expect(body).toContain('normalizedShare')
    expect(body).toContain('contextRetentionFactor')
    expect(body).toContain('hotPath')
    expect(body).toContain('ac-hot')
  })

  it('uses Spanish labels', () => {
    expect(body).toContain('memoria')
    expect(body).toContain('intensidad')
    expect(body).toContain('peso total')
  })
})

// ─── updateBurnRate (F-19) ───────────────────────────────────────────────────
describe('updateBurnRate — token burn rate tracking (F-19)', () => {
  const body = rendererJs.split('function updateBurnRate')[1]?.split('\n// ─')[0] || ''

  it('tracks burn history array', () => {
    expect(rendererJs).toContain('_burnHistory')
  })

  it('tracks previous token count', () => {
    expect(rendererJs).toContain('_prevBurnTokens')
  })

  it('shows dash when no usage data', () => {
    expect(body).toContain("valEl.textContent = '—'")
  })

  it('calculates delta from previous', () => {
    expect(body).toContain('tokens - _prevBurnTokens')
  })

  it('keeps rolling window of 30 entries', () => {
    expect(body).toContain('_burnHistory.length > 30')
    expect(body).toContain('_burnHistory.shift()')
  })

  it('calculates average burn rate', () => {
    expect(body).toContain('_burnSum')
    expect(body).toContain('_burnHistory.length')
  })

  it('formats with /iter suffix', () => {
    expect(body).toContain("+ '/iter'")
  })

  it('warns when latest > 1.3x average', () => {
    expect(body).toContain('avg * 1.3')
    expect(body).toContain("' warn'")
  })

  it('renders sparkline with burn history', () => {
    expect(body).toContain('renderSparkline')
  })
})

// ─── updateCompressionPanel (F-21) ──────────────────────────────────────────
describe('updateCompressionPanel — context compression display (F-21)', () => {
  const body = rendererJs.split('function updateCompressionPanel')[1]?.split('\n// ─')[0] || ''

  it('hides panel when no context data', () => {
    expect(body).toContain("panel.style.display = 'none'")
  })

  it('shows aggregated stats: ciclos, tokens ahorrados, compresión', () => {
    expect(body).toContain('ciclos')
    expect(body).toContain('tokens ahorrados')
    expect(body).toContain('compresión')
  })

  it('shows per-delta stats: archivos, cambios, secciones', () => {
    expect(body).toContain('archivos')
    expect(body).toContain('cambios')
    expect(body).toContain('secciones')
  })

  it('formats saved/processed tokens with K suffix', () => {
    expect(body).toContain('totalTokensSaved > 999')
    expect(body).toContain('totalTokensProcessed > 999')
  })

  it('shows history snapshot count', () => {
    expect(body).toContain('historySize')
    expect(body).toContain('snapshots')
  })

  it('escapes all rendered values', () => {
    const escCount = (body.match(/esc\(/g) || []).length
    expect(escCount).toBeGreaterThanOrEqual(8)
  })
})

// ─── Compression panel toggle ───────────────────────────────────────────────
describe('compression panel toggle IIFE', () => {
  it('initializes compression toggle on compressionToggle button', () => {
    expect(rendererJs).toContain("$('#compressionToggle')")
  })

  it('toggles display between none and visible', () => {
    expect(rendererJs).toContain("$('#compressionBody')")
  })

  it('uses Spanish label', () => {
    expect(rendererJs).toContain('COMPRESIÓN DE CONTEXTO')
  })

  it('toggles open class', () => {
    expect(rendererJs).toContain("classList.toggle('open'")
  })
})

// ─── renderSparkline — SVG mini chart ───────────────────────────────────────
describe('renderSparkline — SVG polyline rendering', () => {
  const body = rendererJs.split('function renderSparkline')[1]?.split('\nfunction ')[0] || ''

  it('hides SVG when insufficient data (< 2 points)', () => {
    expect(body).toContain("scores.length < 2")
    expect(body).toContain("display = 'none'")
  })

  it('uses 60x16 viewbox dimensions', () => {
    expect(body).toContain('w = 60')
    expect(body).toContain('h = 16')
  })

  it('calculates min/max range', () => {
    expect(body).toContain('if (_sv < min) min = _sv')
    expect(body).toContain('if (_sv > max) max = _sv')
  })

  it('maps scores to x,y coordinates', () => {
    expect(body).toContain('x.toFixed(1)')
    expect(body).toContain('y.toFixed(1)')
  })

  it('uses color coding: green >= 90, yellow >= 70, red below', () => {
    expect(body).toContain('>= 90')
    expect(body).toContain('>= 70')
    expect(body).toContain('#40c840')
    expect(body).toContain('#ddba00')
    expect(body).toContain('#e03030')
  })

  it('renders as SVG polyline', () => {
    expect(body).toContain('polyline')
    expect(body).toContain('stroke-linecap="round"')
  })
})

// ─── updateComplianceDisplay ────────────────────────────────────────────────
describe('updateComplianceDisplay — compliance score rendering', () => {
  const body = rendererJs.split('function updateComplianceDisplay')[1]?.split('\nfunction ')[0] || ''

  it('shows dash for null/missing data', () => {
    expect(body).toContain("el.textContent = '—'")
  })

  it('shows score as percentage', () => {
    expect(body).toContain("score + '%'")
  })

  it('shows cycle count when > 1', () => {
    expect(body).toContain('data.cycles > 1')
  })

  it('uses ok/warn/bad CSS classes', () => {
    expect(body).toContain("'ok'")
    expect(body).toContain("'warn'")
    expect(body).toContain("'bad'")
  })

  it('renders compliance sparkline', () => {
    expect(body).toContain("$('#complianceSpark')")
    expect(body).toContain('renderSparkline')
  })
})

// ─── updateComplianceFromLog ────────────────────────────────────────────────
describe('updateComplianceFromLog — inline COMPLIANCE parser', () => {
  const body = rendererJs.split('function updateComplianceFromLog')[1]?.split('\nasync ')[0] || ''

  it('matches COMPLIANCE regex from log line', () => {
    expect(body).toContain('COMPLIANCE')
    expect(body).toContain('match')
  })

  it('parses category:actual/planned pairs', () => {
    expect(body).toContain('match')
    expect(body).toContain('parseInt')
  })

  it('extracts DRIFT value', () => {
    expect(body).toContain('DRIFT:')
    expect(body).toContain('drift')
  })

  it('caps actual at planned', () => {
    expect(body).toContain('Math.min(actual, planned)')
  })

  it('calculates score as percentage', () => {
    expect(body).toContain('totalActual / totalPlanned * 100')
    expect(body).toContain('Math.round')
  })

  it('calls updateComplianceDisplay with parsed data', () => {
    expect(body).toContain('updateComplianceDisplay')
  })
})

// ─── loadRoadmapFreshness (F-16) ────────────────────────────────────────────
describe('loadRoadmapFreshness — staleness detection (F-16)', () => {
  const body = rendererJs.split('async function loadRoadmapFreshness')[1]?.split('\nasync ')[0] || ''

  it('calls roadmapFreshness API', () => {
    expect(body).toContain('window.director.roadmapFreshness')
  })

  it('shows absent when ROADMAP missing', () => {
    expect(body).toContain("'absent'")
    expect(body).toContain('!data.exists')
  })

  it('shows hours untouched when stale', () => {
    expect(body).toContain('staleHours')
    expect(body).toContain('untouched')
  })

  it('applies red background to feature strip when stale', () => {
    expect(body).toContain("$('#featureStrip')")
    expect(body).toContain('rgba(224,48,48')
  })

  it('shows GHOST ROADMAP warning', () => {
    expect(body).toContain('GHOST ROADMAP')
    expect(body).toContain('roadmap-sync')
  })

  it('clears styling when not stale', () => {
    expect(body).toContain("fsEl.style.background = ''")
  })
})

// ─── Blueprint interview system ─────────────────────────────────────────────
describe('blueprint phases rendering', () => {
  const body = rendererJs.split('function renderBpPhases')[1]?.split('\nfunction ')[0] || ''

  it('clears existing phases', () => {
    expect(body).toContain("el.innerHTML = ''")
  })

  it('calculates completion percentage per phase', () => {
    expect(body).toContain('answered / total * 100')
  })

  it('marks current phase as active', () => {
    expect(body).toContain("' active'")
  })

  it('marks completed phases as done', () => {
    expect(body).toContain("' done'")
  })

  it('renders progress bar with fill', () => {
    expect(body).toContain('bp-phase-fill')
    expect(body).toContain("width:${pct}%")
  })

  it('clicking phase navigates to first question', () => {
    expect(body).toContain('bpState.currentQuestion = firstQ')
    expect(body).toContain('bpAskCurrent()')
  })
})

describe('blueprint interview flow', () => {
  it('bpAnswer stores answer and advances', () => {
    const body = rendererJs.split('function bpAnswer')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('bpState.answers[q.key] = text')
    expect(body).toContain('bpState.currentQuestion++')
    expect(body).toContain('bpSave()')
  })

  it('bpSkip advances without storing', () => {
    const body = rendererJs.split('function bpSkip')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('bpState.currentQuestion++')
    expect(body).toContain('(skipped)')
  })

  it('bpAskCurrent shows completion message when all done', () => {
    const body = rendererJs.split('function bpAskCurrent')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('Interview completed')
    expect(body).toContain('GENERATE BRIEF')
  })

  it('bpAskCurrent shows previous answer if exists', () => {
    const body = rendererJs.split('function bpAskCurrent')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('Previous answer')
  })

  it('bpAskCurrent shows hint if available', () => {
    const body = rendererJs.split('function bpAskCurrent')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('q.hint')
  })

  it('bpAnswer escapes user text', () => {
    const body = rendererJs.split('function bpAnswer')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('esc(text)')
  })

  it('bpUpdateCompleteness calculates overall progress', () => {
    const body = rendererJs.split('function bpUpdateCompleteness')[1]?.split('\nasync ')[0] || ''
    expect(body).toContain('answered / total * 100')
    expect(body).toContain("$('#bpReadiness')")
  })

  it('bpUpdateCompleteness enables generate at 15%', () => {
    const body = rendererJs.split('function bpUpdateCompleteness')[1]?.split('\nasync ')[0] || ''
    expect(body).toContain('completeness < 15')
  })
})

describe('bpLoad — blueprint state restoration', () => {
  const body = rendererJs.split('async function bpLoad')[1]?.split('\nasync ')[0] || ''

  it('loads from blueprintLoad API', () => {
    expect(body).toContain('window.director.blueprintLoad')
  })

  it('initializes default state when no data', () => {
    expect(body).toContain("answers: {}")
    expect(body).toContain("modules: []")
    expect(body).toContain("sessions: []")
  })

  it('calls completeness update and renders', () => {
    expect(body).toContain('bpUpdateCompleteness()')
    expect(body).toContain('renderBpPhases()')
    expect(body).toContain('renderBpModules()')
  })
})

describe('loadBpReadiness — readiness indicator (F-12)', () => {
  const body = rendererJs.split('async function loadBpReadiness')[1]?.split('\nconst ')[0] || ''

  it('calls blueprintReadiness API', () => {
    expect(body).toContain('window.director.blueprintReadiness')
  })

  it('color codes by readiness: green/yellow/red', () => {
    expect(body).toContain('#40c840')
    expect(body).toContain('#ddba00')
    expect(body).toContain('#e03030')
  })

  it('shows fields, modules, sessions counts', () => {
    expect(body).toContain('campos')
    expect(body).toContain('módulos')
    expect(body).toContain('sesiones')
  })

  it('shows missing fields in tooltip', () => {
    expect(body).toContain('Faltan:')
    expect(body).toContain('r.missing')
  })
})

// ─── Lifecycle timeline (F-14) ──────────────────────────────────────────────
describe('lifecycle timeline constants', () => {
  it('defines LC_ICONS for event types', () => {
    expect(rendererJs).toContain('LC_ICONS')
  })

  it('covers all lifecycle event types', () => {
    const block = rendererJs.split('LC_ICONS')[1]?.split('}')[0] || ''
    const types = ['play', 'started', 'fine', 'kill', 'exit', 'usage_limit', 'resume', 'commit', 'cycle_close', 'hot_reload', 'auto_resume', 'directive', 'error']
    for (const t of types) {
      expect(block).toContain(t)
    }
  })
})

// ─── Version upgrade check ──────────────────────────────────────────────────
describe('checkVersionUpgrade', () => {
  const body = rendererJs.split('async function checkVersionUpgrade')[1]?.split('\n// ─')[0] || ''

  it('calls orchestraVersionCheck API', () => {
    expect(body).toContain('window.director.orchestraVersionCheck')
  })

  it('shows upgrade button when needed', () => {
    expect(body).toContain('needsUpgrade')
    expect(body).toContain("$('#upgradeBtn')")
  })

  it('shows version transition label', () => {
    expect(body).toContain('data.project')
    expect(body).toContain('data.bundled')
  })
})

// ─── IPC event handlers ────────────────────────────────────────────────────
describe('onUsageLimit handler', () => {
  const body = rendererJs.split('window.director.onUsageLimit')[1]?.split('\nwindow.director.on')[0] || ''

  it('shows usage banner', () => {
    expect(body).toContain('showUsageBanner(true)')
  })

  it('sets status to PAUSE', () => {
    expect(body).toContain("setStatus('PAUSE')")
  })

  it('stops clock', () => {
    expect(body).toContain('stopClock()')
  })

  it('sets state to usage_limit', () => {
    expect(body).toContain("setOrchestraState('usage_limit')")
  })

  it('removes live interpreting indicator', () => {
    expect(body).toContain("$('#le-interpreting-live')")
  })

  it('shows exhaustion message in Spanish', () => {
    expect(body).toContain('Límite alcanzado')
  })
})

describe('onResumed handler', () => {
  const body = rendererJs.split('window.director.onResumed')[1]?.split('\nwindow.director.on')[0] || ''

  it('reloads AI credits', () => {
    expect(body).toContain('loadAiCredits()')
  })

  it('updates AI select value', () => {
    expect(body).toContain("$('#aiSelect')")
  })

  it('hides usage banner', () => {
    expect(body).toContain('showUsageBanner(false)')
  })

  it('sets status to PLAY', () => {
    expect(body).toContain("setStatus('PLAY')")
  })
})

// ─── AI control panel ───────────────────────────────────────────────────────
describe('updateAiControl — AI provider display', () => {
  const body = rendererJs.split('function updateAiControl')[1]?.split('\nasync function ')[0] || ''

  it('shows credit percentage and reset time', () => {
    expect(body).toContain('credit.credits')
    expect(body).toContain('formatReset')
  })

  it('defines icons for each AI vendor', () => {
    expect(body).toContain('AI_ICONS')
    expect(body).toContain('claude:')
    expect(body).toContain('agy:')
    expect(body).toContain('codex:')
    expect(body).toContain('aider:')
  })
})

describe('formatReset — credit reset time formatting', () => {
  it('uses Intl.DateTimeFormat with weekday and 24h time', () => {
    expect(rendererJs).toContain('Intl.DateTimeFormat')
    expect(rendererJs).toContain("weekday: 'short'")
    expect(rendererJs).toContain('hour12: false')
  })

  it('returns dash for missing iso', () => {
    expect(rendererJs).toContain("if (!iso) return '—'")
  })
})

// ─── Save mix flow ──────────────────────────────────────────────────────────
describe('save mix flow', () => {
  it('generates default name with date/time', () => {
    expect(rendererJs).toContain('`Mix ')
    expect(rendererJs).toContain('toLocaleDateString')
    expect(rendererJs).toContain('toLocaleTimeString')
  })

  it('warns when no stands loaded', () => {
    expect(rendererJs).toContain("'No stands loaded'")
  })

  it('saves via mixerSavedSave API', () => {
    expect(rendererJs).toContain('window.director.mixerSavedSave')
  })
})
