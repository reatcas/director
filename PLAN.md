# Cycle 237 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 237 (business_logic BANNED: C234+C235+C236 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | BAN (C234+C235+C236 consecutive) |
| ux_accessibility | 5 | 0 | SKIP (done C236) |
| data_db | 5 | 0 | SKIP (done C235) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (business_logic BANNED)

## Units
1. [quality_tests] T-129 — cycle237-coverage.test.js: P-68 _updateAggregated running sum source + integration
2. [quality_tests] T-130 — cycle237-coverage.test.js: B-22 _metricsCache trim no-sort + insertion-order delete
3. [quality_tests] T-131 — cycle237-coverage.test.js: S-75/S-76/S-77 preload guards (id format, array reject, param sanitization)
4. [security] S-78 — preload.js `configWrite`: add cfg object guard (not null, not array) per ADR-007
5. [security] S-79 — preload.js `mixerHistory`: add n integer guard (1-100) per ADR-007
6. [performance] P-69 — resource-scheduler.js `computeAllocation`: merge totalWeight reduce + maxWeight map into single pass
7. [backend] B-23 — main.js `orchestra:clearLog`: add usageTracker.delete(dir) + _metricsCache.delete('claude-usage:'+dir) + 'session-summary' after iter prune
8. [frontend] F-20 — renderer.js `open()`: reset _prevBurnTokens=0 + _burnHistory.length=0 on project switch

## Stats
- 4320 tests at cycle open

---
# Cycle 236 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 236 (quality_tests BANNED: 3 consecutive C233-C235)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 0 | BAN (C233+C234+C235 consecutive) |
| security | 20 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (quality_tests BANNED)

## Units
1. [security] S-75 — preload.js `mixerSavedDelete`/`mixerSavedExport`: add id guard (string, `/^[0-9a-z]+$/`, length 1-64) per ADR-007
2. [security] S-76 — preload.js `blueprintSave`: add data object guard (not null, not array) + JSON size cap ≤512KB per ADR-007
3. [security] S-77 — preload.js `lifecycleList`: add limit (integer 1-500), typeFilter (string /^[\w\-]+$/ ≤64), before (ISO prefix ≤64) guards per ADR-007
4. [performance] P-68 — context-protocol.js `_updateAggregated`: running sum via `_aggRunning` Map — O(n) full sum → O(1) incremental update
5. [backend] B-22 — main.js `_metricsCache` trim: replace spread+sort O(n log n) with insertion-order delete O(n)
6. [frontend] F-19 — renderer.js `updateMetricsDisplay`: cache 9 DOM element refs at module level, avoid per-call `$()` lookups
7. [business_logic] BL-16 — coordination-protocol.js `acquireLock`: distinguish `tie` vs `lower_priority` in lock_denied _logEvent + return value
8. [ux_accessibility] A-36 — index.html `#rawLogOverlay`: add role=dialog + aria-modal + aria-label; renderer.js: focus closeRawBtn on open, restore prior focus on close, Escape closes

## Stats
- 4320 tests at cycle open → 4320 at close (regressions fixed)

▸ ◼ Cycle 236 cerrado — COMPLIANCE security:3/3 performance:1/1 backend:1/1 frontend:1/1 business_logic:1/1 ux_accessibility:1/1 DRIFT:none TESTS:green

---
# Cycle 235 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 235 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 5 | 0/5 |
| performance | 10 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BAN (C233+C234 consecutive) |
| ux_accessibility | 5 | 0 | BAN (C233+C234 consecutive) |
| backend | 5 | 0 | BAN (C233+C234 consecutive) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-67 — resource-scheduler.js _updateEfficiency(): 4× reduce/map/max calls → single pass computing avgMem, avgCPU, peakMem, peakCPU together
2. [business_logic] BL-15 — coordination-protocol.js releaseLock(): log heldMs (lock hold duration since grantedAt) to event log for contention analysis
3. [data_db] DD-01 — lifecycle pruning: add _LC_TYPES.has(e.type) to filters in persistLifecycleEvent + orchestra:clearLog — evicts pre-BL-14 unknown-type entries
4. [quality_tests] T-124 — cycle235-coverage.test.js: P-67 single-pass source + integration
5. [quality_tests] T-125 — cycle235-coverage.test.js: BL-15 heldMs in releaseLock event log
6. [quality_tests] T-126 — cycle235-coverage.test.js: DD-01 _LC_TYPES filter in persistLifecycleEvent source
7. [quality_tests] T-127 — cycle235-coverage.test.js: DD-01 _LC_TYPES filter in orchestra:clearLog source
8. [quality_tests] T-128 — cycle235-coverage.test.js: CoordinationProtocol releaseLock integration

## Stats
- 4302 tests at cycle open → 4320 at close

▸ ◼ Cycle 235 cerrado — COMPLIANCE performance:1/1 business_logic:1/1 data_db:1/1 quality_tests:5/5 DRIFT:none TESTS:green
