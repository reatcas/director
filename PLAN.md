# Cycle 110 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 110
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 4 | 4/4 |
| performance | 10 | 2 | 2/2 |
| ux_accessibility | 5 | 1 | 1/1 |
| data_db | 5 | 1 | 1/1 |
| quality_tests | 35 | FROZEN (3rd consecutive) | — |
| backend | 5 | FROZEN (3rd consecutive) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-160 — validate cfg in orchestra:writeConfig (plain object + 64KB size limit) ✅
2. [security] I-161 — validate id in ai:select against AI_DEFAULTS allowlist ✅
3. [security] I-162 — validate cfg.focus weights in orchestra:writeConfig (numeric 0-100) ✅
4. [security] I-163 — security tests for I-160/I-161/I-162 validations ✅
5. [performance] I-164 — cache atriles:list response ✅
6. [performance] I-165 — memoize orchestraSrc() result ✅
7. [ux_accessibility] I-166 — role=tablist + aria-label + aria-selected on mixer tab buttons ✅
8. [data_db] I-167 — evict metrics + readiness cache on repertoire:remove ✅

## Stats
- 2974 tests passing (was 2962 at cycle start)
- +12 net tests added this cycle
- orchestra:writeConfig now validates type + size + focus weight ranges
- ai:select uses AI_DEFAULTS allowlist (consistent with orchestra:play)
