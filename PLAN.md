# Cycle 116 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 116
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| security | 20 | 2 | 2/2 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| data_db | 5 | FROZEN (3rd consecutive) | — |
| performance | 10 | FROZEN (7th consecutive) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] I-220 — test repertoire:open isKnownProject guard ✅
2. [quality_tests] I-221 — test lifecycle:add null byte rejection ✅
3. [quality_tests] I-222 — test metrics:session-summary creditsRemaining ✅
4. [quality_tests] I-223 — test modal role=dialog + aria-modal attributes ✅
5. [security] I-216 — repertoire:open: isKnownProject guard instead of bare !dir ✅
6. [security] I-217 — lifecycle:add: reject null bytes in label/message ✅
7. [backend] I-218 — metrics:session-summary: add creditsRemaining field ✅
8. [frontend] I-219 — all 5 modals: role=dialog + aria-modal=true + Spanish aria-label ✅

## Stats
- 3104 tests passing (was 3089 at cycle start)
- +15 net tests added this cycle
- repertoire:open was unguarded — fixed
- All modals now accessible with role=dialog and aria-modal
