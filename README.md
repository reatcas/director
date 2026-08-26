# Director — Autonomous AI Orchestration Environment

An Electron desktop app that runs infinite AI development cycles on any software project. Point it at a repo, set the focus mixer, and hit Play — the AI reads the codebase, plans work from a roadmap, writes code, runs tests, commits, and repeats without human intervention.

## Features

### Core Engine
- **Infinite loop** with auto-restart, anti-hallucination (5-strike breaker), and anti-slop enforcement
- **Focus Mixer** — weighted sliders (0–100) per engineering category, retunable live
- **Smart Mix v3** — self-regulating algorithm analyzes last 50 commits and adjusts weights with exponential damping to prevent oscillation
- **Multi-agent** — supports Claude, Gemini (AGY), Codex, Aider
- **Smart Model Routing** — uses Sonnet for regular cycles, Opus only for `[deep-work]` items to optimize API quota

### Deep Work Mode
- **Module-level changes** — Architect-Executor pattern with DAG decomposition for complex multi-file features
- **Dependency-ordered execution** — migration → engine → repository → handlers → frontend → tests
- **MODULE BAN suspended** during deep-work to allow cross-layer implementation

### Token Economy
- **Caveman mode** — 200-token response cap, zero prose
- **compactAt** — aggressive context compaction (default 35%)
- **cooldownSeconds** — configurable pause between iterations to spread API usage
- **Smart model routing** — Sonnet for 90% of work, Opus only when needed

### Safeguards
- **Verification gate** before every commit (tests must pass)
- **Anti-hallucination** — fake commit hash detection, zero-commit streak tracking
- **Anti-slop** — mislabeled feat() detection, mechanical busywork detection, module concentration limits
- **Atomic JSON writes** — .tmp + rename prevents corruption from concurrent Smart Mix + UI writes
- **Separate BLOCKED_STREAK** — genuine blocks don't trigger hallucination breaker

### Desktop App (Electron)
- Project list with drag-and-drop, transport controls (Play/Stop/Kill)
- Mixer equalizer with saved presets and weight history chart
- Live log viewer with commit timeline, metrics dashboards, aurora effects
- Desktop notifications for stalls, ALTO, usage limits
- Keyboard shortcuts + command palette

## Install

```bash
git clone https://github.com/reatcas/director.git
cd director
npm install
npm start
```

## Usage
1. Click + to add a project directory
2. Adjust the Focus Mixer sliders (product, backend, frontend, quality_tests, security, etc.)
3. Hit ▶ Play — the orchestra starts an infinite development loop
4. Hit ◼ Stop for graceful shutdown or ✕ Kill to terminate immediately

## Configuration (`orchestra.json`)

```json
{
  "model": "claude-sonnet-4-6",
  "modelComplex": "claude-opus-4-6",
  "caveman": true,
  "compactAt": 35,
  "cooldownSeconds": 15,
  "smartMix": true,
  "focus": {
    "product": 30,
    "backend": 20,
    "frontend": 15,
    "quality_tests": 20,
    "security": 10,
    "performance": 5
  }
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `model` | `claude-sonnet-4-6` | Base model for regular cycles |
| `modelComplex` | same as model | Model for `[deep-work]` items (auto-routed) |
| `caveman` | `true` | 200-token response cap, zero prose |
| `compactAt` | `35` | Context compaction threshold (%) |
| `cooldownSeconds` | `0` | Pause between iterations (spread API usage) |
| `smartMix` | `true` | Self-regulating weight adjustment |

## Architecture

```
Director (Electron)
├── main.js          — IPC handlers, process management, protocol sync
├── renderer.js      — UI: mixer, log viewer, metrics, aurora effects
├── resource-scheduler.js    — weighted resource allocator
├── context-protocol.js      — delta context management
├── coordination-protocol.js — multi-orchestra synchronization
└── resources/orchestra/
    ├── run.sh       — infinite loop harness (Smart Mix v3, anti-slop)
    └── CLAUDE.md    — AI constitution (40 rules)
```

## Tests

```bash
npm test          # 2600+ vitest tests
```

## License

AGPL-3.0 — see [LICENSE](LICENSE)
