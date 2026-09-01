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
- 4302 tests at cycle open
