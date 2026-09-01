import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

// ─── paint() — project view rendering ──────────────────────────────────────
describe('paint() — project detail view', () => {
  const body = rendererJs.split('function paint()')[1]?.split('\nlet ')[0] || ''

  it('sets project name', () => {
    expect(body).toContain("$('#pname')")
    expect(body).toContain('p.name')
  })

  it('sets project path', () => {
    expect(body).toContain("$('#ppath')")
    expect(body).toContain('p.path')
  })

  it('renders logo if available', () => {
    expect(body).toContain('p.logo')
    expect(body).toContain('local-img://')
  })

  it('renders initials badge if no logo', () => {
    expect(body).toContain('initials(esc(p.name))')
    expect(body).toContain('hue(p.name)')
  })

  it('shows INTERPRETING status when running', () => {
    expect(body).toContain('INTERPRETING')
  })

  it('shows SILENT status when stopped', () => {
    expect(body).toContain('SILENT')
  })

  it('shows NO ORCHESTRA when not installed', () => {
    expect(body).toContain('NO ORCHESTRA')
  })

  it('shows version in status', () => {
    expect(body).toContain('p.version')
  })

  it('adds live class when running', () => {
    expect(body).toContain("' live'")
  })

  it('hides install button when installed', () => {
    expect(body).toContain("$('#installBtn')")
    expect(body).toContain('p.installed')
  })

  it('shows analysis section only when logs exist', () => {
    expect(body).toContain("$('#sectionAnalysis')")
    expect(body).toContain('p.hasLogs')
  })

  it('starts clock when running', () => {
    expect(body).toContain('startClock(p.runStarted)')
  })

  it('handles usage_limit state', () => {
    expect(body).toContain('p.usageLimited')
    expect(body).toContain("setOrchestraState('usage_limit')")
  })
})

// ─── Monitor status — 5 states ──────────────────────────────────────────────
describe('updateMonitorStatus — 5 orchestra states', () => {
  const body = rendererJs.split('function updateMonitorStatus')[1]?.split('\n// ─')[0] || ''

  it('defines 5 states: idle, started, interpreting, usage_limit, finished', () => {
    expect(body).toContain("idle:")
    expect(body).toContain("started:")
    expect(body).toContain("interpreting:")
    expect(body).toContain("usage_limit:")
    expect(body).toContain("finished:")
  })

  it('shows waveform animation for interpreting state', () => {
    expect(body).toContain("s.icon === 'waveform'")
    expect(body).toContain('waveform-bar')
  })

  it('sets className with state cls', () => {
    expect(body).toContain("'monitor-status ' + s.cls")
  })

  it('renders icon and label', () => {
    expect(body).toContain('ms-icon')
    expect(body).toContain('ms-label')
  })
})

// ─── setOrchestraState ──────────────────────────────────────────────────────
describe('setOrchestraState', () => {
  const body = rendererJs.split('function setOrchestraState')[1]?.split('\nfunction ')[0] || ''

  it('sets orchestraState variable', () => {
    expect(body).toContain('orchestraState = state')
  })

  it('calls updateMonitorStatus', () => {
    expect(body).toContain('updateMonitorStatus()')
  })

  it('calls updateTransportButtons', () => {
    expect(body).toContain('updateTransportButtons()')
  })
})

// ─── Clock system ───────────────────────────────────────────────────────────
describe('clock system — session timer', () => {
  it('clockTick formats as HH:MM:SS', () => {
    const body = rendererJs.split('function clockTick')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain("padStart(2, '0')")
    expect(body).toContain('3600')
    expect(body).toContain('60')
  })

  it('startClock clears existing interval', () => {
    const body = rendererJs.split('function startClock')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('clearInterval(clockIv)')
  })

  it('startClock defaults to Date.now()', () => {
    const body = rendererJs.split('function startClock')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('startTime || Date.now()')
  })

  it('startClock ticks every 1000ms', () => {
    const body = rendererJs.split('function startClock')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('1000')
  })

  it('stopClock resets to 00:00:00', () => {
    const body = rendererJs.split('function stopClock')[1]?.split('\nfunction ')[0] || ''
    expect(body).toContain('clockIv = null')
    expect(body).toContain('clockStart = null')
    expect(body).toContain('clockTick()')
  })

  it('setStatus updates clockStatus element', () => {
    const body = rendererJs.split('function setStatus')[1]?.split('\n// ─')[0] || ''
    expect(body).toContain("$('#clockStatus')")
    expect(body).toContain('_clockStatusEl.textContent = text')
  })
})

