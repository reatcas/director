# Cycle 194 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 194 (frontend BANNED C191+C192+C193)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| frontend | 5 | 0 | BANNED (C191+C192+C193) |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-27 — orchestra:analyze: cap started string to 64 chars before git --since
2. [security] S-28 — mixer:saved:list: validate name/id/focus fields on load-time filter
3. [performance] P-30 — findLogo step 3: use withFileTypes to eliminate statSync per entry
4. [backend] I-571 — metrics:context: guard totalTokens/totalTokensSaved as finite numbers
5. [business_logic] I-572 — lifecycle:list: add unfiltered total to response object
6. [quality_tests] T-46 — test C194: S-27 started cap + S-28 mixer:saved:list validation
7. [quality_tests] T-47 — test C194: P-30 withFileTypes + I-571 finite guard
8. [quality_tests] T-48 — test C194: I-572 lifecycle:list unfiltered total

## Stats
- 3733 tests at cycle start
