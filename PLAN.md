# Cycle 215 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 215 (performance+ux_accessibility+data_db BANNED — in C212+C213+C214)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | 0 | BANNED |
| ux_accessibility | 5 | 0 | BANNED |
| data_db | 5 | 0 | BANNED |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-59 — getClaudeUsage: add /^iter-[\w\-.]+\.log$/ regex to iter log filename filter
2. [security] S-60 — blueprint:generate-brief _bpInline: strip control chars [\x00-\x08\x0B\x0C\x0E-\x1F\x7F] in addition to newlines
3. [backend] I-592 — orchestra:writeConfig: evict snapshot: cache when focus changes (mirrors mixer:write fix from C214)
4. [business_logic] BL-10 — metricsGet: use ?? instead of || for TTL to handle edge cases where TTL=0
5. [frontend] FE-09 — loadSessionSummary: show — empty state instead of clearing element on null/missing data
6. [quality_tests] T-98 — cycle215-coverage.test.js covering S-59, S-60, I-592, BL-10, FE-09
7. [quality_tests] T-99 — fix cycle111-coverage.test.js slice(0,8) fragile anchor
8. [quality_tests] T-100 — remove dead block variable in cycle158-coverage.test.js

## Stats
- 3937 tests at cycle start
