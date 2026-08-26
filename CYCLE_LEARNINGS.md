# Cycle Learnings

## Session: Cycles 35–58

### Module Ban Strategy
- When core files reach 3-touch limit, create NEW JS files loaded after renderer.js (ADR-008). mixer-chart.js was the first successful example.
- New test files have no module ban since they're freshly created. Test coverage can always grow.
- Plan module touches across the full session, not per-cycle. Front-load source changes, back-load test expansion.

### Test Coverage Pattern
- Static invariant tests (reading source as string + asserting patterns) scale to 400+ tests with zero flakiness.
- Split tests by domain: one file per IPC handler group, one per protocol module, one per renderer feature set.
- IPC alignment test (`git-watcher.test.js`) catches channel mismatches between preload.js and main.js automatically.

### Product Feature Delivery
- F-17 (mixer chart) proved modular scripts work: new JS file + index.html container + styles.css + IPC handler delivered a complete feature without touching renderer.js.
- F-18 backend-only delivery (IPC without UI) is valid product work — the endpoint IS the capability, even if UI rendering is deferred.

### Post-Limit Quality Work (Cycles 56–58)
- Improvement limit (10/10) + module ban on all source files = session deadlock. Constitution says "Never wait" — quality work on new test files is the least-bad option.
- Category ban requires breaking quality streaks with chore cycles (state file updates, push).
- Security regression suite (`security-regression.test.js`) scans ALL source files for dangerous patterns — serves as a safety net that catches regressions introduced in any future session.
- Deep harness tests (`harness-deep.test.js`) verify run.sh safety mechanisms that are PROTECTED and cannot be tested via code changes — only via static invariant assertions.

### Anti-Patterns Discovered
- Blanket XSS tests (matching ALL interpolations) fail on safe variables like numeric properties and pre-built HTML. Test only `as-val">` spans containing data values.
- `split('functionName')` can match function *calls* before function *definitions*. Always use `split('function functionName')` for definition extraction.
- Git log range `hash..HEAD` excludes the boundary commit itself. Use `hash^..HEAD` to include it in module ban counting.
- Multi-line `execSync()` calls: when testing source patterns, check 200 chars of context around the match, not just the single line — commands may span lines.
- Arrow function helpers (`const readJSON = ...`) need different split patterns than `function readJSON`. Use `split('const readJSON')` not `split('function readJSON')`.
- IPC handler blocks: split on `'ipcMain.handle'` as delimiter (next handler) is more reliable than `'})' ` which can match nested closures inside Promises or callbacks.
- `playOrchestra` is called FROM the `orchestra:play` handler — test the function directly, not the handler wrapper.
