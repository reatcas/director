# Cycle Learnings

## Session: Cycles 35–55

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

### Anti-Patterns Discovered
- Blanket XSS tests (matching ALL interpolations) fail on safe variables like numeric properties and pre-built HTML. Test only `as-val">` spans containing data values.
- `split('functionName')` can match function *calls* before function *definitions*. Always use `split('function functionName')` for definition extraction.
- Git log range `hash..HEAD` excludes the boundary commit itself. Use `hash^..HEAD` to include it in module ban counting.
