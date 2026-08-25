# Pending

## Blocked

- **[HARNESS]** Cycle close validation (F-01) — requires modifying `run.sh` to grep for `▸ ◼ ... COMPLIANCE` after each iteration. Cannot be done during self-orchestration. Apply between sessions.
- **[HARNESS]** Category ban enforcement — CLAUDE.md Rule 22 says "harness-enforced" but run.sh has no category-ban counter. Needs a `CATEGORY_BAN_STREAK` variable tracking consecutive same-category cycles. Apply between sessions.

## Deferred

- E2E tests for Electron UI — requires Playwright + Electron integration which is heavyweight. Defer until test coverage on pure logic reaches 60+.
- Renderer tests with mock DOM — vitest can use jsdom environment but renderer.js directly queries `document`. Would need refactoring to separate DOM access from logic.
