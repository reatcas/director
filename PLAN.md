# Cycle 170 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 170 (all bans cleared)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| security | 20 | 2 | 2/2 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-511 — parseComplianceLine: categories key sliced to 64 chars
2. [security] I-512 — export:session: compliance array capped at 50 lines
3. [backend] I-513 — orchestra:writeConfig: fix keepLogs (integer not boolean), mode (add perpetual), maxIterations (allow 0)
4. [frontend] I-514 — showToast: add role=status, aria-live=polite, aria-atomic=true
5-8. [quality_tests] cycle170-coverage.test.js — 6 tests

## Stats
- 3609 tests at cycle start → 3615 passing (+6)
- parseComplianceLine: pm[1].slice(0,64) — unbounded category key cap
- export:session: .slice(-50) on COMPLIANCE lines
- writeConfig: keepLogs=integer(0-500), mode+=perpetual, maxIterations>=0
- showToast: role=status + aria-live=polite for screen reader announcements

▸ ◼ Cycle 170 cerrado — COMPLIANCE security:2/2 backend:1/1 frontend:1/1 quality_tests:4/4 DRIFT:none TESTS:green
