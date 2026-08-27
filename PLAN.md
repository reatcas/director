# Cycle 129 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 129
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 4 | 4/4 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| business_logic | 5 | 1 | 1/1 |
| quality_tests | 35 | FROZEN (3rd: 126,127,128) | — |
| performance | 10 | FROZEN (20th) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-321 — persistLifecycleEvent: lifecycle-events.json 2MB guard ✅
2. [security] I-322 — exit handler: directivePath read guarded at 512KB ✅
3. [backend] I-325 — mixer:saved:export: saved-mixes.json 512KB size guard ✅
4. [frontend] I-323 — openFolderBtn/installBtn/upgradeBtn/removeBtn: Spanish aria-labels ✅
5. [ux_accessibility] I-324 — mixImportBtn/saveMixer/addAtrilBtn: Spanish aria-labels ✅
6. [business_logic] I-326 — coordination-protocol: resource length cap 256 chars ✅
7. [security] I-321b — persistLifecycleEvent guards included in I-321 ✅
8. [security] I-322b — exit handler directive included in I-322 ✅

## Stats
- 3275 tests passing (was 3261 at cycle start)
- +14 net tests added this cycle
- All lifecycle event reads now consistently size-guarded
- PRODUCT_DIRECTIVE.md reads fully bounded across all call sites
- Transport action and mixer buttons now fully accessible
