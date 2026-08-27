# Cycle 163 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 163 (performance FROZEN; security allowed after C162 break)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-482 — proc-row innerHTML: esc() on p.pid, p.cpu, p.mem, p.time
2. [security] I-483 — project list li.innerHTML: esc(p.version) prevents XSS via crafted package.json
3. [backend] I-484 — metrics:compliance: filter null scores before avg; Number.isFinite guard on avg
4. [frontend] I-485 — proc-kill-btn: aria-label instead of title for screen reader accessibility
5-8. [quality_tests] cycle163-coverage.test.js — 4 tests

## Stats
- 3568 tests at cycle start → target 3572 (+4)
