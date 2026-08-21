---
name: license-compliance
description: AGPL-3.0 license and open source check. Run in Phase 0 and before EVERY deploy. Installs the canonical AGPL LICENSE, enforces public metadata.
---

# License Compliance Check

Run before every deploy; any failure is fixed before shipping. Log `license: ok` on the deploy line in PLAN.md.

1. `LICENSE` at repo root must equal the canonical text in `license/LICENSE.tpl` of this package.
2. No conflicting license artifacts in first-party code. Third-party deps (node_modules, vendor) keep their own.
3. Package metadata declares AGPL-3.0: package.json → "license": "AGPL-3.0" without "private": true.
4. Dependency license audit (once per cycle): ensure compatible licenses with AGPL-3.0.
