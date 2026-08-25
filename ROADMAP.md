# Director — Product Roadmap

## Product Features

- [ ] **F-01** Cycle close validation — harness must verify `▸ ◼ ... COMPLIANCE` line was emitted by the agent after each iteration. Log `COMPLIANCE_MISSING` warning if absent.
- [ ] **F-02** Final git check on process exit — run one last `git log` poll when orchestra process exits (before sending `orchestra:exit` to renderer) so commits made in the last 8s aren't missed.
- [ ] **F-03** PRODUCT_DIRECTIVE.md growth cap — overwrite instead of append when injecting `## NEXT ITEM` on auto-restart, preventing the file from growing to megabytes after many restarts.
- [ ] **F-04** Credits floor at zero — prevent `credits` from going negative in `ai-credits.json`. Clamp to 0 instead of decrementing below.
- [ ] **F-05** Log filter for grouped normal lines — fix `logObserver` to also apply filter matching to `.le-group-body` text elements, not just `.le` entries.
- [ ] **F-06** DECISIONS.md category mapping — map DECISIONS.md to `architecture` or a high-floor category instead of `backend` only, so cross-cutting conventions aren't lost when backend weight is 0%.
- [ ] **F-07** Anti-slop pattern hardening — widen mislabeled detection regex to catch `feat(localization)`, `feat(l10n)`, and other alternate wordings. Widen mechanical detection beyond numeric patterns.
- [ ] **F-08** Mixed-case hash detection — update fake hash regex to be case-insensitive and support hashes on separate lines from `▸ ✔`.

## Improvements

- [ ] **I-01** Increase test coverage to 60+ tests — add tests for renderer logic (mock DOM), main.js IPC handlers (mock Electron), and edge cases in Smart Mix normalization.
- [ ] **I-02** Auto-restart try/catch — wrap `playOrchestra` call in `child.on('exit')` with try/catch to prevent uncaught exceptions from crashing the Electron app.
- [ ] **I-03** Stale `USAGE_LIMIT` cleanup — detect and remove stale USAGE_LIMIT files from previous sessions on app startup.
