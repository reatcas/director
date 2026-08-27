# Cycle 173 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 173 (backend BANNED: 3 consecutive)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 4 | 0/4 |
| security | 20 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| backend | 5 | BANNED | — |
| frontend | 5 | 0 | SKIP |
| business_logic | 5 | 0 | SKIP |
| data_db | 5 | 0 | SKIP |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] S-01 — atriles:save: add color field CSS-safe validation
2. [security] S-02 — orchestra:writeConfig: add control-char guard to quietFlags + version
3. [performance] P-04 — snapshotMixer: ISO string cutoff (avoid new Date() allocs per filter)
4. [ux_accessibility] I-524 — modal close (closeSettings/closeAbout/Escape): restore focus to trigger btn
5. [quality_tests] T-01 — test S-01: atriles:save rejects invalid color values
6. [quality_tests] T-02 — test S-02: writeConfig rejects control chars in quietFlags/version
7. [quality_tests] T-03 — test P-04: snapshotMixer uses ISO cutoff string
8. [quality_tests] T-04 — test I-524: settingsModal/aboutModal close restores focus

## Stats
- 3621 tests at cycle start (quality_tests ALLOWED — streak broken at C172)
- atriles:save validates name/path/description/id/icon but NOT color → CSS injection via buildMixRibbon/setProperty
- orchestra:writeConfig: quietFlags and version lack control-char guard (model/modelComplex have it)
- snapshotMixer: hist.filter(h => new Date(h.ts).getTime() >= cutoffMs) → N Date allocs per snapshot
- modal close (closeSettings, closeAbout, Escape, backdrop click) → no focus restore to trigger button
