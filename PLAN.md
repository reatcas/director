# Cycle 176 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 176 (security + quality_tests BANNED: 3 consecutive each)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| performance | 10 | 3 | 0/3 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | BANNED | — |
| quality_tests | 35 | BANNED | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-06 — persistLifecycleEvent: cache cutoffISO with 60s TTL (avoid Date alloc on every event)
2. [performance] P-07 — metrics:roadmap-freshness: replace existsSync+statSync with single statSync try/catch
3. [performance] P-08 — pollGitCommits: stat .git/COMMIT_EDITMSG mtime before git log subprocess
4. [backend] I-529 — orchestra:analyze: cache ORCHESTRA_REPORT.md read; remove dead avgCompliance variable
5. [frontend] I-530 — loadMixes: guard m.ts with typeof + isNaN before new Date() to avoid "Invalid Date"
6. [business_logic] I-531 — CoordinationProtocol.detectConflicts(): cache os.totalmem() in constructor
7. [ux_accessibility] I-532 — index.html: aria-hidden="true" on decorative section-icon spans (3 instances)
8. [data_db] I-533 — orchestra:clearLog lifecycle pruning: replace new Date(e.ts).getTime() with ISO string compare

## Stats
- 3645 tests at cycle start (no tests this cycle — quality_tests BANNED)