// ─── initials and hue helpers ───────────────────────────────────────────────
describe('helper functions — initials and hue', () => {
  it('initials strips non-alphanumeric, takes first chars, uppercases', () => {
    expect(rendererJs).toContain("const initials")
    expect(rendererJs).toContain("toUpperCase()")
    expect(rendererJs).toContain("slice(0, 2)")
  })

  it('initials defaults to ♪ for empty names', () => {
    expect(rendererJs).toContain("|| '♪'")
  })

  it('hue generates deterministic color from string', () => {
    expect(rendererJs).toContain('const hue')
    expect(rendererJs).toContain('charCodeAt(0)')
    expect(rendererJs).toContain('% 360')
  })
})

// ─── Log entry types — comprehensive ────────────────────────────────────────
describe('addActionEntry — lifecycle action log entries', () => {
  const body = rendererJs.split('function addActionEntry')[1]?.split('\n// ')[0] || ''

  it('supports play, fine, kill, started, exit, resume types', () => {
    expect(body).toContain("'play':")
    expect(body).toContain("'fine':")
    expect(body).toContain("'kill':")
    expect(body).toContain("'started':")
    expect(body).toContain("'exit':")
    expect(body).toContain("'resume':")
  })

  it('each type has icon, color, and bg', () => {
    expect(body).toContain('icon:')
    expect(body).toContain('color:')
    expect(body).toContain('bg:')
  })

  it('uses le-action CSS class', () => {
    expect(body).toContain('le le-action')
  })

  it('escapes label and message with esc()', () => {
    expect(body).toContain('esc(label)')
    expect(body).toContain('esc(message)')
  })

  it('pushes to rawLogBuffer', () => {
    expect(body).toContain('rawLogBuffer.push')
  })

  it('resets currentGroup', () => {
    expect(body).toContain('currentGroup = null')
  })

  it('trims and scrolls log', () => {
    expect(body).toContain('trimLog()')
    expect(body).toContain('scrollLog()')
  })
})

describe('addInterpretingEntry — waveform animation', () => {
  const body = rendererJs.split('function addInterpretingEntry')[1]?.split('\n// ')[0] || ''

  it('creates element with id le-interpreting-live', () => {
    expect(body).toContain("'le-interpreting-live'")
  })

  it('renders 5 waveform bars with animation delays', () => {
    const barCount = (body.match(/waveform-bar/g) || []).length
    expect(barCount).toBeGreaterThanOrEqual(5)
    expect(body).toContain('animation-delay')
  })

  it('uses le-interpreting CSS class', () => {
    expect(body).toContain('le le-interpreting')
  })
})

describe('addUsageEntry — collapsible retry counter', () => {
  const body = rendererJs.split('function addUsageEntry')[1]?.split('\n// ')[0] || ''

  it('reuses existing entry for retries', () => {
    expect(body).toContain('usageEntry && usageEntry.parentNode')
  })

  it('increments retry counter', () => {
    expect(body).toContain('retryCount++')
    expect(body).toContain('le-retry')
  })

  it('uses PAUSE badge', () => {
    expect(body).toContain('PAUSE')
  })

  it('uses le-usage CSS class', () => {
    expect(body).toContain('le le-usage')
  })
})

describe('addFeatureEntry — category-colored feature start', () => {
  const body = rendererJs.split('function addFeatureEntry')[1]?.split('\n// ')[0] || ''

  it('parses category tag, unit name, and goal', () => {
    expect(body).toContain('category')
    expect(body).toContain('unit')
    expect(body).toContain('goal')
  })

  it('maps category to mixer section color', () => {
    expect(body).toContain('SECTIONS.find')
    expect(body).toContain('catColor')
  })

  it('uses le-feature CSS class', () => {
    expect(body).toContain('le le-feature')
  })

  it('sets border-left-color to category color', () => {
    expect(body).toContain('borderLeftColor = catColor')
  })

  it('updates currentFeature indicator', () => {
    expect(body).toContain("$('#currentFeature')")
  })

  it('escapes unit and goal text', () => {
    expect(body).toContain('esc(unit)')
    expect(body).toContain('esc(goal)')
  })
})

