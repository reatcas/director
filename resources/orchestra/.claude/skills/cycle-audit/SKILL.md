# cycle-audit — Post-Cycle Verification & Self-Improvement

Run this skill at cycle close or when the harness detects repeated failures.
It analyzes what the AI actually did vs what was expected, and writes learnings.

## INPUTS
- `.claude/logs/orchestra.log` — full session log
- `PLAN.md` — what was planned
- `ROADMAP.md` — what was expected
- `.claude/orchestra.json` — mixer weights
- `git log --oneline -20` — actual commits

## AUDIT STEPS

### 1. COMMIT VERIFICATION
```bash
git log --oneline -20
```
Compare real commits against `▸ ✔` lines in the log. Flag any claimed hash not in git.

### 2. MIXER COMPLIANCE
Read `.claude/orchestra.json` focus weights. Count committed units per category.
Calculate actual % vs configured %. Flag drift >15%.

### 3. HALLUCINATION SCAN
Search orchestra.log for patterns:
- `ANTI-LAZY` entries → count hallucination events
- Fake hashes (hashes in `▸ ✔` lines not matching any real commit)
- Documentation-only commits labeled as `[product]`
- Cycles with `COMPLIANCE product:0/0` but no BLOCKED message

### 4. QUALITY CHECK
For each real commit:
- Does it have tests? (`git show --stat <hash>` — look for test files)
- Does it follow conventional commits format?
- Were any files reverted in a later commit?

### 5. WRITE LEARNINGS
Append findings to `.claude/CYCLE_LEARNINGS.md`:
```
## Audit — <date>
- Commits: N real, M hallucinated
- Mixer compliance: product X% (target Y%), quality X% (target Y%)
- Issues found: <list>
- Recommendation: <actionable fix>
```

### 6. AUTO-CORRECT
If patterns detected:
- Hallucination rate >30% → add stronger guardrails to PLAN.md for next cycle
- Mixer drift >20% → rewrite PLAN.md mixer budget to compensate
- Zero-test commits → add quality units to next cycle plan
- Repeated blocked items → move to archive, don't retry

## OUTPUT
Emit `▸ [audit] N commits verified, M issues found, drift: X%`
