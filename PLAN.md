# Cycle 228 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 228 (F-01 HARNESS-blocked, ALL other ROADMAP done)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 1 | 0/1 |
| security | 20 | 1 | 0/1 |
| performance | 10 | 1 | 0/1 |
| product | 10 | 0 | SKIP (HARNESS-blocked) |
| ux_accessibility | 5 | 0 | SKIP |
| business_logic | 5 | 0 | SKIP |
Total: 3 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-63 — animLoop: bound `_t` with `% (Math.PI * 2)` — prevents float precision loss in sessions >33h @ 60fps
2. [security] S-69 — repertoire:readFile: block `.env.*` and `.envrc` variants — current blocklist only catches exact `.env`, misses `.env.local`, `.env.production`, `.envrc` etc.
3. [quality_tests] T-118 — cycle228-coverage.test.js: P-63 modulo bound, S-69 env-file block

## Stats
- 4169 tests at cycle open
