# Cycle 160 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 160
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
1. [security] I-471 — ai:select + orchestra:play: _aiSSer 256KB cap on aiState writes
2. [security] I-472 — mixer:write + agent-switch cfg: _mwSer/_asCfgSer 512KB caps
3. [backend] I-473 — lifecycle:list: require e.ts + e.label string in event filter
4. [frontend] I-474 — #cmdInput: aria-autocomplete=list + aria-controls=cmdResults
5-8. [quality_tests] cycle160-coverage.test.js — 4 tests

## Stats
- 3544 tests at cycle start
