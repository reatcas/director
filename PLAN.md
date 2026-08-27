# Cycle 218 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 218 (backend+business_logic BANNED — in C215+C216+C217)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| backend | 5 | 0 | BANNED |
| business_logic | 5 | 0 | BANNED |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-63 — cachedProjects(): validate p.name and p.id as bounded strings before caching
2. [security] S-64 — orchestra:kill: validate PID from ORCHESTRA_PID file is in [2, 4194304] before killing
3. [performance] P-60 — persistLifecycleEvent: evict lc:dir:* cache entries after writing (fixes all callers, not just IPC)
4. [frontend] FE-11 — sessionSummary: apply ss-idle class to active count when active===0
5. [ux_accessibility] A-25 — sessionSummary: add :focus-visible CSS outline for keyboard focus ring
6. [quality_tests] T-104 — cycle218-coverage.test.js for S-63, S-64, P-60, FE-11, A-25
7. [quality_tests] T-105 — fix fragile test in cycle152 that expects exact _ssEvent pattern
8. [quality_tests] T-106 — test that metricsSet TTL guard is in the function body (S-61 regression test)

## Stats
- 3961 tests at cycle start
