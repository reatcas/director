# Cycle 201 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 201 (backend BANNED C199+C200+C201)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| backend | 5 | 0 | BANNED (C199+C200) |
| frontend | 5 | 0 | SKIP |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-37 — mixer:saved:list: tighten validDefaults filter — validate id pattern /^[0-9a-z_\-]+$/, name type+length, focus object check
2. [security] S-38 — export:session lifecycle: add type/ts/label/message field validation (match lifecycle:list rigor)
3. [performance] P-39 — mixer:write + orchestra:writeConfig: add _metricsCache.delete('resource:'+dir) to fix stale 30s resource cache (regression from P-38)
4. [business_logic] BL-01 — playOrchestra child exit handler: add _invalidateIsRunning(dir) so cache is cleared immediately on natural process exit
5. [quality_tests] T-63 — test C201: S-37 mixer:saved:list validDefaults rigor
6. [quality_tests] T-64 — test C201: S-38 export:session lifecycle validation
7. [quality_tests] T-65 — test C201: P-39 resource cache invalidation in mixer:write + writeConfig
8. [quality_tests] T-66 — test C201: BL-01 _invalidateIsRunning in child exit handler

## Stats
- 3779 tests at cycle start
