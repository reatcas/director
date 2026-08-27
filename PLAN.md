# Cycle 113 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 113
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 4 | 4/4 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| data_db | 5 | 1 | 1/1 |
| quality_tests | 35 | FROZEN (3rd consecutive) | — |
| performance | 10 | FROZEN (4th consecutive) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-184 — system:kill-proc: pid typeof+integer+positive validation ✅
2. [security] I-185 — mixer:history: cap limit to Math.min(limit, 500) ✅
3. [security] I-186 — lifecycle:add: type allowlist /^[\w\-]+$/ ✅
4. [security] I-187 — 22-test suite for all new validations ✅
5. [backend] I-188 — mixer:write: validate focus object with numeric weights 0-100 ✅
6. [frontend] I-189 — stall-badge: aria-label "N minutos sin commits" ✅
7. [ux_accessibility] I-190 — addBtn: aria-label "Agregar proyecto" ✅
8. [data_db] I-191 — persistLifecycleEvent: prune events older than 90 days on insert ✅

## Stats
- 3058 tests passing (was 3036 at cycle start)
- +22 net tests added this cycle
- mixer:write now validates focus shape and weight range
- lifecycle events auto-pruned on insert (90-day rolling window)
