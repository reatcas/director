# Cycle 115 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 115
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| security | 20 | 2 | 2/2 |
| data_db | 5 | 1 | 1/1 |
| business_logic | 5 | 1 | 1/1 |
| backend | 5 | FROZEN (3rd consecutive) | — |
| frontend | 5 | FROZEN (3rd consecutive) | — |
| ux_accessibility | 5 | FROZEN (3rd consecutive) | — |
| performance | 10 | FROZEN (6th consecutive) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] I-212 — test repertoire:readFile isKnownProject + 2MB cap ✅
2. [quality_tests] I-213 — test ai:auth-status + ai:login allowlist validation ✅
3. [quality_tests] I-214 — test snapshotMixer 30-day age pruning ✅
4. [quality_tests] I-215 — test nextAvailableAi unknown agent fix ✅
5. [security] I-208 — repertoire:readFile: isKnownProject + 2MB size cap ✅
6. [security] I-209 — ai:auth-status + ai:login: typeof+allowlist before shell commands ✅
7. [data_db] I-210 — snapshotMixer: prune mixer-history entries older than 30 days ✅
8. [business_logic] I-211 — nextAvailableAi: fix unknown currentAgent handling ✅

## Stats
- 3089 tests passing (was 3072 at cycle start)
- +17 net tests added this cycle
- repertoire:readFile was vulnerable to reading arbitrary filesystem paths — fixed
- ai:auth-status/login now validated against AI_DEFAULTS allowlist
