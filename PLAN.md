# Cycle 126 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 126
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| business_logic | 5 | 1 | 1/1 |
| data_db | 5 | 1 | 1/1 |
| security | 20 | FROZEN (3rd: 123,124,125) | — |
| ux_accessibility | 5 | FROZEN (3rd: 123,124,125) | — |
| performance | 10 | FROZEN (17th) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [backend] I-297 — orchestra:clearLog: context-metrics 1MB size guard ✅
2. [frontend] I-298 — smartModelToggle: aria-label "Alternar Smart Model" (es) ✅
3. [business_logic] I-299 — snapshotMixer: mixer-history 512KB size guard ✅
4. [data_db] I-300 — startMetricsSampling: use claude-usage cache, fallback to getClaudeUsage ✅
5. [quality_tests] I-301 — test clearLog context-metrics size guard ✅
6. [quality_tests] I-302 — test smartModelToggle Spanish aria-label ✅
7. [quality_tests] I-303 — test snapshotMixer size guard ✅
8. [quality_tests] I-304 — test startMetricsSampling cached usage ✅

## Stats
- 3240 tests passing (was 3231 at cycle start)
- +9 net tests added this cycle
- All JSON telemetry reads now consistently guarded by size checks
- Metrics sampling now cache-aware, reduces disk reads
