# Cycle 175 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 175 (performance BANNED: 3 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | BANNED | — |
| ux_accessibility | 5 | 0 | SKIP |
| business_logic | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 7 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-01 — blueprint:save: per-item sessions validation (object + started string ≤ 64)
2. [security] S-02 — mixer:saved:list: Array.isArray + item object filter guard (crash on null entries)
3. [backend] I-527 — snapshotMixer: Array.isArray(hist) guard before .filter() (crash on corrupted JSON)
4. [frontend] I-528 — importMixesBtn: Array.isArray guard on mixes before for..of iteration
5. [quality_tests] T-01 — test S-01: blueprint:save rejects invalid session items
6. [quality_tests] T-02 — test S-02: mixer:saved:list guard (Array.isArray + item filter present)
7. [quality_tests] T-03 — test I-527 + I-528

## Stats
- 3638 tests at cycle start
