# Cycle 232 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 232 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 1 | 0/1 |
| performance | 10 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| security | 20 | 0 | SKIP |
| ux_accessibility | 5 | 0 | SKIP |
| product | 10 | 0 | SKIP (HARNESS-blocked) |
Total: 3 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-65 — context-protocol.js: `_tokenCache` Map caches section hash→tokenCount, avoiding redundant word-by-word estimation on repeated section bodies across delta cycles
2. [business_logic] BL-13 — context-protocol.js `_splitSections`: deduplicate section titles with `_N` suffix — prevents incorrect delta tracking when markdown files have duplicate headers
3. [quality_tests] T-121 — cycle232-coverage.test.js: P-65 token cache, BL-13 duplicate title dedup

## Stats
- 4236 tests at cycle open
