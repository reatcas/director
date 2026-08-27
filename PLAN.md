# Cycle 139 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 139
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | FROZEN (29th) | — |
| business_logic | 5 | SKIP (proportional) | — |
| ux_accessibility | 5 | SKIP (proportional) | — |
| data_db | 5 | SKIP (proportional) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-380 — aiState(): add statSync 512KB guard for ai-credits.json read
2. [security] I-381 — atriles:save: expand NUL check to full control char range [\x00-\x08\x0B\x0C\x0E-\x1F\x7F]
3. [backend] I-382 — copyDir: add size guard before settings.json readJSON merge
4. [frontend] I-383 — allocInspector/compressionPanel/mixerHistoryPanel: add role="region" + aria-label
5-8. [quality_tests] cycle139-coverage.test.js — 4 units

## Stats
- 3396 tests passing (cycle 138 close)
