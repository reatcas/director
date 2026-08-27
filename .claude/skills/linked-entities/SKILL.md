---
name: linked-entities
description: Universal UI law — every entity reference renders as a data-connected selection control, never free text or hardcoded options; plus business cascades between related entities. Use when building or auditing any form, filter, table or view.
---

# Linked Entities Principle

The UI never asks a user to hand-type a value that exists as an entity in the data layer.

1. Detection: any field referencing another domain entity (FK in schema, ID in endpoint contract, obvious business relationship) MUST be a selection control populated from the API — never free text, never hardcoded options.
2. Control by cardinality and volume (reason per field, record it):
   - single ref, small catalog (<~50) → simple select loaded from API
   - single ref, large/growing entity → searchable autocomplete with debounced, paginated server-side search; human-readable label; ID persisted
   - multiple refs → multiselect with chips
   - binary → checkbox/switch; short exclusive → segmented/radio
3. Standard behavior: loading state, empty state with a useful action (role-permitting), errors handled, permissions filtered by the ENDPOINT (never the frontend), persisted value is always the entity ID.
4. Business cascades: when an entity changes state, reason which dependents are affected and implement the automated flow (notify affected parties, generate action requests without imposing choices that belong to the user — e.g. a provider's day-block auto-notifies every affected booking and issues an open-dated reschedule request the customer resolves from available slots), fully audited, reflected live where real-time channels exist.
5. Living record: maintain ENTITY_BINDINGS.md (relationship → control → populating endpoint → cascades). Review it when opening any module; design new features on this premise; fix violations in existing screens as bugs during audits.
