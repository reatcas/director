# Cycle 214 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 214 (backend+business_logic BANNED — in C211+C212+C213)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 2 | 0/2 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| backend | 5 | 0 | BANNED |
| business_logic | 5 | 0 | BANNED |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-57 — orchestra:version-check: sanitize version strings from disk (strip control chars, cap at 64 chars)
2. [security] S-58 — orchestra:analyze: set maxBuffer:262_144 on execFile to cap git log output
3. [performance] P-55 — mixer:write: evict allocation: and snapshot: caches for dir after writing new focus weights
4. [frontend] FE-08 — loadSessionSummary: display s.creditsRemaining as new ss-item in panel
5. [ux_accessibility] A-23 — ss-item compliance span: add aria-label with score to the value span
6. [data_db] D-17 — mixer:saved:save: reject save if a mix with identical name already exists (prevent duplicates)
7. [quality_tests] T-96 — cycle214-coverage.test.js covering S-57, S-58, P-55, FE-08, A-23, D-17
8. [quality_tests] T-97 — audit and fix fragile split anchors in existing cycle tests

## Stats
- 3925 tests at cycle start
