# Director — Self-Orchestration Context

## WHAT IS DIRECTOR
Director is an Electron desktop app that autonomously orchestrates AI coding agents (Claude, Gemini, Codex, Aider) across software projects. It runs an infinite development loop: the AI reads the codebase, plans work from a roadmap, writes code, runs tests, commits, and repeats — without human intervention. **You are currently developing Director itself.** Every improvement you make to this codebase directly improves the system that is running you.

## SELF-ORCHESTRATION AWARENESS
You are an AI agent running inside Director, developing Director. This means:
- Your commits improve the tool that orchestrates you
- The `run.sh` harness executing your session is the same code in `resources/orchestra/run.sh`
- The CLAUDE.md constitution governing your behavior is `resources/orchestra/CLAUDE.md`
- The verification gate you run before commits tests the code you're developing
- Changes to `main.js` affect how Director spawns and manages orchestra sessions (including yours)
- Changes to `renderer.js` affect the UI your operator sees while watching you work
- Changes to the protocol modules affect resource allocation and context management for all orchestras

## PROTECTED FILES — DO NOT MODIFY
These files are the harness running your current session. Modifying them will break or corrupt the session.
**NEVER edit, delete, or overwrite during orchestra sessions:**
- `resources/orchestra/run.sh` — the bash harness loop
- `resources/orchestra/CLAUDE.md` — the AI constitution
- `resources/orchestra/.claude/commands/loop.md` — per-session bootstrap prompt
- `run.sh` (project root copy, synced from resources/)
- `CLAUDE.md` (project root copy, synced from resources/)

If improvements to these files are needed, add them to `PENDING.md` with `[HARNESS]` tag.

## ARCHITECTURE

### Source Files (8.8k lines total)
| File | Lines | Role |
|------|-------|------|
| `main.js` | 1532 | Electron main process — IPC handlers, process management, lifecycle events, protocol sync, hot-reload, auto-restart, git watcher, metrics sampling |
| `renderer.js` | 2695 | Frontend SPA — project list, transport controls (play/stop/kill), mixer equalizer, log viewer, commit timeline, metrics dashboards, aurora effects |
| `index.html` | 434 | Single HTML page — semantic layout, no framework |
| `styles.css` | 2529 | Full design system — dark theme, glass effects, aurora gradients, responsive |
| `preload.js` | 64 | Electron context bridge — 50+ IPC methods exposed to renderer |
| `resource-scheduler.js` | 332 | Weighted resource allocator — maps mixer weights to OS priority, memory budgets, token budgets |
| `context-protocol.js` | 360 | Delta context management — hash-based change detection, weight-linked retention, token estimation |
| `coordination-protocol.js` | 298 | Multi-orchestra synchronization — priority inheritance, resource locking, conflict detection |
| `resources/orchestra/run.sh` | 553 | Orchestra harness — infinite loop, Smart Mix v3, anti-hallucination, anti-slop, usage limit detection |

### Process Model
```
Director (Electron main)
├── renderer (Chromium, UI)
├── Orchestra A (bash run.sh → claude/gemini/codex)
│   ├── run.sh loop (infinite, auto-restart on exit)
│   ├── AI agent subprocess (claude --output-format stream-json)
│   └── git watcher (8s poll for new commits)
├── Orchestra B (same pattern, different project)
└── Hot-reload watcher (resources/orchestra/ → all projects)
```

### IPC Architecture (preload.js → main.js)
- **Repertoire:** `list`, `add`, `remove`, `openDir`, `readFile` — project management
- **Orchestra:** `play`, `fine` (graceful stop), `kill`, `tail`, `clearLog`, `analyze` — session control
- **Mixer:** `read`, `write`, `saved:list/save/delete/export`, `configWrite` — focus weight management
- **Metrics:** `resource`, `context`, `coordination`, `snapshot`, `allocation`, `claude-usage`, `compliance`, `roadmap-freshness` — telemetry
- **Lifecycle:** `list`, `add` — append-only event log (play, commit, cycle_close, exit, usage_limit)
- **System:** `claude-procs`, `kill-proc` — OS process monitor
- **Blueprint:** `load`, `save`, `generate-brief`, `readiness` — project discovery

