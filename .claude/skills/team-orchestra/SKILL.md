---
name: team-orchestra
description: The embedded elite team — Phase 0 discovery for any stack, team roles, per-unit protocol, cycle structure, checkpoints. Use at session boot, when state files are missing, and to run every work unit.
---

# Team Orchestra (v2)

## Phase 0 — Discovery & Adaptation (only when state files are missing; max ~1h)
1. Map the terrain: languages, frameworks, package managers, build/test tooling, CI, containers, deploy targets, conventions (linters, formatters, commit style), README/ADRs.
2. Synthesize the Verification Gate for THIS stack (see verification-gate skill) and record it at the top of PLAN.md. Missing scaffolding (tests, linter, CI, headless E2E) → building it IS the first work.
3. Baseline: run the gate on main. Red baseline → fixing it is job one.
4. Detect the toolbelt: MCP servers, CLIs, credentials. Prefer MCP/official docs over guessed APIs; record learned APIs in DECISIONS.md.
5. **Run the `roadmap-sync` skill** — harvest every prior gap analysis, spec, or feature report in the repo into `ROADMAP.md`. This runs BEFORE the constitution is finalized, because the constitution's cycle plan depends on what ROADMAP.md contains.
6. Write the constitution into DECISIONS.md: stack versions, conventions adopted, gate, deploy procedure, environments. Add an empty **"## Patterns"** section — this is where solved-once, reuse-many-times design patterns get recorded (see step 6 below).
7. Run the ip-protection skill check.
8. Build Cycle 1's plan in PLAN.md using the `backlog-generator` skill's product-first composition (NOT a generic quality-only plan).

## Roles (hats or subagents; master coordination always in PLAN.md + files)
- Tech Lead (orchestrator): owns PLAN.md, prioritizes by value and risk, enforces the constitution, keeps the loop moving. **Enforces the cycle composition budget from backlog-generator — the single most important guardrail against drifting into pure polishing.**
- Architect: design before non-trivial builds — data models, contracts, boundaries, failure modes, 10x scalability check; lightweight ADR per significant choice. **After solving a new shape (e.g. "versioned entity with public link + 2FA", "pipeline with derived stages"), immediately writes it into DECISIONS.md's Patterns section** so the next similar feature reuses it instead of rediscovering it from scratch.
- Researcher: unknowns are investigated FIRST (official docs, changelogs, pitfalls) — never build on guessed APIs.
- Backend: contract-first, versioned reversible migrations, real constraints, transactions on multi-writes, timeouts/retries on external calls, pagination default, idempotency on critical creations.
- Frontend: only the established UI system/tokens; complete states; automated a11y checks; i18n primary locale.
- QA: tests with/before code — happy path, edges, and ALWAYS negative security cases (unauthorized fails, malicious input rejected, other-user data unreachable). Never weaken tests. Flaky → stabilize quick or skip with reason. **Right-sizes test depth to risk (see backlog-generator Step 3) — does not chase raw test-count as a metric.**
- Security: threat-model data/auth features; parameterized queries, least privilege, encryption for sensitive data, headers, per-cycle dependency audit → AUDIT_LOG.md.
- DevOps/SRE: boring deploys, health checks, rollback-ready; ip-protection check before every deploy; deploy failing 2× same cause → rollback + PENDING.md; workspace hygiene (kill orphans, stop test containers, clean temp, prune branches).
- Docs/DX: specs regenerated and diffed per cycle; ADRs written; READMEs true.
- Reviewer (mandatory subagent per completed unit): diff vs constitution + conventions; flag ONLY correctness/requirement gaps; fix before closing.

## Per-unit protocol
1. Brief (goal, approach, acceptance criteria, risks) → PLAN.md. **For product units: cite the exact ROADMAP.md item and its acceptance line.** **Check DECISIONS.md Patterns first — reuse before designing from scratch.**
2. Research if unknowns. 3. Design if non-trivial (contract/schema first). Split into parallel backend/frontend executor subagents when the surfaces are reasonably independent (see backlog-generator Step 3).
4. Build + tests together, security cases included, test depth matched to risk.
5. Full verification gate → Reviewer subagent → fix findings → commit(s) per topic → push → ip-protection → deploy → health checks with evidence (curl output).
6. Outcome paragraph → PLAN.md; **mark the ROADMAP.md item done (or partial, with what's missing) for product units**; state files updated; NEXT unit immediately. Budget ×1.5 exceeded → cut, log remainder, advance. Full traversal beats single-unit perfection.

## Cadence
- Checkpoint every ~2h: checkpoint commit, `date` logged with cycle+elapsed, retry pending pushes, back to work.
- Cycle close: global gate; scan AUDIT_LOG.md for repeated bug classes (same class ×3 → hunt everywhere); append cycle section to ORCHESTRA_REPORT.md **including the cycle's product-vs-quality unit ratio** (so drift is visible immediately, not after 53 cycles); re-run `roadmap-sync` if stale; invoke backlog-generator with the product-first composition; start next cycle immediately.
