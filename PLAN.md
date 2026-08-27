# Cycle 153 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 153
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
1. [security] I-440 — mixer:saved:export: add alphanumeric ID regex (match mixer:saved:delete)
2. [security] I-441 — mixer:saved:save: add write size cap 512KB via _msSer
3. [backend] I-442 — mixer:history: use Number.isInteger(limit) instead of typeof === 'number'
4. [frontend] I-443 — switchTab: set aria-hidden on inactive tabpanels
5-8. [quality_tests] cycle153-coverage.test.js — 4 tests

## Stats
- 3496 tests at cycle start
