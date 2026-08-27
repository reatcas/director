# Cycle 169 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 169 (security+backend BANNED — 3 consecutive each)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 5 | 5/5 |
| frontend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| business_logic | 5 | 1 | 1/1 |
| security | 20 | BANNED | — |
| backend | 5 | BANNED | — |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [frontend] I-508 — parseLogLine summary: remove double-escaping before addSummaryEntry (esc() handles it)
2. [ux_accessibility] I-509 — Fix duplicate id="bpReadiness"; rename span to bpCompleteness; aria-live="polite" on div; wire bpUpdateCompleteness to update both
3. [business_logic] I-510 — updateBurnRate: Math.max(0, delta) prevents negative burn history entries
4-8. [quality_tests] cycle169-coverage.test.js — 5 tests

## Stats
- 3603 tests at cycle start → 3609 passing (+6)
- parseLogLine: removed redundant .replace(/</g) before addSummaryEntry — esc() already handles
- bpCompleteness: duplicate id fixed; bpUpdateCompleteness wires both elements; bpReadiness aria-live=polite
- updateBurnRate: Math.max(0, tokens-_prevBurnTokens) — no negative deltas in _burnHistory

▸ ◼ Cycle 169 cerrado — COMPLIANCE frontend:1/1 ux_accessibility:1/1 business_logic:1/1 quality_tests:5/5 DRIFT:none TESTS:green