### Key Algorithms
1. **Smart Mix v3** (`run.sh` lines 310-470): Self-regulating mixer that analyzes last 50 commits, classifies by category, and adjusts weights with exponential damping (0.3 smoothing), ±6 step, 5pt dead zone, ±15pt session cap. Prevents oscillation.
2. **Anti-Hallucination Breaker** (`run.sh` lines 200-235): Tracks zero-commit iterations. 5 consecutive hallucinations → ALTO (stop). Separate `BLOCKED_STREAK` for genuine blocks.
3. **Anti-Slop Enforcement** (`run.sh` lines 272-310): Detects mislabeled feat() commits, mechanical busywork (>3 same-pattern commits), and module concentration (>5 commits to same module).
4. **Retention Curve** (`resource-scheduler.js` line 121): S-curve sigmoid for context retention — low-weight categories retain ~10%, high-weight retain ~95%.
5. **Priority Inheritance** (`coordination-protocol.js`): Multi-orchestra priority derived from mixer weights. Higher intensity → lower nice → more OS resources.

### Data Flow
```
User drags mixer slider
→ renderer.js rebalanceMixer() + debouncedMixerSave()
→ IPC mixer:write
→ main.js writeJSON (atomic: .tmp + rename)
→ .claude/orchestra.json updated
→ run.sh reads at next iteration via json_val()
→ Smart Mix v3 adjusts weights every 3 iterations
→ AI agent plans cycle from adjusted weights
```

## Stack & Conventions
- **Runtime:** Electron (Node.js + Chromium), no framework
- **Module system:** CommonJS (`require`/`module.exports`) in main process. ESM (`import`) in tests only.
- **No build step** — Electron runs source directly
- **Tests:** vitest (44+ tests in `test/`)
- **Commits:** Conventional — `feat()`, `fix()`, `test()`, `perf()`, `style()`, `chore()`
- **JSON I/O:** Always through `readJSON(path, fallback)` / `writeJSON(path, obj)` — atomic writes via `.tmp` + `fs.renameSync`
- **Process lifecycle:** `pidAlive(pid)` + `killProcessGroup(pid)` with SIGTERM→SIGKILL escalation
- **Events:** `persistLifecycleEvent(dir, type, label, message)` for audit trail (max 500 events per project)
- **Protocol sync:** `syncProtocol(dir)` copies harness files before every play
- **Hot-reload:** File watcher on `resources/orchestra/` auto-syncs to all running projects (does NOT restart running sessions)
- **Spanish i18n** primary in UI labels

## Verification Gate
Before EVERY commit: `bash .claude/skills/verification-gate/run-tests.sh "npx vitest run"`
This wrapper truncates verbose output to prevent context window bloat.
The gate checks: bash syntax of run.sh + vitest (44+ tests covering Smart Mix, resource allocation, context protocol, coordination, harness invariants).

## Testing
Test files in `test/`:
- `resource-scheduler.test.js` — retention curve, allocation math, priority mapping, memory budgets
- `context-protocol.test.js` — hashing, token estimation, section splitting
- `coordination-protocol.test.js` — priority computation, instance registration, conflicts
- `smart-mix.test.js` — normalization, convergence, damping, session cap, floor enforcement (runs actual python algorithm)
- `harness.test.js` — run.sh invariants (PIPESTATUS, pipefail, atomic writes, blocked streak, Smart Mix v3 markers)

## What To Work On
Check `ROADMAP.md` for pending features (F-01, I-01, I-02, I-03). Check `PENDING.md` for blocked items tagged `[HARNESS]`. Always run the verification gate before committing. Always check `DECISIONS.md` for established patterns before introducing new ones.
