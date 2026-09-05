# Plan-Mode Skill — Plan Spec Protocol

## WHEN INVOKED
PLANNER MODE: A `[plan-mode]` ROADMAP item has no spec yet.
Your ONLY job: investigate → write spec → commit → EXIT. No application code.

## PLAN SPEC FORMAT

Write to `.claude/plan-specs/F-XX.md` (XX = ROADMAP item number from harness):

```
# Plan Spec: F-XX — [Feature Name]

## STATUS: active

## Context
User-visible problem solved. Layers touched (migration/backend/frontend/mobile/etc.).
Why this approach over alternatives.

## Files
Read ALL of these before writing the DAG.
- `path/to/file.ts` — purpose / what will change
- `path/to/migration.sql` — purpose

## Design Decisions
Key architectural choices. What the executor must not re-derive.
Security considerations. Data model changes. API contract.

## DAG

[TASK 1] title
  DEPENDS: none
  FILES: path/to/file
  WHAT: exact change — function name, SQL statement, component name
  VERIFY: command or assertion to confirm task succeeded

[TASK 2] title
  DEPENDS: [1]
  FILES: path/to/file
  WHAT: exact change description
  VERIFY: test command

[TASK N] ...

## Verification
End-to-end: how to confirm the complete feature works after all DAG tasks finish.
```

## PLANNER RULES

1. **Read ALL files** listed in the Files section before writing the DAG.
2. **DAG must be self-contained** — a fresh session must execute it without re-investigation.
3. **Dependency order**: migrations first → models/logic → handlers/services → UI → tests.
4. **Each task = 1 commit** when executing. Size tasks accordingly.
5. **VERIFY must be concrete** — a command that returns exit 0 on success, or a grep pattern.
6. After writing spec: `mkdir -p .claude/plan-specs && git add .claude/plan-specs/F-XX.md`
7. Commit: `plan(F-XX): write spec — [one-line feature summary]`
8. **EXIT immediately after committing.** Do NOT start coding. Next session is executor.

## EXECUTOR RULES

1. At boot: read the plan spec (`cat .claude/plan-specs/F-XX.md`).
2. Identify first uncommitted task: `git log --oneline | grep "task(F-XX):"` — find gap.
3. Execute tasks **strictly in DAG order**. Do NOT skip or reorder.
4. Commit each task: `task(F-XX): [TASK N] — title`
5. After each task: add `✓` prefix to that task line in spec file. Stage+commit the spec
   update IN THE SAME COMMIT as the task code. Never a standalone state commit (Rule 41).
6. When ALL tasks committed: update spec `## STATUS: complete` → commit `plan(F-XX): mark complete`.
7. Update ROADMAP.md to check off the `[plan-mode]` item: `- [x] F-XX ...`
8. Resume normal IMPROVEMENT/PRODUCT cycle.

## COMMIT CONVENTION

```
plan(F-XX): write spec — [feature name]      # planner creates this
task(F-XX): [TASK 1] — [title]               # executor creates per task
task(F-XX): [TASK 2] — [title]
...
plan(F-XX): mark complete                    # executor closes the plan
```

## AUTOMATIC ESCALATION

A ROADMAP item qualifies for `[plan-mode]` if it touches ≥3 files across ≥2 layers:
- migration + backend handler + frontend view
- backend service + API endpoint + mobile component + tests
- database schema + ORM model + REST handler + UI form

When you encounter such an item during PRODUCT MODE: tag it `[plan-mode]` in ROADMAP.md,
then write the plan spec immediately (you are already in the right session for it).
