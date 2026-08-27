# Cycle 125 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 125
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 4 | 4/4 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| business_logic | 5 | 1 | 1/1 |
| quality_tests | 35 | FROZEN (3rd: 122,123,124) | — |
| performance | 10 | FROZEN (16th) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-289 — orchestra:kill: evict claude-usage cache ✅
2. [security] I-290 — orchestra:clearLog: lifecycle events 2MB size guard ✅
3. [security] I-291 — export:session read(): stat.size > 1MB guard ✅
4. [security] I-292 — orchestra:tail: stat.size > 10MB guard ✅
5. [backend] I-293 — metrics:allocation: metricsGet/Set cache ✅
6. [frontend] I-294 — emptyState: role=status + aria-label ✅
7. [ux_accessibility] I-295 — procsPanel: role=region + aria-label ✅
8. [business_logic] I-296 — mixer:write: evict allocation cache on focus change ✅

## Stats
- 3231 tests passing (was 3217 at cycle start)
- +14 net tests added this cycle
- All major log reads now bounded with size guards
- metrics:allocation now cached, evicted on mixer:write
