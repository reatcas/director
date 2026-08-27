# Cycle 155 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 155
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| ux_accessibility | 5 | 3 | 0/3 |
| business_logic | 5 | 3 | 0/3 |
| data_db | 5 | 2 | 0/2 |
| security | 20 | BANNED (3rd consecutive would be 153+154+155) | — |
| backend | 5 | BANNED | — |
| frontend | 5 | BANNED | — |
| quality_tests | 35 | BANNED | — |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [ux_accessibility] I-448 — project list ul: ArrowUp/ArrowDown keyboard navigation
2. [ux_accessibility] I-449 — mixer tablist: ArrowLeft/ArrowRight tab navigation
3. [ux_accessibility] I-450 — index.html #mixerStrips: role="group" + aria-label
4. [business_logic] I-451 — normalizeMixerValues: guard NaN focus values with Number.isFinite
5. [business_logic] I-452 — cachedProjects: filter to objects with string path
6. [business_logic] I-453 — refresh(): guard against non-array from director.list()
7. [data_db] I-454 — atriles:list: filter loaded data to valid objects
8. [data_db] I-455 — lifecycle:list: filter events to valid objects

## Stats
- 3509 tests at cycle start
