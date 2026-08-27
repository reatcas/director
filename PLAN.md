# Cycle 206 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 206 (no bans — no category in all of C203+C204+C205)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| backend | 5 | 0 | SKIP |
| business_logic | 5 | 0 | SKIP |
| ux_accessibility | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-45 — mixer:history: add numeric focus value validation (0-100, finite) to filter, consistent with mixer:write guard
2. [security] S-46 — repertoire:add: cap projects array at 100 entries before push, consistent with mixer:saved:save cap
3. [performance] P-45 — metrics:allocation: use _SLOW_METRICS_TTL instead of 2s default (already invalidated on mixer:write + play events)
4. [frontend] FE-03 — renderer.js: session-summary dashboard panel — render active/idle/tokens from metrics:session-summary in projects header area
5. [data_db] D-13 — orchestra:analyze: prune old analysis-*.txt files in .claude/, keep only 10 most recent to prevent unbounded disk growth
6. [quality_tests] T-77 — test C206: S-45 focus value validation + S-46 projects cap
7. [quality_tests] T-78 — test C206: P-45 allocation slow TTL + D-13 analyze file pruning
8. [quality_tests] T-79 — test C206: FE-03 session-summary renderer panel

## Stats
- 3823 tests at cycle start
