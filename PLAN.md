# Cycle 245 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 245 (business_logic BANNED: C242+C243+C244 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | BAN (C242+C243+C244 consecutive) |
| backend | 5 | 0 | SKIP (done C244) |
| data_db | 5 | 0 | SKIP (done C243) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (business_logic BANNED)

## Units
1. [quality_tests] T-149 — cycle245-coverage.test.js: S-89 metricsResource/Context/Snapshot/Allocation guards source
2. [quality_tests] T-150 — cycle245-coverage.test.js: S-90 claudeUsage/complianceMetrics/roadmapFreshness + S-91 blueprintLoad/Generate/Readiness/notesRead guards source
3. [quality_tests] T-151 — cycle245-coverage.test.js: B-28 fine/kill coordination eviction + F-26 _complianceSparkEl + P-74 hotPaths counter + BL-22 _retentionCache
4. [security] S-92 — preload.js `add(p)`+`remove(p)`+`openDir(p)`: typeof string guard per ADR-007
5. [security] S-93 — preload.js `readFile(p,s)`+`install(p)`+`exportSession(dir)`: typeof string guard per ADR-007
6. [performance] P-75 — main.js `isKnownProject`: cache known-paths Set for O(1) lookup (currently O(n) linear scan)
7. [frontend] F-27 — renderer.js: add module-level _usageBarEl+_usageBarFillEl cached refs
8. [ux_accessibility] A-41 — index.html: add role=status+aria-live=polite to mmAllocVal+mmMemVal+mmTokensVal

## Stats
- 4397 tests at cycle open → TBD at close

---
# Cycle 244 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 244 (quality_tests BANNED: C241+C242+C243 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| quality_tests | 35 | 0 | BAN (C241+C242+C243 consecutive) |
| data_db | 5 | 0 | SKIP (done C243) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (quality_tests BANNED)

## Units
1. [security] S-89 — preload.js `metricsResource(p)`+`metricsContext(p)`+`metricsSnapshot(p)`+`metricsAllocation(p)`: typeof string guard per ADR-007
2. [security] S-90 — preload.js `claudeUsage(p)`+`complianceMetrics(p)`+`roadmapFreshness(p)`: typeof string guard per ADR-007
3. [security] S-91 — preload.js `blueprintLoad(p)`+`blueprintGenerate(p)`+`blueprintReadiness(p)`+`notesRead(p)`: typeof string guard per ADR-007
4. [performance] P-74 — coordination-protocol.js `_computePriority`: replace .filter() with manual counter (eliminates intermediate array)
5. [backend] B-28 — main.js `orchestra:fine`+`orchestra:kill`: add _metricsCache.delete('coordination') eviction on stop
6. [frontend] F-26 — renderer.js: add module-level _complianceSparkEl cached ref
7. [business_logic] BL-22 — context-protocol.js `computeRetention`: memoize sigmoid via _retentionCache Map
8. [ux_accessibility] A-40 — index.html: complianceSpark SVG gets aria-hidden=true (decorative sparkline)

## Stats
- 4397 tests at cycle open → 4397 at close (quality_tests BANNED — no new tests)

▸ ◼ Cycle 244 cerrado — COMPLIANCE security:3/3 performance:1/1 backend:1/1 frontend:1/1 business_logic:1/1 ux_accessibility:1/1 DRIFT:none TESTS:green

---
# Cycle 243 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 243 (security+backend+frontend BANNED: C240+C241+C242 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| performance | 10 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BAN (C240+C241+C242 consecutive) |
| backend | 5 | 0 | BAN (C240+C241+C242 consecutive) |
| frontend | 5 | 0 | BAN (C240+C241+C242 consecutive) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (security+backend+frontend BANNED)

## Units
1. [quality_tests] T-145 — cycle243-coverage.test.js: S-87 fine/kill/clearLog typeof string guard source
2. [quality_tests] T-146 — cycle243-coverage.test.js: S-88 mixerRead/analyze typeof string guard source
3. [quality_tests] T-147 — cycle243-coverage.test.js: B-27 orchestra:play coordination cache eviction source
4. [quality_tests] T-148 — cycle243-coverage.test.js: F-25 _burnSparkEl cached ref + BL-20 priorityTier in rebalance log
5. [performance] P-73 — coordination-protocol.js `_rebalance`: single-pass totalInverse (no separate reduce)
6. [business_logic] BL-21 — coordination-protocol.js `acquireLock`: auto-reclaim stale lock when holder unregistered
7. [ux_accessibility] A-39 — index.html: burnSpark sparkline gets aria-hidden=true (decorative element)
8. [data_db] DD-03 — main.js `atriles:save`: cap stored entries at 200 (prevent unbounded JSON growth)

