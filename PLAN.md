# Cycle 120 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 120
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 4/4 |
| security | 20 | 2 | 2/2 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| performance | 10 | FROZEN (11th consecutive) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] I-252 — test readFile sensitive file blocklist ✅
2. [quality_tests] I-253 — test BrowserWindow security flags ✅
3. [quality_tests] I-254 — test metrics:claude-usage caching ✅
4. [quality_tests] I-255 — test transport header landmark + cycle 119 regression ✅
5. [security] I-248 — repertoire:readFile: .env/.key/.pem/.cert/id_rsa/id_ed25519 blocklist ✅
6. [security] I-249 — BrowserWindow: contextIsolation=true, nodeIntegration=false, webSecurity=true ✅
7. [backend] I-250 — metrics:claude-usage: add metricsSet cache (2s TTL) ✅
8. [frontend] I-251 — transport header: role=banner + aria-label ✅

## Stats
- 3166 tests passing (was 3152 at cycle start)
- +14 net tests added this cycle
- Electron renderer now has contextIsolation + nodeIntegration disabled + webSecurity
- readFile now blocks access to credential files
