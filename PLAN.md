# Cycle 140 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 140
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | FROZEN (30th) | — |
| business_logic | 5 | SKIP (proportional) | — |
| ux_accessibility | 5 | SKIP (proportional) | — |
| data_db | 5 | SKIP (proportional) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-388 — mixer:write + mixer:saved:save: NaN bypass fix (add !Number.isFinite(v) to focus validation)
2. [security] I-389 — orchestra:writeConfig: validate nice as int in [-20,19]; claudeUsageBudget as finite non-negative number
3. [backend] I-390 — orchestra:readIterLog: add NUL byte check on logPath
4. [frontend] I-391 — renderCmdResults: add role=option + aria-selected to cmd-item divs
5-8. [quality_tests] cycle140-coverage.test.js

## Stats
- 3404 tests passing (cycle 139 close)