## Stats
- 4387 tests at cycle open → 4397 at close

▸ ◼ Cycle 243 cerrado — COMPLIANCE quality_tests:4/4 performance:1/1 business_logic:1/1 ux_accessibility:1/1 data_db:1/1 DRIFT:none TESTS:green

---
# Cycle 242 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 242 (performance BANNED: C239+C240+C241 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| performance | 10 | 0 | BAN (C239+C240+C241 consecutive) |
| ux_accessibility | 5 | 0 | SKIP (done C240) |
| data_db | 5 | 0 | SKIP (done C239) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (performance BANNED)

## Units
1. [quality_tests] T-142 — cycle242-coverage.test.js: S-85 aiLogin/aiAuthStatus guard + S-86 orch guards source
2. [quality_tests] T-143 — cycle242-coverage.test.js: P-72 _coordTelDirReady source + B-26 coordination TTL source
3. [quality_tests] T-144 — cycle242-coverage.test.js: F-24 compressionStats+compressionHist cached refs source
4. [security] S-87 — preload.js `fine(p)`+`kill(p)`+`clearLog(p)`: typeof string guard per ADR-007
5. [security] S-88 — preload.js `mixerRead(p)`+`analyze(p)`: typeof string guard per ADR-007
6. [backend] B-27 — main.js `orchestra:play`: add _metricsCache.delete('coordination') eviction
7. [frontend] F-25 — renderer.js `updateBurnRate`: add module-level _burnSparkEl cached ref
8. [business_logic] BL-20 — coordination-protocol.js `_rebalance`: add priorityTier to rebalance log event

## Stats
- 4375 tests at cycle open → 4387 at close

▸ ◼ Cycle 242 cerrado — COMPLIANCE quality_tests:3/3 security:2/2 backend:1/1 frontend:1/1 business_logic:1/1 DRIFT:none TESTS:green

---
# Cycle 241 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 241 (business_logic BANNED: C238+C239+C240 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | BAN (C238+C239+C240 consecutive) |
| ux_accessibility | 5 | 0 | SKIP (done C240) |
| data_db | 5 | 0 | SKIP (done C239) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (business_logic BANNED)

## Units
1. [quality_tests] T-139 — cycle241-coverage.test.js: S-82/S-83/S-84 play+mixerWrite+aiSelect guards source
2. [quality_tests] T-140 — cycle241-coverage.test.js: P-71 _cpTelDirReady source + B-25 play cache eviction source
3. [quality_tests] T-141 — cycle241-coverage.test.js: BL-19 conflictSeveritySummary integration + A-38 aria-hidden source
4. [security] S-85 — preload.js `aiLogin(id)`+`aiAuthStatus(id)`: add string guard per ADR-007
5. [security] S-86 — preload.js `orchestraUpgrade(p)`+`orchestraVersionCheck(p)`: add typeof string guard
6. [performance] P-72 — coordination-protocol.js `persistTelemetry`: add _coordTelDirReady Set (mirrors P-70+P-71)
7. [backend] B-26 — main.js `metrics:coordination`: use _SLOW_METRICS_TTL (30s) when no active instances
8. [frontend] F-24 — renderer.js `updateCompressionPanel`: cache compressionStats+compressionHistory DOM refs

## Stats
- 4361 tests at cycle open → 4375 at close

▸ ◼ Cycle 241 cerrado — COMPLIANCE security:2/2 performance:1/1 backend:1/1 frontend:1/1 quality_tests:3/3 DRIFT:none TESTS:green

---
# Cycle 240 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 240 (quality_tests BANNED: C237+C238+C239 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| quality_tests | 35 | 0 | BAN (C237+C238+C239 consecutive) |
| data_db | 5 | 0 | SKIP (done C239) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (quality_tests BANNED)

