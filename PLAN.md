# Cycle 204 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 204 (quality_tests + security BANNED: both appear in C201+C202+C203)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| performance | 10 | 3 | 3/3 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| business_logic | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| data_db | 5 | 1 | 1/1 |
| quality_tests | 35 | 0 | BANNED (C201+C202+C203) |
| security | 20 | 0 | BANNED (C201+C202+C203) |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-41 — metrics:session-summary: add 2s TTL cache (currently uncached; iterates all projects on every call)
2. [performance] P-42 — metrics:context disk path: use _SLOW_METRICS_TTL (30s) instead of 2s for disk-served history (data unchanged between 30s sampler intervals)
3. [performance] P-43 — blueprint:readiness: extend TTL 5s→10s to match _readinessCache periodic sweep eviction interval (D-11, C203)
4. [backend] I-584 — export:session: add concurrent-export guard flag to prevent dialog double-open
5. [frontend] FE-02 — renderer notes: clear char counter when no project selected (currently shows stale count from previous project)
6. [business_logic] BL-02 — persistLifecycleEvent: add byte-length cap on message (Buffer.byteLength > 4096 guard, matching notes:write pattern)
7. [ux_accessibility] A-17 — index.html: add role="status" + aria-live="polite" to #monitorStatus so screen readers announce orchestra state changes
8. [data_db] D-12 — mixer:saved:save: validate-filter existing mixes on read (matching mixer:saved:list filter) before 100-cap check, preventing corrupt entries from consuming slots

## Stats
- 3813 tests at cycle start
