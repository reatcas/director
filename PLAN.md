# Cycle 138 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 138
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 5 | 0/5 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| security | 20 | FROZEN (5th: 133,134,135,136,137) | — |
| performance | 10 | FROZEN (29th) | — |
| ux_accessibility | 5 | SKIP (proportional, next cycle) | — |
| data_db | 5 | SKIP (proportional, next cycle) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [backend] I-372 — cachedProjects()/repertoire:add/remove: size guard for repertoire.json (readJSON without statSync guard)
2. [frontend] I-373 — renderer.js: toggle aria-expanded on allocToggle + compressionToggle; add missing mixerHistoryToggle handler
3. [business_logic] I-374 — mixer:saved:delete: ID format validation (base36 alphanumeric, /^[0-9a-z]+$/)
4-8. [quality_tests] cycle138-coverage.test.js — 5 units covering I-372/I-373/I-374

## Stats
- 3385 tests passing (cycle 137 close)