describe('addCycleEntry — status line', () => {
  const body = rendererJs.split('function addCycleEntry')[1]?.split('\n// ')[0] || ''

  it('uses le-cycle CSS class', () => {
    expect(body).toContain('le le-cycle')
  })

  it('uses ▸ icon', () => {
    expect(body).toContain('▸')
  })

  it('escapes text', () => {
    expect(body).toContain('esc(text)')
  })
})

describe('addErrorEntry — error display', () => {
  const body = rendererJs.split('function addErrorEntry')[1]?.split('\n// ')[0] || ''

  it('uses le-error CSS class', () => {
    expect(body).toContain('le le-error')
  })

  it('shows ERROR badge in red', () => {
    expect(body).toContain('ERROR')
    expect(body).toContain('#e03030')
  })

  it('escapes error text', () => {
    expect(body).toContain('esc(text)')
  })
})

describe('addClaudeMessageEntry — milestone log', () => {
  const body = rendererJs.split('function addClaudeMessageEntry')[1]?.split('\n// ')[0] || ''

  it('uses le-claude-msg CSS class', () => {
    expect(body).toContain('le le-claude-msg')
  })

  it('shows MILESTONE badge in purple', () => {
    expect(body).toContain('MILESTONE')
    expect(body).toContain('#8844ff')
  })

  it('escapes message text', () => {
    expect(body).toContain('esc(text)')
  })
})

describe('addConclusionEntry — summary with issues', () => {
  const body = rendererJs.split('function addConclusionEntry')[1]?.split('\n// ')[0] || ''

  it('uses le-conclusion CSS class', () => {
    expect(body).toContain('le le-conclusion')
  })

  it('color codes: green for success, yellow for issues', () => {
    expect(body).toContain('#40c840')
    expect(body).toContain('#ddba00')
  })

  it('shows ✓ or ⚠ based on issues', () => {
    expect(body).toContain("hasIssues ? '⚠' : '✓'")
  })

  it('renders issues as joined list', () => {
    expect(body).toContain("issues.join(' · ')")
  })

  it('escapes text and issues', () => {
    expect(body).toContain('esc(text)')
    expect(body).toContain('esc(issues')
  })
})

// ─── Normal line grouping ───────────────────────────────────────────────────
describe('addNormalLine — collapsible grouped lines', () => {
  const body = rendererJs.split('function addNormalLine')[1]?.split('\nfunction ')[0] || ''

  it('appends to existing group if available', () => {
    expect(body).toContain('currentGroup && currentGroup.parentNode')
  })

  it('increments group count', () => {
    expect(body).toContain('le-group-count')
  })

  it('truncates preview at 80 characters', () => {
    expect(body).toContain('text.length > 80')
    expect(body).toContain("text.slice(0, 77) + '…'")
  })

  it('creates collapsible group with toggle', () => {
    expect(body).toContain('le-group-header')
    expect(body).toContain("classList.toggle('expanded')")
  })

  it('escapes preview text', () => {
    expect(body).toContain('esc(preview)')
  })

  it('sets currentGroup to new group', () => {
    expect(body).toContain('currentGroup = grp')
  })
})

// ─── trimLog — log size management ──────────────────────────────────────────
describe('trimLog — log entry limiting', () => {
  const body = rendererJs.split('function trimLog')[1]?.split('\n// ')[0] || ''

  it('caps DOM entries at 300', () => {
    expect(body).toContain('childElementCount > 300')
    expect(body).toContain('removeChild(logEl.firstChild)')
  })

  it('caps rawLogBuffer at 2000', () => {
    expect(body).toContain('rawLogBuffer.length > 2000')
    expect(body).toContain('rawLogBuffer.splice(0')
  })
})

// ─── Iteration entries ──────────────────────────────────────────────────────
describe('addIterationStartEntry — cycle begin marker', () => {
  const body = rendererJs.split('function addIterationStartEntry')[1]?.split('\n// ')[0] || ''

  it('uses le-iter-start CSS class', () => {
    expect(body).toContain('le-iter-start')
  })

  it('shows CYCLE badge with number', () => {
    expect(body).toContain('CYCLE ${num}')
  })

  it('escapes date string', () => {
    expect(body).toMatch(/esc\((?:dateStr|cleanDate)\)/)
  })
})

