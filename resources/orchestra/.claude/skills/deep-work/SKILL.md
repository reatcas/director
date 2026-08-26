# Deep Work — Module-Level Architect-Executor Skill

## WHEN TO INVOKE
Invoke this skill when a ROADMAP item requires **module-level changes** — work that spans multiple files, layers (migration + backend + handlers + frontend), or requires architectural reasoning before execution. Signs:
- The feature touches 3+ files across different layers
- A new database table or migration is needed
- An existing system must be redesigned, not just extended
- Multiple handlers/endpoints must change in coordination
- The change requires understanding domain logic deeply before coding

Do NOT invoke for: single-file fixes, UI tweaks, test additions, mechanical changes, or anything completable in one commit.

## THE PATTERN: Architect-Executor with DAG Decomposition

You operate as TWO roles in sequence:

### PHASE 1 — ARCHITECT (reason before acting)

**1.1 Deep Investigation**
Before writing any code, investigate the full scope. Use parallel tool calls:
- Read ALL files involved in the module (handlers, models, migrations, repository, frontend views)
- Search for every reference to the concepts being changed (`grep` for function names, types, table names)
- Read the existing test files to understand expected behavior
- Read DB_SCHEMA.md, DECISIONS.md, ENTITY_BINDINGS.md for context

**1.2 Scenario Analysis**
Write out (in your thinking) every real-world scenario the change must support. For each scenario:
- What data flows in?
- What transformations happen?
- What data flows out?
- What edge cases exist?
- What breaks if this is wrong?

**1.3 Dependency DAG**
Produce an ordered task list where each task has:
```
[TASK N] title
  DEPENDS: [task numbers that must complete first]
  FILES: [exact files to modify]
  WHAT: [precise description of the change]
  VERIFY: [how to confirm it works — test command or grep pattern]
```

Rules for the DAG:
- Migrations ALWAYS come first (the schema must exist before code references it)
- Pure logic (engine, models) comes before handlers that use it
- Handlers come before frontend that calls them
- Tests come AFTER the code they test but BEFORE the next task begins
- Each task must be independently committable and testable

**1.4 Write the DAG to PLAN.md**
Before executing, write the full DAG to PLAN.md under a `## Deep Work: [title]` section. This is your contract — execute it in order.

### PHASE 2 — EXECUTOR (act precisely)

For each task in the DAG, in dependency order:

**2.1 Localize**
- Re-read the specific files listed in the task
- Confirm assumptions from Phase 1 are still valid (code may have changed)
- If assumptions are wrong: STOP, return to Phase 1, revise the DAG

**2.2 Implement**
- Write the minimal correct change for this task only
- Follow existing patterns (check DECISIONS.md)
- Use existing helpers (check Patterns section)
- Do NOT refactor unrelated code
- Do NOT add features beyond the task scope

**2.3 Verify**
- Run the verification gate
- Run the specific VERIFY check from the DAG
- If tests fail: fix within this task, do NOT proceed to the next task with red tests

**2.4 Commit**
- Commit with conventional commit format referencing the ROADMAP item
- Update PLAN.md marking the task as done

**2.5 Re-evaluate**
After each task, check:
- Did implementing this task reveal something the DAG didn't anticipate?
- Does the remaining DAG need adjustment?
- If yes: update PLAN.md with the revised DAG before proceeding

### PHASE 3 — INTEGRATION VERIFICATION

After all DAG tasks are complete:
- Run the FULL test suite (not just the new tests)
- Verify backward compatibility — existing functionality must not break
- Check that all files modified are consistent with each other
- If the change touches an API: verify the frontend calls match the new contract
- Update DECISIONS.md with any new patterns discovered
- Update ROADMAP.md marking the item complete

## ANTI-PATTERNS (what NOT to do)

1. **Never start coding before completing Phase 1.** The investigation and DAG are mandatory. Skipping them causes mid-implementation surprises that waste cycles.

2. **Never execute tasks out of dependency order.** If Task 4 depends on Task 2, Task 2 must be committed and verified before Task 4 begins.

3. **Never modify the DAG silently.** If you discover the DAG needs to change, write the update to PLAN.md BEFORE continuing. The DAG is the audit trail.

