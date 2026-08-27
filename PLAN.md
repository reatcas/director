# Cycle 219 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 219 (F-01 HARNESS-blocked, ALL other ROADMAP done)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| product | 10 | 0 | SKIP (HARNESS-blocked) |
| business_logic | 5 | 0 | SKIP |
| frontend | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-65 — metricsSet/metricsGet: validate key is string, cap 256 chars
2. [security] S-66 — _metricsCache periodic sweep: add 500-entry size cap after age eviction
3. [performance] P-61 — cachedFindLogo: early-return null when dir does not exist
4. [ux_accessibility] A-26 — sessionSummary in index.html: add tabindex="0"
5. [backend] B-14 — snapshotMixer: add isKnownProject guard at function start
6. [quality_tests] T-107 — cycle219-coverage.test.js for S-65, S-66, P-61, A-26, B-14
7. [quality_tests] T-108 — metricsSet invalid-key test; cache size-cap sweep test
8. [quality_tests] T-109 — cachedFindLogo existsCheck test; snapshotMixer guard test

## Stats
- 3975 tests at cycle start
