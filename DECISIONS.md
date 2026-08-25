# Decisions

## Stack
- Electron (Node.js + Chromium), no framework frontend
- CommonJS in main process, ESM in tests (vitest)
- No build step — Electron runs source directly

## Conventions
- Conventional commits: `feat()`, `fix()`, `test()`, `perf()`, `style()`, `chore()`
- Atomic JSON writes via tmp+rename pattern
- PID-based process management with group kill
- Spanish i18n primary

## Patterns
- `readJSON(path, fallback)` / `writeJSON(path, obj)` for all JSON I/O
- `pidAlive(pid)` + `killProcessGroup(pid)` for process lifecycle
- `persistLifecycleEvent(dir, type, label, message)` for audit trail
- `syncProtocol(dir)` before every play to ensure latest harness files
