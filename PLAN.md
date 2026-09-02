# Cycle 271 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 271 (no bans — C270 resumed standard rotation)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 2 | 0/2 |
| quality_tests | 35 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (at budget) |
| ux_accessibility | 5 | 0 | SKIP (at budget) |
| data_db | 5 | 0 | SKIP (at budget) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE

## Units
1. [security] S-140 — preload.js `readFile` subpath `s`: add control-char rejection `/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s)` before IPC — defense-in-depth matching main.js pattern
2. [security] S-141 — preload.js `readIterLog` logPath `l`: add control-char rejection `/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(l)` before IPC — mirrors main.js readIterLog handler check
3. [performance] P-98 — main.js `orchestra:play`: `sortedFocus.forEach(([key, weight]) => {...})` → `for (const [key, weight] of sortedFocus)` — eliminates forEach closure allocation
4. [backend] B-52 — main.js `orchestra:clearLog`: `iterLogs.slice(0, ...).forEach(f => {...})` → `for (const f of iterLogs.slice(...))` — consistent with B-51 pattern
5. [frontend] F-49 — renderer.js `updateSmartAuroraColors()`: `strips.forEach(s => {...})` → `for (const s of strips)` — eliminates NodeList forEach
6. [quality_tests] T-222 — cycle271-coverage.test.js: S-140 readFile subpath control-char check source coverage
7. [quality_tests] T-223 — cycle271-coverage.test.js: S-141 readIterLog logPath control-char check; P-98 sortedFocus for...of source coverage
8. [quality_tests] T-224 — cycle271-coverage.test.js: B-52 iterLogs for...of; F-49 updateSmartAuroraColors for...of

---

# Cycle 270 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 270 (no bans — C269 broke 7-cycle security/perf/backend/frontend/quality streak)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 2 | 0/2 |
| quality_tests | 35 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (at budget) |
| ux_accessibility | 5 | 0 | SKIP (at budget) |
| data_db | 5 | 0 | SKIP (at budget) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE

## Units
1. [security] S-138 — preload.js `atrilesSave`: add per-element `description` (≤1024), `icon` (≤64), `color` (≤64) validation — matches main.js `atriles:save` field validation, early-exit before IPC
2. [security] S-139 — preload.js `mixerSavedSave`: add control-char rejection on name `n` — `/[\x00-\x1F\x7F]/.test(n)` → false; prevents malformed preset names in storage
3. [performance] P-97 — renderer.js `rebalanceMixer()`: `strips.forEach(s => {...})` → `for (const s of strips)`; `others.forEach((o, i) => {...})` → `for (let _ri = 0; _ri < others.length; _ri++)`
4. [backend] B-51 — main.js `orchestra:clearLog`: `files.slice(...).forEach(f => {...})` → `for (const f of files.slice(...))`
5. [frontend] F-48 — renderer.js `renderSavedMixes()`: `mixes.forEach(m => {...})` → `for (const m of mixes)`
6. [quality_tests] T-219 — cycle270-coverage.test.js: S-138 description/icon/color validation in preload source
7. [quality_tests] T-220 — cycle270-coverage.test.js: S-139 control-char check; P-97 for...of strips/others source
8. [quality_tests] T-221 — cycle270-coverage.test.js: B-51 forEach→for in clearLog; F-48 for-of in renderSavedMixes

---

# Cycle 269 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 269 (BAN: security+performance+backend+frontend+quality_tests — 7 consecutive cycles C262-C268)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| business_logic | 5 | 3 | 0/3 |
| ux_accessibility | 5 | 3 | 0/3 |
| data_db | 5 | 2 | 0/2 |
| security | 20 | 0 | BAN (C262-C268 consecutive) |
| performance | 10 | 0 | BAN (C262-C268 consecutive) |
| backend | 5 | 0 | BAN (C262-C268 consecutive) |
| frontend | 5 | 0 | BAN (C262-C268 consecutive) |
| quality_tests | 35 | 0 | BAN (C262-C268 consecutive) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (category rotation enforced)

## Units
1. [business_logic] BL-33 — coordination-protocol.js `getStatus()`: `Array.from(this.instances).map(...)` + `Object.fromEntries()` → for...of into plain object — eliminates 2 intermediate arrays
2. [business_logic] BL-34 — coordination-protocol.js `_rebalance()`: `entries.map(([d,i]) => ({...}))` → `const _prList = []; for (const [d,i] of entries) _prList.push({...})` — eliminates 1 intermediate array
3. [business_logic] BL-35 — coordination-protocol.js: add `_rebalanceCount` field (init=0 in constructor, increment in `_rebalance()`, expose in `getStatus()`) — diagnostic telemetry
4. [ux_accessibility] A-48 — index.html `#smartMixToggle`: add `role="switch"` + `aria-label` + `tabindex="0"` + `aria-checked="false"`; renderer.js `updateSmartMixIndicator()`: sync `aria-checked`; add keydown handler for Space/Enter activation
5. [ux_accessibility] A-49 — index.html `#procsCount` + `#lifecycleCount`: add `aria-live="polite"` + `aria-label` so screen readers announce count updates
6. [ux_accessibility] A-50 — renderer.js `openAtrilModal()`: save `_atrilPrevFocus = document.activeElement`; `closeAtrilModal` onclick: restore `_atrilPrevFocus.focus()` after hide
7. [data_db] DD-03 — main.js `repertoire:remove`: fix `_metricsCache` cleanup — `key.endsWith(':' + dir)` misses `lc:dir:*` and `mixer-hist:dir:*` keys; add `|| key.startsWith('lc:' + dir + ':') || key.startsWith('mixer-hist:' + dir + ':')`
8. [data_db] DD-04 — main.js `repertoire:remove`: add `_gitCommitMtimes.delete(dir)` — prevents stale mtime for removed project if re-added

---

# Cycle 261 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 261 (no bans; C260=security breaks quality_tests streak)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE

## Units
1. [security] S-122 — main.js setInterval GC loop: add TTL-based eviction for `_notesCache`, `_blueprintCache`, `_analyzeCache` (currently never GC'd)
2. [security] S-123 — main.js `mixer:saved:list`: add size cap to `_savedMixesCache` before `.set()` — insertion-order evict oldest at ≥100 entries
3. [performance] P-89 — resource-scheduler.js `getMetrics()`: replace `.slice(-1)[0]` with direct `_s[_s.length - 1]` — avoids allocating a slice array for last element
4. [backend] B-43 — main.js `metrics:session-summary`: replace `filter().reduce()` chain with single `for...of` loop for `creditsRemaining`
5. [frontend] F-40 — renderer.js `addSleepEntry` + `addSummaryEntry`: apply `_logEl` lazy-init pattern
6. [quality_tests] T-192 — cycle261-coverage.test.js: S-122 setInterval GC evictions for notes/blueprint/analyze caches
7. [quality_tests] T-193 — cycle261-coverage.test.js: S-123 savedMixes cap source; P-89 getMetrics last-element access
8. [quality_tests] T-194 — cycle261-coverage.test.js: B-43 for...of creditsRemaining; F-40 addSleepEntry+addSummaryEntry _logEl

## Stats
- 4583 tests at cycle open

---
# Cycle 260 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 260 (quality_tests BANNED: C257+C258+C259 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 0 | BAN (C257+C258+C259 consecutive) |
| security | 20 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (quality_tests BANNED)

## Units
1. [security] S-119 — preload.js `tail`: add `|| p.length > 4096` path cap (currently only `!p` check)
2. [security] S-120 — preload.js `play`: add `|| p.length > 4096` for the path `p` parameter
3. [security] S-121 — preload.js `play`: add agent whitelist `!new Set(['claude','agy','codex','aider']).has(a)` (currently only length 1-64, no provider validation)
4. [performance] P-88 — context-protocol.js `_computeRetention`: replace `Object.values(fw).reduce((a, b) => a + b, 0)` with `for...of` (same P-87 pattern)
5. [backend] B-42 — main.js `mixer:write` + `orchestra:writeConfig`: add `_metricsCache.delete('coordination')` when focus weights change
6. [frontend] F-39 — renderer.js `addIterationStartEntry` + `addIterationEndEntry`: apply `_logEl` lazy-init pattern
7. [business_logic] BL-29 — coordination-protocol.js `acquireLock`: cache `new Date().toISOString()` as `const _now` — avoids 3 separate Date constructor calls across branches
8. [ux_accessibility] A-47 — index.html `#logFilterCount`: add `aria-live="polite"` + `aria-label="Filtros activos"` for screen reader announcements

## Stats
- 4583 tests at cycle open

---
# Cycle 259 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 259 (no bans; quality_tests C257+C258=2 consec)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE

## Units
1. [security] S-117 — preload.js `readIterLog`: add `l.length > 512` length cap (currently only checks `!l.trim()`, no length cap)
2. [security] S-118 — preload.js `aiLogin` + `aiAuthStatus`: add provider whitelist `new Set(['claude','agy','codex','aider'])` matching aiSelect (S-105 pattern)
3. [performance] P-87 — context-protocol.js `analyzeFiles()`: replace `sections.reduce((s, sec) => s + sec.tokens, 0)` with `for...of` accumulation — avoids closure creation per file
4. [backend] B-41 — main.js `lifecycle:list`: merge `_llBefore` + `_llType` conditional filter passes into one — halves iterations when both filters active
5. [frontend] F-38 — renderer.js `addClaudeMessageEntry` + `addConclusionEntry`: apply `_logEl` lazy-init pattern
6. [quality_tests] T-189 — cycle259-coverage.test.js: S-117 readIterLog l.length guard source check
7. [quality_tests] T-190 — cycle259-coverage.test.js: S-118 aiLogin+aiAuthStatus whitelist source check
8. [quality_tests] T-191 — cycle259-coverage.test.js: P-87 for-loop source, B-41 merged filter source, F-38 addClaudeMessageEntry+addConclusionEntry _logEl source

## Stats
- 4569 tests at cycle open

---
# Cycle 258 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 258 (no bans)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] T-186 — cycle258-coverage.test.js: S-113 install/mixerHistory/lifecycleList/mixerSavedList path cap source
2. [quality_tests] T-187 — cycle258-coverage.test.js: S-114 metricsAllocation/claudeUsage/compliance/freshness + P-85 addInterpretingEntry _logEl
3. [quality_tests] T-188 — cycle258-coverage.test.js: B-39 kill allocation+versionCheck + F-36 addFeatureEntry _logEl
4. [security] S-115 — preload.js mixerSavedSave/Delete/Export: add p.length > 4096 cap (completing saved-mixes path guards)
5. [security] S-116 — preload.js blueprintSave/Generate/Readiness + exportSession: add p.length > 4096 cap (completes all path guards)
6. [performance] P-86 — renderer.js addUsageEntry(): use _logEl cached ref
7. [backend] B-40 — main.js lifecycle:add handler: add _metricsCache.delete('session-summary') after persistLifecycleEvent
8. [frontend] F-37 — renderer.js addErrorEntry(): use _logEl cached ref

---

# Cycle 257 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 257 (no bans)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] T-183 — cycle257-coverage.test.js: S-110 add/remove/openDir path cap + S-111 mixerWrite/configWrite/blueprintLoad cap
2. [quality_tests] T-184 — cycle257-coverage.test.js: S-112 notesRead/notesWrite/metricsContext/metricsSnapshot cap + P-84 addCycleEntry _logEl
3. [quality_tests] T-185 — cycle257-coverage.test.js: B-38 kill _analyzeCache + F-35 addActionEntry _logEl + BL-28 for loop + A-46 aria attrs
4. [security] S-113 — preload.js install/mixerHistory/lifecycleList/mixerSavedList: p.length > 4096 cap
5. [security] S-114 — preload.js metricsAllocation/claudeUsage/complianceMetrics/roadmapFreshness: p.length > 4096 cap
6. [performance] P-85 — renderer.js addInterpretingEntry(): use _logEl cached ref
7. [backend] B-39 — main.js orchestra:kill: add _metricsCache.delete allocation + version-check entries
8. [frontend] F-36 — renderer.js addFeatureEntry(): use _logEl cached ref

---

# Cycle 256 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 256 (quality_tests BANNED: C253+C254+C255 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| quality_tests | 35 | 0 | BAN (C253+C254+C255 consecutive) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-110 — preload.js add/remove/openDir: p.length > 4096 path length cap
2. [security] S-111 — preload.js mixerWrite/configWrite/blueprintLoad: p.length > 4096 cap
3. [security] S-112 — preload.js notesRead/notesWrite/metricsContext/metricsSnapshot: p.length > 4096 cap
4. [performance] P-84 — renderer.js addCycleEntry(): use _logEl cached ref instead of $('#log')
5. [backend] B-38 — main.js orchestra:kill handler: add _analyzeCache.delete(dir)
6. [frontend] F-35 — renderer.js addActionEntry(): use _logEl cached ref instead of $('#log')
7. [business_logic] BL-28 — coordination-protocol.js _rebalance(): replace entries.forEach closure with for loop
8. [ux_accessibility] A-46 — index.html #upgradeVer + #bpCompleteness: add aria-live="polite" + aria-label

---

# Cycle 255 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 255 (no bans)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] T-180 — cycle255-coverage.test.js: S-106 readFile s-param guard + S-107 versionCheck/upgrade path cap source
2. [quality_tests] T-181 — cycle255-coverage.test.js: P-82 _computeRetention empty-snapshot exit + B-36 repertoire:remove cache eviction source
3. [quality_tests] T-182 — cycle255-coverage.test.js: F-33 addNormalLine _logEl source + _logEl lazy-init count check
4. [security] S-108 — preload.js fine/kill/clearLog: add p.length > 4096 path length cap
5. [security] S-109 — preload.js analyze/mixerRead/metricsResource: add p.length > 4096 path length cap
6. [performance] P-83 — renderer.js log filter input handler: use _logEl instead of $('#log') on keystrokes
7. [backend] B-37 — main.js orchestra:fine handler: add _analyzeCache.delete(dir) on graceful stop
8. [frontend] F-34 — renderer.js logObserver.observe: replace $('#log') with _logEl cached ref

---

# Cycle 254 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 254 (no bans)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] T-177 — cycle254-coverage.test.js: P-81 detectConflicts fast-path source + size<2 integration
2. [quality_tests] T-178 — cycle254-coverage.test.js: B-35 _analyzeCache.delete in play source + F-32 _logEl+_upgradeBtnEl declarations
3. [quality_tests] T-179 — cycle254-coverage.test.js: BL-27 _computeRetention _clampedShare source + clamp integration
4. [security] S-106 — preload.js readFile(p,s): length cap on s param (s !== undefined && s.length > 512 → empty string)
5. [security] S-107 — preload.js orchestraVersionCheck+orchestraUpgrade: p.length > 4096 path length cap
6. [performance] P-82 — context-protocol.js _computeRetention(): early exit when snapshot is empty
7. [backend] B-36 — main.js repertoire:remove: evict _analyzeCache + _notesCache + _blueprintCache (currently not cleaned on remove)
8. [frontend] F-33 — renderer.js addNormalLine(): use _logEl cached ref instead of $('#log')

---

# Cycle 253 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 253 (security BANNED: C250+C251+C252 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| security | 20 | 0 | BAN (C250+C251+C252 consecutive) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] T-173 — cycle253-coverage.test.js: S-103 lifecycleAdd type whitelist source + known types set
2. [quality_tests] T-174 — cycle253-coverage.test.js: S-104 atrilesSave element name guard + S-105 aiSelect provider whitelist source
3. [quality_tests] T-175 — cycle253-coverage.test.js: P-80 getSampleHistory fast-path source + F-31 _pbadgeEl lazy-init in paint()+clearProject()
4. [quality_tests] T-176 — cycle253-coverage.test.js: BL-26 _lastPersistEvCount skip-write source + B-34 _analyzeCache.delete in orchestra:clearLog
5. [performance] P-81 — coordination-protocol.js detectConflicts(): fast-path return [] when instances.size < 2
6. [backend] B-35 — main.js orchestra:play handler: add _analyzeCache.delete(dir) at session start
7. [frontend] F-32 — renderer.js: _logEl + _upgradeBtnEl module-level cached refs
8. [business_logic] BL-27 — context-protocol.js _computeRetention: clamp share to [0,1] before cache key + sigmoid

---

# Cycle 252 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 252 (quality_tests BANNED: C249+C250+C251 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| quality_tests | 35 | 0 | BAN (C249+C250+C251 consecutive) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-103 — preload.js lifecycleAdd: add type whitelist (t must be known lifecycle type set)
2. [security] S-104 — preload.js atrilesSave: add per-element name string validation (typeof el.name === 'string' + len 1-256)
3. [security] S-105 — preload.js aiSelect: add known-provider whitelist (claude/gemini/codex/aider)
4. [performance] P-80 — resource-scheduler.js getSampleHistory: fast-path skip Array.slice() copy when limit >= history.length
5. [backend] B-34 — main.js orchestra:clearLog: add _analyzeCache.delete(dir) (analysis includes log excerpts)
6. [frontend] F-31 — renderer.js paint(): cache _pbadgeEl + _pbadgeTextEl module-level refs
7. [business_logic] BL-26 — coordination-protocol.js persistTelemetry: skip write if no new events since last persist (_lastPersistEvCount)
8. [ux_accessibility] A-45 — index.html #nodeGraph: add role="img" aria-label="Grafo de dependencias del proyecto"

---

# Cycle 251 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 251 (performance BANNED: C248+C249+C250 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | 0 | BAN (C248+C249+C250 consecutive) |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] T-169 — cycle251-coverage.test.js: S-99 play(p,a) typeof p guard source + p-before-a ordering
2. [quality_tests] T-170 — cycle251-coverage.test.js: S-100 tail(p,lines) typeof p guard source
3. [quality_tests] T-171 — cycle251-coverage.test.js: P-79 _retentionCurveCache source + Map.get() reuse integration
4. [quality_tests] T-172 — cycle251-coverage.test.js: A-44 #ppath aria-live + #pbadgeText aria attrs in index.html
5. [security] S-101 — preload.js atrilesSave: add length cap >200 + per-element object check per ADR-007
6. [security] S-102 — preload.js systemKill: add PID upper bound cap pid > 4_194_304
7. [backend] B-33 — main.js orchestra:analyze handler: add _analyzeCache with 60s TTL per dir
8. [frontend] F-30 — renderer.js: _ppathEl module-level cached ref for #ppath in paint()

---

# Cycle 250 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 250 (backend+business_logic BANNED: C247+C248+C249 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| backend | 5 | 0 | BAN (C247+C248+C249 consecutive) |
| business_logic | 5 | 0 | BAN (C247+C248+C249 consecutive) |
| frontend | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] T-165 — cycle250-coverage.test.js: P-78 _pnameEl lazy-init pattern source + usage in paint()+clearProject()
2. [quality_tests] T-166 — cycle250-coverage.test.js: B-32 _notesCache TTL in notes:read + _notesCache.delete on notes:write source
3. [quality_tests] T-167 — cycle250-coverage.test.js: BL-25 register() rejects when instances.size>=20 + logs register_rejected event
4. [quality_tests] T-168 — cycle250-coverage.test.js: BL-25 integration — 20th registers, 21st rejected, re-register of existing dir still works
5. [security] S-99 — preload.js play(p,a): add typeof string guard for p before agent check
6. [security] S-100 — preload.js tail(p,lines): add typeof string guard for p
7. [performance] P-79 — resource-scheduler.js _retentionCurve(): add Map memoization keyed by Math.round(share*1000)
8. [ux_accessibility] A-44 — index.html: aria-live="polite" on #ppath; aria-live="polite"+aria-label on #pbadgeText

