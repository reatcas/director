# Cycle 108 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 108
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
1. [quality_tests] I-144 — test orchestra:readIterLog isKnownProject guard ✅
2. [quality_tests] I-145 — test mixer:saved:save name/focus validation ✅
3. [quality_tests] I-146 — test _metricsCache eviction (setInterval + unref + evict age) ✅
4. [quality_tests] I-147 — test orchestra:install isKnownProject guard + return null ✅
5. [security] I-148 — validate id param in mixer:saved:delete + mixer:saved:export ✅
6. [security] I-149 — isKnownProject guard on orchestra:fine + orchestra:kill ✅
7. [ux_accessibility] I-150 — Ctrl+P/./K keyboard shortcuts + aria-keyshortcuts on transport buttons ✅
8. [backend] I-151 — validate agent param in orchestra:play against AI_DEFAULTS allowlist ✅

## Stats
- 2939 tests passing (was 2919 at cycle start)
- +20 net tests added this cycle
- orchestra:fine, orchestra:kill, orchestra:play now fully validated with isKnownProject
- mixer:saved:delete/export id param validated (string, ≤64 chars)
