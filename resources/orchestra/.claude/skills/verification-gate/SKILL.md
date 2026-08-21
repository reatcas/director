---
name: verification-gate
description: The full pre-commit verification gate. Synthesize it per stack in Phase 0, then run it in full before EVERY commit and globally at cycle close. Completion claims require evidence from these commands.
---

# Verification Gate

## Universal template (instantiate per stack in PLAN.md during Phase 0)
1. Build/compile every deliverable (backend, frontend(s), workers).
2. Static analysis: linters, formatters (check mode), typecheck (e.g. vet/staticcheck, vue-tsc/tsc, mypy/ruff, clippy — whatever the stack uses).
3. Unit tests, full suite.
4. Integration tests with ephemeral infrastructure (testcontainers or docker compose profile) — includes DB-level security (RLS/tenancy isolation) where applicable.
5. E2E of touched flows — HEADLESS ALWAYS (Playwright/Cypress headless or stack equivalent).
6. Security & dependency scan available for the stack (audit tooling, secrets scan).
7. Style/architecture guards: no forbidden frameworks/styles per DECISIONS.md (grep-based CI checks: banned imports, hardcoded strings vs i18n, loose CSS/hex outside the design system).

## Rules
- ALL steps green → conventional commit + push. Any red → fix; 3 failed attempts → revert + PENDING.md entry, move on.
- Evidence over assertion: paste the summarized real output (tail/grep) of failing→passing runs into the unit's outcome; never claim "should work".
- Non-interactive everywhere: CI=true, --run/--no-watch, timeouts on every command. Long output piped through tail/grep — never dumped whole into context.
- The gate itself is code: keep its exact commands versioned at the top of PLAN.md; improve it when gaps let a bug through (a bug that passed the gate = a missing gate step).
