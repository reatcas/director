# Cycle 118 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 118
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 5 | 5/5 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| business_logic | 5 | 1 | 1/1 |
| security | 20 | FROZEN (3rd consecutive) | — |
| performance | 10 | FROZEN (9th consecutive) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] I-235 — test ai:auth-status + ai:login type guards ✅
2. [quality_tests] I-236 — test nextAvailableAi robustness ✅
3. [quality_tests] I-237 — test snapshotMixer age pruning ✅
4. [quality_tests] I-238 — test export:session serialization order ✅
5. [quality_tests] I-239 — test metrics:session-summary completeness ✅
6. [backend] I-232 — metrics:resource + metrics:context: if (hit !== null) cache check ✅
7. [frontend] I-233 — themeToggle/settingsBtn titles translated to Spanish ✅
8. [business_logic] I-234 — parseComplianceLine: typeof + includes guard before regex ✅

## Stats
- 3136 tests passing (was 3121 at cycle start)
- +15 net tests added this cycle
- All metrics cache miss checks now use !== null (correct for falsy values)
- parseComplianceLine no longer throws on non-string input
