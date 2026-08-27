# Cycle 199 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 199 (performance+business_logic BANNED C197+C198+C199)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | 0 | BANNED (C197+C198) |
| business_logic | 5 | 0 | BANNED (C197+C198) |
| ux_accessibility | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-35 — repertoire:readFile: add .db/.sqlite/.sqlite3/.db3 to _BLOCKED_FILE_EXT; add .npmrc/.yarnrc/.netrc to _BLOCKED_FILE_NAME
2. [security] S-36 — lifecycle:list: add typeFilter.length <= 64 length cap before regex test
3. [backend] I-579 — _piStaticCache.delete(dir) in orchestra:install and orchestra:play to flush stale installed/hasLogs after state change
4. [frontend] I-580 — shortcutsModal: save _scmPrevFocus=document.activeElement on open, restore focus on Escape close
5. [quality_tests] T-59 — test C199: S-35 blocked file extensions + blocked file names in repertoire:readFile
6. [quality_tests] T-60 — test C199: S-36 typeFilter length cap in lifecycle:list
7. [quality_tests] T-61 — test C199: I-579 _piStaticCache.delete in orchestra:install + orchestra:play
8. [quality_tests] T-62 — test C199: I-580 shortcutsModal _scmPrevFocus save + restore on Escape

## Stats
- 3765 tests at cycle start
