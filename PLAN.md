# Cycle 187 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 187 (performance BANNED)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 0 | BANNED (C184+C185+C186) |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-17 — blueprint:save: validate currentPhase (integer ≥0) and sessionActive (boolean) top-level fields
2. [security] S-18 — blueprint:save: validate currentQuestion (integer ≥0) top-level field
3. [backend] I-556 — metrics:compliance: update _complianceMtimeCache even when no COMPLIANCE lines found
4. [frontend] I-557 — loadKnowledge: fix empty-file display — content != null instead of content ||
5. [business_logic] I-558 — orchestra:clearLog: use _lcCutoff() for lifecycle pruning instead of inline date computation
6. [quality_tests] T-28 — test C187: S-17/S-18 top-level field validation
7. [quality_tests] T-29 — test C187: I-556 compliance mtime on empty + I-557 loadKnowledge fix
8. [quality_tests] T-30 — test C187: I-558 clearLog uses _lcCutoff

## Stats
- 3706 tests at cycle start
