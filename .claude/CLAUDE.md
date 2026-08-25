# Director — Self-Orchestration Rules

## PROTECTED FILES — DO NOT MODIFY
The following files are the orchestra harness itself. Modifying them mid-flight will break the running session.
**NEVER edit, delete, or overwrite these files during orchestra sessions:**
- `resources/orchestra/run.sh`
- `resources/orchestra/CLAUDE.md`
- `resources/orchestra/.claude/commands/loop.md`

If improvements to these files are needed, add them to `PENDING.md` with the tag `[HARNESS]` so they can be applied manually between sessions.

## Stack
- **Runtime:** Electron (Node.js + Chromium)
- **Backend:** `main.js` (IPC handlers, process management, lifecycle events)
- **Frontend:** `renderer.js` + `index.html` + `styles.css` (single-page app, no framework)
- **Protocols:** `resource-scheduler.js`, `context-protocol.js`, `coordination-protocol.js`
- **Harness:** `resources/orchestra/run.sh` (bash), `resources/orchestra/CLAUDE.md`
- **Tests:** `vitest` — run with `npx vitest run` or `bash .claude/skills/verification-gate/run-tests.sh`

## Conventions
- CommonJS (`require`/`module.exports`) — no ESM in main process files
- Tests use ESM (`import`) via vitest
- No build step — Electron runs source directly
- Conventional commits: `feat()`, `fix()`, `test()`, `perf()`, `style()`, `chore()`

## Verification Gate
Before EVERY commit: `bash .claude/skills/verification-gate/run-tests.sh`
This runs: bash syntax check on run.sh + vitest (44+ tests)
