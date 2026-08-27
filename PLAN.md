# Cycle 178 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 178 (no bans)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 0 | SKIP |
| business_logic | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-03 — blueprint:save: answer string values lack control-char guard (\x00-\x1F excl. \t\n\r)
2. [security] S-04 — blueprint:save: module m.name/m.description/m.notes lack control-char guard
3. [performance] P-10 — generate-brief handler: triple existsSync+statSync for directivePath (lines 674/685/697) → single statSync try/catch
4. [backend] I-535 — metrics:session-summary: add mtime skip for unchanged ORCHESTRA_REPORT.md (reuse _complianceMtimeCache)
5. [frontend] I-536 — loadMixes: add title="${esc(m.name)}" to .mix-card-name div for truncated name tooltip
6. [quality_tests] T-05 — test C178: S-03 + S-04 blueprint:save control-char guards
7. [quality_tests] T-06 — test C178: P-10 directivePath no existsSync + I-535 mtime cache presence
8. [quality_tests] T-07 — test C178: I-536 mix-card-name title attribute

## Stats
- 3656 tests at cycle start
