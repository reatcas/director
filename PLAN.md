# Cycle 205 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 205 (no bans — no category in all of C202+C203+C204)
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
1. [security] S-43 — notes:read: byte-length guard (st.size > 102_400 → '') to match notes:write 100KB limit
2. [security] S-44 — mixer:saved:delete: add validation filter before writing to remove corrupt entries (matches D-12 pattern from mixer:saved:save)
3. [performance] P-44 — metrics:session-summary: extend cache TTL to _SLOW_METRICS_TTL (30s) — session state changes slowly, 2s was too aggressive
4. [backend] I-585 — readJSON: guard null result (return fallback when JSON.parse returns null or undefined) — prevents subtle null-dereference in callers
5. [business_logic] BL-03 — orchestra:play: decrement credits only after successful playOrchestra call (currently decremented before call, not restored on failure)
6. [quality_tests] T-74 — test C205: S-43 notes:read byte guard + S-44 delete validation filter
7. [quality_tests] T-75 — test C205: P-44 session-summary slow TTL + I-585 readJSON null guard
8. [quality_tests] T-76 — test C205: BL-03 credits post-play

## Stats
- 3813 tests at cycle start
