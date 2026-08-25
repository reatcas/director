#!/usr/bin/env bash
# Director verification gate — runs before every commit
set -euo pipefail
cd "$(dirname "$0")/../../.."

echo "▸ [gate] bash syntax check: run.sh"
bash -n resources/orchestra/run.sh

echo "▸ [gate] vitest (44 tests)"
npx vitest run --reporter=dot 2>&1 | tail -5

echo "▸ [gate] all checks passed"
