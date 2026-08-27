# Cycle 104 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 104
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 1 | 0/1 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| frontend | 5 | FROZEN | — |
Total: 7 units — IMPROVEMENT MODE (ROADMAP all done, F-01 HARNESS-blocked)

## Units
1. [backend] I-114 — add isKnownProject guard to notes:read (info disclosure gap) ✅
2. [performance] I-115 — cache isKnownProject store reads with version counter ✅
3. [quality_tests] I-116 — test export:session handler structure (0 coverage) ✅
4. [quality_tests] I-117 — test notes:read/write handler pair + validation ✅
5. [quality_tests] I-118 — test isKnownProject edge cases + handler-level validation ✅
6. [ux_accessibility] I-119 — focus-visible ring restored on outline:none elements ✅
7. [security] I-120 — validate dir in export:session + mixer:history + mixer:saved:* ✅

## Stats
- 2827 tests passing (was 2794 at cycle start)
- +33 tests added this cycle
- 6 more IPC handlers secured with isKnownProject
