# Cycle 112 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 112
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| security | 20 | 2 | 2/2 |
| ux_accessibility | 5 | 1 | 1/1 |
| backend | 5 | 1 | 1/1 |
| performance | 10 | FROZEN (3rd consecutive) | — |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] I-176 — test aiState cache TTL + hit/miss paths ✅
2. [quality_tests] I-177 — test atriles:save entry length validation ✅
3. [quality_tests] I-178 — test _lifecycleDirReady cleanup in repertoire:remove ✅
4. [quality_tests] I-179 — test aiState invalidation on all 3 write paths ✅
5. [security] I-180 — notes:write rejects control characters ✅
6. [security] I-181 — 10-test security suite for notes:write ✅
7. [ux_accessibility] I-182 — aria-label on project list items ✅
8. [backend] I-183 — stopTailing+stopMetricsSampling on repertoire:remove ✅

## Stats
- 3036 tests passing (was 3008 at cycle start)
- +28 net tests added this cycle
- notes:write now rejects null bytes and ASCII control characters
- repertoire:remove now stops tailing and metrics sampling for removed project
