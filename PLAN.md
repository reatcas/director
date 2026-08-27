# Cycle 111 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 111
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| security | 20 | 2 | 2/2 |
| performance | 10 | 1 | 1/1 |
| backend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | FROZEN (3rd consecutive) | — |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] I-168 — test orchestraSrc memoization + atriles cache ✅
2. [quality_tests] I-169 — test orchestra:writeConfig full validation ✅
3. [quality_tests] I-170 — test repertoire:remove cache eviction ✅
4. [quality_tests] I-171 — test mixer tab aria attributes ✅
5. [security] I-172 — name/path length validation in atriles:save entries ✅
6. [security] I-173 — security test coverage for atriles:save (13 tests) ✅
7. [performance] I-174 — cache aiState() reads (5s TTL, invalidated on write) ✅
8. [backend] I-175 — clear _lifecycleDirReady on repertoire:remove ✅

## Stats
- 3008 tests passing (was 2974 at cycle start)
- +34 net tests added this cycle
- aiState() now cached — no disk read on every ai:credits poll
