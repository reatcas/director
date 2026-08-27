# Cycle 183 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 183 (no bans except performance)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 0 | BANNED (C180+C181+C182) |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-11 — blueprint:save sessions: validate `label` field (string ≤128, no control chars)
2. [security] S-12 — blueprint:save sessions: validate `duration` (finite number ≥0) and `commits` (integer ≥0) fields
3. [backend] I-548 — orchestra:tail: remove dead fs.existsSync(log) — statSync try/catch already handles ENOENT
4. [frontend] I-547 — loadLifecycleHistory: add isNaN(d.getTime()) guard for invalid ev.ts (matches C182 fix in loadLifecycleTimeline)
5. [business_logic] I-549 — snapshotMixer: skip write when last history entry focus is identical to current (dedup)
6. [quality_tests] T-19 — test C183: S-11/S-12 session label+duration+commits validation
7. [quality_tests] T-20 — test C183: I-548 no existsSync in orchestra:tail block + I-549 snapshotMixer dedup guard
8. [quality_tests] T-21 — test C183: I-547 loadLifecycleHistory isNaN guard

## Stats
- 3680 tests at cycle start
