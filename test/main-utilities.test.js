import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8')

// ─── Helper: extract function body ──────────────────────────────────────────
const fnBody = name => {
  const kw = mainJs.includes(`function ${name}`) ? `function ${name}` : `const ${name}`
  return mainJs.split(kw)[1]?.split('\nfunction ')[0] || ''
}

// ─── LOGO_CANDIDATES ────────────────────────────────────────────────────────
describe('LOGO_CANDIDATES constant', () => {
  const block = mainJs.split('LOGO_CANDIDATES')[1]?.split(']')[0] || ''

  it('contains at least 20 candidate paths', () => {
    const entries = block.match(/'/g) || []
    expect(entries.length / 2).toBeGreaterThanOrEqual(20)
  })

  it('includes common logo filenames', () => {
    expect(block).toContain('logo.png')
    expect(block).toContain('logo.svg')
    expect(block).toContain('icon.png')
    expect(block).toContain('favicon.ico')
  })

  it('includes public/ directory variants', () => {
    expect(block).toContain('public/logo.png')
    expect(block).toContain('public/favicon.ico')
  })

  it('includes src/assets/ directory variants', () => {
    expect(block).toContain('src/assets/logo.png')
    expect(block).toContain('src/assets/logo.svg')
  })

  it('includes resources/ directory variants', () => {
    expect(block).toContain('resources/icon.png')
    expect(block).toContain('resources/logo.png')
  })

  it('includes webp format', () => {
    expect(block).toContain('logo.webp')
  })
})

// ─── scanDirForImage ────────────────────────────────────────────────────────
describe('scanDirForImage', () => {
  const body = fnBody('scanDirForImage')

  it('is defined as a function', () => {
    expect(mainJs).toContain('function scanDirForImage')
  })

  it('uses readdirSync to list directory contents', () => {
    expect(body).toContain('readdirSync')
  })

  it('matches image extensions with regex', () => {
    expect(body).toMatch(/png|svg|jpg|webp|ico/)
  })

  it('checks isFile before returning', () => {
    expect(body).toContain('isFile()')
  })

  it('recurses into subdirectories', () => {
    expect(body).toContain('isDirectory()')
    expect(body).toContain('scanDirForImage')
  })

  it('wraps in try-catch for permission errors', () => {
    expect(body).toContain('try')
    expect(body).toContain('catch')
  })

  it('returns null on failure or no match', () => {
    expect(body).toContain('return null')
  })
})

// ─── findLogo — 5-step logo detection ───────────────────────────────────────
describe('findLogo — 5-step logo detection', () => {
  const body = fnBody('findLogo')

  it('is defined as a function', () => {
    expect(mainJs).toContain('function findLogo')
  })

  // Step 1: explicit candidates
  it('step 1: iterates LOGO_CANDIDATES', () => {
    expect(body).toContain('LOGO_CANDIDATES')
  })

  it('step 1: checks existsSync for each candidate', () => {
    expect(body).toContain('existsSync(full)')
  })

  // Step 2: package.json fields
  it('step 2: reads package.json via readJSON', () => {
    expect(body).toContain('package.json')
    expect(body).toContain('readJSON')
  })

  it('step 2: checks icon, logo, image fields', () => {
    expect(body).toContain("'icon'")
    expect(body).toContain("'logo'")
    expect(body).toContain("'image'")
  })

  it('step 2: checks build.icon for Electron apps', () => {
    expect(body).toContain('pkg.build')
    expect(body).toContain('build.icon')
  })

  it('step 2: validates field is string before path.join', () => {
    expect(body).toContain("typeof pkg[field] === 'string'")
  })

  // Step 3: branded directories
  it('step 3: scans logo/icon/brand/img/images/static dirs', () => {
    expect(body).toMatch(/logo|icon|brand|img|images|static/)
    expect(body).toContain('isDirectory()')
  })

  it('step 3: calls scanDirForImage on matched dirs', () => {
    const step3 = body.split('logo|icon|brand')[0] ? body : ''
    expect(body).toContain('scanDirForImage')
  })

  // Step 4: .github directory
  it('step 4: checks .github directory', () => {
    expect(body).toContain('.github')
  })

  it('step 4: verifies .github is a directory before scanning', () => {
    const githubSection = body.split('// 4')[1]?.split('// 5')[0] || ''
    expect(githubSection).toContain('isDirectory()')
  })

  // Step 5: root scan with size limit
  it('step 5: scans root for any image file', () => {
    const lastSection = body.split('// 5')[1] || ''
    expect(lastSection).toContain('readdirSync')
  })

  it('step 5: enforces 500KB size limit', () => {
    expect(body).toContain('500000')
  })

  it('returns null if nothing found', () => {
    expect(body).toContain('return null')
  })

  it('wraps each step in try-catch', () => {
    const catchCount = (body.match(/catch/g) || []).length
    expect(catchCount).toBeGreaterThanOrEqual(3)
  })
})

// ─── projectInfo ────────────────────────────────────────────────────────────
describe('projectInfo — project state aggregator', () => {
  const body = fnBody('projectInfo')

  it('is defined as a function', () => {
    expect(mainJs).toContain('function projectInfo')
  })

  it('checks installed status via run.sh + loop.md', () => {
    expect(body).toContain('run.sh')
    expect(body).toContain('loop.md')
  })

  it('reads ORCHESTRA_VERSION file', () => {
    expect(body).toContain('ORCHESTRA_VERSION')
  })

  it('defaults version to 1.x when file missing', () => {
    expect(body).toContain("'1.x'")
  })

  it('reads mixer config via readJSON', () => {
    expect(body).toContain('readJSON')
    expect(body).toContain('orchestra.json')
  })

  it('checks running status via isRunning', () => {
    expect(body).toContain('isRunning(dir)')
  })

  it('checks usage limit status', () => {
    expect(body).toContain('USAGE_LIMIT_SIGNAL')
  })

  it('checks ALTO flag', () => {
    expect(body).toContain('ALTO')
  })

  it('calls findLogo for project logo', () => {
    expect(body).toContain('findLogo(dir)')
  })

  it('checks for log file existence', () => {
    expect(body).toContain('orchestra-stdout.log')
    expect(body).toContain('orchestra.log')
  })

  it('reads RUN_STARTED timestamp', () => {
    expect(body).toContain('RUN_STARTED')
  })

  it('only reads runStarted when running', () => {
    expect(body).toContain('if (running')
  })

  it('returns object with all 9 expected fields', () => {
    expect(body).toContain('installed')
    expect(body).toContain('version')
    expect(body).toContain('mixer')
    expect(body).toContain('running')
    expect(body).toContain('usageLimited')
    expect(body).toContain('alto')
    expect(body).toContain('logo')
    expect(body).toContain('hasLogs')
    expect(body).toContain('runStarted')
  })
})

// ─── copyDir — recursive copy with CLAUDE.md/settings.json merge ────────────
describe('copyDir — recursive copy with merge logic', () => {
  const body = fnBody('copyDir')

  it('is defined as a function', () => {
    expect(mainJs).toContain('function copyDir')
  })

  it('creates destination directory recursively', () => {
    expect(body).toContain('mkdirSync(dst')
    expect(body).toContain('recursive: true')
  })

  it('uses readdirSync with withFileTypes', () => {
    expect(body).toContain('withFileTypes: true')
  })

  it('recurses into subdirectories', () => {
    expect(body).toContain('copyDir(s, d)')
  })

  it('uses copyFileSync for normal files', () => {
    expect(body).toContain('copyFileSync')
  })

  it('skips overwrite for CLAUDE.md and settings.json if destination exists', () => {
    expect(body).toContain('CLAUDE.md')
    expect(body).toContain('settings.json')
  })

  it('appends CLAUDE.md content instead of overwriting', () => {
    expect(body).toContain('appendFileSync')
  })

  it('merges settings.json hooks instead of overwriting', () => {
    expect(body).toContain('hooks')
    expect(body).toContain('readJSON')
  })

  it('spreads existing hooks with source hooks', () => {
    const settingsBlock = body.split('settings.json')[1]?.split('}')[0] || body
    expect(body).toContain('a.hooks[k]')
  })

  it('uses writeJSON for merged settings with size cap', () => {
    expect(body).toContain('_cdMergeSer')
    expect(body).toContain('writeJSON(d,')
  })
})

// ─── nextAvailableAi — round-robin AI provider selection ────────────────────
describe('nextAvailableAi — round-robin provider selection', () => {
  const body = fnBody('nextAvailableAi')

  it('is defined as a function', () => {
    expect(mainJs).toContain('function nextAvailableAi')
  })

  it('gets providers from AI_DEFAULTS keys', () => {
    expect(body).toContain('AI_DEFAULTS')
    expect(body).toContain('Object.keys')
  })

  it('starts search from current agent position', () => {
    expect(body).toContain('indexOf(currentAgent)')
  })

  it('uses modular arithmetic for round-robin', () => {
    expect(body).toContain('% providers.length')
  })

  it('checks credits > 0 for candidate', () => {
    expect(body).toContain('.credits > 0')
  })

  it('returns null if no provider has credits', () => {
    expect(body).toContain('return null')
  })

  it('skips current agent (offset starts at 1)', () => {
    expect(body).toContain('offset = 1')
  })
})

// ─── nextReset — daily credit reset time ────────────────────────────────────
describe('nextReset — daily credit reset at 14:30', () => {
  const body = fnBody('nextReset')

  it('is defined as a function', () => {
    expect(mainJs).toContain('function nextReset')
  })

  it('sets hours to 14:30', () => {
    expect(body).toContain('setHours(14, 30, 0, 0)')
  })

  it('advances to next day if time has passed', () => {
    expect(body).toContain('setDate')
    expect(body).toContain('getDate() + 1')
  })

  it('returns ISO string', () => {
    expect(body).toContain('toISOString()')
  })
})

// ─── aiState — credit management with auto-reset ────────────────────────────
describe('aiState — credit management with auto-reset', () => {
  const body = fnBody('aiState')

  it('is defined as a function', () => {
    expect(mainJs).toContain('function aiState')
  })

  it('reads state from aiStateFile via readJSON', () => {
    expect(body).toContain('aiStateFile()')
    expect(body).toContain('readJSON(')
  })

  it('iterates all AI_DEFAULTS entries', () => {
    expect(body).toContain('AI_DEFAULTS')
    expect(body).toContain('Object.entries')
  })

  it('preserves existing resetAt if present', () => {
    expect(body).toContain('existingReset')
    expect(body).toContain('resetAt')
  })

  it('always overwrites models and defaultModel from defaults', () => {
    expect(body).toContain('defaults.models')
    expect(body).toContain('defaults.defaultModel')
  })

  it('resets credits to 100 when resetAt has passed', () => {
    expect(body).toContain('credits = 100')
    expect(body).toContain('new Date(state[id].resetAt)')
  })

  it('sets new resetAt via nextReset after credit reset', () => {
    expect(body).toContain('nextReset()')
  })

  it('persists updated state via writeJSON', () => {
    expect(body).toContain('writeJSON(aiStateFile()')
  })

  it('merges defaults with existing state (defaults first)', () => {
    expect(body).toContain('...defaults')
    expect(body).toContain('...state[id]')
  })
})

// ─── AI_DEFAULTS — provider configuration ───────────────────────────────────
describe('AI_DEFAULTS — provider configuration', () => {
  const block = mainJs.split('const AI_DEFAULTS')[1]?.split('\nfunction')[0] || ''

  it('defines at least 3 AI providers', () => {
    const providers = block.match(/\w+:\s*\{/g) || []
    expect(providers.length).toBeGreaterThanOrEqual(3)
  })

  it('includes claude provider', () => {
    expect(block).toContain('claude:')
  })

  it('each provider has credits, models, defaultModel', () => {
    expect(block).toContain('credits:')
    expect(block).toContain('models:')
    expect(block).toContain('defaultModel:')
  })

  it('each provider has a label and vendor', () => {
    expect(block).toContain('label:')
    expect(block).toContain('vendor:')
  })

  it('claude default credits are 100', () => {
    expect(block).toContain('credits: 100')
  })

  it('includes claude-opus and claude-sonnet models', () => {
    expect(block).toContain('claude-opus')
    expect(block).toContain('claude-sonnet')
  })
})

// ─── snapshotMixer — mixer history recording ────────────────────────────────
describe('snapshotMixer — mixer history recording', () => {
  const body = fnBody('snapshotMixer')

  it('is defined as a function', () => {
    expect(mainJs).toContain('function snapshotMixer')
  })

  it('guards against null dir', () => {
    expect(body).toContain('if (!dir) return')
  })

  it('reads orchestra.json for current config', () => {
    expect(body).toContain('readJSON')
    expect(body).toContain('orchestra.json')
  })

  it('guards against missing focus', () => {
    expect(body).toContain('!cfg.focus')
  })

  it('reads existing history from mixer-history.json', () => {
    expect(body).toContain('mixer-history.json')
  })

  it('pushes entry with timestamp, event, and focus copy', () => {
    expect(body).toContain('ts:')
    expect(body).toContain('toISOString()')
    expect(body).toContain('event')
    expect(body).toMatch(/cfg\.focus/)

  })

  it('writes history via writeJSON', () => {
    expect(body).toContain('writeJSON(histFile')
  })
})

// ─── watchForResume — deep invariants ───────────────────────────────────────
describe('watchForResume — auto-resume on usage reset', () => {
  const body = fnBody('watchForResume')

  it('polls at 5-minute (300s) intervals', () => {
    expect(body).toContain('300_000')
  })

  it('checks if USAGE_LIMIT file was removed', () => {
    expect(body).toContain('signalFile')
    expect(body).toContain('_wrSig')
  })

  it('clears interval on resume', () => {
    expect(body).toContain('clearInterval(iv)')
  })

  it('removes timer from resumeTimers map', () => {
    expect(body).toContain('resumeTimers.delete(dir)')
  })

  it('only plays if not already running', () => {
    expect(body).toContain('isRunning(dir)')
  })

  it('calls playOrchestra on resume', () => {
    expect(body).toContain('playOrchestra(dir')
  })

  it('sends orchestra:resumed to renderer', () => {
    expect(body).toContain("'orchestra:resumed'")
  })

  it('checks win.isDestroyed before sending', () => {
    expect(body).toContain('isDestroyed()')
  })

  it('uses aiState to get selected agent for resume', () => {
    expect(body).toContain('aiState()')
  })
})

// ─── stopWatchingResume ─────────────────────────────────────────────────────
describe('stopWatchingResume', () => {
  const body = fnBody('stopWatchingResume')

  it('is defined', () => {
    expect(mainJs).toContain('function stopWatchingResume')
  })

  it('gets interval from resumeTimers', () => {
    expect(body).toContain('resumeTimers.get(dir)')
  })

  it('clears interval and removes from map', () => {
    expect(body).toContain('clearInterval')
    expect(body).toContain('resumeTimers.delete')
  })
})

// ─── getClaudeUsage — deep invariants ───────────────────────────────────────
describe('getClaudeUsage — token estimation and caching', () => {
  const body = fnBody('getClaudeUsage')

  it('returns exhausted status when usage limited', () => {
    expect(body).toContain('USAGE_LIMIT_SIGNAL')
    expect(body).toContain("'exhausted'")
  })

  it('returns 100% when usage limited', () => {
    expect(body).toContain('percent: 100')
  })

  it('reads RUN_STARTED for session boundary', () => {
    expect(body).toContain('RUN_STARTED')
  })

  it('uses usageTracker Map for caching', () => {
    expect(body).toContain('usageTracker')
  })

  it('caches for 25 seconds', () => {
    expect(body).toContain('25_000')
  })

  it('checks runStarted matches for cache validity', () => {
    expect(body).toContain('cached.runStarted === runStarted')
  })

  it('counts iter-*.log files', () => {
    expect(body).toContain("startsWith('iter-')")
    expect(body).toContain("endsWith('.log')")
  })

  it('only counts files modified after session start', () => {
    expect(body).toContain('mtimeMs >= runStarted')
  })

  it('estimates tokens as totalBytes / 4', () => {
    expect(body).toContain('totalBytes / 4')
  })

  it('reads claudeUsageBudget from orchestra.json', () => {
    expect(body).toContain('claudeUsageBudget')
  })

  it('defaults daily budget to 1M tokens', () => {
    expect(body).toContain('1_000_000')
  })

  it('caps percent at 99', () => {
    expect(body).toContain('Math.min(99')
  })

  it('has 4 status levels: critical/high/mid/normal', () => {
    expect(body).toContain("'critical'")
    expect(body).toContain("'high'")
    expect(body).toContain("'mid'")
    expect(body).toContain("'normal'")
  })

  it('calculates estimated cost at $0.000003 per token', () => {
    expect(body).toContain('0.000003')
  })

  it('formats token count with K suffix', () => {
    expect(body).toContain("'K'")
  })

  it('stores scan data back in usageTracker', () => {
    expect(body).toContain('usageTracker.set(dir')
  })
})

// ─── playOrchestra — setup chain ────────────────────────────────────────────
describe('playOrchestra — orchestration setup chain', () => {
  const body = fnBody('playOrchestra')

  it('guards against already running', () => {
    expect(body).toContain('isRunning(dir)')
    expect(body).toContain('already running')
  })

  it('syncs protocol files first', () => {
    expect(body).toContain('syncProtocol(dir)')
  })

  it('removes ALTO file before starting', () => {
    expect(body).toContain('ALTO')
    expect(body).toContain('unlinkSync')
  })

  it('removes stale usage limit signal', () => {
    expect(body).toContain('USAGE_LIMIT_SIGNAL')
  })

  it('ensures shared memory directory exists', () => {
    expect(body).toContain('.director-suite')
    expect(body).toContain('shared-memory')
  })

  it('computes resource allocation from mixer weights', () => {
    expect(body).toContain('computeAllocation')
  })

  it('computes initial context delta', () => {
    expect(body).toContain('computeDelta')
  })

  it('spawns bash run.sh with detached:true', () => {
    expect(body).toContain("'run.sh'")
    expect(body).toContain('detached: true')
  })

  it('sets DIRECTOR_AI_AGENT environment variable', () => {
    expect(body).toContain('DIRECTOR_AI_AGENT')
  })

  it('writes ORCHESTRA_PID file', () => {
    expect(body).toContain('ORCHESTRA_PID')
    expect(body).toContain('child.pid')
  })

  it('applies OS-level resource controls', () => {
    expect(body).toContain('applyToProcess')
  })

  it('registers with coordination protocol', () => {
    expect(body).toContain('coordinator.register')
  })

  it('takes mixer snapshot on play', () => {
    expect(body).toContain("snapshotMixer(dir, 'play')")
  })

  it('unrefs child process', () => {
    expect(body).toContain('child.unref()')
  })

  it('stores child in procs map', () => {
    expect(body).toContain('procs.set(dir, child)')
  })

  it('starts log tailing', () => {
    expect(body).toContain('startTailing')
  })

  it('starts git watcher', () => {
    expect(body).toContain('startGitWatcher')
  })

  it('starts metrics sampling', () => {
    expect(body).toContain('startMetricsSampling')
  })

  it('writes current-allocation.json for orchestra', () => {
    expect(body).toContain('current-allocation.json')
  })

  it('injects PRODUCT_DIRECTIVE.md when top weight >= 20', () => {
    expect(body).toContain('PRODUCT_DIRECTIVE.md')
    expect(body).toContain('>= 20')
  })
})

// ─── Focus directive injection detail ───────────────────────────────────────
describe('playOrchestra — focus directive injection', () => {
  const body = fnBody('playOrchestra')

  it('sorts focus weights descending', () => {
    expect(body).toContain('sort((a, b) => b[1] - a[1])')
  })

  it('filters out zero-weight categories', () => {
    expect(body).toContain('w > 0')
  })

  it('has three priority tiers: CRITICAL (>=70), HIGH (>=40), LOW', () => {
    expect(body).toContain('CRITICAL')
    expect(body).toContain('>= 70')
    expect(body).toContain('HIGH')
    expect(body).toContain('>= 40')
    expect(body).toContain('LOW')
  })

  it('activates PRODUCT MODE when product >= 50%', () => {
    expect(body).toContain('PRODUCT MODE')
    expect(body).toContain('>= 50')
  })

  it('activates QUALITY MODE when quality >= 50%', () => {
    expect(body).toContain('QUALITY MODE')
  })
})

// ─── startMetricsSampling ───────────────────────────────────────────────────
describe('startMetricsSampling — periodic metrics push', () => {
  const body = fnBody('startMetricsSampling')

  it('prevents duplicate samplers', () => {
    expect(body).toContain('metricsSamplers.has(dir)')
  })

  it('samples every 30 seconds', () => {
    expect(body).toContain('30_000')
  })

  it('samples process resources', () => {
    expect(body).toContain('scheduler.sampleProcess')
  })

  it('computes context delta', () => {
    expect(body).toContain('contextProto.computeDelta')
  })

  it('pushes metrics to renderer via webContents.send', () => {
    expect(body).toContain('webContents.send')
    expect(body).toContain("'metrics:update'")
  })

  it('checks win.isDestroyed before sending', () => {
    expect(body).toContain('isDestroyed()')
  })

  it('includes resource, context, coordination, and claudeUsage', () => {
    expect(body).toContain('resourceMetrics')
    expect(body).toContain('contextMetrics')
    expect(body).toContain('coordinator.getStatus')
    expect(body).toContain('getClaudeUsage')
  })

  it('stores interval in metricsSamplers map', () => {
    expect(body).toContain('metricsSamplers.set(dir')
  })
})

// ─── stopMetricsSampling ────────────────────────────────────────────────────
describe('stopMetricsSampling', () => {
  const body = fnBody('stopMetricsSampling')

  it('clears interval and removes from map', () => {
    expect(body).toContain('clearInterval')
    expect(body).toContain('metricsSamplers.delete')
  })
})

// ─── LEGACY_PURGE + syncProtocol ────────────────────────────────────────────
describe('syncProtocol — protocol sync with legacy cleanup', () => {
  const legacyBlock = mainJs.split('LEGACY_PURGE')[1]?.split(']')[0] || ''
  const body = fnBody('syncProtocol')

  it('LEGACY_PURGE lists .bak files to remove', () => {
    expect(legacyBlock).toContain('.bak')
  })

  it('LEGACY_PURGE covers skills, commands, CLAUDE.md, run.sh', () => {
    expect(legacyBlock).toContain('skills/')
    expect(legacyBlock).toContain('commands/')
    expect(legacyBlock).toContain('CLAUDE.md.bak')
    expect(legacyBlock).toContain('run.sh.bak')
  })

  it('purges legacy files before syncing', () => {
    expect(body).toContain('LEGACY_PURGE')
    expect(body).toContain('unlinkSync')
  })

  it('copies UPGRADE_FILES from orchestraSrc', () => {
    expect(body).toContain('UPGRADE_FILES')
    expect(body).toContain('orchestraSrc')
  })

  it('creates parent dirs for target files', () => {
    expect(body).toContain('mkdirSync')
    expect(body).toContain('recursive: true')
  })

  it('makes run.sh executable (0o755)', () => {
    expect(body).toContain('chmodSync')
    expect(body).toContain('0o755')
  })
})

// ─── hotReloadAllProjects ───────────────────────────────────────────────────
describe('hotReloadAllProjects', () => {
  const body = fnBody('hotReloadAllProjects')

  it('reads project list via cachedProjects()', () => {
    expect(body).toContain('cachedProjects()')
  })

  it('syncs protocol to each project', () => {
    expect(body).toContain('syncProtocol(p.path)')
  })

  it('sends hot-sync notification to renderer', () => {
    expect(body).toContain('Hot-sync')
    expect(body).toContain("'orchestra:line'")
  })

  it('checks win.isDestroyed before notification', () => {
    expect(body).toContain('isDestroyed()')
  })

  it('skips projects without path', () => {
    expect(body).toContain('!p.path')
  })
})

// ─── startHotReloadWatcher ──────────────────────────────────────────────────
describe('startHotReloadWatcher', () => {
  const body = fnBody('startHotReloadWatcher')

  it('watches orchestraSrc directory', () => {
    expect(body).toContain('fs.watch')
    expect(body).toContain('orchestraSrc')
  })

  it('uses recursive watching', () => {
    expect(body).toContain('recursive: true')
  })

  it('debounces with 500ms timeout', () => {
    expect(body).toContain('500')
    expect(body).toContain('hotReloadDebounce')
  })

  it('ignores dotfiles', () => {
    expect(body).toContain("startsWith('.')")
  })

  it('wraps in try-catch', () => {
    expect(body).toContain('try')
    expect(body).toContain('catch')
  })
})
