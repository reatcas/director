# Cycle 229 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 229 (F-01 HARNESS-blocked, ALL other ROADMAP done)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 1 | 0/1 |
| security | 20 | 0 | SKIP |
| ux_accessibility | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| performance | 10 | 0 | SKIP |
| product | 10 | 0 | SKIP (HARNESS-blocked) |
Total: 3 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [ux_accessibility] A-32 — strip range inputs: focus→activateMixerStand(k), blur→activateMixerStand(null) — keyboard users get graph-node activation while tabbing through mixer
2. [business_logic] BL-11 — destroy() resets `_autoRotate`, `_camAngle`, `_linkFlash` — stale state persists across destroy+reinit, rotation carries over unexpectedly
3. [quality_tests] T-119 — cycle229-coverage.test.js: A-32 focus/blur handlers, BL-11 destroy completeness

## Stats
- 4183 tests at cycle open
