# Cycle 168 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 168 (frontend BANNED — 5 consecutive cycles)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| security | 20 | 2 | 2/2 |
| backend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| frontend | 5 | BANNED | — |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-504 — blueprint:save: m.description missing length cap (add ≤2000)
2. [security] I-505 — blueprint:save: m.notes completely unvalidated (add string+length check)
3. [backend] I-506 — orchestra:tail: no per-line truncation → map l.slice(0, 4096)
4. [ux_accessibility] I-507 — mixerDrawer: aria-expanded on toggle + role=dialog/aria-modal/aria-hidden on drawer
5-8. [quality_tests] cycle168-coverage.test.js — 6 tests

## Stats
- 3597 tests at cycle start → 3603 passing (+6)
- blueprint:save: m.description length cap ≤2000; m.notes type+length validated
- orchestra:tail: each log line capped at 4096 chars before returning IPC response
- mixerDrawer: aria-expanded toggles on open/close; drawer role=dialog, aria-modal=true, aria-hidden managed

▸ ◼ Cycle 168 cerrado — COMPLIANCE security:2/2 backend:1/1 ux_accessibility:1/1 quality_tests:4/4 DRIFT:none TESTS:green
