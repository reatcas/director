# Cycle 166 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 166 (C165 broke streaks — all categories reset)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-492 — bpGenerateBrief: esc(result.briefPath) in bpAddMessage call
2. [security] I-493 — fetchIterSummary: remove redundant manual escaping; use ' · ' separator
3. [backend] I-494 — orchestra:writeConfig: validate cfg.version (string ≤64 chars)
4. [frontend] I-495 — renderBpModules: bp-mod-del aria-label="Eliminar módulo"
5-8. [quality_tests] cycle166-coverage.test.js — 4 tests

## Stats
- 3586 tests at cycle start → target 3590 (+4)
