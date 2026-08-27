# Cycle 197 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 197 (backend BANNED C194+C195+C196)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| backend | 5 | 0 | BANNED (C194+C195+C196) |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-31 — lifecycle:list: add before.length <= 64 cap to cursor validation
2. [security] S-32 — atriles:save: add path.isAbsolute(a.path) per-entry check to reject relative path traversal
3. [performance] P-34 — periodic cache sweep: evict _orchJsonCache (>10s) and _logoCache (>60s) entries in existing _metricsCache sweep
4. [frontend] I-577 — shortcutsModal open via '?' key: add requestAnimationFrame focus on first focusable element
5. [business_logic] D-07 — repertoire:remove: evict _orchJsonCache and _logoCache entries for removed project dir
6. [quality_tests] T-53 — test C197: S-31 before length cap in lifecycle:list
7. [quality_tests] T-54 — test C197: S-32 path.isAbsolute in atriles:save
8. [quality_tests] T-55 — test C197: P-34 cache sweep markers + D-07 repertoire:remove cleanup

## Stats
- 3743 tests at cycle start
