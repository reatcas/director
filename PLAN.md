# Cycle 181 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 181 (backend + frontend BANNED: 3 consecutive each)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| backend | 5 | BANNED | — |
| frontend | 5 | BANNED | — |
| business_logic | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-07 — blueprint:save sessions: s.started lacks control-char guard
2. [security] S-08 — blueprint:save sessions: missing per-session key count cap (≤20 keys)
3. [performance] P-14 — repertoire:add line 819: existsSync+statSync → single statSync try/catch
4. [ux_accessibility] I-544 — loadMixes mix-card: add keydown handler for Enter/Space to activate load
5. [quality_tests] T-12 — test C181: S-07 s.started control-char guard
6. [quality_tests] T-13 — test C181: S-08 per-session key count cap
7. [quality_tests] T-14 — test C181: P-14 repertoire:add no existsSync(dir) before statSync
8. [quality_tests] T-15 — test C181: I-544 keydown handler in mix-card

## Stats
- 3670 tests at cycle start
