# Cycle 156 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 156
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | SKIP (proportional) | — |
| business_logic | 5 | SKIP (proportional) | — |
| data_db | 5 | SKIP (proportional) | — |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-456 — repertoire:add: _rapSer write size cap on projects store
2. [security] I-457 — copyDir settings.json merge: _cdMergeSer write size cap
3. [backend] I-458 — mixer:saved:list: cap merged array at 200 items
4. [frontend] I-459 — renderCmdResults: use module-level projects instead of IPC per keystroke
5-8. [quality_tests] cycle156-coverage.test.js — 4 tests

## Stats
- 3518 tests at cycle start