describe('addIterationEndEntry — cycle end with exit code', () => {
  const body = rendererJs.split('function addIterationEndEntry')[1]?.split('\n// ')[0] || ''

  it('uses le-iter-end CSS class', () => {
    expect(body).toContain('le-iter-end')
  })

  it('checks exit code 0 for success', () => {
    expect(body).toContain("exitCode === '0'")
  })

  it('shows ✓ for success, ↺ for restart', () => {
    expect(body).toContain("ok ? '✓' : '↺'")
  })

  it('escapes non-zero exit code', () => {
    expect(body).toContain('esc(exitCode)')
  })
})

describe('addSleepEntry — backoff wait display', () => {
  const body = rendererJs.split('function addSleepEntry')[1]?.split('\n// ')[0] || ''

  it('parses seconds to minutes+seconds', () => {
    expect(body).toContain('Math.floor(s / 60)')
    expect(body).toContain('s % 60')
  })

  it('uses le-sleep CSS class', () => {
    expect(body).toContain('le le-sleep')
  })

  it('shows hourglass icon', () => {
    expect(body).toContain('⏳')
  })
})

describe('addSummaryEntry — iteration result', () => {
  const body = rendererJs.split('function addSummaryEntry')[1]?.split('\n// ')[0] || ''

  it('uses le-summary CSS class', () => {
    expect(body).toContain('le le-summary')
  })

  it('shows RESULT badge', () => {
    expect(body).toContain('RESULT')
  })

  it('escapes summary text', () => {
    expect(body).toContain('esc(text)')
  })
})

// ─── fetchIterSummary — iteration log parser ────────────────────────────────
describe('fetchIterSummary — iter log content display', () => {
  const body = rendererJs.split('async function fetchIterSummary')[1]?.split('\n}')[0] || ''

  it('reads iter log via readIterLog API', () => {
    expect(body).toContain('window.director.readIterLog')
  })

  it('filters out usage limit messages', () => {
    expect(body).toContain("you're out of")
    expect(body).toContain('usage limit')
  })

  it('filters out warning lines', () => {
    expect(body).toContain("startsWith('warning:')")
  })

  it('shows last 3 meaningful lines', () => {
    expect(body).toContain('meaningful.slice(-3)')
  })

  it('joins lines with middle dot separator', () => {
    expect(body).toContain("join(' · ')")
  })

  it('wraps in try-catch', () => {
    expect(body).toContain('try')
    expect(body).toContain('catch')
  })
})

// ─── Log filter with MutationObserver ───────────────────────────────────────
describe('log filter — search and observer', () => {
  it('filters on input event', () => {
    expect(rendererJs).toContain("filterInput.addEventListener('input'")
  })

  it('matches case-insensitively', () => {
    expect(rendererJs).toContain('e.target.value.toLowerCase()')
    expect(rendererJs).toContain('textContent.toLowerCase().includes(q)')
  })

  it('toggles filtering class on log element', () => {
    expect(rendererJs).toContain("logEl.classList.add('filtering')")
    expect(rendererJs).toContain("logEl.classList.remove('filtering')")
  })

  it('adds match class to matching entries', () => {
    expect(rendererJs).toContain("el.classList.add('match')")
    expect(rendererJs).toContain("el.classList.remove('match')")
  })

  it('shows result count in Spanish', () => {
    expect(rendererJs).toContain(' resultado')
  })

  it('uses MutationObserver for new entries', () => {
    expect(rendererJs).toContain('new MutationObserver')
    expect(rendererJs).toContain('childList: true')
  })

  it('observer checks le and le-group classes', () => {
    expect(rendererJs).toContain("node.classList.contains('le')")
    expect(rendererJs).toContain("node.classList.contains('le-group')")
  })
})

