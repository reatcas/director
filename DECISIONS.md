# Decisions

## Stack
- Electron (Node.js + Chromium), no framework frontend
- CommonJS in main process, ESM in tests (vitest)
- No build step — Electron runs source directly
- AGPL-3.0 license

## Conventions
- Conventional commits: `feat()`, `fix()`, `test()`, `perf()`, `style()`, `chore()`
- Atomic JSON writes via tmp+rename pattern (`writeJSON` in main.js)
- PID-based process management with group kill (SIGTERM→SIGKILL escalation after 5s)
- Spanish i18n primary in UI labels
- All state files in `.claude/` directory per project
- Lifecycle events are append-only (max 500), never deleted

## Patterns
- `readJSON(path, fallback)` / `writeJSON(path, obj)` for all JSON I/O — **never use raw fs.writeFileSync for JSON**
- `pidAlive(pid)` + `killProcessGroup(pid)` for process lifecycle
- `persistLifecycleEvent(dir, type, label, message)` for audit trail
- `syncProtocol(dir)` before every play to ensure latest harness files
- `isRunning(dir)` checks PID file + process alive — **always verify PID, not just file existence**
- `json_val key default` in run.sh for reading orchestra.json fields
- `stamp message` in run.sh for timestamped log entries to master log
- Smart Mix python block writes via `os.replace(tmp_path, cfg_path)` — **never json.dump directly to cfg_path**

## Architecture Decisions

### ADR-001: Self-Orchestration Protection
**Decision:** Orchestra sessions MUST NOT modify harness files (`resources/orchestra/run.sh`, `resources/orchestra/CLAUDE.md`, `resources/orchestra/.claude/commands/loop.md`). Changes go to PENDING.md with `[HARNESS]` tag.
**Reason:** Modifying the harness mid-flight corrupts the running session. The harness restarts between sessions, so changes take effect naturally.

### ADR-002: Atomic File Writes
**Decision:** All JSON writes go through `.tmp` + `fs.renameSync` (Node) or `os.replace` (Python).
**Reason:** Smart Mix and the UI can write to `orchestra.json` concurrently. Without atomicity, partial writes produce corrupted JSON that silently falls back to defaults.

### ADR-003: Separate Block and Hallucination Counters
**Decision:** `BLOCKED_STREAK` (agent genuinely stuck) is separate from `HALLUCINATION_STREAK` (agent claiming work but producing no commits).
**Reason:** 5 genuine blocks killed the agent before this fix. Blocked and hallucinating are different failure modes requiring different responses.

### ADR-004: Smart Mix Damping (v3)
**Decision:** Exponential smoothing (0.3 factor), wider dead zone (5pt), session cap (±15pt).
**Reason:** v2 oscillated ±8 every 3 iterations at category boundaries. Damping ensures convergence.

### ADR-005: No Framework Frontend
**Decision:** Vanilla JS + DOM manipulation in renderer.js. No React/Vue/Svelte.
**Reason:** Director is a dev tool, not a product app. Single-file simplicity enables the orchestra to modify UI without understanding a framework's reactivity model.

### ADR-006: Protocol Sync + Hot Reload
**Decision:** Protocol files are synced from `resources/orchestra/` into each project at play time. A file watcher auto-syncs changes during runtime.
**Reason:** Ensures all projects always run the latest harness version. Hot-reload applies to protocol files only — running sessions pick up changes at next iteration without restart.
