# Cycle 230 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 230 (F-01 HARNESS-blocked, quality_tests BANNED: 4 consecutive C226-C229)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 1 | 0/1 |
| performance | 10 | 1 | 0/1 |
| quality_tests | 35 | 0 | SKIP (category ban ≥3 consecutive) |
| product | 10 | 0 | SKIP (HARNESS-blocked) |
Total: 2 units — IMPROVEMENT MODE, tests bundled into implementation commits

## Units
1. [performance] P-64 — mixer-graph.js: `_nodeMap = new Map()` for O(1) `nodePos()` lookup, replacing O(n) `_gData.nodes.find()` — follows _sectionMap pattern from B-16
2. [security] S-70 — preload.js: defense-in-depth type guards on `notesWrite` (content string ≤50000) and `mixerSavedSave` (name string, focus object) per ADR-007

## Stats
- 4198 tests at cycle open
