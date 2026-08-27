# Cycle 106 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 106
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | FROZEN (3rd consecutive) | — |
| backend | 5 | FROZEN (3rd consecutive) | — |
| frontend | 5 | FROZEN | — |
| security | 20 | 4 | 4/4 |
| performance | 10 | 2 | 2/2 |
| ux_accessibility | 5 | 1 | 1/1 |
| data_db | 5 | 1 | 1/1 |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-128 — isKnownProject guard on mixer:saved:list + orchestra:upgrade ✅
2. [security] I-129 — isKnownProject guard on blueprint:load/save/generate-brief/readiness (4 handlers) ✅
3. [security] I-130 — blueprint:save data validation (type + size limit) ✅
4. [security] I-131 — security test coverage for blueprint handlers + orchestra:upgrade ✅
5. [performance] I-132 — cache blueprint:readiness result (5s TTL per dir) ✅
6. [performance] I-133 — server-side 2s result cache for metrics:resource + metrics:context ✅
7. [ux_accessibility] I-134 — aria-live region for log panel + new-commit announcements ✅
8. [data_db] I-135 — prune analysis-*.txt on clearLog (keep last 5) + cap mixer-history at 100 ✅

## Stats
- 2898 tests passing (was 2895 at cycle start)
- +3 tests added this cycle
- 6 more IPC handlers secured with isKnownProject (blueprint×4, mixer:saved:list, orchestra:upgrade)
- blueprint:save data validated (type + 512KB limit)
- blueprint:readiness cached 5s TTL
- metrics:resource + metrics:context cached 2s TTL
