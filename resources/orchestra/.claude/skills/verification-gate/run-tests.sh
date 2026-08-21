#!/usr/bin/env bash
# run-tests.sh — A wrapper to prevent terminal noise brain rot.
# Usage: ./run-tests.sh "npm run test"

CMD="$1"

if [ -z "$CMD" ]; then
  echo "Usage: ./run-tests.sh <test-command>"
  exit 1
fi

echo "Running: $CMD"
OUTPUT=$(eval "$CMD" 2>&1)
EXIT_CODE=$?

LINES=$(echo "$OUTPUT" | wc -l)

if [ "$LINES" -gt 50 ]; then
  echo "$OUTPUT" | head -n 20
  echo "... [ $(expr "$LINES" - 40) lines truncated to prevent context window brain rot ] ..."
  echo "$OUTPUT" | tail -n 20
else
  echo "$OUTPUT"
fi

echo "Exit Code: $EXIT_CODE"
exit $EXIT_CODE