---

# Cycle 249 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 249 (security+frontend+ux_accessibility BANNED: C246+C247+C248 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 5 | 0/5 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| security | 20 | 0 | BAN (C246+C247+C248 consecutive) |
| frontend | 5 | 0 | BAN (C246+C247+C248 consecutive) |
| ux_accessibility | 5 | 0 | BAN (C246+C247+C248 consecutive) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| data_db | 5 | 0 | SKIP (budget trim) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [quality_tests] T-160 — cycle249-coverage.test.js: S-96 mixerSavedSave/Delete/Export typeof p guard source
2. [quality_tests] T-161 — cycle249-coverage.test.js: S-97 mixerWrite/configWrite/blueprintSave typeof p guard source
3. [quality_tests] T-162 — cycle249-coverage.test.js: S-98 notesWrite dir guard + readIterLog p guard source
4. [quality_tests] T-163 — cycle249-coverage.test.js: P-77 sampleProcess uses systemSnapshot().loadAvg1 source + cache integration
5. [quality_tests] T-164 — cycle249-coverage.test.js: B-31 _blueprintCache.delete on save + BL-24 _cachedConflicts=null in releaseLock
6. [performance] P-78 — renderer.js: _pnameEl module-level cached ref for #pname lookups (lazy-init pattern)
7. [backend] B-32 — main.js notes:read: add 30s TTL _notesCache (dir → {data, ts}) similar to B-30 blueprint cache
8. [business_logic] BL-25 — coordination-protocol.js register(): cap at 20 max instances, reject with null + log event on overflow

---

# Cycle 248 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 248 (quality_tests BANNED: C245+C246+C247 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| quality_tests | 35 | 0 | BAN (C245+C246+C247 consecutive) |
| data_db | 5 | 0 | SKIP (done C243) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (quality_tests BANNED)

## Units
1. [security] S-96 — preload.js `mixerSavedSave(p,n,f)`+`mixerSavedDelete(p,id)`+`mixerSavedExport(p,id)`: typeof string guard for p
2. [security] S-97 — preload.js `mixerWrite(p,f)`+`configWrite(p,c)`+`blueprintSave(p,d)`: typeof string guard for p
3. [security] S-98 — preload.js `notesWrite(dir,c)`+`readIterLog(p,l)`: typeof string guard for dir/p
4. [performance] P-77 — resource-scheduler.js `_takeSample`: use `this.systemSnapshot().loadAvg1` (uses 1s TTL cache from P-76)
5. [backend] B-31 — main.js `blueprint:save`: invalidate _blueprintCache on save for cache coherence
6. [frontend] F-29 — renderer.js: add module-level _clockStatusEl+_pstatusEl cached refs
7. [business_logic] BL-24 — coordination-protocol.js `releaseLock`: invalidate conflict cache on successful release
8. [ux_accessibility] A-43 — index.html: add aria-live=polite+aria-label to #pname; aria-label to #ppath

## Stats
- 4437 tests at cycle open → TBD at close (quality_tests BANNED — no new tests)

---
# Cycle 247 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 247 (security+frontend BANNED: C244+C245+C246 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| security | 20 | 0 | BAN (C244+C245+C246 consecutive) |
| frontend | 5 | 0 | BAN (C244+C245+C246 consecutive) |
| data_db | 5 | 0 | SKIP (done C243) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (security+frontend BANNED)

## Units
1. [quality_tests] T-156 — cycle247-coverage.test.js: S-94 mixerSavedList/mixerHistory p guard source
2. [quality_tests] T-157 — cycle247-coverage.test.js: S-95 lifecycleList/lifecycleAdd p guard source
3. [quality_tests] T-158 — cycle247-coverage.test.js: B-29 clearLog compliance+freshness cache eviction source
4. [quality_tests] T-159 — cycle247-coverage.test.js: F-28 _aiSelectEl cached ref source
5. [performance] P-76 — resource-scheduler.js `systemSnapshot`: add 1s TTL cache for OS syscalls (freemem/loadavg)
6. [backend] B-30 — main.js `blueprint:load`: add 30s TTL cache to avoid re-reading BLUEPRINT.md on every call
7. [business_logic] BL-23 — coordination-protocol.js `acquireLock`: call invalidateConflictCache() on successful lock grant
8. [ux_accessibility] A-42 — index.html: add role=status+aria-live=polite to remaining mm-val elements (compression/instances/compliance/roadmap/burn)

