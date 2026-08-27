# Cycle 189 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 189 (backend BANNED C186+C187+C188, frontend BANNED C186+C187+C188)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
| backend | 5 | 0 | BANNED (C186+C187+C188) |
| frontend | 5 | 0 | BANNED (C186+C187+C188) |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-19 — repertoire:add: full control-char guard on droppedPath + 4096 length cap
2. [security] S-20 — blueprint:save: reject boolean/number answer values (only null/string valid)
3. [performance] P-24 — git watcher pidFile: replace existsSync with statSync try/catch
4. [business_logic] I-562 — git watcher: cap newCommits to 100 to prevent unbounded processing
5. [quality_tests] T-31 — test C189: S-19 repertoire:add control-char + length guard
6. [quality_tests] T-32 — test C189: S-20 blueprint answer value type rejection
7. [quality_tests] T-33 — test C189: P-24 pidFile statSync + I-562 newCommits cap
8. [quality_tests] T-34 — test C188: lifecycle:list ISO date pattern filter (I-561 retrospective)

## Stats
- 3712 tests at cycle start
