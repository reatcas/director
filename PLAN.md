# Cycle 117 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 117
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 4 | 4/4 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| data_db | 5 | 1 | 1/1 |
| quality_tests | 35 | FROZEN (3rd consecutive) | — |
| performance | 10 | FROZEN (8th consecutive) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-224 — CSP meta tag + viewport meta in index.html ✅
2. [security] I-225 — IPC audit: all handlers use isKnownProject or exempt ✅
3. [security] I-226 — export:session: 10MB output size cap ✅
4. [security] I-227 — 17-test suite for all cycle 117 additions ✅
5. [backend] I-228 — repertoire:readFile: stat.isFile() check rejects directories ✅
6. [frontend] I-229 — viewport meta tag added ✅
7. [ux_accessibility] I-230 — compliance/roadmap/burn-rate/AI-usage metrics cells aria-labels ✅
8. [data_db] I-231 — orchestra:clearLog caps context-metrics.json at 500 entries ✅

## Stats
- 3121 tests passing (was 3104 at cycle start)
- +17 net tests added this cycle
- CSP added to index.html
- All IPC handlers now use isKnownProject or have documented exemptions
