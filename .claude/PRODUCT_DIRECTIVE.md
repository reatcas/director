# FOCUS DIRECTIVE — injected by Director at play time
Follow these exact priorities for this cycle based on the Director Mixer:

- **PRODUCT (LOW - 30%):** Address only if opportunistic or blocking other work.
- **FRONTEND (LOW - 15%):** Address only if opportunistic or blocking other work.
- **QUALITY_TESTS (LOW - 15%):** Address only if opportunistic or blocking other work.
- **BACKEND (LOW - 10%):** Address only if opportunistic or blocking other work.
- **SECURITY (LOW - 10%):** Address only if opportunistic or blocking other work.
- **BUSINESS_LOGIC (LOW - 5%):** Address only if opportunistic or blocking other work.
- **PERFORMANCE (LOW - 5%):** Address only if opportunistic or blocking other work.
- **UX_ACCESSIBILITY (LOW - 5%):** Address only if opportunistic or blocking other work.
- **DATA_DB (LOW - 3%):** Address only if opportunistic or blocking other work.
- **I18N (LOW - 2%):** Address only if opportunistic or blocking other work.

Generated: 2026-08-27T00:37:22.640Z

## CONTINUOUS EXECUTION DIRECTIVE (INFINITE LOOP)
You MUST NEVER STOP. Continue developing in an infinite loop until all tasks in the project are 100% completed.
Do not ask for permission to continue. Automatically proceed to the next item when one is finished.
Your objective is to NEVER stop working. Follow the mix parameters and keep working without stopping, regardless of the project.

## ⚠️ ANTI-HALLUCINATION & AUDIT RULES (MANDATORY)
YOUR COMMITS ARE VERIFIED EXTERNALLY. The harness checks `git log` before/after your session.
If HEAD has not changed, your ENTIRE session is marked FAILURE regardless of output.
1. **NO FAKE COMMITS**: NEVER type/generate a commit hash. Read it from `git log` output after a real `git commit`. Fabricating hashes = immediate detection + backoff penalty.
2. **NO FAKE TESTS**: Tests MUST verify real logic (200/201 responses, DB persistence). Error-only tests are NOT product work.
3. **NO FAKE LOGS**: Do NOT print `▸ ✔` or `▸ ◼` lines unless a real tool-executed commit preceded them.
4. **BLOCKED = IMPROVEMENT MODE**: If all ROADMAP items are blocked, switch to IMPROVEMENT MODE: review existing modules, forms, UI, API handlers, tests, and make real code improvements. Distribute work following the mixer weights. Write new items to ROADMAP.md under ## Improvements.
5. After 5 consecutive zero-commit sessions, the harness will STOP you permanently and flag PENDING.md.
6. **NEVER STOP**: If ROADMAP is empty, scan the codebase and find improvements. A senior developer always finds work to do.

## NEXT ITEM
El proceso ha parado. Tu siguiente objetivo es:
- [ ] **F-01** Cycle close validation — harness must verify `▸ ◼ ... COMPLIANCE` line was emitted by the agent after each iteration. Log `COMPLIANCE_MISSING` warning if absent.
