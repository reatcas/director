# Cycle 152 Plan — IMPROVEMENT MODE

## MIXER BUDGET — Cycle 152
| Cat | Peso | Units | Estado |
|-----|------|-------|--------|
| ux_accessibility | 5 | 3 | 0/3 |
| business_logic | 5 | 2 | 0/2 |
| data_db | 5 | 3 | 0/3 |
| security | 20 | BANNED (3rd consecutive) | — |
| backend | 5 | BANNED (3rd consecutive) | — |
| frontend | 5 | BANNED (3rd consecutive) | — |
| quality_tests | 35 | BANNED (3rd consecutive) | — |
| performance | 10 | FROZEN | — |
Total: 8 units — IMPROVEMENT MODE (F-01 HARNESS-blocked)

## Units
1. [ux_accessibility] I-432 — updateTransportButtons: sync aria-disabled on play/fine/kill
2. [ux_accessibility] I-433 — tab click handler: call switchTab() for aria-selected consistency
3. [ux_accessibility] I-434 — refresh() project list: add aria-current="true" to selected item
4. [business_logic] I-435 — persistLifecycleEvent: cap type length at 64 chars
5. [business_logic] I-436 — snapshotMixer: cap event string at 64 chars
6. [data_db] I-437 — snapshotMixer: add 512KB write size cap
7. [data_db] I-438 — persistLifecycleEvent: add 2MB write size cap
8. [data_db] I-439 — startup lifecycle pruning: add 2MB size cap to conditional write

## Stats
- 3487 tests at cycle start
