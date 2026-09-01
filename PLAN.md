# Cycle 234 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 234 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| ux_accessibility | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| performance | 10 | 0 | BAN (C232+C233 consecutive) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-73 — preload.js alertsConfig: no cfg shape guard; add plain-object + boolean-only validation per ADR-007
2. [security] S-74 — preload.js readIterLog: logPath param has no preload guard; add string + non-empty validation
3. [ux_accessibility] A-35 — cmd palette: #cmdInput missing aria-expanded + aria-activedescendant; add id to items; update on navigate
4. [business_logic] BL-14 — persistLifecycleEvent: type='unknown' events persist but are silently dropped by lifecycle:list filter (_LC_TYPES has no 'unknown'); return early instead
5. [backend] B-21 — metrics:roadmap-freshness: git log -1 measures whole-repo freshness, not ROADMAP.md-specific; add -- ROADMAP.md arg
6-8. [quality_tests] T-123 — cycle234-coverage.test.js: S-73 alertsConfig guard, S-74 readIterLog guard, A-35 cmd palette aria, BL-14 unknown type guard, B-21 git log fix

## Stats
- 4281 tests at cycle open
