# Cycle 185 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 185 (backend+frontend BANNED)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 0 | BANNED (C182+C183+C184) |
| frontend | 5 | 0 | BANNED (C182+C183+C184) |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-13 — repertoire:readFile: add control-char guard + length cap ≤4096 on subpath
2. [security] S-14 — blueprint:save sessions: validate `ended` field (string ≤64, no control chars) — mirrors started guard
3. [performance] P-19 — exit handler: existsSync(usageSig) → statSync try/catch (single syscall)
4. [business_logic] I-553 — snapshotMixer dedup: use sorted JSON comparison to prevent key-order false negatives
5. [ux_accessibility] A-08 — loadProcs: add role="list" to #procsList + role="listitem" to proc-row divs
6. [quality_tests] T-22 — test C185: S-13 subpath control-char + length cap + S-14 sessions ended field
7. [quality_tests] T-23 — test C185: P-19 no existsSync in exit usageSig path
8. [quality_tests] T-24 — test C185: I-553 sorted snapshotMixer dedup + A-08 proc-row role

## Stats
- 3688 tests at cycle start
