---
name: db-vision
description: Auto-extracts database schema (Prisma, SQL, etc.) into .claude/DB_SCHEMA.md so the AI is not blind to data relations when building UI forms.
---

# Database Vision

When building UI forms or making API requests, you MUST know the data schema. 
Run: `bash .claude/skills/db-vision/db-extract.sh`

This script will find `schema.prisma`, `*.sql`, and other database files and dump their contents into `.claude/DB_SCHEMA.md`. 
Since `loop.md` reads `DB_SCHEMA.md` on every cycle, this gives you persistent "eyes" on the database structure, ensuring you never build a plain text input when a foreign key relation requires a dropdown/select!
