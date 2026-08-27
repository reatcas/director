# Cycle 193 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 193 (backend BANNED C190+C191+C192)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| backend | 5 | 0 | BANNED (C190+C191+C192) |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-25 — orchestra:writeConfig: restrict quietFlags to shell-safe flag characters
2. [security] S-26 — atriles:list: add length + control-char validation to load-time filter
3. [performance] P-29 — findLogo step 5: fix double-statSync → single stat assignment
4. [frontend] I-569 — loadKnowledge: disable knowledge tab buttons during load, re-enable after
5. [business_logic] I-570 — getClaudeUsage: fix dailyBudget double-fetch — use local var directly
6. [quality_tests] T-43 — test C193: S-25 quietFlags restriction
7. [quality_tests] T-44 — test C193: S-26 atriles:list length+control-char
8. [quality_tests] T-45 — test C193: P-29 findLogo single stat + I-570 dailyBudget local var

## Stats
- 3727 tests at cycle start
