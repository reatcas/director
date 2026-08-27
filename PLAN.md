# Cycle 180 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 180 (security + quality_tests BANNED: 3 consecutive each)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| performance | 10 | 3 | 0/3 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | BANNED | — |
| quality_tests | 35 | BANNED | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-11 — findLogo line 294: pkgStat existsSync+statSync → single statSync try/catch
2. [performance] P-12 — findLogo line 323: ghDir existsSync+statSync → single statSync try/catch
3. [performance] P-13 — exit handler line 772: directivePath existsSync+statSync → single statSync try/catch
4. [backend] I-539 — metrics:session-summary: add _worstComplianceCache to fix worstCompliance gap when mtime matches
5. [frontend] I-540 — updateComplianceDisplay: guard data.cycles with Number.isFinite before rendering
6. [ux_accessibility] I-541 — loadMixes mix-card: add role="button" + tabindex="0" for keyboard accessibility
7. [business_logic] I-542 — snapshotMixer: cache 30-day cutoff ISO with _smCutoff() helper (same pattern as _lcCutoff)
8. [data_db] I-543 — orchestra:clearLog: add pruning of coordination-metrics.json (keep last 100 entries)

## Stats
- 3670 tests at cycle start
