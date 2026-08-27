# Cycle 216 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 216 (security+quality_tests BANNED — in C213+C214+C215)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| performance | 10 | 3 | 0/3 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BANNED |
| quality_tests | 35 | 0 | BANNED |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-56 — metrics:compliance: cache null result when ORCHESTRA_REPORT.md is missing (avoids repeated failed statSync on every cache miss)
2. [performance] P-57 — metrics:roadmap-freshness: cache {exists:false} when ROADMAP.md missing (same uncached-miss pattern)
3. [performance] P-58 — snapshotMixer: evict mixer-hist:dir:* cache after writing history
4. [backend] I-593 — orchestra:clearLog: evict lc:dir:* cache keys (I-591 fixed lifecycle:add but clearLog still doesn't invalidate)
5. [business_logic] BL-11 — aiState(): validate resetAt is a valid ISO date format before using it for reset logic
6. [frontend] FE-10 — loadSessionSummary: add ss-warn class to credits span when creditsRemaining === 0
7. [ux_accessibility] A-24 — compliance ss-item: add ss-warn class when worstScore < 50 for visual at-a-glance status
8. [data_db] D-18 — snapshotMixer: skip write if filtered focus object is empty (empty focus signals misconfiguration)

## Stats
- 3945 tests at cycle start
