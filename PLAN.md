# Cycle 184 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 184 (security+quality_tests BANNED)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 0 | BANNED (C181+C182+C183) |
| security | 20 | 0 | BANNED (C181+C182+C183) |
| performance | 10 | 3 | 0/3 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-16 — getClaudeUsage: existsSync(USAGE_LIMIT_SIGNAL) → statSync try/catch (single syscall)
2. [performance] P-17 — exit handler line 767: existsSync(roadmapPath)+statSync double-stat → single statSync
3. [performance] P-18 — orchestra:upgrade: existsSync(srcPath)+existsSync(dstPath) → statSync/try-catch pattern
4. [backend] I-550 — watchForResume: existsSync(signalFile) → statSync try/catch (ENOENT=signal gone=resume)
5. [frontend] I-551 — loadBpReadiness: add aria-label for missing fields (accessible alt to title attribute)
6. [business_logic] I-552 — parseComplianceLine: cap categories at 20 with break to prevent unbounded growth
7. [ux_accessibility] A-07 — renderSparkline: set role="img" + aria-label with last score when visible
8. [data_db] D-03 — persistLifecycleEvent: aggressive trim fallback (100 events) when serialized > 2MB, prevent event loss

## Stats
- 3688 tests at cycle start
