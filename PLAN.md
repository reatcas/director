# Cycle 128 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 128
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| security | 20 | 2 | 2/2 |
| frontend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| backend | 5 | FROZEN (3rd: 125,126,127) | — |
| performance | 10 | FROZEN (19th) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-313 — PRODUCT_DIRECTIVE.md reads: 512KB size guard (3 occurrences) ✅
2. [security] I-314 — findLogo: package.json 512KB guard before readJSON ✅
3. [frontend] I-315 — refreshAnalysis/copyAnalysis/exportMixesBtn/importMixesBtn: Spanish aria-labels ✅
4. [ux_accessibility] I-316 — consoleSection: role=region + aria-label ✅
5. [quality_tests] I-317 — test PRODUCT_DIRECTIVE.md size guards ✅
6. [quality_tests] I-318 — test findLogo package.json guard ✅
7. [quality_tests] I-319 — test analysis/mixer button aria-labels ✅
8. [quality_tests] I-320 — test consoleSection region aria ✅

## Stats
- 3261 tests passing (was 3251 at cycle start)
- +10 net tests added this cycle
- PRODUCT_DIRECTIVE.md reads now bounded — prevents unbounded file reads
- consoleSection and analysis buttons now fully accessible
