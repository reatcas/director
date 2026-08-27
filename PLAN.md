# Cycle 144 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 144
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | SKIP (proportional) | — |
| business_logic | 5 | SKIP (proportional) | — |
| data_db | 5 | SKIP (proportional) | — |
| performance | 10 | FROZEN (33rd) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-402 — isRunning(): try/catch + 64-byte size guard on PID read
2. [security] I-403 — copyDir(): size guard on CLAUDE.md readFileSync (1MB limit)
3. [backend] I-404 — lifecycle:list: add validated limit param (default 200, max 500)
4. [frontend] I-405 — cmdResults: aria-live="polite" to announce results to screen readers
5-8. [quality_tests] cycle144-coverage.test.js — 4 tests

## Stats
- 3435 tests passing at cycle start
