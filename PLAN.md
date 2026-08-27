# Cycle 107 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 107
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
1. [quality_tests] I-136 — test blueprint:readiness cache (TTL hit, miss, invalidation on save) ✅
2. [quality_tests] I-137 — test _metricsCache TTL behavior for metrics:resource + metrics:context ✅
3. [quality_tests] I-138 — test orchestra:clearLog analysis file pruning + mixer-history cap ✅
4. [quality_tests] I-139 — test blueprint:save data validation (non-object, array, oversized) ✅
5. [security] I-140 — isKnownProject guard on orchestra:readIterLog (replace !dir) ✅
6. [security] I-141 — mixer:saved:save name/focus validation (string, length ≤256, focus object) ✅
7. [performance] I-142 — periodic _metricsCache eviction (30s interval, unref) ✅
8. [backend] I-143 — isKnownProject guard on orchestra:install ✅

## Stats
- 2919 tests passing (was 2898 at cycle start)
- +21 net tests added this cycle (22 new, -1 dynamic from readIterLog guard upgrade)
- orchestra:readIterLog, mixer:saved:save, orchestra:install now fully validated
