# Cycle 177 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 177 (backend + frontend BANNED: 3 consecutive each)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| backend | 5 | BANNED | — |
| frontend | 5 | BANNED | — |
| business_logic | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-01 — copyDir: reject filenames with path traversal patterns (e.name contains .. or path.sep)
2. [security] S-02 — CoordinationProtocol.persistTelemetry: Array.isArray(hist) guard after JSON.parse
3. [performance] P-09 — isRunning: replace existsSync+statSync with single statSync try/catch
4. [ux_accessibility] I-534 — loadLifecycleTimeline: add aria-hidden="true" to lc-icon spans
5. [quality_tests] T-01 — test C176: _lcCutoff cache helper + cutoffISO use in persistLifecycleEvent
6. [quality_tests] T-02 — test C176: pollGitCommits _gitCommitMtimes Map + COMMIT_EDITMSG guard
7. [quality_tests] T-03 — test C176: CoordProtocol._totalMemMB + clearLog ISO string compare
8. [quality_tests] T-04 — test C177: S-01 copyDir guard + S-02 Array.isArray + P-09 isRunning + I-534 aria-hidden

## Stats
- 3645 tests at cycle start
