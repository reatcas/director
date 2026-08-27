# Cycle 211 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 211 (performance BANNED — in C208+C209+C210)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | 0 | BANNED |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-53 — ai:credits/aiState: validate credits value is non-negative integer when reading ai-credits.json
2. [security] S-54 — lifecycle:list: validate e.type against _LC_TYPES before returning to renderer (ensures only known types escape IPC)
3. [backend] I-589 — orchestra:play: invalidate version-check cache on play (version file may change during play if auto-upgrade ran)
4. [business_logic] BL-07 — getClaudeUsage: cap tokensEstimated at Number.MAX_SAFE_INTEGER to prevent NaN in percent calculation
5. [frontend] FE-06 — renderer.js: show idle count in separate text color in sessionSummary (idle projects dimmer than active)
6. [quality_tests] T-89 — test C211: S-53 credits validation + S-54 lifecycle type filter on return
7. [quality_tests] T-90 — test C211: I-589 version-check invalidation on play + BL-07 tokensEstimated cap
8. [quality_tests] T-91 — test C211: FE-06 sessionSummary idle styling

## Stats
- 3894 tests at cycle start
