# Cycle 188 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 188 (security BANNED C185+C186+C187, quality_tests BANNED C185+C186+C187)
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| performance | 10 | 3 | 0/3 |
| backend | 5 | 1 | 0/1 |
| frontend | 5 | 1 | 0/1 |
| business_logic | 5 | 1 | 0/1 |
| ux_accessibility | 5 | 1 | 0/1 |
| data_db | 5 | 1 | 0/1 |
| security | 20 | 0 | BANNED (C185+C186+C187) |
| quality_tests | 35 | 0 | BANNED (C185+C186+C187) |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [performance] P-21 — playOrchestra: replace existsSync(alto)+unlinkSync and existsSync(usageSignal)+try{unlinkSync}catch{} with direct try{unlinkSync}catch{}
2. [performance] P-22 — exit handler: !fs.existsSync(altoPath) → statSync try/catch (statAlto flag)
3. [performance] P-23 — repertoire:open: fs.existsSync(dir) → statSync try/catch
4. [backend] I-559 — metrics:roadmap-freshness: guard staleHours with Number.isFinite check in isStale expression
5. [frontend] I-560 — loadKnowledge: add concurrent-load guard (_knCurrentFile) to prevent stale responses overwriting newer results
6. [business_logic] I-561 — lifecycle:list: add ISO date format validation to event filter (not just typeof string check)
7. [ux_accessibility] A-13 — init: set aria-live="polite" on #knowledgeContent element for screen reader announcements
8. [data_db] D-04 — snapshotMixer: validate focus values are finite numbers before storing in mixer-history.json

## Stats
- 3714 tests at cycle start
