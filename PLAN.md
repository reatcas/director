# Cycle 158 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 158
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
1. [security] I-464 — orchestra:play allocation write: _allocSer 256KB cap
2. [security] I-465 — metrics:context hist trim write: _mcTrimSer 1MB cap
3. [backend] I-466 — mixer:history: filter hist to valid objects before slice
4. [frontend] I-467 — model select innerHTML: esc() m.id and m.label
5-8. [quality_tests] cycle158-coverage.test.js — 4 tests

## Stats
- 3532 tests at cycle start
