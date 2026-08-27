# Cycle 114 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 114
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| data_db | 5 | 1 | 1/1 |
| security | 20 | FROZEN (3rd consecutive) | — |
| performance | 10 | FROZEN (5th consecutive) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] I-204 — test orchestraSrc readIterLog file size guard ✅
2. [quality_tests] I-205 — test projects ul aria attributes ✅
3. [quality_tests] I-206 — test project list item keyboard accessibility ✅
4. [quality_tests] I-207 — test context-metrics telemetry cap + repertoire:remove cleanups ✅
5. [backend] I-200 — orchestra:readIterLog: reject files >1MB before reading ✅
6. [frontend] I-201 — projects <ul>: add role=list + aria-label="Repertorio de proyectos" ✅
7. [ux_accessibility] I-202 — project list items: tabindex=0, role=listitem, Enter/Space keys ✅
8. [data_db] I-203 — metrics:context: cap context-metrics.json at 500 entries on read ✅

## Stats
- 3072 tests passing (was 3058 at cycle start)
- +14 net tests added this cycle
- Project list items now fully keyboard navigable
- Context telemetry file bounded at 500 entries
