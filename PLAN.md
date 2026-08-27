# Cycle 207 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 207 (performance BANNED — in C204+C205+C206)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| performance | 10 | 0 | BANNED |
| frontend | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-47 — orchestra:clearLog: validate lifecycle event entries (type/label/message strings) before writing pruned array back — consistent with lifecycle:list filter
2. [security] S-48 — snapshotMixer: add full entry validation (ts string, event string, focus object with numeric values) before dedup comparison — consistent with mixer:history S-45 fix
3. [backend] I-586 — persistLifecycleEvent: guard type against _LC_TYPES allowlist before writing (prevents future internal callers from writing invalid event types)
4. [business_logic] BL-04 — orchestra:fine: evict session-summary cache on fine (active count changes when orchestra stops, consistent with play evicting claude-usage)
5. [ux_accessibility] A-18 — sessionSummary ss-item spans: add aria-label to each item for screen reader context
6. [quality_tests] T-80 — test C207: S-47 clearLog lifecycle validation + S-48 snapshotMixer entry validation
7. [quality_tests] T-81 — test C207: I-586 persistLifecycleEvent type guard + BL-04 session-summary cache eviction on fine
8. [quality_tests] T-82 — test C207: A-18 sessionSummary aria-labels

## Stats
- 3843 tests at cycle start
