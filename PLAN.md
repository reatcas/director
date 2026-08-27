# Cycle 196 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 196 (security BANNED C193+C194+C195, quality_tests BANNED C193+C194+C195)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| performance | 10 | 3 | 0/3 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BANNED (C193+C194+C195) |
| quality_tests | 35 | 0 | BANNED (C193+C194+C195) |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-31 — readOrchJson(dir, fb): 2s TTL cache for orchestra.json reads across metrics handlers
2. [performance] P-32 — getClaudeUsage iter-log scan: readdirSync withFileTypes to filter isFile() before name check
3. [performance] P-33 — _projectInfoCache: 5s TTL Map cache for projectInfo(dir) result to reduce repeated FS work on repertoire:list polls
4. [backend] I-575 — lifecycle:list: add `before` ISO timestamp cursor for paginated history loading
5. [frontend] I-576 — loadLifecycleTimeline: show "+ N anteriores" hint when unfilteredTotal > events.length
6. [business_logic] D-06 — lifecycle:add: validate type against _LC_TYPES allowlist
7. [ux_accessibility] A-13 — #nodeGraphSection: role="img" → role="application" + tabindex="0" + aria-roledescription
8. [data_db] DB-01 — persistLifecycleEvent: reduce max cap 500→300; update clearLog trim to match

## Stats
- 3743 tests at cycle start
