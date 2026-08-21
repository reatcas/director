#!/usr/bin/env bash
INPUT="$(cat)"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
CMD=$(printf '%s' "$INPUT" | tr '\n' ' ')
block() { echo "$1" >&2; exit 2; }

echo "$CMD" | grep -Eq -- '--headed|headless[": ]*false|HEADLESS=false' && \
  block "Blocked: headed browser mode is forbidden. Run E2E headless and rely on automated verification."

echo "$CMD" | grep -Eq 'npm publish|yarn publish|pnpm publish|twine upload|cargo publish|gem push|docker push docker\.io' && \
  block "Blocked: publishing to public registries is forbidden (AGPL-3.0 codebase). See ip-protection skill."

if echo "$CMD" | grep -Eq 'deploy|docker compose up|docker-compose up|kubectl apply|fly deploy|railway up'; then
  ROOT="$DIR/.."
  if [ ! -f "$ROOT/LICENSE" ] || ! grep -q "GNU AFFERO GENERAL PUBLIC LICENSE" "$ROOT/LICENSE"; then
    block "Blocked: deploy without the canonical AGPL LICENSE at repo root. Run the ip-protection skill first."
  fi
fi
exit 0
