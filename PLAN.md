# Cycle 192 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 192 (security BANNED C189+C190+C191, quality_tests BANNED C189+C190+C191)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| performance | 10 | 3 | 0/3 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BANNED (C189+C190+C191) |
| quality_tests | 35 | 0 | BANNED (C189+C190+C191) |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-26 — findLogo: replace existsSync(full) with statSync try/catch
2. [performance] P-27 — findLogo: replace existsSync(fp) with statSync try/catch (2 calls in pkg.json loop)
3. [performance] P-28 — projectInfo: replace has() existsSync helper with statSync try/catch
4. [backend] I-566 — copyDir: replace existsSync(d) with statSync try/catch
5. [frontend] I-567 — loadKnowledge: add aria-pressed state on knowledge tab buttons (active/inactive)
6. [business_logic] I-568 — orchestra:clearLog: prune old iter-*.log files (keep newest 200)
7. [ux_accessibility] A-14 — mixer history sparkline: add aria-live="off" and descriptive label on container
8. [data_db] D-05 — mixer:history: validate entries have ts/event/focus fields of correct types

## Stats
- 3727 tests at cycle start
