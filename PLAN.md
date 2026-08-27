# Cycle 200 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 200 (security+quality_tests BANNED C198+C199+C200)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| performance | 10 | 3 | 0/3 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BANNED (C198+C199) |
| quality_tests | 35 | 0 | BANNED (C198+C199) |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-36 — isRunning(dir): 1s TTL cache _isRunningCache to avoid repeated PID file syscalls per list refresh
2. [performance] P-37 — orchestra:tail: seek-based read of last tailLines×200 bytes instead of full file read (avoids loading up to 10MB)
3. [performance] P-38 — metrics:resource static allocation: use _SLOW_METRICS_TTL (30s) when no live data instead of 2s TTL
4. [backend] I-582 — readOrchJson: only cache when parsed result is a valid object (not just when file was read) — handles corrupt JSON fallback case
5. [frontend] I-581 — #closeShortcuts onclick: restore _scmPrevFocus on button click (consistent with Escape behavior added in C199)
6. [business_logic] D-09 — snapshotMixer: clamp _ssFocus values to [0, 100] (filter Finite already there; add v >= 0 && v <= 100)
7. [ux_accessibility] A-15 — #commitBreakdown: update aria-label dynamically with commit summary when rendered
8. [data_db] D-10 — persistLifecycleEvent: tighten read size cap from 2_097_152 to 512_000 (matches 300 × ~200 byte cap)

## Stats
- 3779 tests at cycle start
