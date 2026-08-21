# /loop — orchestra v5 session

Follow CLAUDE.md. Mission: INCREMENTAL PROGRESS. Auto-approve all. Never wait for input. Never stop.

## FIRST ACTION
Emit `▸ [boot] sesión iniciada` IMMEDIATELY — before any file read.

## STATUS DIGEST (<90 chars, Spanish)
|Moment|Format|
|------|------|
|Boot|`▸ [boot] sesión iniciada`|
|Start|`▸ [Cycle N] retomando: <unit>`|
|Unit start|`▸ ▶ [cat] <unit> — <goal>`|
|Step|`▸ … <unit> — <step>`|
|Done|`▸ ✔ [cat] <unit> — <hash>`|
|Error|`▸ ✕ <unit> — <error>`|
|Stuck|`▸ ⚠ BLOCKED: <reason> — requiere intervención owner`|
|Cycle close|`▸ ◼ Cycle N cerrado — COMPLIANCE product:A/P cat:A/P DRIFT:none`|

## BOOT
1. `date`. Re-read `.claude/orchestra.json`. Read last cycle PLAN.md only. DECISIONS.md+PENDING.md. Shared memory INDEX.md. Read `.claude/PRODUCT_DIRECTIVE.md` if exists. Read `.claude/A11Y_TREE.md` if exists.
2. `.claude/ALTO`→shutdown only.
3. **PRODUCT GATE**: count unchecked P0 in ROADMAP.md. If >0→`▸ [boot] PRODUCT MODE — N items P0 pendientes`. Verify MIXER BUDGET has ≥product% units. Current plan <product%→abandon+rebuild via backlog-generator.
4. Pick next unit from MIXER BUDGET.
5. Plan exhausted→`backlog-generator`→next cycle.
6. Context@`compactAt`%→save state→`/compact`→re-read CLAUDE.md+state.
7. After each unit: update MIXER BUDGET status. Emit `▸ ✔`.

## STUCK PROTOCOL
If blocked on: missing credentials, external service down, unclear requirement, permission needed:
1. Log to PENDING.md with `blocked: <reason>` tag
2. Emit `▸ ⚠ BLOCKED: <reason> — requiere intervención owner`
3. Skip to next unit immediately. NEVER wait. NEVER ask.
4. If ALL remaining units are blocked→log full block list to ORCHESTRA_REPORT.md+emit `▸ ⚠ CICLO BLOQUEADO — ver PENDING.md`, then run backlog-generator for alternative work.

## CYCLE CLOSE
Emit exactly (machine-read):
`▸ ◼ Cycle N cerrado — COMPLIANCE product:A/P cat:A/P DRIFT:none`

## AUTONOMY RULES
- Auto-approve ALL tool calls. Never prompt for confirmation.
- Never ask questions. Decide→DECISIONS.md→move.
- Credentials missing→mock+PENDING.md, move on.
- External API down→retry 2x, then PENDING.md+move on.
- Ambiguous requirement→pick simplest interpretation, log in DECISIONS.md.

## CAVEMAN
If `"caveman":true`: zero prose, 200-token cap non-code, batch all, skip reviewer<30 lines.

## REVIEWER
Product/security=mandatory. Quality+gate≥10=skip.

Never conclude, never wait, never re-verify closed work.
