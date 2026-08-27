# Cycle 121 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 121
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 4 | 4/4 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| data_db | 5 | 1 | 1/1 |
| quality_tests | 35 | FROZEN (3rd: 118,119,120) | — |
| performance | 10 | FROZEN (12th) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-257 — will-navigate handler on win.webContents: block non-file:// URLs ✅
2. [security] I-258 — global app.on('web-contents-created') will-navigate + deny popups ✅
3. [security] I-259 — evict claude-usage cache on orchestra:play ✅
4. [security] I-260 — evict claude-usage cache on orchestra:fine ✅
5. [backend] I-261 — notes:read: stat.size > 512KB guard before readFileSync ✅
6. [frontend] I-262 — aside#rack + main#stage landmark aria-labels (es) ✅
7. [ux_accessibility] I-263 — dropzone: role=region + aria-label ✅
8. [data_db] I-264 — mixer:saved:save: cap at 100 mixes per project ✅

## Stats
- 3183 tests passing (was 3166 at cycle start)
- +17 net tests added this cycle
- Electron renderer now fully locked: will-navigate blocked, popups denied globally
- notes:read protected from large file reads
- mixer:saved capped at 100 entries
