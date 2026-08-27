# Cycle 209 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 209 (no bans — no category in all of C206+C207+C208)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| frontend | 5 | 0 | SKIP |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-49 — mixer:saved:list: validate focus object values are numeric 0-100 in user mixes filter (currently validates focus is object but not value types)
2. [security] S-50 — lifecycle:list return shape: cap event.message at 4096 bytes before returning to renderer (IPC boundary output guard)
3. [performance] P-49 — metrics:coordination: add 2s TTL cache (coordinator.getStatus() is uncached, called on every renderer poll)
4. [backend] I-588 — orchestra:clearLog: invalidate metrics:snapshot and metrics:context caches for dir on clearLog (stale data after log clear)
5. [business_logic] BL-06 — orchestra:upgrade: invalidate version-check cache for dir after upgrade (currently cached 30s, stays stale after upgrade completes)
6. [quality_tests] T-83 — test C209: S-49 mix focus validation + S-50 lifecycle:list message cap
7. [quality_tests] T-84 — test C209: P-49 coordination cache + I-588 clearLog cache invalidation
8. [quality_tests] T-85 — test C209: BL-06 version-check invalidation on upgrade

## Stats
- 3874 tests at cycle start