// ─── Auto-scroll and log controls ───────────────────────────────────────────
describe('auto-scroll and log controls', () => {
  it('scrollLog respects autoScrollEnabled flag', () => {
    expect(rendererJs).toContain('autoScrollEnabled')
    expect(rendererJs).toContain('scrollTop = l.scrollHeight')
  })

  it('clear log clears cache and DOM', () => {
    expect(rendererJs).toContain("logCache.set(current, '')")
    expect(rendererJs).toContain("$('#log').innerHTML = ''")
  })

  it('auto-scroll toggle changes button color', () => {
    expect(rendererJs).toContain('var(--hi)')
    expect(rendererJs).toContain('var(--tx-muted)')
  })

  it('copy log copies rawLogBuffer', () => {
    expect(rendererJs).toContain("rawLogBuffer.join('\\n')")
    expect(rendererJs).toContain('clipboard.writeText')
  })

  it('raw log overlay shows full buffer', () => {
    expect(rendererJs).toContain("$('#rawLogOverlay')")
    expect(rendererJs).toContain("$('#rawLogContent')")
  })

  it('select all raw log uses Range API', () => {
    expect(rendererJs).toContain('document.createRange()')
    expect(rendererJs).toContain('selectNodeContents')
  })
})

// ─── Button handlers — play/fine/kill/install ───────────────────────────────
describe('play button handler', () => {
  const body = rendererJs.split("playBtn').onclick")[1]?.split("$('#aiLoginBtn')")[0] || ''

  it('guards against not installed, already running, no agent', () => {
    expect(body).toContain('!p.installed')
    expect(body).toContain('p.running')
    expect(body).toContain('!agent')
  })

  it('persists agent and model to config', () => {
    expect(body).toContain('cfg.agent = agent')
    expect(body).toContain('cfg.model = model')
  })

  it('sets started state then transitions to interpreting', () => {
    expect(body).toContain("setOrchestraState('started')")
    expect(body).toContain("setOrchestraState('interpreting')")
  })

  it('tracks play for stall detection', () => {
    expect(body).toContain('trackPlay(current)')
  })

  it('transitions to interpreting after 3s delay', () => {
    expect(body).toContain('3000')
  })
})

describe('fine button handler', () => {
  it('shows CLOSING LAST MEASURE status', () => {
    expect(rendererJs).toContain('CLOSING LAST MEASURE')
  })

  it('calls director.fine', () => {
    expect(rendererJs).toContain('window.director.fine(current)')
  })

  it('sets status to FINE', () => {
    expect(rendererJs).toContain("setStatus('FINE')")
  })
})

describe('kill button handler', () => {
  it('calls director.kill', () => {
    expect(rendererJs).toContain('window.director.kill(current)')
  })

  it('sets state to finished', () => {
    expect(rendererJs).toContain("setOrchestraState('finished')")
  })
})

describe('remove button handler', () => {
  it('resets all UI state', () => {
    const body = rendererJs.split("removeBtn').onclick")[1]?.split("installBtn').onclick")[0] || ''
    expect(body).toContain('current = null')
    expect(body).toContain('stopClock()')
    expect(body).toContain("setOrchestraState('idle')")
  })
})

describe('upgrade button handler', () => {
  it('calls orchestraUpgrade API', () => {
    expect(rendererJs).toContain('window.director.orchestraUpgrade')
  })

  it('shows upgrade count on success', () => {
    expect(rendererJs).toContain('result.upgraded.length')
  })

  it('shows ERROR on failure', () => {
    expect(rendererJs).toContain("btn.textContent = 'ERROR'")
  })
})

// ─── COMMIT_TYPE_COLORS ─────────────────────────────────────────────────────
describe('COMMIT_TYPE_COLORS — chart color palette', () => {
  it('defines colors for standard commit types', () => {
    expect(rendererJs).toContain('COMMIT_TYPE_COLORS')
    const block = rendererJs.split('COMMIT_TYPE_COLORS')[1]?.split('}')[0] || ''
    const types = ['feat', 'fix', 'test', 'refactor', 'chore', 'security', 'perf', 'docs', 'style', 'i18n']
    for (const t of types) {
      expect(block).toContain(t)
    }
  })
})

// ─── AI select/model handlers ───────────────────────────────────────────────
describe('AI select/model change handlers', () => {
  it('aiSelect persists selection', () => {
    expect(rendererJs).toContain('window.director.aiSelect(agentId)')
  })

  it('aiSelect updates default model', () => {
    expect(rendererJs).toContain('aiData.defaultModel')
  })

  it('modelSelect persists model to config', () => {
    expect(rendererJs).toContain("$('#modelSelect')")
    expect(rendererJs).toContain('cfg.model = event.target.value')
  })
})
