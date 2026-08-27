# Cycle 161 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 161
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | SKIP (proportional) | — |
| business_logic | 5 | SKIP (proportional) | — |
| data_db | 5 | SKIP (proportional) | — |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-475 — aiState dirty writes (lines 723+923): _aisUsageSer/_aisDirtySer cap
2. [security] I-476 — bpAskCurrent: esc(existing) to prevent stored XSS in blueprint chat
3. [backend] I-477 — getClaudeUsage: Number.isFinite guard on dailyBudget
4. [frontend] I-478 — #analysisOut aria-label+aria-readonly; #commitBreakdown aria-label
5-8. [quality_tests] cycle161-coverage.test.js — 4 tests

## Stats
- 3553 tests at cycle start
