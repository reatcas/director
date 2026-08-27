# Cycle 202 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 202 (backend BANNED C199+C200+C201 — NOT banned C202: no cat in all 3)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-39 — notes:write: byte-length guard (Buffer.byteLength > 102_400) prevents oversized writes via multi-byte Unicode (50K chars = up to 200KB)
2. [security] S-40 — export:session mixerHistory: tighten filter to match mixer:history rigor (add ts/event/focus field type validation, analogous to C201 lifecycle fix)
3. [performance] P-40 — metrics:context: remove write-on-read trim (read path should not write; trim belongs in clearLog)
4. [backend] I-583 — export:session mixerConfig: add non-array object guard (if readJSON returns array/primitive, fallback to {})
5. [quality_tests] T-67 — test C202: S-39 notes:write byte-length guard
6. [quality_tests] T-68 — test C202: S-40 export:session mixerHistory rigor
7. [quality_tests] T-69 — test C202: P-40 metrics:context no write-on-read + I-583 mixerConfig guard
8. [frontend] FE-01 — renderer notes: add char count display + error state when notes:write returns false

## Stats
- 3790 tests at cycle start
