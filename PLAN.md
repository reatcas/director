# Cycle 147 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 147
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | SKIP (proportional) | — |
| business_logic | 5 | SKIP (proportional) | — |
| data_db | 5 | SKIP (proportional) | — |
| performance | 10 | FROZEN (35th) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-413 — resource-scheduler.js: 1MB size cap on serialized JSON before write
2. [security] I-414 — context-protocol.js: same size cap on context-metrics write
3. [backend] I-415 — orchestra:tail: add lines param (default 400, max 1000)
4. [frontend] I-416 — cmd-item: add aria-label announcing running state to screen readers
5-8. [quality_tests] cycle147-coverage.test.js — 4 tests

## Stats
- 3457 tests passing at cycle start
