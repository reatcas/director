# Cycle 190 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 190 (business_logic BANNED C187+C188+C189)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | BANNED (C187+C188+C189) |
| frontend | 5 | 0 | SKIP |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-21 — blueprint:save sessions.started: add ISO date format regex validation
2. [security] S-22 — blueprint:save sessions.ended: add ISO date format regex validation
3. [performance] P-25 — app restart watcher: replace 3 existsSync (logFile/usageSig/pidFile) with statSync try/catch
4. [backend] I-563 — orchestra:install/upgrade: replace existsSync(hooks) and existsSync(srcPath) with statSync try/catch
5. [quality_tests] T-35 — test C190: S-21 sessions.started ISO validation
6. [quality_tests] T-36 — test C190: S-22 sessions.ended ISO validation
7. [quality_tests] T-37 — test C190: P-25 restart watcher statSync
8. [quality_tests] T-38 — test C190: I-563 install/upgrade statSync

## Stats
- 3718 tests at cycle start
