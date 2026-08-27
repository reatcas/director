# Cycle 186 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 186 (business_logic BANNED)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | BANNED (C183+C184+C185) |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-15 — blueprint:save sessions: validate `agent` field (string ≤64, no control chars)
2. [security] S-16 — blueprint:save sessions: validate `model` field (string ≤256, no control chars)
3. [performance] P-20 — orchestra:clearLog: remove dead existsSync for stdoutLog+masterLog (writeFileSync handles non-existing)
4. [backend] I-554 — getClaudeUsage: wrap statSync in iter-log loop with try/catch (TOCTOU race fix)
5. [frontend] I-555 — formatReset: add isNaN(d.getTime()) guard for invalid ISO date strings
6. [quality_tests] T-25 — test C186: S-15/S-16 session agent+model validation
7. [quality_tests] T-26 — test C186: P-20 no existsSync in clearLog + I-554 individual try/catch in iter-log
8. [quality_tests] T-27 — test C186: I-555 formatReset isNaN guard

## Stats
- 3697 tests at cycle start
