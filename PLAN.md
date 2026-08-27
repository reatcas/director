# Cycle 171 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 171 (all bans cleared)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-515 — atriles:save: control char guard for icon field
2. [security] I-516 — blueprint:save: answers key count cap (>200)
3. [backend] I-517 — repertoire:remove: usageTracker.delete(dir) cleanup
4. [ux_accessibility] I-518 — play/fine/kill: announce to #a11y-live region
5-8. [quality_tests] cycle171-coverage.test.js — 4 tests

## Stats
- 3615 tests at cycle start → 3619 expected (+4)
- atriles:save: icon field missing control char guard (name/path/description checked, icon skipped)
- blueprint:save: data.answers object has no key count cap (only per-value length cap)
- repertoire:remove: usageTracker.delete(dir) missing — entry leaks until process exit
- play/fine/kill buttons: no #a11y-live announcement for screen readers
