---
name: backlog-generator
description: Product-first cycle builder. Invoke at cycle close or plan dry. ROADMAP first, quality fills remainder only.
---

# Backlog Generator v5 — product-first, mixer-enforced

Quality=infinite (always more tests/coverage/polish). Without hard cap→drift to pure polishing. Fix: `product` weight=MINIMUM FLOOR, not just another category.

## Step 1 — Refresh ROADMAP.md
Run `roadmap-sync` if ANY: missing | >10 cycles stale | count unchanged 5+ cycles | stats differ >20% from ORCHESTRA_REPORT | product/quality ratio <30% for 3+ cycles (ghost document).

## Step 2 — Read MIXER, compute budget
Read `.claude/orchestra.json`. Drift check: if `product` or `quality_tests` changed ≥20pts vs PLAN.md header→abandon remaining quality units, recompose NOW.

### Formula (BINDING)
```
total = 8 units/cycle

product weight = MINIMUM % of units for ROADMAP.md items (NOT competing)

A) product_units = ceil(focus.product/100 × total)  [if ROADMAP has P0/P1]
   ROADMAP empty → product_units = 0
B) remaining = total - product_units
   Non-product categories share remaining by weight ratio. w=0→SKIP.

product:90 + P0 exists → ceil(7.2)=8 → ALL product, 0 quality
product:70 + P0 exists → ceil(5.6)=6 product, 2 quality
product:70 + ROADMAP empty → 0 product, 8 quality
```

### Product unit = MUST produce ≥1:
- New migration | New endpoint/handler | New UI component/view | New user-visible capability

### NOT product (even if touches product code):
Tests for existing code | Refactor without new capability | i18n existing | Docs | CI/CD

**Anti-drift**: about to test code you didn't change this cycle? STOP=quality unit.

### Category→source
|Cat|Source|Note|
|---|------|----|
|`product`|ROADMAP.md P0→P1|FLOOR, not competing|
|`backend`|AUDIT_LOG refactors|NOT new features=product|
|`frontend`|AUDIT_LOG refactors|NOT new features=product|
|`business_logic`|Domain refactors|—|
|`security`|AUDIT_LOG+deps|—|
|`quality_tests`|Tests THIS cycle's code only|Cap 80%. w=0→ZERO tests|
|`devops_infra`|CI/CD/deploy|—|
|`performance`|AUDIT_LOG perf|—|
|`data_db`|Schema cleanup/indexes|NOT new migrations=product|
|`i18n`|THIS cycle's screens only|—|

### MIXER BUDGET in PLAN.md (mandatory)
```
## MIXER BUDGET — Cycle N (PRODUCT MODE: X P0 pendientes)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| product (FLOOR) | 90 | 8 | 0/8 |
| security | 10 | 0 | SKIP |
| quality  | 0  | 0 | SKIP |
Total: 8 — 100% producto
```
Table=law. Category done→STOP. PRODUCT MODE→emit: `▸ [boot] PRODUCT MODE — N P0, X/Y producto`

## Step 3 — Fill units
1. **Product FIRST** → P0→P1. Each brief MUST: cite ROADMAP ID (F-XX), name files (migration/handler/component), state acceptance. Vague items→run `roadmap-sync` first. Empty→roadmap-sync.
2. **PENDING.md blockers** → interleave with blocked category.
3. **Quality** → from sources above. THIS cycle's code only unless AUDIT_LOG flags older.
4. **w=0→SKIP.** No "just a quick fix".
5. **NEVER backfill product slots with quality.** Early finish→next ROADMAP item.

## Step 4 — Efficiency
Pattern reuse (DECISIONS.md). Parallelize backend/frontend. Right-size tests (getter=0, auth/money=full). Batch similar endpoints.

## Step 5 — Tag + enforce
Every unit: `### [product] Feature X` — untagged=rejected.
Cycle close→compliance line: `▸ ◼ Cycle N cerrado — COMPLIANCE product:A/P ... DRIFT:none|cat+N`
Drift→violation→correct next cycle. Never idle→re-read ROADMAP+mixer.
