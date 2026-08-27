# Cycle 208 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 208 (security+quality_tests BANNED — in C205+C206+C207)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| performance | 10 | 3 | 0/3 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BANNED |
| quality_tests | 35 | 0 | BANNED |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-46 — system:claude-procs: add 5s TTL cache via _metricsCache to avoid ps aux on every IPC call
2. [performance] P-47 — orchestra:version-check: add 30s TTL per-dir cache (version files don't change between upgrades)
3. [performance] P-48 — metrics:snapshot: add 2s TTL cache (contextProto.computeDelta is non-trivial, results valid for renderer poll interval)
4. [backend] I-587 — mixer:saved:list: add per-dir _savedMixesCache Map (like _atrilesCache), invalidated on save/delete write operations
5. [business_logic] BL-05 — orchestra:kill: evict session-summary cache (consistent with BL-04 fine fix — active count changes on kill too)
6. [frontend] FE-04 — renderer.js loadSessionSummary: add total project count to panel (s.total alongside active/idle)
7. [ux_accessibility] A-19 — sessionSummary div: add descriptive aria-label summarizing active/idle/tokens on update
8. [data_db] D-14 — mixer:saved:export: validate returned mix's focus values are numeric 0-100 before serializing

## Stats
- 3855 tests at cycle start
