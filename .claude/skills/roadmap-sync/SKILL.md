---
name: roadmap-sync
description: Consolidates PRODUCT FEATURES into ROADMAP.md with concrete deliverables. Single source for backlog-generator.
---

# Roadmap Sync v5 — concrete items only

ROADMAP.md≠PENDING.md. PENDING=bugs/partials/quality. ROADMAP=unshipped product capability. Empty ROADMAP→loop degrades to permanent polishing.

## Procedure
1. **Harvest** planning artifacts: `.claude/BLUEPRINT.md`, `.claude/blueprint.json`, `*GAP*.md`, `*ROADMAP*.md`, `*SPEC.md`, `*_REPORT.md`, `docs/features/`, `docs/adr/`, README/CHANGELOG TODOs. Read fully.
2. **Extract features only** (skip quality/hardening). Feature=user-facing capability or business workflow not yet built/complete. Implemented→don't carry forward.
3. **Normalize** into ROADMAP.md — CONCRETE items only:
   ```
   ## F-XX: <Feature name>
   Source: <origin file>
   Priority: P0|P1|P2|P3
   Status: not started | partial → PENDING.md link
   ### Deliverables
   - Migration: `NNNN_<name>.sql` (tables/columns)
   - Handler: `internal/handler/<name>.go` (or stack equivalent)
   - Component: `src/views/<Name>View.vue` (or stack equivalent)
   - Tests: handler+component tests (WITH feature, not separate)
   ### Acceptance
   - <concrete testable criterion — verifiable by test/curl>
   ```
   **RULES**:
   - NEVER vague ("Treatment Plans Module"). ALWAYS name files.
   - Can't determine paths→investigate codebase+DECISIONS.md patterns first.
   - Acceptance=automatable. Never "should work well".
   - Too large (>1 cycle)→split into sub-items, each independently deliverable.
   - NEVER replace concrete item with vaguer version. Only add detail.

4. **Order** P0 first, then by dependency within tier.
5. **Conflicts**: keep newer source priority, note in DECISIONS.md.
6. **Marking complete**: `[x]` ONLY when ALL verified:
   - grep confirms migration exists
   - grep confirms handler/endpoint responds
   - grep confirms UI component exists+routed
   - Acceptance passes (test output/curl evidence)
   Partial→mark `partial` with what's missing, never `[x]`.
7. **Empty**: after full harvest, genuinely nothing→`## No pending product features found — quality backlog only`. Re-harvest every ~10 cycles.
