# Cycle 210 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 210 (backend+business_logic BANNED — in C207+C208+C209)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 0 | SKIP |
| backend | 5 | 0 | BANNED |
| business_logic | 5 | 0 | BANNED |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-51 — metrics:context: validate totalTokens/totalTokensSaved values are non-negative integers before accumulating
2. [security] S-52 — blueprint:readiness: cap size of readiness check fields before returning (tech_stack, modules lengths)
3. [performance] P-50 — metrics:resource: invalidate cache on orchestra:kill (live data stale after process stops)
4. [frontend] FE-05 — renderer.js: add sessionSummary refresh on refresh() call (keeps session panel in sync with project list changes)
5. [ux_accessibility] A-20 — mixer slider inputs: ensure aria-valuetext shows current % for screen readers in renderer renderMixer
6. [quality_tests] T-86 — test C210: S-51 context metrics validation + S-52 readiness field cap
7. [quality_tests] T-87 — test C210: P-50 resource cache invalidation on kill
8. [quality_tests] T-88 — test C210: FE-05 sessionSummary refresh + A-20 mixer aria-valuetext

## Stats
- 3884 tests at cycle start
