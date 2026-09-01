# Cycle 233 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 233 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| business_logic | 5 | 0 | BAN (C231+C232 consecutive) |
| devops_infra | 0 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-66 — resource-scheduler.js sampleProcess(): use _cpuCache.count instead of os.cpus().length — redundant OS syscall on every 30s sample
2. [security] S-71 — export:session main.js line 1538: non-atomic fs.writeFileSync to JSON export violates ADR-002; fix with tmp+renameSync
3. [security] S-72 — preload.js lifecycleAdd: missing preload-boundary guards per ADR-007; add t/l/m type+length validation before IPC invoke
4. [ux_accessibility] A-34 — index.html usage-bar + renderer.js updateUsageBar(): add role="progressbar" aria-valuenow/min/max; update aria-valuenow dynamically
5. [backend] B-20 — orchestra:analyze main.js line 1590: non-atomic writeFileSync for analysis .txt; use tmp+renameSync for consistency
6-8. [quality_tests] T-122 — cycle233-coverage.test.js: P-66 cpuCache usage, S-71 atomic export, S-72 preload guard, A-34 progressbar role, B-20 atomic analyze

## Stats
- 4252 tests at cycle open
