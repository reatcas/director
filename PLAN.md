# Cycle 164 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 164 (performance FROZEN; backend/frontend 2-streak allowed)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-486 — buildStrips: esc(label) in strip-h-label innerHTML (customAtriles name XSS)
2. [security] I-487 — atriles:save: validate id (alphanumeric+dash ≤64) and icon (string ≤64) fields
3. [backend] I-488 — orchestra:analyze: cap report in resolve at 4MB (matching file write cap)
4. [frontend] I-489 — mix-card buttons: aria-label in Spanish for screen readers
5-8. [quality_tests] cycle164-coverage.test.js — 4 tests

## Stats
- 3574 tests at cycle start → target 3578 (+4)
