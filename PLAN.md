# Cycle 167 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 167 (C165 broke streaks — all categories reset)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| security | 20 | 2 | 2/2 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-496 — parseComplianceLine: drift field length cap (slice to 128)
2. [security] I-497 — orchestra:writeConfig: control char guard on model/modelComplex/smartModel/modelFast fields
3. [backend] I-498 — orchestra:writeConfig: expand _allowedKeys to include all valid orchestra.json fields with per-field validation
4. [frontend] I-499 — index.html: mixer tab buttons get id, tab panels get aria-labelledby (WAI-ARIA tabs pattern)
5-8. [quality_tests] cycle167-coverage.test.js — 4 tests

## Stats
- 3591 tests at cycle start → 3597 passing (+6)
- parseComplianceLine: drift.slice(0, 128) — prevents unbounded string from crafted ORCHESTRA_REPORT.md
- orchestra:writeConfig model guard: /[\x00-\x08...]/.test() for model/modelComplex/smartModel/modelFast
- orchestra:writeConfig _allowedKeys: expanded to 19 keys with full per-field validation
- tab panels: aria-labelledby="tab-{id}" — proper WAI-ARIA tabs relationship

▸ ◼ Cycle 167 cerrado — COMPLIANCE security:2/2 backend:1/1 frontend:1/1 quality_tests:4/4 DRIFT:none TESTS:green
