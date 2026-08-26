# Pending

## Blocked

- **[HARNESS]** Cycle close validation (F-01) — requires modifying `run.sh` to grep for `▸ ◼ ... COMPLIANCE` after each iteration. Cannot be done during self-orchestration. Apply between sessions.
- **[HARNESS]** Category ban enforcement — CLAUDE.md Rule 22 says "harness-enforced" but run.sh has no category-ban counter. Needs a `CATEGORY_BAN_STREAK` variable tracking consecutive same-category cycles. Apply between sessions.

## Deferred

- E2E tests for Electron UI — requires Playwright + Electron integration which is heavyweight. Pure logic coverage at 570+ tests.
- Renderer tests with mock DOM — vitest can use jsdom environment but renderer.js directly queries `document`. Would need refactoring to separate DOM access from logic.
- F-18 frontend panel — cross-project session dashboard UI. Backend IPC endpoint done (metrics:session-summary). Needs renderer.js for DOM insertion into project list. Deferred due to module ban.
- mixer-chart.js enhancements — tooltip on hover, click-to-zoom, category toggle. File at module ban limit.
- New ROADMAP features (F-22+) — all existing features done except F-01 (HARNESS). New features need index.html to load scripts (module-banned). Next session should front-load product.