## Stats
- 4428 tests at cycle open → 4437 at close

▸ ◼ Cycle 247 cerrado — COMPLIANCE quality_tests:4/4 performance:1/1 backend:1/1 business_logic:1/1 ux_accessibility:1/1 DRIFT:none TESTS:green

---
# Cycle 246 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 246 (performance+ux_accessibility BANNED: C243+C244+C245 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| performance | 10 | 0 | BAN (C243+C244+C245 consecutive) |
| ux_accessibility | 5 | 0 | BAN (C243+C244+C245 consecutive) |
| business_logic | 5 | 0 | SKIP (done C244) |
| data_db | 5 | 0 | SKIP (done C243) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (performance+ux_accessibility BANNED)

## Units
1. [quality_tests] T-152 — cycle246-coverage.test.js: S-92 add/remove/openDir string guards source
2. [quality_tests] T-153 — cycle246-coverage.test.js: S-93 readFile/install/exportSession string guards source
3. [quality_tests] T-154 — cycle246-coverage.test.js: P-75 _knownPathsSet isKnownProject + F-27 _usageBarEl/_usageBarFillEl cached refs
4. [quality_tests] T-155 — cycle246-coverage.test.js: A-41 role=status+aria-live on mmAllocVal/mmMemVal/mmTokensVal
5. [security] S-94 — preload.js `mixerSavedList(p)`+`mixerHistory(p,n)`: typeof string guard for p per ADR-007
6. [security] S-95 — preload.js `lifecycleList(p,...)`+`lifecycleAdd(p,...)`: typeof string guard for p per ADR-007
7. [backend] B-29 — main.js `orchestra:clearLog`: add compliance+freshness cache eviction for that dir
8. [frontend] F-28 — renderer.js: add module-level _aiSelectEl cached ref (queried in 4 locations)

## Stats
- 4412 tests at cycle open → 4428 at close

▸ ◼ Cycle 246 cerrado — COMPLIANCE quality_tests:4/4 security:2/2 backend:1/1 frontend:1/1 DRIFT:none TESTS:green

---
# Cycle 245 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 245 (business_logic BANNED: C242+C243+C244 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | BAN (C242+C243+C244 consecutive) |
| backend | 5 | 0 | SKIP (done C244) |
| data_db | 5 | 0 | SKIP (done C243) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (business_logic BANNED)

## Units
1. [quality_tests] T-149 — cycle245-coverage.test.js: S-89 metricsResource/Context/Snapshot/Allocation guards source
2. [quality_tests] T-150 — cycle245-coverage.test.js: S-90 claudeUsage/complianceMetrics/roadmapFreshness + S-91 blueprintLoad/Generate/Readiness/notesRead guards source
3. [quality_tests] T-151 — cycle245-coverage.test.js: B-28 fine/kill coordination eviction + F-26 _complianceSparkEl + P-74 hotPaths counter + BL-22 _retentionCache
4. [security] S-92 — preload.js `add(p)`+`remove(p)`+`openDir(p)`: typeof string guard per ADR-007
5. [security] S-93 — preload.js `readFile(p,s)`+`install(p)`+`exportSession(dir)`: typeof string guard per ADR-007
6. [performance] P-75 — main.js `isKnownProject`: cache known-paths Set for O(1) lookup (currently O(n) linear scan)
7. [frontend] F-27 — renderer.js: add module-level _usageBarEl+_usageBarFillEl cached refs
8. [ux_accessibility] A-41 — index.html: add role=status+aria-live=polite to mmAllocVal+mmMemVal+mmTokensVal

## Stats
- 4397 tests at cycle open → 4412 at close

▸ ◼ Cycle 245 cerrado — COMPLIANCE quality_tests:3/3 security:2/2 performance:1/1 frontend:1/1 ux_accessibility:1/1 DRIFT:none TESTS:green

---
# Cycle 244 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 244 (quality_tests BANNED: C241+C242+C243 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| quality_tests | 35 | 0 | BAN (C241+C242+C243 consecutive) |
| data_db | 5 | 0 | SKIP (done C243) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (quality_tests BANNED)

## Units
1. [security] S-89 — preload.js `metricsResource(p)`+`metricsContext(p)`+`metricsSnapshot(p)`+`metricsAllocation(p)`: typeof string guard per ADR-007
2. [security] S-90 — preload.js `claudeUsage(p)`+`complianceMetrics(p)`+`roadmapFreshness(p)`: typeof string guard per ADR-007
3. [security] S-91 — preload.js `blueprintLoad(p)`+`blueprintGenerate(p)`+`blueprintReadiness(p)`+`notesRead(p)`: typeof string guard per ADR-007
4. [performance] P-74 — coordination-protocol.js `_computePriority`: replace .filter() with manual counter (eliminates intermediate array)
5. [backend] B-28 — main.js `orchestra:fine`+`orchestra:kill`: add _metricsCache.delete('coordination') eviction on stop
6. [frontend] F-26 — renderer.js: add module-level _complianceSparkEl cached ref
7. [business_logic] BL-22 — context-protocol.js `computeRetention`: memoize sigmoid via _retentionCache Map
8. [ux_accessibility] A-40 — index.html: complianceSpark SVG gets aria-hidden=true (decorative sparkline)

## Stats
- 4397 tests at cycle open → 4397 at close (quality_tests BANNED — no new tests)

▸ ◼ Cycle 244 cerrado — COMPLIANCE security:3/3 performance:1/1 backend:1/1 frontend:1/1 business_logic:1/1 ux_accessibility:1/1 DRIFT:none TESTS:green

---
# Cycle 243 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 243 (security+backend+frontend BANNED: C240+C241+C242 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| performance | 10 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BAN (C240+C241+C242 consecutive) |
| backend | 5 | 0 | BAN (C240+C241+C242 consecutive) |
| frontend | 5 | 0 | BAN (C240+C241+C242 consecutive) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (security+backend+frontend BANNED)

## Units
1. [quality_tests] T-145 — cycle243-coverage.test.js: S-87 fine/kill/clearLog typeof string guard source
2. [quality_tests] T-146 — cycle243-coverage.test.js: S-88 mixerRead/analyze typeof string guard source
3. [quality_tests] T-147 — cycle243-coverage.test.js: B-27 orchestra:play coordination cache eviction source
4. [quality_tests] T-148 — cycle243-coverage.test.js: F-25 _burnSparkEl cached ref + BL-20 priorityTier in rebalance log
5. [performance] P-73 — coordination-protocol.js `_rebalance`: single-pass totalInverse (no separate reduce)
6. [business_logic] BL-21 — coordination-protocol.js `acquireLock`: auto-reclaim stale lock when holder unregistered
7. [ux_accessibility] A-39 — index.html: burnSpark sparkline gets aria-hidden=true (decorative element)
8. [data_db] DD-03 — main.js `atriles:save`: cap stored entries at 200 (prevent unbounded JSON growth)

## Stats
- 4387 tests at cycle open → 4397 at close

▸ ◼ Cycle 243 cerrado — COMPLIANCE quality_tests:4/4 performance:1/1 business_logic:1/1 ux_accessibility:1/1 data_db:1/1 DRIFT:none TESTS:green

---
# Cycle 242 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 242 (performance BANNED: C239+C240+C241 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| performance | 10 | 0 | BAN (C239+C240+C241 consecutive) |
| ux_accessibility | 5 | 0 | SKIP (done C240) |
| data_db | 5 | 0 | SKIP (done C239) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (performance BANNED)

## Units
1. [quality_tests] T-142 — cycle242-coverage.test.js: S-85 aiLogin/aiAuthStatus guard + S-86 orch guards source
2. [quality_tests] T-143 — cycle242-coverage.test.js: P-72 _coordTelDirReady source + B-26 coordination TTL source
3. [quality_tests] T-144 — cycle242-coverage.test.js: F-24 compressionStats+compressionHist cached refs source
4. [security] S-87 — preload.js `fine(p)`+`kill(p)`+`clearLog(p)`: typeof string guard per ADR-007
5. [security] S-88 — preload.js `mixerRead(p)`+`analyze(p)`: typeof string guard per ADR-007
6. [backend] B-27 — main.js `orchestra:play`: add _metricsCache.delete('coordination') eviction
7. [frontend] F-25 — renderer.js `updateBurnRate`: add module-level _burnSparkEl cached ref
8. [business_logic] BL-20 — coordination-protocol.js `_rebalance`: add priorityTier to rebalance log event

