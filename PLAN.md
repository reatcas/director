# Cycle 174 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 174 (ux_accessibility BANNED: 3 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | BANNED | — |
| business_logic | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-01 — lifecycle:list filter: add typeof e.message === 'string' check
2. [security] S-02 — buildMixRibbon: CSS color guard before style injection (defense-in-depth)
3. [performance] P-05 — getClaudeUsage: cache dailyBudget in usageTracker (skip orchestra.json re-read on cache hit)
4. [backend] I-525 — repertoire:remove: _complianceMtimeCache.delete(dir) memory leak fix
5. [frontend] I-526 — debounce updateMixerGraph + updateSmartAuroraColors on slider input (fires 60x/sec during drag)
6. [quality_tests] T-01 — test S-01: lifecycle:list filter includes message string check
7. [quality_tests] T-02 — test S-02: buildMixRibbon CSS color validation in renderer
8. [quality_tests] T-03 — test P-05 + I-525: getClaudeUsage caches dailyBudget + complianceMtimeCache cleanup

## Stats
- 3630 tests at cycle start
- lifecycle:list filter checks type/ts/label but NOT message → non-string message bypasses esc() into innerHTML
- buildMixRibbon: color from atriles injected into style attr without renderer-side validation (backend validated C173)
- getClaudeUsage: reads orchestra.json every call even on 25s cache hit (iterCount/totalBytes cached but not dailyBudget)
- _complianceMtimeCache never cleared on project remove → memory leak (same pattern as gitLastCommitTime in I-519)
- updateMixerGraph + updateSmartAuroraColors fire on every slider input (up to 60/s during drag), not debounced
