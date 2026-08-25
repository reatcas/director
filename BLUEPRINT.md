# Director — Architecture Blueprint

## Purpose
Autonomous AI orchestration environment. Manages infinite development cycles across multiple projects with multiple AI agents, self-regulating focus distribution, anti-hallucination safeguards, and resource allocation.

## Module Map

```
┌─────────────────────────────────────────────────────────┐
│                    Electron App                          │
│                                                         │
│  ┌──────────────┐   IPC (preload.js)   ┌────────────┐  │
│  │  main.js     │◄───────────────────►│ renderer.js │  │
│  │              │    50+ channels      │             │  │
│  │ • repertoire │                      │ • project   │  │
│  │ • orchestra  │                      │   sidebar   │  │
│  │ • mixer      │                      │ • transport │  │
│  │ • metrics    │                      │ • mixer EQ  │  │
│  │ • lifecycle  │                      │ • log view  │  │
│  │ • blueprint  │                      │ • timeline  │  │
│  │ • system     │                      │ • metrics   │  │
│  └──────┬───────┘                      └────────────┘  │
│         │                                               │
│  ┌──────┴───────┐                                       │
│  │ Protocols    │                                       │
│  │              │                                       │
│  │ • Resource   │ Maps mixer weights → OS resources     │
│  │   Scheduler  │ (nice, memory, token budgets)         │
│  │              │                                       │
│  │ • Context    │ Delta detection, weight-linked         │
│  │   Protocol   │ retention, token estimation            │
│  │              │                                       │
│  │ • Coord      │ Multi-orchestra priority inheritance,  │
│  │   Protocol   │ resource locking, conflict detection   │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
         │
         │ spawns (bash run.sh, detached)
         ▼
┌─────────────────────────────────────────────────────────┐
│              Orchestra Session (per project)             │
│                                                         │
│  run.sh (infinite loop)                                 │
│  ├── Iteration N                                        │
│  │   ├── AI agent invocation (claude/gemini/codex)      │
│  │   ├── Anti-lazy check (commits? → hallucination?)    │
│  │   ├── Post-iteration audit (fake hashes? mislabel?)  │
│  │   ├── Smart Mix v3 (every 3 iterations)              │
│  │   ├── Usage limit detection → sleep until reset      │
│  │   └── Log rotation (keep last 50 iter logs)          │
│  └── Auto-restart on exit (unless ALTO signal)          │
│                                                         │
│  State files (per project .claude/):                    │
│  ├── orchestra.json     (mixer weights, agent, model)   │
│  ├── ORCHESTRA_PID      (running process PID)           │
│  ├── ORCHESTRA_VERSION  (harness version)               │
│  ├── ALTO               (stop signal)                   │
│  ├── USAGE_LIMIT        (rate limit signal)             │
│  ├── RUN_STARTED        (ISO timestamp)                 │
│  ├── CYCLE_LEARNINGS.md (audit trail)                   │
│  ├── PRODUCT_DIRECTIVE.md (injected focus)              │
│  └── logs/                                              │
│      ├── orchestra.log       (master append-only)       │
│      ├── orchestra-stdout.log (raw process output)      │
│      ├── iter-*.log          (per-iteration, last 50)   │
│      └── lifecycle-events.json (play/commit/exit/etc)   │
└─────────────────────────────────────────────────────────┘
```

## Data Storage
- **App data:** `~/Library/Application Support/Director/`
  - `repertoire.json` — registered projects (path, name, id)
  - `ai-credits.json` — per-agent credit counters
- **Per-project:** `<project>/.claude/`
  - `orchestra.json` — mixer weights, agent config
  - `logs/` — all log files
  - `telemetry/` — resource allocation snapshots, context metrics
  - `mixer-history.json` — weight snapshots at play/exit events
  - `saved-mixes.json` — user-named mix presets

## Key Invariants
1. `orchestra.json` is always valid JSON (atomic writes)
2. Lifecycle events are append-only, max 500 per project
3. PID files are cleaned up on process exit (or detected as orphans after 15 stale polls)
4. Auto-restart fires 3s after exit unless ALTO exists
5. Smart Mix never drifts more than ±15pt per session from original weights
6. Zero-weight categories get zero work (MIXER=HARD CONTRACT)
7. Verification gate runs before every commit (test suite must pass)
