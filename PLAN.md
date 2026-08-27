# Cycle 137 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 137
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| security | 20 | 4 | 4/4 |
| backend | 5 | 1 | 1/1 |
| frontend | 5 | 1 | 1/1 |
| ux_accessibility | 5 | 1 | 1/1 |
| business_logic | 5 | 1 | 1/1 |
| quality_tests | 35 | FROZEN (136,137 implicit) | — |
| performance | 10 | FROZEN (28th) | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [security] I-364 — mixer:write: _VALID_CATS focus key whitelist (prevents __proto__ injection) ✅
2. [security] I-365 — mixer:saved:save: focus key whitelist + name control char rejection ✅
3. [security] I-366 — orchestra:writeConfig: agent validated vs AI_DEFAULTS, model max 256 chars, focus keys via _VALID_CATS ✅
4. [security] I-367 — lifecycle:add: full control char range [\x00-\x08\x0B\x0C\x0E-\x1F\x7F] on label+message (was NUL only) ✅
5. [backend] I-368 — auto-switch cfgPath: statSync size guard before readJSON ✅
6. [ux_accessibility] I-369 — compressionToggle + mixerHistoryToggle: aria-expanded="false" added ✅
7. [frontend] I-370 — shortcutsModal: aria-labelledby="shortcutsTitle", shortcutsTitle id on h2, dl role="list" ✅
8. [business_logic] I-371 — mixer:saved:save name: control char rejection (embedded in I-365) ✅

## Stats
- 3385 tests passing (was 3371 at cycle start)
- +14 net tests added this cycle
- All mixer focus writes now validated against known category set — no prototype pollution via unknown keys
- orchestra:writeConfig agent field validated against AI_DEFAULTS keys
- lifecycle:add label+message now reject full control char range, not just NUL
- auto-switch handler reads orchestra.json safely within 512KB guard
- compressionToggle and mixerHistoryToggle now announce collapsed/expanded state to screen readers
- shortcutsModal properly labeled by visible heading
