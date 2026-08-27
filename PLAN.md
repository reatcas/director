# Cycle 217 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 217 (frontend BANNED — in C214+C215+C216)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| frontend | 5 | 0 | BANNED |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-61 — metricsSet: validate TTL is positive finite, default to _METRICS_TTL if not
2. [security] S-62 — snapshotMixer: strip control chars from _ssEvent before persisting
3. [performance] P-59 — mixer:write: evict mixer-hist:dir:* cache keys when focus changes
4. [backend] I-594 — orchestra:hotReload: also evict lc:dir:* caches for all projects after hot reload
5. [business_logic] BL-12 — aiState() dirty: call invalidateAiStateCache() unconditionally (not only when writeJSON succeeds)
6. [quality_tests] T-101 — cycle216-coverage.test.js covering C216 changes (compliance/freshness null cache, snapshotMixer guards, clearLog evict, aiState resetAt, ss-warn CSS)
7. [quality_tests] T-102 — cycle217-coverage.test.js covering C217 changes
8. [quality_tests] T-103 — verify cycle161-coverage.test.js metricsGet uses ?? pattern

## Stats
- 3945 tests at cycle start
