# Cycle 191 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 191 (performance BANNED C188+C189+C190)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | 0 | BANNED (C188+C189+C190) |
| business_logic | 5 | 0 | SKIP |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-23 — orchestra:writeConfig: add upper bound to claudeUsageBudget (max 100_000_000_000)
2. [security] S-24 — orchestra:readIterLog: narrow logPath to iter-*.log pattern to prevent path traversal
3. [backend] I-564 — blueprint:generate-brief: replace existsSync(roadmapPath) with statSync try/catch (2 calls)
4. [frontend] I-565 — loadKnowledge: reset _knCurrentFile to null after load completes (prevent ghost guard state)
5. [quality_tests] T-39 — test C191: S-23 claudeUsageBudget upper bound
6. [quality_tests] T-40 — test C191: S-24 readIterLog logPath pattern restriction
7. [quality_tests] T-41 — test C191: I-564 blueprint generateBrief statSync
8. [quality_tests] T-42 — test C191: I-565 loadKnowledge _knCurrentFile reset

## Stats
- 3723 tests at cycle start
