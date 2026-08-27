# Cycle 203 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 203 (performance BANNED: appears in C200+C201+C202)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| performance | 10 | 0 | BANNED (C200+C201+C202) |
| backend | 5 | 0 | SKIP |
| frontend | 5 | 0 | SKIP |
| business_logic | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-41 — blueprint:generate-brief: sanitize newlines in inline template fields (projectName, stack, projectType etc.) to prevent markdown section injection in AI-read BLUEPRINT.md
2. [security] S-42 — metrics:context: add ts string field validation to context-metrics entry filter (match rigor of other metrics handlers)
3. [ux_accessibility] A-16 — lifecycle timeline: use `<time datetime="ISO">` instead of `<span>` for timestamps (semantic HTML + screen reader support)
4. [data_db] D-11 — add _readinessCache to periodic eviction sweep (prevent unbounded Map growth; TTL 10s)
5. [quality_tests] T-70 — test C203: S-41 blueprint:generate-brief newline sanitization
6. [quality_tests] T-71 — test C203: S-42 metrics:context ts field validation
7. [quality_tests] T-72 — test C203: A-16 lifecycle timeline time element
8. [quality_tests] T-73 — test C203: D-11 _readinessCache in periodic sweep

## Stats
- 3804 tests at cycle start