4. **Never combine multiple DAG tasks into one commit.** Each task = one commit. This enables rollback of individual steps if something goes wrong.

5. **Never skip the Localize step.** Re-read the files even if you just read them in Phase 1. Another task may have changed them.

6. **Never hardcode domain knowledge.** If the module needs to work across different projects (which it does — Director serves any project), make the logic data-driven, not assumption-driven.

## EXAMPLE: How the Indicator Measurement v2 Would Be Decomposed

```
## Deep Work: Unified Indicator Measurement Engine

[TASK 1] CQL Migration — new columns and tables
  DEPENDS: none
  FILES: migrations/059_indicator_measurement_v2.cql
  WHAT: ALTER indicators ADD measurement_source, accumulation_rule, 
        denominator_type, survey_criterion, indicator_lifecycle.
        CREATE indicator_beneficiary_index, project_beneficiary_counts.
  VERIFY: docker exec scylla cqlsh -e "DESCRIBE indicators"

[TASK 2] Progress engine v2 — pure logic with tests
  DEPENDS: none (pure functions, no DB)
  FILES: internal/progress/engine.go, internal/progress/engine_test.go
  WHAT: Add IndicatorConfig, MeasurementData, IndicatorProgress(),
        EvaluateCriterion(), SurveyCriterion type. Keep legacy functions.
  VERIFY: go test ./internal/progress/ -v

[TASK 3] Indicator repository — new queries
  DEPENDS: [1, 2]
  FILES: internal/repository/indicator_measurement_repository.go
  WHAT: Add GetIndicatorV2Config, InsertMeasurementFull, TrackBeneficiary,
        CountUniqueBeneficiaries, BuildMeasurementData.
  VERIFY: go build ./...

[TASK 4] CreateIndicator/UpdateIndicator handlers
  DEPENDS: [2, 3]
  FILES: internal/rest/project_handlers.go
  WHAT: Add v2 fields to request structs, validation, INSERT/UPDATE queries.
  VERIFY: go build ./... && go test ./internal/rest/

[TASK 5] Session measurement write path
  DEPENDS: [3, 4]
  FILES: internal/rest/session_handlers.go, internal/repository/session_repository.go
  WHAT: WriteMeasurementV2 with per-beneficiary + disaggregation.
        GetBeneficiaryDimensions for dimension_values.
  VERIFY: go test ./...

[TASK 6] Survey aggregation v2
  DEPENDS: [2, 3]
  FILES: internal/rest/survey_handlers.go
  WHAT: Add "criterion" agg_rule, use EvaluateCriterion.
  VERIFY: go build ./... && go test ./...

[TASK 7] Report handlers unified formula
  DEPENDS: [3, 4, 5]
  FILES: internal/rest/report_handlers.go
  WHAT: Use IndicatorProgress for v2-configured indicators.
  VERIFY: go test ./...

[TASK 8] Frontend fix + v2 wiring
  DEPENDS: [4, 7]
  FILES: web-vue/src/views/DashboardView.vue, web-vue/src/views/ProgramsView.vue
  WHAT: Fix indicatorAchieved to use participants_count.
        Add v2 fields to indicator form.
  VERIFY: npm run build (web-vue)

[TASK 9] Integration verification
  DEPENDS: [1-8]
  FILES: none (verification only)
  WHAT: Full test suite, build all frontends, verify health endpoint.
  VERIFY: go test ./... && npm run build (all frontends)
```

## INTEGRATION WITH ORCHESTRA LOOP

When a ROADMAP item is tagged `[deep-work]`, the orchestra session should:
1. Invoke this skill instead of the normal single-unit-per-cycle approach
2. The entire DAG executes within a single orchestra session (not spread across cycles)
3. The session may produce 5-15 commits (one per DAG task)
4. Cycle compliance counts the aggregate: all tasks contribute to the category of the ROADMAP item
5. If the session hits a usage limit mid-DAG: write progress to PLAN.md, the next session resumes from the last completed task

## ADAPTIVE TO ANY PROJECT

This skill works on any stack because:
- Phase 1 discovers the stack by reading files (no assumptions about Go/JS/Python)
- The DAG structure is universal (migrations→models→logic→handlers→UI→tests)
- Verification uses the project's own verification-gate skill
- Patterns come from the project's DECISIONS.md, not hardcoded
