# Cycle 231 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 231 (F-01 HARNESS-blocked; quality_tests eligible again after C230 ban)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| security | 20 | 0 | SKIP |
| performance | 10 | 0 | SKIP |
| product | 10 | 0 | SKIP (HARNESS-blocked) |
Total: 3 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [ux_accessibility] A-33 — strip-h-icon div: add `aria-hidden="true"` — decorative SVGs pollute screen reader output; label element already describes the category
2. [business_logic] BL-12 — destroy() resets `_focus = {}` — last remaining stale state after destroy+reinit (all other fields now reset C229-C230)
3. [quality_tests] T-120 — cycle231-coverage.test.js: A-33 aria-hidden on icon div, BL-12 _focus reset in destroy

## Stats
- 4217 tests at cycle open
