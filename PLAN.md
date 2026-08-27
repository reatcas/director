# Cycle 172 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 172 (security+quality_tests BANNED: 3 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| performance | 10 | 3 | 3/3 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| business_logic | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| data_db | 5 | 1 | 1/1 |
| security | 20 | BANNED | — |
| quality_tests | 35 | BANNED | — |
| performance_note | — | unfrozen (no perf commits in last 30) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-01 — loadProcs() interval: !current guard (skip ps aux when idle)
2. [performance] P-02 — getAllSections(): memoize with customAtriles fingerprint
3. [performance] P-03 — metrics:compliance: mtime guard (skip re-parse when file unchanged)
4. [backend] I-519 — stopGitWatcher: gitLastCommitTime.delete(dir) memory leak fix
5. [frontend] I-520 — refreshAnalysis: aria-busy + disabled during load
6. [business_logic] I-521 — pollGitCommits stall init: fix confusing double-check lines 113-114
7. [ux_accessibility] I-522 — settingsModal/aboutModal open: focus first focusable element
8. [data_db] I-523 — persistLifecycleEvent: ISO string cutoff (avoid 500 Date allocs per call)

## Stats
- 3621 tests at cycle start (quality_tests BANNED → 0 test units this cycle)
- loadProcs() runs every 5s calling ps aux even when no project selected
- getAllSections() rebuilds array on every call; called 5+ times per mixer render
- metrics:compliance re-parses ORCHESTRA_REPORT.md every 30s even if file unchanged
- stopGitWatcher: gitLastCommitTime map never cleared → memory leak per stopped session
- refreshAnalysis button has no aria-busy feedback during load
- pollGitCommits lines 113-114: redundant .get()/.has() logic, not clearly correct
- settingsModal/aboutModal open without moving focus → keyboard users can't tab in
- persistLifecycleEvent: new Date(e.ts).getTime() for 500 events per call → 500 Date allocs
