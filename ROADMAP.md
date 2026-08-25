# Director — Product Roadmap

## Product Features

- [ ] **F-01** Cycle close validation — harness must verify `▸ ◼ ... COMPLIANCE` line was emitted by the agent after each iteration. Log `COMPLIANCE_MISSING` warning if absent.
- [x] **F-02** Final git check on process exit — run one last `git log` poll when orchestra process exits (before sending `orchestra:exit` to renderer) so commits made in the last 8s aren't missed.
- [x] **F-03** PRODUCT_DIRECTIVE.md growth cap — overwrite instead of append when injecting `## NEXT ITEM` on auto-restart, preventing the file from growing to megabytes after many restarts.
- [x] **F-04** Credits floor at zero — prevent `credits` from going negative in `ai-credits.json`. Clamp to 0 instead of decrementing below.
- [x] **F-05** Log filter for grouped normal lines — fix `logObserver` to also apply filter matching to `.le-group-body` text elements, not just `.le` entries.
- [x] **F-06** DECISIONS.md category mapping — map DECISIONS.md to `architecture` or a high-floor category instead of `backend` only, so cross-cutting conventions aren't lost when backend weight is 0%.
- [x] **F-07** Anti-slop pattern hardening — widen mislabeled detection regex to catch `feat(localization)`, `feat(l10n)`, and other alternate wordings. Widen mechanical detection beyond numeric patterns.
- [x] **F-08** Mixed-case hash detection — update fake hash regex to be case-insensitive and support hashes on separate lines from `▸ ✔`.

## Improvements

- [x] **I-01** Increase test coverage to 60+ tests — add tests for renderer logic (mock DOM), main.js IPC handlers (mock Electron), and edge cases in Smart Mix normalization.
- [x] **I-02** Auto-restart try/catch — wrap `playOrchestra` call in `child.on('exit')` with try/catch to prevent uncaught exceptions from crashing the Electron app.
- [x] **I-03** Stale `USAGE_LIMIT` cleanup — detect and remove stale USAGE_LIMIT files from previous sessions on app startup.
- [x] **I-04** Cache iter-log scan in getClaudeUsage — skip readdirSync+statSync rescan within 25s to reduce main-thread I/O during metrics sampling.
- [x] **I-05** Escape all log entry innerHTML + restrict kill-proc signals — prevent XSS from rogue subprocess output and arbitrary signal injection.
- [x] **I-06** Increase test coverage to 73 — security hardening tests, main.js invariant assertions.
- [x] **I-07** Validate IPC file path arguments as strings — prevent type errors from non-string arguments in readFile and readIterLog handlers.
- [x] **I-08** Log filter match count + i18n placeholder — show result count and localize filter placeholder to Spanish.
- [x] **I-09** Context protocol delta + retention tests — 11 new tests for computeDelta and _computeRetention (84 total).
- [x] **I-10** Widen commit type regex in analyze handler — add style, security, i18n to detection regex.
- [x] **I-11** Atomic writes for telemetry JSON in protocol modules — fix ADR-002 violation in context-protocol and resource-scheduler.
- [x] **I-12** Resource-scheduler efficiency + edge case tests — 6 new tests (90 total).
- [x] **I-13** Mtime-based caching in computeDelta — skip file reads when state files unchanged between polls.
- [x] **I-14** Complete XSS hardening — escape all remaining innerHTML injections across all log entry types.
- [x] **I-15** XSS + atomic write invariant tests — 7 XSS verification + 2 atomic write protocol tests (97 total).
- [x] **I-16** Focus-visible keyboard navigation styles — global outline for buttons, inputs, selects.
- [x] **I-17** Coordination protocol comprehensive tests — priority, status, rebalance, event log cap (103 total).
