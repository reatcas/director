# Cycle 109 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 109
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| performance | 10 | 1 | 1/1 |
| backend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| data_db | 5 | 1 | 1/1 |
| security | 20 | FROZEN (3rd consecutive) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] I-152 — test orchestra:fine/kill isKnownProject guards ✅
2. [quality_tests] I-153 — test orchestra:play agent allowlist + isKnownProject ✅
3. [quality_tests] I-154 — test mixer:saved:delete/export id validation ✅
4. [quality_tests] I-155 — test aria-keyshortcuts on transport buttons ✅
5. [performance] I-156 — 30s TTL cache for metrics:roadmap-freshness + metrics:compliance ✅
6. [backend] I-157 — lifecycle:list returns {events,total} capped at 200 ✅
7. [ux_accessibility] I-158 — role=status + aria-label on metrics strip cells ✅
8. [data_db] I-159 — prune lifecycle-events.json entries >90 days on clearLog ✅

## Stats
- 2962 tests passing (was 2939 at cycle start)
- +23 net tests added this cycle
- orchestra:fine/kill/play coverage complete
- metrics:compliance + roadmap-freshness now cached 30s (was hitting disk+git every poll)