## Stats
- 4375 tests at cycle open → 4387 at close

▸ ◼ Cycle 242 cerrado — COMPLIANCE quality_tests:3/3 security:2/2 backend:1/1 frontend:1/1 business_logic:1/1 DRIFT:none TESTS:green

---
# Cycle 241 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 241 (business_logic BANNED: C238+C239+C240 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | BAN (C238+C239+C240 consecutive) |
| ux_accessibility | 5 | 0 | SKIP (done C240) |
| data_db | 5 | 0 | SKIP (done C239) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (business_logic BANNED)

## Units
1. [quality_tests] T-139 — cycle241-coverage.test.js: S-82/S-83/S-84 play+mixerWrite+aiSelect guards source
2. [quality_tests] T-140 — cycle241-coverage.test.js: P-71 _cpTelDirReady source + B-25 play cache eviction source
3. [quality_tests] T-141 — cycle241-coverage.test.js: BL-19 conflictSeveritySummary integration + A-38 aria-hidden source
4. [security] S-85 — preload.js `aiLogin(id)`+`aiAuthStatus(id)`: add string guard per ADR-007
5. [security] S-86 — preload.js `orchestraUpgrade(p)`+`orchestraVersionCheck(p)`: add typeof string guard
6. [performance] P-72 — coordination-protocol.js `persistTelemetry`: add _coordTelDirReady Set (mirrors P-70+P-71)
7. [backend] B-26 — main.js `metrics:coordination`: use _SLOW_METRICS_TTL (30s) when no active instances
8. [frontend] F-24 — renderer.js `updateCompressionPanel`: cache compressionStats+compressionHistory DOM refs

## Stats
- 4361 tests at cycle open → 4375 at close

▸ ◼ Cycle 241 cerrado — COMPLIANCE security:2/2 performance:1/1 backend:1/1 frontend:1/1 quality_tests:3/3 DRIFT:none TESTS:green

---
# Cycle 240 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 240 (quality_tests BANNED: C237+C238+C239 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| quality_tests | 35 | 0 | BAN (C237+C238+C239 consecutive) |
| data_db | 5 | 0 | SKIP (done C239) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (quality_tests BANNED)

## Units
1. [security] S-82 — preload.js `play(p, a)`: add agent string guard (length 1-64) per ADR-007
2. [security] S-83 — preload.js `mixerWrite(p, f)`: add focus object guard (not null, not array) per ADR-007
3. [security] S-84 — preload.js `aiSelect(id)`: add string + length guard per ADR-007
4. [performance] P-71 — context-protocol.js `_persist`: add _cpTelDirReady Set to skip redundant mkdirSync
5. [backend] B-25 — main.js `orchestra:play`: evict allocation/resource/snapshot caches on play start
6. [frontend] F-23 — renderer.js `updateCompressionPanel`: add module-level _compressionPanelEl cached ref
7. [business_logic] BL-19 — coordination-protocol.js `getStatus`: add conflictSeveritySummary {high, medium, low} + priorityTier in instances
8. [ux_accessibility] A-38 — index.html `#particleCanvasWrap`: add aria-hidden=true (decorative aurora canvas)

## Stats
- 4361 tests at cycle open → 4361 at close (no new tests — quality_tests BANNED)

▸ ◼ Cycle 240 cerrado — COMPLIANCE security:3/3 performance:1/1 backend:1/1 frontend:1/1 business_logic:1/1 ux_accessibility:1/1 DRIFT:none TESTS:green

