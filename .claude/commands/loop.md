# /loop — orchestra session

Follow CLAUDE.md. Mission: INCREMENTAL PROGRESS.

## ANTI-HALLUCINATION
⚠️ Commits verified externally. HEAD unchanged=FAILURE. Fake hashes=backoff+penalty.
1. `▸ ✔` ONLY after real `git commit` succeeded. Hash from tool output, never typed.
2. No fabricated output. Need info→use tool.
3. Can't work→PENDING.md+EXIT. No fake docs/patterns.

## BOOT
1. Emit `▸ [boot] sesión iniciada`. Read workspace files (orchestra.json, PLAN.md, DECISIONS.md, PENDING.md, ROADMAP.md, PRODUCT_DIRECTIVE.md, BLUEPRINT.md, A11Y_TREE.md, DB_SCHEMA.md, CYCLE_LEARNINGS.md).
2. **PRODUCT GATE**: Count unchecked ROADMAP features (all priorities). >0→`▸ [boot] PRODUCT MODE — N pendientes`.
   **TEST GATE**: Run verification gate. Fails→`▸ [boot] TESTS RED` — fix first.
3. Plan from MIXER BUDGET. Exhausted→`backlog-generator`.

## STATUS (<90 chars, Spanish)
`▸ [boot] sesión iniciada` | `▸ ▶ [cat] unit — goal` | `▸ ✔ [cat] unit — hash` | `▸ ✕ unit — error` | `▸ ⚠ BLOCKED: reason` | `▸ ◼ Cycle N cerrado — COMPLIANCE product:A/P cat:A/P DRIFT:none TESTS:green|red`

## EXECUTION
1. `▸ ▶ [cat] unit — goal` 2. Code+test+commit via tools. 3. `git log -1 --format=%h`→`▸ ✔` 4. Update PLAN.md.

## STUCK
PENDING.md→`▸ ⚠ BLOCKED`→skip. ALL blocked→IMPROVEMENT MODE (see CLAUDE.md).

## IMPROVEMENT MODE
ENTRY: ALL ROADMAP done + tests green + <10 consecutive improvement cycles.
1. `git log -30` for category distribution. Category >2× budget→FROZEN.
2. Priority: red tests→security→broken features→test coverage→perf→UX→new features→tech debt.
3. Different category each cycle. Mechanical≤2 commits batched. High-impact>easy wins.
4. Write items to ROADMAP.md `## Improvements`, execute, commit.
5. `feat()`=new capabilities ONLY. i18n→`i18n()`. UUID→`security()`. CSS→`style()`.

## RULES
Auto-approve all. Never ask. Credentials missing→mock+PENDING.md. Caveman(`"caveman":true`): 200-token cap, batch all. Reviewer: product/security=mandatory, quality+gate≥10=skip. Never conclude, never wait.
