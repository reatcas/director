# Perpetual Dev Orchestra v2 — drop-in package for any repo

## Install
1. Copy contents into the target repo root (merge `.claude/` if it exists; append to an existing CLAUDE.md).
2. `chmod +x run.sh .claude/hooks/*.sh`
3. Start: `./run.sh`   ·   Stop: `touch .claude/ALTO` or write ALTO in chat.

## v2 highlights
- Product-first backlog: `roadmap-sync` skill harvests every gap analysis/spec into ROADMAP.md; backlog-generator enforces a product quota so the loop ships features instead of polishing forever.
- FOCUS MIXER: `.claude/orchestra.json` — 0–100 weights per branch (product, backend, frontend, business_logic, security, quality_tests, devops_infra, performance, ux_accessibility, data_db, documentation, i18n). Retunable live; the Director app writes it.
- Live digest in the same terminal: Claude emits "▸ " one-liners (unit start/done, commit, deploy, cycle close) that run.sh surfaces while full output streams to `.claude/logs/iter-*.log`.
- Master log `.claude/logs/orchestra.log`: append-only across restarts, version-stamped on every DOWNBEAT (start) and FINE (stop).
- `.claude/ORCHESTRA_VERSION` — the installed orchestra version (2.0.0).
- Exponential backoff on failed iterations (30s→15m, reset on success) — survives quota exhaustion gracefully.
- Patterns library in DECISIONS.md: solved design shapes are recorded and reused, the main feature-velocity lever.
