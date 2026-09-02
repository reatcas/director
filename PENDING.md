# Pending

## Blocked

_(No blocked harness items — F-01 and category ban enforcement implemented between sessions 2026-09-02)_

## Deferred

- E2E tests for Electron UI — requires Playwright + Electron integration which is heavyweight. Pure logic coverage at 570+ tests.
- Renderer tests with mock DOM — vitest can use jsdom environment but renderer.js directly queries `document`. Would need refactoring to separate DOM access from logic.
- F-18 frontend panel — cross-project session dashboard UI. Backend IPC endpoint done (metrics:session-summary). Needs renderer.js for DOM insertion into project list. Deferred due to module ban.
- mixer-chart.js enhancements — tooltip on hover, click-to-zoom, category toggle. File at module ban limit.
- New ROADMAP features (F-22+) — all existing features done except F-01 (HARNESS). New features need index.html to load scripts (module-banned). Next session should front-load product.