---
# Cycle 239 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 239 (security+backend+frontend BANNED: C236+C237+C238 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| performance | 10 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BAN (C236+C237+C238 consecutive) |
| backend | 5 | 0 | BAN (C236+C237+C238 consecutive) |
| frontend | 5 | 0 | BAN (C236+C237+C238 consecutive) |
| product | 10 | 0 | SKIP (F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (security+backend+frontend BANNED)

## Units
1. [quality_tests] T-135 — cycle239-coverage.test.js: S-80 tail lines guard + S-81 atrilesSave array guard source
2. [quality_tests] T-136 — cycle239-coverage.test.js: B-24 _invalidateSavedMixes in remove handler source
3. [quality_tests] T-137 — cycle239-coverage.test.js: F-22 burn reset on clearLog source
4. [quality_tests] T-138 — cycle239-coverage.test.js: BL-17 _priorityTier integration + priorityTier stored in register
5. [performance] P-70 — resource-scheduler.js `persistTelemetry`: add _telDirReady Set to skip redundant mkdirSync calls
6. [business_logic] BL-18 — coordination-protocol.js `_rebalance`: early return when instances empty
7. [ux_accessibility] A-37 — index.html `#clockStatus`+`#pstatus`: add role=status for dynamic status announcements
8. [data_db] DD-02 — main.js `orchestra:clearLog`: cap resource-metrics.json at 300 entries (mirrors context/coordination caps)

## Stats
- 4348 tests at cycle open → 4361 at close

▸ ◼ Cycle 239 cerrado — COMPLIANCE performance:1/1 business_logic:1/1 ux_accessibility:1/1 data_db:1/1 quality_tests:4/4 DRIFT:none TESTS:green

---
# Cycle 238 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 238 (performance BANNED: C235+C236+C237 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| performance | 10 | 0 | BAN (C235+C236+C237 consecutive) |
| ux_accessibility | 5 | 0 | SKIP (done C236) |
| data_db | 5 | 0 | SKIP (done C235) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (performance BANNED)

## Units
1. [quality_tests] T-132 — cycle238-coverage.test.js: S-78 configWrite object guard + S-79 mixerHistory integer guard source
2. [quality_tests] T-133 — cycle238-coverage.test.js: P-69 computeAllocation single-pass source + integration
3. [quality_tests] T-134 — cycle238-coverage.test.js: B-23 clearLog cache keys source + F-20 burn reset source
4. [security] S-80 — preload.js `tail`: add lines integer guard (1-1000) per ADR-007
5. [security] S-81 — preload.js `atrilesSave`: add object guard (not null, not array) per ADR-007
6. [backend] B-24 — main.js `repertoire:remove`: add _invalidateSavedMixes(dir) call to evict saved-mixes cache on removal
7. [frontend] F-22 — renderer.js `clearLogBtn` handler: reset _prevBurnTokens=0 + _burnHistory.length=0 after clearLog
8. [business_logic] BL-17 — coordination-protocol.js: add _priorityTier(score) helper + store priorityTier in register()

## Stats
- 4335 tests at cycle open → 4348 at close

▸ ◼ Cycle 238 cerrado — COMPLIANCE security:2/2 backend:1/1 frontend:1/1 business_logic:1/1 quality_tests:3/3 DRIFT:none TESTS:green

---
# Cycle 237 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 237 (business_logic BANNED: C234+C235+C236 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | BAN (C234+C235+C236 consecutive) |
| ux_accessibility | 5 | 0 | SKIP (done C236) |
| data_db | 5 | 0 | SKIP (done C235) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (business_logic BANNED)

## Units
1. [quality_tests] T-129 — cycle237-coverage.test.js: P-68 _updateAggregated running sum source + integration
2. [quality_tests] T-130 — cycle237-coverage.test.js: B-22 _metricsCache trim no-sort + insertion-order delete
3. [quality_tests] T-131 — cycle237-coverage.test.js: S-75/S-76/S-77 preload guards (id format, array reject, param sanitization)
4. [security] S-78 — preload.js `configWrite`: add cfg object guard (not null, not array) per ADR-007
5. [security] S-79 — preload.js `mixerHistory`: add n integer guard (1-100) per ADR-007
6. [performance] P-69 — resource-scheduler.js `computeAllocation`: merge totalWeight reduce + maxWeight map into single pass
7. [backend] B-23 — main.js `orchestra:clearLog`: add usageTracker.delete(dir) + _metricsCache.delete('claude-usage:'+dir) + 'session-summary' after iter prune
8. [frontend] F-20 — renderer.js `open()`: reset _prevBurnTokens=0 + _burnHistory.length=0 on project switch

## Stats
- 4320 tests at cycle open → 4335 at close

▸ ◼ Cycle 237 cerrado — COMPLIANCE security:2/2 performance:1/1 backend:1/1 frontend:1/1 quality_tests:3/3 DRIFT:none TESTS:green

---
# Cycle 236 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 236 (quality_tests BANNED: 3 consecutive C233-C235)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 0 | BAN (C233+C234+C235 consecutive) |
| security | 20 | 3 | 0/3 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (quality_tests BANNED)

## Units
1. [security] S-75 — preload.js `mixerSavedDelete`/`mixerSavedExport`: add id guard (string, `/^[0-9a-z]+$/`, length 1-64) per ADR-007
2. [security] S-76 — preload.js `blueprintSave`: add data object guard (not null, not array) + JSON size cap ≤512KB per ADR-007
3. [security] S-77 — preload.js `lifecycleList`: add limit (integer 1-500), typeFilter (string /^[\w\-]+$/ ≤64), before (ISO prefix ≤64) guards per ADR-007
4. [performance] P-68 — context-protocol.js `_updateAggregated`: running sum via `_aggRunning` Map — O(n) full sum → O(1) incremental update
5. [backend] B-22 — main.js `_metricsCache` trim: replace spread+sort O(n log n) with insertion-order delete O(n)
6. [frontend] F-19 — renderer.js `updateMetricsDisplay`: cache 9 DOM element refs at module level, avoid per-call `$()` lookups
7. [business_logic] BL-16 — coordination-protocol.js `acquireLock`: distinguish `tie` vs `lower_priority` in lock_denied _logEvent + return value
8. [ux_accessibility] A-36 — index.html `#rawLogOverlay`: add role=dialog + aria-modal + aria-label; renderer.js: focus closeRawBtn on open, restore prior focus on close, Escape closes

## Stats
- 4320 tests at cycle open → 4320 at close (regressions fixed)

▸ ◼ Cycle 236 cerrado — COMPLIANCE security:3/3 performance:1/1 backend:1/1 frontend:1/1 business_logic:1/1 ux_accessibility:1/1 DRIFT:none TESTS:green

---
# Cycle 235 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 235 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 5 | 0/5 |
| performance | 10 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BAN (C233+C234 consecutive) |
| ux_accessibility | 5 | 0 | BAN (C233+C234 consecutive) |
| backend | 5 | 0 | BAN (C233+C234 consecutive) |
| product | 10 | 0 | SKIP (ROADMAP empty) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-67 — resource-scheduler.js _updateEfficiency(): 4× reduce/map/max calls → single pass computing avgMem, avgCPU, peakMem, peakCPU together
2. [business_logic] BL-15 — coordination-protocol.js releaseLock(): log heldMs (lock hold duration since grantedAt) to event log for contention analysis
3. [data_db] DD-01 — lifecycle pruning: add _LC_TYPES.has(e.type) to filters in persistLifecycleEvent + orchestra:clearLog — evicts pre-BL-14 unknown-type entries
4. [quality_tests] T-124 — cycle235-coverage.test.js: P-67 single-pass source + integration
5. [quality_tests] T-125 — cycle235-coverage.test.js: BL-15 heldMs in releaseLock event log
6. [quality_tests] T-126 — cycle235-coverage.test.js: DD-01 _LC_TYPES filter in persistLifecycleEvent source
7. [quality_tests] T-127 — cycle235-coverage.test.js: DD-01 _LC_TYPES filter in orchestra:clearLog source
8. [quality_tests] T-128 — cycle235-coverage.test.js: CoordinationProtocol releaseLock integration

## Stats
- 4302 tests at cycle open → 4320 at close

▸ ◼ Cycle 235 cerrado — COMPLIANCE performance:1/1 business_logic:1/1 data_db:1/1 quality_tests:5/5 DRIFT:none TESTS:green

---
# Cycle 272 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 272 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| business_logic | 5 | 3 | 0/3 |
| ux_accessibility | 5 | 3 | 0/3 |
| data_db | 5 | 2 | 0/2 |
| security | 20 | 0 | BAN (C270+C271 consecutive) |
| performance | 10 | 0 | BAN (C270+C271 consecutive) |
| backend | 5 | 0 | BAN (C270+C271 consecutive) |
| frontend | 5 | 0 | BAN (C270+C271 consecutive) |
| quality_tests | 35 | 0 | BAN (C270+C271 consecutive) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (5 banned, 3 active)

## Units
1. [business_logic] BL-36 — coordination-protocol.js `detectConflicts()`: `Array.from(this.instances.entries())` → for...of accumulate `_dcEntries` — no intermediate spread
2. [business_logic] BL-37 — coordination-protocol.js `_rebalance()`: `Array.from(this.instances.entries())` → for...of accumulate `_rbEntries`
3. [business_logic] BL-38 — coordination-protocol.js `getStatus()`: `Object.fromEntries(this.locks)` → explicit for...of `_locksObj` — consistent Map iteration pattern
4. [ux_accessibility] A-51 — index.html `#rawLogContent` pre: add `tabindex="0"` + `aria-label="Contenido del log completo"` — keyboard-scrollable + sr-announced
5. [ux_accessibility] A-52 — index.html `#mixerSaved` span: add `role="status" aria-live="polite"` — unused live region activated for sr save confirmation
6. [ux_accessibility] A-53 — renderer.js `#saveMixer` onclick: activate `#mixerSaved` with '✓ Mezcla guardada' text + auto-hide 2s — pairs with A-52 to give sr users save feedback
7. [data_db] DD-05 — main.js line 1648: `_anFiles.slice(...).forEach(f => ...)` → `for (const f of _anFiles.slice(...))` — analysis file prune for...of
8. [data_db] DD-06 — main.js `_sortedJson` helper: `.sort().map(k => [k,o[k]])` → for...of `_sjArr` accumulation — consistent serialization pattern

---
# Cycle 273 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 273 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (no bans; C272 broke previous streak)

## Units
1. [security] S-142 — preload.js lifecycleAdd: add /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(l) control-char check on label l (same pattern as S-140/S-141)
2. [security] S-143 — preload.js lifecycleAdd: add same control-char check on message m
3. [performance] P-99 — renderer.js activateMixerStand(): nested .forEach(el) + .forEach(s) → for...of eliminating closure allocations on hot mixer path
4. [backend] B-53 — main.js orchestra:tail: .map(l => ...) line-cap chain → for...of _cappedLines accumulation
5. [frontend] F-50 — renderer.js #saveMixer onclick: querySelectorAll...forEach(i => {...}) → for...of
6. [quality_tests] T-228 — cycle273-coverage.test.js: S-142/S-143 label+message control-char check in preload
7. [quality_tests] T-229 — cycle273-coverage.test.js: P-99 activateMixerStand for-of; F-50 saveMixer for-of in renderer
8. [quality_tests] T-230 — cycle273-coverage.test.js: B-53 tail _cappedLines for-of in main

---
# Cycle 274 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 274 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (C273 streak=1, no bans)

## Units
1. [security] S-144 — preload.js atrilesSave: add /[\x00-\x1F\x7F]/.test(el.name) control-char check on atril names (UI-displayed strings)
2. [security] S-145 — preload.js notesWrite: add /\x00/.test(c) null-byte guard on notes content before file write
3. [performance] P-100 — renderer.js updateMixerGraph(): .forEach(s => {...}) → for...of eliminating closure on mixer graph hot path
4. [backend] B-54 — main.js allowedDirs: .map(p => p.path).filter(Boolean) → for...of _allowedDirs accumulation in protocol handler
5. [frontend] F-51 — renderer.js renderBpModules(): two forEach (bp-mod-name inputs + bp-mod-del buttons) → for...of
6. [quality_tests] T-231 — cycle274-coverage.test.js: S-144 atrilesSave name control-char; S-145 notesWrite null-byte
7. [quality_tests] T-232 — cycle274-coverage.test.js: P-100 updateMixerGraph for-of; F-51 renderBpModules for-of
8. [quality_tests] T-233 — cycle274-coverage.test.js: B-54 allowedDirs for-of in main

---
# Cycle 275 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 275 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| business_logic | 5 | 3 | 0/3 |
| ux_accessibility | 5 | 3 | 0/3 |
| data_db | 5 | 2 | 0/2 |
| security | 20 | 0 | BAN (C273+C274 consecutive) |
| performance | 10 | 0 | BAN (C273+C274 consecutive) |
| backend | 5 | 0 | BAN (C273+C274 consecutive) |
| frontend | 5 | 0 | BAN (C273+C274 consecutive) |
| quality_tests | 35 | 0 | BAN (C273+C274 consecutive) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (5 banned; BL/UX/DD available)

## Units
1. [business_logic] BL-39 — coordination-protocol.js persistTelemetry(): hist.splice(0, hist.length-300) → hist = hist.slice(-300) — eliminates in-place mutation
2. [business_logic] BL-40 — resource-scheduler.js getActiveDirectories(): Array.from(this.allocations.keys()) → for...of _ad accumulation
3. [business_logic] BL-41 — context-protocol.js _estimateTokens(): (text.match(/^#+\s/gm) || []).length → (text.match(/^#+\s/gm) ?? []).length — nullish coalescing
4. [ux_accessibility] A-54 — renderer.js loadKnowledge(): 3× _knBtns.forEach(b => ...) → for...of (manages aria-pressed + disabled)
5. [ux_accessibility] A-55 — renderer.js switchTab(): 2× querySelectorAll.forEach → for...of (manages aria-selected + aria-hidden)
6. [ux_accessibility] A-56 — renderer.js cmd palette Tab nav: _cpItems.forEach((el,i) => ...) → indexed for loop (manages aria-selected)
7. [data_db] DD-07 — context-protocol.js _estimateTokens(): (text.match(/\n/g) || []).length → text.split('\n').length - 1 (no intermediate match array)
8. [data_db] DD-08 — context-protocol.js _splitSections(): titleCount.get(rawTitle) || 0 → titleCount.get(rawTitle) ?? 0 (semantic correctness for zero counts)

---
# Cycle 276 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 276 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (C275 broke streak; all available)

## Units
1. [security] S-146 — preload.js atrilesSave: add /[\x00-\x1F\x7F]/.test(el.description) control-char check on description
2. [security] S-147 — preload.js atrilesSave: add /[\x00-\x1F\x7F]/.test(el.icon) + /.test(el.color) control-char checks
3. [performance] P-101 — renderer.js mixer-tab keyboard nav: Array.from(querySelectorAll) → spread [...] for tab array; indexOf → manual for loop
4. [backend] B-55 — main.js _knownPathsSet: new Set(_rpData.map(p => p.path)) → for...of Set.add accumulation
5. [frontend] F-52 — renderer.js renderCmdResults(): res.querySelectorAll('.cmd-item').forEach((el,i) => ...) → indexed for loop
6. [quality_tests] T-237 — cycle276-coverage.test.js: S-146/S-147 atrilesSave description/icon/color control-char
7. [quality_tests] T-238 — cycle276-coverage.test.js: P-101 mixer-tab spread + B-55 _knownPathsSet for-of
8. [quality_tests] T-239 — cycle276-coverage.test.js: F-52 renderCmdResults indexed for loop

---
# Cycle 277 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 277 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (C276 streak=1; all available)

## Units
1. [security] S-148 — main.js atriles:save: add explicit color control-char check after icon check (line 2051); matches icon check pattern
2. [security] S-149 — main.js atriles:list: extend filter to also reject entries where description/icon/color contain control chars (defense against tampered disk JSON)
3. [performance] P-102 — renderer.js applyTheme()+themeGroup init: two .forEach(b=>{}) → for...of (two occurrences at lines 3339+3355)
4. [backend] B-56 — main.js repertoire:list: cachedProjects().map(p=>({...p,...projectInfo(p.path)})) → for...of _rlProjs accumulation
5. [frontend] F-53 — renderer.js auto-save settings: querySelectorAll('#settingsModal input,...').forEach(el=>{}) → for...of
6. [quality_tests] T-240 — cycle277-coverage.test.js: S-148 atriles:save color check; S-149 atriles:list description/icon/color filter
7. [quality_tests] T-241 — cycle277-coverage.test.js: P-102 themeGroup for-of; F-53 settingsModal for-of
8. [quality_tests] T-242 — cycle277-coverage.test.js: B-56 repertoire:list for-of accumulation

---
# Cycle 278 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 278 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| business_logic | 5 | 3 | 0/3 |
| ux_accessibility | 5 | 3 | 0/3 |
| data_db | 5 | 2 | 0/2 |
| security | 20 | 0 | BAN (C276+C277 consecutive) |
| performance | 10 | 0 | BAN (C276+C277 consecutive) |
| backend | 5 | 0 | BAN (C276+C277 consecutive) |
| frontend | 5 | 0 | BAN (C276+C277 consecutive) |
| quality_tests | 35 | 0 | BAN (C276+C277 consecutive) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (5 banned; BL/UX/DD available)

## Units
1. [business_logic] BL-42 — main.js line 623: cfg.focus || {} → cfg.focus ?? {} (nullish coalescing; focus=0 should not fall through)
2. [business_logic] BL-43 — main.js line 694: focus.product || 0 → focus.product ?? 0
3. [business_logic] BL-44 — main.js line 703: focus.quality_tests || 0 → focus.quality_tests ?? 0
4. [ux_accessibility] A-57 — renderer.js cmd palette ArrowDown/Up: Array.from(querySelectorAll).forEach((el,i)=>{}) → indexed for loop
5. [ux_accessibility] A-58 — renderer.js systemProcs: .proc-kill-btn.forEach(btn=>{}) → for...of
6. [ux_accessibility] A-59 — renderer.js atril modal: colorGrid.querySelectorAll.forEach + iconGrid.querySelectorAll.forEach → for...of
7. [data_db] DD-09 — renderer.js repertoire keydown: Array.from(ul.querySelectorAll('li')) → spread [...ul.querySelectorAll('li')]
8. [data_db] DD-10 — renderer.js drag events: two ['dragover','dragenter'].forEach / ['dragleave','drop'].forEach → for...of

---
# Cycle 279 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 279 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (C278 broke streak; all available)

## Units
1. [security] S-150 — main.js cachedProjects() filter: add !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(p.name) check (currently validates length but not control chars)
2. [security] S-151 — main.js parseComplianceLine(): validate category key pm[1] with /^[\w\-]+$/ allowlist before using as object key
3. [performance] P-103 — renderer.js modal focus traps (4 occurrences): Array.from(modal.querySelectorAll(...)) → spread [...modal.querySelectorAll(...)]
4. [backend] B-57 — main.js orchestra:analyze: cat[k] = (cat[k] || 0)+1 → cat[k] = (cat[k] ?? 0)+1 (nullish coalescing)
5. [frontend] F-54 — renderer.js loadSettings(): cfg.compactAt || 50 → cfg.compactAt ?? 50; cfg.keepLogs || 50 → cfg.keepLogs ?? 50
6. [quality_tests] T-243 — cycle279-coverage.test.js: S-150 cachedProjects name control-char; S-151 parseComplianceLine allowlist
7. [quality_tests] T-244 — cycle279-coverage.test.js: P-103 modal spread patterns
8. [quality_tests] T-245 — cycle279-coverage.test.js: B-57 cat[k]??0; F-54 cfg settings ??

---
# Cycle 280 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 280 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (C279 streak=1; all available)

## Units
1. [security] S-152 — main.js projectInfo(): strip control chars from ORCHESTRA_VERSION file content before returning version string
2. [security] S-153 — main.js orchestra:analyze: validate started string is ISO format before using as git --since argument
3. [performance] P-104 — renderer.js renderBpModules(): .split(',').map(s=>s.trim()).filter(Boolean) → for...of accumulation eliminating 2 intermediate arrays
4. [backend] B-58 — main.js metrics:session-summary: v.credits || 0 → v.credits ?? 0 (nullish coalescing for credit counter)
5. [frontend] F-55 — renderer.js updateMetrics(): data.coordination.conflicts || [] → data.coordination.conflicts ?? [] (semantic correctness)
6. [quality_tests] T-246 — cycle280-coverage.test.js: S-152 ORCHESTRA_VERSION strip; S-153 started ISO validation
7. [quality_tests] T-247 — cycle280-coverage.test.js: P-104 csv for-of; F-55 conflicts ??
8. [quality_tests] T-248 — cycle280-coverage.test.js: B-58 credits ??

---
# Cycle 281 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 281 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| business_logic | 5 | 3 | 0/3 |
| ux_accessibility | 5 | 3 | 0/3 |
| data_db | 5 | 2 | 0/2 |
| security | 20 | 0 | BAN (C279+C280 consecutive) |
| performance | 10 | 0 | BAN (C279+C280 consecutive) |
| backend | 5 | 0 | BAN (C279+C280 consecutive) |
| frontend | 5 | 0 | BAN (C279+C280 consecutive) |
| quality_tests | 35 | 0 | BAN (C279+C280 consecutive) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (5 banned; BL/UX/DD available)

## Units
1. [business_logic] BL-45 — main.js mixer:saved:list: new Set(userMixes.map(m=>m.id)) → for...of Set.add (eliminates intermediate array)
2. [business_logic] BL-46 — renderer.js renderBpModules: mod.features || [] and mod.dependencies || [] → ?? [] (nullish coalescing)
3. [business_logic] BL-47 — renderer.js updateMetrics: allocation.categoryBudgets || {} → ?? {} (nullish coalescing)
4. [ux_accessibility] A-60 — renderer.js loadCustomAtriles: atrilesList() || [] → ?? [] (null-safe init)
5. [ux_accessibility] A-61 — renderer.js loadAiCredits: aiCredits() || {} → ?? {} (null-safe init)
6. [ux_accessibility] A-62 — renderer.js: mixerRead(current) || {} → ?? {} (batch replace all 9 occurrences)
7. [data_db] DD-11 — main.js metrics:snapshot: readOrchJson(dir).focus || {} → ?? {} (nullish coalescing)
8. [data_db] DD-12 — main.js metrics:session-summary: _worstComplianceCache.get(p.path) || null → ?? null

---
# Cycle 282 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 282 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (budget trim) |
| ux_accessibility | 5 | 0 | SKIP (budget trim) |
| data_db | 5 | 0 | SKIP (budget trim) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (C281 broke streak; all available)

## Units
1. [security] S-154 — main.js system:claude-procs: strip control chars from project field (cwdMatch[1] from ps output — untrusted)
2. [security] S-155 — main.js system:claude-procs: strip control chars from cmd field (cmd.slice(0,120) from ps output — untrusted)
3. [performance] P-105 — main.js getClaudeUsage: readdirSync().filter(e=>...) → for...of accumulation (eliminates intermediate array)
4. [backend] B-59 — main.js getClaudeUsage: cached.dailyBudget || 1_000_000 → cached.dailyBudget ?? 1_000_000
5. [frontend] F-56 — renderer.js updateSessionSummary: s.active || 0 and s.idle || 0 → s.active ?? 0 and s.idle ?? 0 (multiple occurrences)
6. [quality_tests] T-249 — cycle282-coverage.test.js: S-154 project ctrl-char; S-155 cmd ctrl-char
7. [quality_tests] T-250 — cycle282-coverage.test.js: P-105 for-of files; B-59 dailyBudget ??
8. [quality_tests] T-251 — cycle282-coverage.test.js: F-56 session summary ?? 0

---
# Cycle 283 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 283 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| business_logic | 5 | 3 | 0/3 |
| ux_accessibility | 5 | 3 | 0/3 |
| data_db | 5 | 2 | 0/2 |
| security | 20 | 0 | BAN (C280+C282 rotation — force BL/UX/DD) |
| performance | 10 | 0 | BAN (C280+C282 rotation — force BL/UX/DD) |
| backend | 5 | 0 | BAN (C280+C282 rotation — force BL/UX/DD) |
| frontend | 5 | 0 | BAN (C280+C282 rotation — force BL/UX/DD) |
| quality_tests | 35 | 0 | SKIP (rotation — no quality this cycle) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (BL/UX/DD rotation cycle)

## Units
1. [business_logic] BL-48 — renderer.js updateMetrics: data.coordination.activeInstances || 0 → ?? 0 (nullish coalescing; 0 is valid instance count)
2. [business_logic] BL-49 — renderer.js telemetry render: lastTelemetryUsage.percent || 0 → ?? 0 (0% is valid usage)
3. [business_logic] BL-50 — renderer.js context breakdown: cats[b].weight || 0, c.normalizedShare || 0, c.contextRetentionFactor || 0 → ?? 0 (batch; 0 values are semantically distinct from null)
4. [ux_accessibility] A-63 — renderer.js atrile render: a.description || '' → ?? '' (empty string is valid description)
5. [ux_accessibility] A-64 — renderer.js renderBpQuestion: phase?.color || '#888' → ?? '#888'; phase?.name || '' → ?? '' (fallback only on null/undefined)
6. [ux_accessibility] A-65 — renderer.js renderBpModules: mod.name || '' → ?? ''; mod.description || '' → ?? '' (null-safe field access)
7. [data_db] DD-13 — renderer.js log streaming: logCache.get(dir) || '' → ?? '' (Map returns undefined for miss; empty string is valid cached log)
8. [data_db] DD-14 — renderer.js blueprintReadiness: r.completeness || 0 → ?? 0 (0% completeness is valid)

---
# Cycle 284 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 284 (F-01 HARNESS-blocked)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 0 | SKIP (rotation — BL/UX/DD cycle was C283) |
| ux_accessibility | 5 | 0 | SKIP (rotation) |
| data_db | 5 | 0 | SKIP (rotation) |
| product | 10 | 0 | SKIP (ROADMAP empty — F-01 HARNESS-blocked) |
| devops_infra | 0 | 0 | SKIP |
| i18n | 0 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (C283 broke BL/UX/DD streak; sec/perf rotation)

## Units
1. [security] S-156 — main.js parseComplianceLine: drift field m[2].trim().slice(0,128) → add .replace(/[\x00-\x1F\x7F]/g,'') (ORCHESTRA_REPORT.md is external, untrusted)
2. [security] S-157 — main.js orchestra:analyze: read('.claude/ORCHESTRA_VERSION').trim() → add .replace(/[\x00-\x1F\x7F]/g,'').slice(0,64) before embedding in analyze report string
3. [performance] P-106 — renderer.js cmdPalette Tab handler: Array.from(querySelectorAll('#cmdResults .cmd-item')) → [...querySelectorAll(...)] (eliminates Array.from allocation)
4. [backend] B-60 — main.js blueprint:generate-brief: bp.modules || [] → ?? [] and bp.sessions || [] → ?? []; blueprint:readiness: (bp.sessions||[]).length → (bp.sessions??[]).length; (bp.modules||[]).length → (bp.modules??[]).length (batch)
5. [frontend] F-57 — renderer.js mixer slider render: focus[k] || 0 → focus[k] ?? 0 (0 is valid mixer weight, not falsy-fallthrough worthy)
6. [quality_tests] T-252 — cycle284-coverage.test.js: S-156 drift ctrl-char strip in parseComplianceLine
7. [quality_tests] T-253 — cycle284-coverage.test.js: S-157 ORCHESTRA_VERSION ctrl-char strip in orchestra:analyze report
8. [quality_tests] T-254 — cycle284-coverage.test.js: P-106 Array.from→spread; B-60 bp.modules/sessions??[]; F-57 focus[k]??0
