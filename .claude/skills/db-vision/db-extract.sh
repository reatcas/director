#!/usr/bin/env bash
# db-extract.sh — Auto-discovers and extracts database schemas

echo "=== DATABASE SCHEMA EXTRACED AT $(date) ===" > .claude/DB_SCHEMA.md

FOUND=0

# Check for Prisma
if [ -f "prisma/schema.prisma" ]; then
  echo -e "\n## Prisma Schema\n\`\`\`prisma" >> .claude/DB_SCHEMA.md
  cat prisma/schema.prisma | grep -v "^//" >> .claude/DB_SCHEMA.md
  echo "\`\`\`" >> .claude/DB_SCHEMA.md
  FOUND=1
fi

# Check for SQL files in common dirs
SQL_FILES=$(find db database src server/db -type f -name "*.sql" -o -name "schema.sql" 2>/dev/null | head -n 5)
if [ -n "$SQL_FILES" ]; then
  echo -e "\n## SQL Schema Files\n" >> .claude/DB_SCHEMA.md
  for f in $SQL_FILES; do
    echo -e "\n### $f\n\`\`\`sql" >> .claude/DB_SCHEMA.md
    head -n 100 "$f" >> .claude/DB_SCHEMA.md
    echo "\`\`\`" >> .claude/DB_SCHEMA.md
  done
  FOUND=1
fi

# Check for Drizzle / ORM Models
TS_MODELS=$(find src/db src/server/db src/models src/schema -type f -name "*.ts" -o -name "*.js" 2>/dev/null | grep -i "schema\|model" | head -n 5)
if [ -n "$TS_MODELS" ]; then
  echo -e "\n## ORM Models / Schema Definitions\n" >> .claude/DB_SCHEMA.md
  for f in $TS_MODELS; do
    echo -e "\n### $f\n\`\`\`typescript" >> .claude/DB_SCHEMA.md
    head -n 150 "$f" | grep -v "^//" | grep -v "^import" >> .claude/DB_SCHEMA.md
    echo "\`\`\`" >> .claude/DB_SCHEMA.md
  done
  FOUND=1
fi

if [ "$FOUND" -eq 0 ]; then
  echo "\nNo standard schema files (Prisma, SQL) found automatically." >> .claude/DB_SCHEMA.md
fi