## Units
1. [security] S-82 — preload.js `play(p, a)`: add agent string guard (length 1-64) per ADR-007
2. [security] S-83 — preload.js `mixerWrite(p, f)`: add focus object guard (not null, not array) per ADR-007
3. [security] S-84 — preload.js `aiSelect(id)`: add string + length guard per ADR-007
4. [performance] P-71 — context-protocol.js `_persist`: add _cpTelDirReady Set to skip redundant mkdirSync
5. [backend] B-25 — main.js `orchestra:play`: evict allocation/resource/snapshot caches on play start
6. [frontend] F-23 — renderer.js `updateCompressionPanel`: add module-level _compressionPanelEl cached ref
7. [business_logic] BL-19 — coordination-protocol.js `getStatus`: add conflictSeveritySummary {high, medium, low} + priorityTier in instances
8. [ux_accessibility] A-38 — index.html `#particleCanvasWrap`: add aria-hidden=true (decorative aurora canvas)

## Stats
- 4361 tests at cycle open → 4361 at close (no new tests — quality_tests BANNED)

▸ ◼ Cycle 240 cerrado — COMPLIANCE security:3/3 performance:1/1 backend:1/1 frontend:1/1 business_logic:1/1 ux_accessibility:1/1 DRIFT:none TESTS:green

---
# Cycle 239 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 239 (security+backend+frontend BANNED: C236+C237+C238 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| performance | 10 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BAN (C236+C237+C238 consecutive) |
| backend | 5 | 0 | BAN (C236+C237+C238 consecutive) |
| frontend | 5 | 0 | BAN (C236+C237+C238 consecutive) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (security+backend+frontend BANNED)

## Units
1. [quality_tests] T-135 — cycle239-coverage.test.js: S-80 tail lines guard + S-81 atrilesSave array guard source
2. [quality_tests] T-136 — cycle239-coverage.test.js: B-24 _invalidateSavedMixes in remove handler source
3. [quality_tests] T-137 — cycle239-coverage.test.js: F-22 burn reset on clearLog source
4. [quality_tests] T-138 — cycle239-coverage.test.js: BL-17 _priorityTier integration + priorityTier stored in register
5. [performance] P-70 — resource-scheduler.js `persistTelemetry`: add _telDirReady Set to skip redundant mkdirSync calls
6. [business_logic] BL-18 — coordination-protocol.js `_rebalance`: early return when instances empty
7. [ux_accessibility] A-37 — index.html `#clockStatus`+`#pstatus`: add role=status for dynamic status announcements
8. [data_db] DD-02 — main.js `orchestra:clearLog`: cap resource-metrics.json at 300 entries (mirrors context/coordination caps)

## Stats
- 4348 tests at cycle open → 4361 at close

▸ ◼ Cycle 239 cerrado — COMPLIANCE performance:1/1 business_logic:1/1 ux_accessibility:1/1 data_db:1/1 quality_tests:4/4 DRIFT:none TESTS:green

---
# Cycle 238 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 238 (performance BANNED: C235+C236+C237 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| performance | 10 | 0 | BAN (C235+C236+C237 consecutive) |
| ux_accessibility | 5 | 0 | SKIP (done C236) |
| data_db | 5 | 0 | SKIP (done C235) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (performance BANNED)

## Units
1. [quality_tests] T-132 — cycle238-coverage.test.js: S-78 configWrite object guard + S-79 mixerHistory integer guard source
2. [quality_tests] T-133 — cycle238-coverage.test.js: P-69 computeAllocation single-pass source + integration
3. [quality_tests] T-134 — cycle238-coverage.test.js: B-23 clearLog cache keys source + F-20 burn reset source
4. [security] S-80 — preload.js `tail`: add lines integer guard (1-1000) per ADR-007
5. [security] S-81 — preload.js `atrilesSave`: add object guard (not null, not array) per ADR-007
6. [backend] B-24 — main.js `repertoire:remove`: add _invalidateSavedMixes(dir) call to evict saved-mixes cache on removal
7. [frontend] F-22 — renderer.js `clearLogBtn` handler: reset _prevBurnTokens=0 + _burnHistory.length=0 after clearLog
8. [business_logic] BL-17 — coordination-protocol.js: add _priorityTier(score) helper + store priorityTier in register()

## Stats
- 4335 tests at cycle open → 4348 at close

▸ ◼ Cycle 238 cerrado — COMPLIANCE security:2/2 backend:1/1 frontend:1/1 business_logic:1/1 quality_tests:3/3 DRIFT:none TESTS:green

---
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
- 4320 tests at cycle open → 4335 at close

▸ ◼ Cycle 237 cerrado — COMPLIANCE security:2/2 performance:1/1 backend:1/1 frontend:1/1 quality_tests:3/3 DRIFT:none TESTS:green

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
