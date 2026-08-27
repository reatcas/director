# Cycle 105 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 105
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| quality_tests | 35 | 3 | 0/3 |
| backend | 10 | 2 | 0/2 |
| performance | 10 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| security | 20 | FROZEN (3rd consecutive) | — |
| frontend | 5 | FROZEN | — |
Total: 7 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] I-121 — replace readJSON(store()) with cachedProjects() in read-only paths ✅
2. [backend] I-122 — add isKnownProject to mixer:write, orchestra:writeConfig, clearLog, analyze ✅
3. [quality_tests] I-123 — test orchestra:analyze handler structure ✅
4. [quality_tests] I-124 — test alerts:config/read + mixer:read/write/writeConfig handlers ✅
5. [quality_tests] I-125 — test metrics:resource/context/snapshot/allocation handlers ✅
6. [backend] I-126 — add isKnownProject to remaining metrics + tail handlers ✅
7. [ux_accessibility] I-127 — aria-label + aria-valuetext on mixer sliders ✅

## Stats
- 2895 tests passing (was 2827 at cycle start)
- +68 tests added this cycle
- 14 more IPC handlers secured with isKnownProject
