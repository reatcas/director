# Cycle 213 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 213 (frontend BANNED — in C210+C211+C212)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 2 | 0/2 |
| quality_tests | 35 | 1 | 0/1 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| frontend | 5 | 0 | BANNED |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-55 — parseComplianceLine: clamp parsed actual/planned to [0, 9999] to prevent unbounded integers from disk
2. [security] S-56 — aiState(): validate state.selected from disk is a known AI id; reset to null if invalid
3. [performance] P-54 — metrics:claude-usage: switch from default 2s TTL to _SLOW_METRICS_TTL (30s); file rarely changes
4. [backend] I-591 — lifecycle:add: evict 'lc:dir:*' metricsCache keys after persisting event (C212 added cache but forgot invalidation)
5. [business_logic] BL-09 — metrics:session-summary: clamp creditsRemaining to Math.max(0, sum) to prevent negative total
6. [ux_accessibility] A-22 — sessionSummary panel: set role="group" in loadSessionSummary for proper screen reader region navigation
7. [data_db] D-16 — persistLifecycleEvent: validate e.type, e.label, e.message are strings in the pruning filter (complements existing ts check)
8. [quality_tests] T-95 — cycle213-coverage.test.js covering all 7 above

## Stats
- 3916 tests at cycle start
